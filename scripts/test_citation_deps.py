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
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kwargs)


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
        _run([str(py), "-m", "pip", "install", "-q", "bibtexparser==2.0.1"])
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


if __name__ == "__main__":
    test_workflow_pins_compatible_versions()
    test_bibtexparser_v2_breaks_scholarly_import()
    test_bibtexparser_v1_keeps_scholarly_import()
    print("\nAll citation dependency checks passed.")
