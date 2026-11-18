#!/usr/bin/env python3
"""Verify citation-workflow dependency pins and bibtexparser compatibility."""

import re
import subprocess
import sys
import tempfile
import venv
from pathlib import Path

WORKFLOW = Path(__file__).resolve().parents[1] / ".github" / "workflows" / "update-citations.yml"
PIN_PATTERN = re.compile(
    r'pip install "scholarly==1\.7\.11" "bibtexparser>=1\.4,<2" "httpx>=0\.24,<0\.28"'
)


def _run(cmd, **kwargs):
    res = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    if res.returncode != 0:
        raise RuntimeError(f"Command failed ({res.returncode}): {cmd}\nSTDOUT:\n{res.stdout}\nSTDERR:\n{res.stderr}")
    return res


def test_workflow_pins_compatible_versions():
    text = WORKFLOW.read_text(encoding="utf-8")
    assert PIN_PATTERN.search(text), (
        "workflow must pin scholarly==1.7.11, bibtexparser>=1.4,<2, and httpx>=0.24,<0.28"
    )
    assert "pip install scholarly\n" not in text
    print("[ok] workflow pins compatible scholarly / bibtexparser / httpx versions")


def _venv_python(root: Path) -> Path:
    if sys.platform == "win32":
        return root / "Scripts" / "python.exe"
    return root / "bin" / "python"


def _import_bibdatabase(python_exe: Path) -> subprocess.CompletedProcess:
    return subprocess.run(
        [str(python_exe), "-c", "from bibtexparser.bibdatabase import BibDatabase"],
        capture_output=True,
        text=True,
    )


def test_bibtexparser_v2_breaks_scholarly_import():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp) / "v2"
        venv.create(root, with_pip=True)
        py = _venv_python(root)
        pkg = "bibtexparser==2.0.1" if sys.version_info >= (3, 10) else "bibtexparser==2.0.0b9"
        _run([str(py), "-m", "pip", "install", "-q", pkg])
        result = _import_bibdatabase(py)
        assert result.returncode != 0, "bibtexparser 2.x should not expose bibdatabase"
        assert "bibtexparser.bibdatabase" in (result.stderr + result.stdout)
        print("[ok] bibtexparser 2.x reproduces scholarly's ModuleNotFoundError")


def test_bibtexparser_v1_keeps_scholarly_import():
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp) / "v1"
        venv.create(root, with_pip=True)
        py = _venv_python(root)
        _run([str(py), "-m", "pip", "install", "-q", "bibtexparser>=1.4,<2"])
        result = _import_bibdatabase(py)
        assert result.returncode == 0, result.stderr
        print("[ok] bibtexparser 1.x still provides bibdatabase (scholarly import path)")


def test_proxy_address_sanitization_and_patch():
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import types
    import update_citations as uc

    assert uc._sanitize_proxy_address("45.225.18.240:8080:HTTP") == "45.225.18.240:8080"
    assert uc._sanitize_proxy_address("216.152.149.246:80:HTTP") == "216.152.149.246:80"
    assert uc._sanitize_proxy_address("http://1.2.3.4:3128:HTTPS") == "1.2.3.4:3128"
    assert uc._sanitize_proxy_address("1.2.3.4:3128") == "1.2.3.4:3128"
    assert uc._sanitize_proxy_address("invalid-row") == ""

    # Stub fp.fp.FreeProxy and verify _patch_free_proxy_parser cleans the list
    class DummyFreeProxy:
        def _parse_proxy_list(self, content):
            return ["45.225.18.240:8080:HTTP", "bad_entry", "10.0.0.1:80:HTTP"]

    fp_mod = types.ModuleType("fp")
    fp_sub = types.ModuleType("fp.fp")
    fp_sub.FreeProxy = DummyFreeProxy
    sys.modules["fp"] = fp_mod
    sys.modules["fp.fp"] = fp_sub

    uc._patch_free_proxy_parser()
    parsed = DummyFreeProxy()._parse_proxy_list(b"")
    assert parsed == ["45.225.18.240:8080", "10.0.0.1:80"], f"Unexpected parsed list: {parsed}"
    print("[ok] _sanitize_proxy_address and _patch_free_proxy_parser strip ':HTTP' suffixes")


def test_real_free_proxy_html_with_httpx_url():
    """Verify real free-proxy 1.3.0 + patched parser + httpx URL parsing on new sslproxies HTML."""
    sample_html = (
        '<section id="list"><table><thead><tr>'
        "<th>IP:Port</th><th>Protocol</th><th>Code</th><th>Country</th>"
        "<th>Anonymity</th><th>Https</th><th>Last Checked</th>"
        "</tr></thead><tbody>"
        "<tr><td class='fpl-ip'>45.225.18.240<span class='fpl-port'>:8080</span></td>"
        "<td>HTTP</td><td>BR</td><td>Brazil</td><td>Elite</td><td>Yes</td><td>4 secs ago</td></tr>"
        "<tr><td class='fpl-ip'>216.152.149.246<span class='fpl-port'>:80</span></td>"
        "<td>HTTP</td><td>US</td><td>United States</td><td>Elite</td><td>Yes</td><td>4 secs ago</td></tr>"
        "</tbody></table></section>"
    )
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp) / "fp"
        venv.create(root, with_pip=True)
        py = _venv_python(root)
        _run([str(py), "-m", "pip", "install", "-q", "free-proxy==1.3.0", "httpx>=0.24,<0.28"])
        code = f"""
import sys
sys.path.insert(0, {str(Path(__file__).resolve().parent)!r})
import httpx
from fp.fp import FreeProxy
import update_citations as uc

fp = FreeProxy()
raw = fp._parse_proxy_list({sample_html.encode()!r})
assert raw == ['45.225.18.240:8080:HTTP', '216.152.149.246:80:HTTP'], f'Unexpected unpatched: {{raw}}'

# Without patch, httpx.URL raises InvalidURL on 'http://' + raw[0]
try:
    httpx.URL('http://' + raw[0])
    raise AssertionError('Expected httpx.InvalidURL for unpatched proxy string')
except httpx.InvalidURL:
    pass

# With patch applied, FreeProxy._parse_proxy_list returns valid host:port for httpx.URL
uc._patch_free_proxy_parser()
cleaned = fp._parse_proxy_list({sample_html.encode()!r})
assert cleaned == ['45.225.18.240:8080', '216.152.149.246:80'], f'Unexpected cleaned: {{cleaned}}'
for addr in cleaned:
    u = httpx.URL('http://' + addr)
    assert u.host in ('45.225.18.240', '216.152.149.246')
    assert u.port in (8080, None)
"""
        _run([str(py), "-c", code])
        print("[ok] real free-proxy 1.3.0 + httpx 0.27 parses new sslproxies.org HTML after patch")


def test_setup_proxy_catches_invalid_url_and_fallback():
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import update_citations as uc

    class BrokenProxyGenerator:
        def FreeProxies(self, timeout=2, wait_time=60):
            raise ValueError("Invalid port: '80:HTTP'")

    class DummyScholarly:
        def __init__(self):
            self.proxy_calls = []
            self.search_calls = 0

        def use_proxy(self, pg1, pg2=None):
            self.proxy_calls.append((pg1, pg2))

        def search_author_id(self, scholar_id):
            self.search_calls += 1
            if self.search_calls == 1:
                return None  # simulate transient None response
            return {"name": "Test Author", "citedby": 42}

        def fill(self, author, sections=None):
            author["publications"] = []
            return author

    dummy_scholarly = DummyScholarly()
    uc.ProxyGenerator = BrokenProxyGenerator
    uc.scholarly = dummy_scholarly
    uc.USE_PROXY = True

    # 1. _setup_proxy should catch ValueError and return False instead of crashing
    assert uc._setup_proxy() is False
    print("[ok] _setup_proxy catches InvalidURL / ValueError and returns False")

    # 2. When proxy is active initially, first fetch returning None retries and succeeds
    class WorkingProxyGenerator:
        def FreeProxies(self, timeout=2, wait_time=60):
            return True

    uc.ProxyGenerator = WorkingProxyGenerator
    author = uc.fetch_scholar_data()
    assert author["name"] == "Test Author"
    assert author["citedby"] == 42
    assert dummy_scholarly.search_calls == 2
    print("[ok] fetch_scholar_data retries when search_author_id returns None or fails")


if __name__ == "__main__":
    test_workflow_pins_compatible_versions()
    test_proxy_address_sanitization_and_patch()
    test_setup_proxy_catches_invalid_url_and_fallback()
    test_real_free_proxy_html_with_httpx_url()
    test_bibtexparser_v2_breaks_scholarly_import()
    test_bibtexparser_v1_keeps_scholarly_import()
    print("\nAll citation dependency checks passed.")
