#!/usr/bin/env python3
"""Refresh cumulative Hugging Face downloads for publications.

A publication with links.huggingface is totaled from every model and dataset
that belongs to the same account and cites the paper's arXiv id. The linked
repo is included even when its card has no arXiv tag. downloadsAllTime is the
cumulative count; the default downloads field is only the last 30 days.
"""

import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUBLICATIONS = ROOT / "data" / "publications.json"
ARXIV_ID = re.compile(r"(\d{4}\.\d{4,5})")
USER_AGENT = "MPX0222.github.io-hf-downloads"


class HuggingFaceError(Exception):
    pass


def arxiv_id_from_publication(pub):
    links = pub.get("links") or {}
    blobs = [
        links.get("cite") or "",
        links.get("pdf") or "",
        pub.get("doi") or "",
        pub.get("bibtex") or "",
    ]
    for blob in blobs:
        match = ARXIV_ID.search(str(blob))
        if match:
            return match.group(1)
    return None


def parse_huggingface_url(url):
    """Return (kind, owner, repo_id). kind is model, dataset, or space."""
    path = urllib.parse.urlparse(url).path
    parts = [part for part in path.split("/") if part]
    kinds = {"datasets": "dataset", "spaces": "space", "models": "model"}
    if len(parts) >= 3 and parts[0] in kinds:
        return kinds[parts[0]], parts[1], f"{parts[1]}/{parts[2]}"
    if len(parts) >= 2:
        return "model", parts[0], f"{parts[0]}/{parts[1]}"
    return None


def owned(repo_id, owner):
    prefix = owner + "/"
    return repo_id.startswith(prefix) and "/" not in repo_id[len(prefix):]


def next_link(header):
    if not header:
        return None
    for part in header.split(","):
        match = re.search(r'<([^>]+)>\s*;\s*rel="?next"?', part.strip())
        if match:
            return match.group(1)
    return None


def require_downloads(entry, repo_id):
    value = entry.get("downloadsAllTime")
    if isinstance(value, bool) or not isinstance(value, int):
        raise HuggingFaceError(f"missing downloadsAllTime for {repo_id}")
    if value < 0:
        raise HuggingFaceError(f"negative downloadsAllTime for {repo_id}")
    return value


def http_fetch(url):
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "User-Agent": USER_AGENT,
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
            return payload, response.headers.get("Link")
    except urllib.error.HTTPError as error:
        raise HuggingFaceError(f"HTTP {error.code} for {url}") from error
    except urllib.error.URLError as error:
        raise HuggingFaceError(f"request failed for {url}: {error.reason}") from error


def _api_url(endpoint, params):
    query = urllib.parse.urlencode(params)
    return f"https://huggingface.co/api/{endpoint}?{query}"


def fetch_tagged(kind, arxiv_id, fetch):
    endpoint = "models" if kind == "model" else "datasets"
    url = _api_url(endpoint, [
        ("filter", f"arxiv:{arxiv_id}"),
        ("expand[]", "downloadsAllTime"),
        ("limit", "100"),
    ])
    collected = []
    for _ in range(5):
        payload, link = fetch(url)
        if not isinstance(payload, list):
            raise HuggingFaceError(f"expected a list from {url}")
        collected.extend(payload)
        url = next_link(link)
        if not url:
            return collected
    raise HuggingFaceError(f"too many result pages for arxiv:{arxiv_id} {kind}")


def fetch_repo(kind, repo_id, fetch):
    endpoint = "models" if kind == "model" else "datasets"
    quoted = urllib.parse.quote(repo_id, safe="/")
    url = _api_url(f"{endpoint}/{quoted}", [("expand[]", "downloadsAllTime")])
    payload, _link = fetch(url)
    if not isinstance(payload, dict):
        raise HuggingFaceError(f"expected an object for {repo_id}")
    return payload


def huggingface_stats(pub, fetch):
    url = ((pub.get("links") or {}).get("huggingface") or "").strip()
    if not url:
        return None
    parsed = parse_huggingface_url(url)
    if not parsed:
        raise HuggingFaceError(f"unrecognized Hugging Face url: {url}")
    kind, owner, repo_id = parsed
    repos = {}
    arxiv_id = arxiv_id_from_publication(pub)
    if arxiv_id:
        for source_kind in ("model", "dataset"):
            for entry in fetch_tagged(source_kind, arxiv_id, fetch):
                entry_id = entry.get("id") or ""
                if not owned(entry_id, owner):
                    continue
                repos[(source_kind, entry_id)] = {
                    "id": entry_id,
                    "type": source_kind,
                    "downloads": require_downloads(entry, entry_id),
                }
    if kind in ("model", "dataset") and (kind, repo_id) not in repos:
        entry = fetch_repo(kind, repo_id, fetch)
        entry_id = entry.get("id") or repo_id
        if not owned(entry_id, owner):
            raise HuggingFaceError(f"{entry_id} is outside account {owner}")
        repos[(kind, entry_id)] = {
            "id": entry_id,
            "type": kind,
            "downloads": require_downloads(entry, entry_id),
        }
    ordered = sorted(repos.values(), key=lambda repo: (repo["type"] != "model", repo["id"]))
    return {
        "downloads": sum(repo["downloads"] for repo in ordered),
        "repos": ordered,
    }


def apply_huggingface_stats(data, fetch):
    publications = data["publications"]
    computed = [huggingface_stats(pub, fetch) for pub in publications]
    changed = False
    for pub, stats in zip(publications, computed):
        current = (pub.get("stats") or {}).get("huggingface")
        if stats is None:
            if current is not None:
                del pub["stats"]["huggingface"]
                changed = True
            continue
        if current != stats:
            pub.setdefault("stats", {})["huggingface"] = stats
            changed = True
    return changed


def update_publications(path=PUBLICATIONS, fetch=http_fetch):
    data = json.loads(path.read_text(encoding="utf-8"))
    changed = apply_huggingface_stats(data, fetch)
    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return changed


def main():
    try:
        changed = update_publications()
    except HuggingFaceError as error:
        print(f"Hugging Face update failed: {error}", file=sys.stderr)
        return 1
    print("updated" if changed else "unchanged")
    return 0


if __name__ == "__main__":
    sys.exit(main())
