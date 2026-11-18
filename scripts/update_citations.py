#!/usr/bin/env python3
"""
Update Google Scholar citation counts automatically.
Uses the scholarly library to fetch data from Google Scholar profile.
In CI (e.g. GitHub Actions), uses free proxies to avoid IP blocking by Google Scholar.
"""

import json
import os
import re
import sys

try:
    from scholarly import scholarly, ProxyGenerator
except ImportError:
    scholarly = None
    ProxyGenerator = None

try:
    from scholarly._proxy_generator import MaxTriesExceededException
except ImportError:
    class MaxTriesExceededException(Exception):
        pass

# Your Google Scholar ID (can be overridden by environment variable)
SCHOLAR_ID = os.environ.get('SCHOLAR_ID', '93URqlsAAAAJ')

# Use proxy in CI (GitHub Actions / data center IPs are often blocked by Google Scholar)
USE_PROXY = os.environ.get('GITHUB_ACTIONS') == 'true' or os.environ.get('SCHOLAR_USE_PROXY', '').lower() in ('1', 'true', 'yes')


def _sanitize_proxy_address(proxy):
    """Normalize a proxy string (e.g. '45.225.18.240:8080:HTTP') to 'host:port'."""
    if not isinstance(proxy, str):
        return ""
    proxy = proxy.strip()
    match = re.match(r"^(?:https?://)?([A-Za-z0-9._-]+:\d+)(?::[A-Za-z0-9._-]+)*$", proxy)
    if match:
        return match.group(1)
    return ""


def _patch_free_proxy_parser():
    """Patch free-proxy so 'IP:Port:HTTP' rows from sslproxies.org are normalized to 'IP:Port'."""
    try:
        from fp.fp import FreeProxy
    except ImportError:
        return

    if getattr(FreeProxy, "_citations_patched", False):
        return

    orig_parse = FreeProxy._parse_proxy_list

    def _patched_parse_proxy_list(self, content):
        raw_list = orig_parse(self, content)
        cleaned = []
        for item in raw_list:
            norm = _sanitize_proxy_address(item)
            if norm:
                cleaned.append(norm)
        return cleaned

    FreeProxy._parse_proxy_list = _patched_parse_proxy_list
    FreeProxy._citations_patched = True


def _reset_direct_connection():
    """Reset scholarly to direct connection without proxies."""
    try:
        direct_pg = ProxyGenerator()
        scholarly.use_proxy(direct_pg, direct_pg)
    except Exception as e:
        print(f"   ⚠️ Failed to reset direct connection: {e}")


def _setup_proxy():
    """Use free rotating proxies (for CI). Reference: BugMaker-Boyan/BugMaker-Boyan.github.io"""
    _patch_free_proxy_parser()
    try:
        pg = ProxyGenerator()
        # timeout=2, wait_time=60: balance between speed and proxy list availability
        ok = pg.FreeProxies(timeout=2, wait_time=60)
        if ok:
            scholarly.use_proxy(pg, pg)
            print("   Using free proxies (CI mode).")
        return bool(ok)
    except Exception as e:
        print(f"   Proxy not available: {e}")
        return False


def _fetch_author_once(scholar_id):
    """Fetch and fill author profile once; raise RuntimeError if response is invalid."""
    author = scholarly.search_author_id(scholar_id)
    if not isinstance(author, dict):
        raise RuntimeError(f"search_author_id returned invalid data: {author!r}")

    filled = scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
    if isinstance(filled, dict):
        author = filled

    if not isinstance(author, dict) or 'publications' not in author:
        raise RuntimeError("Failed to fill author publications from Google Scholar")

    print(f"✓ Found author: {author.get('name', 'Unknown')}")
    print(f"   Total citations: {author.get('citedby', 0)}")
    print(f"   Publications: {len(author.get('publications', []))}")
    return author


def fetch_scholar_data():
    """Fetch publications from Google Scholar using scholarly library"""
    if scholarly is None or ProxyGenerator is None:
        print("❌ Error: scholarly library not found.")
        print("   Please install it: pip install scholarly")
        sys.exit(1)

    print(f"📚 Fetching data from Google Scholar...")
    print(f"   Scholar ID: {SCHOLAR_ID}")

    proxy_active = False
    if USE_PROXY:
        proxy_active = _setup_proxy()
        if not proxy_active:
            print("   ⚠️ Free proxy setup failed, trying without proxy...")
            _reset_direct_connection()

    try:
        return _fetch_author_once(SCHOLAR_ID)
    except Exception as e:
        if isinstance(e, MaxTriesExceededException):
            print(f"⚠️ Proxy max retries exceeded: {e}")
        else:
            print(f"⚠️ Initial attempt failed: {e}")

        # Case 1: Started with proxy -> retry once with a fresh proxy list, then fall back to direct
        if proxy_active:
            print("   Retrying with refreshed free proxies...")
            if _setup_proxy():
                try:
                    return _fetch_author_once(SCHOLAR_ID)
                except Exception as e_proxy_retry:
                    print(f"   ⚠️ Retry with refreshed proxy failed: {e_proxy_retry}")

            print("   Falling back to direct connection without proxy...")
            _reset_direct_connection()
            try:
                return _fetch_author_once(SCHOLAR_ID)
            except Exception as e_direct:
                print(f"❌ Direct fallback failed: {e_direct}")
                sys.exit(1)

        # Case 2: Started without proxy -> retry with free proxies if blocked or failed
        err_msg = str(e).lower()
        if not USE_PROXY or not proxy_active:
            if "cannot fetch" in err_msg or "blocked" in err_msg or "403" in err_msg or "429" in err_msg or "invalid data" in err_msg:
                print("   Request failed (likely blocked). Retrying with free proxies...")
                if _setup_proxy():
                    try:
                        return _fetch_author_once(SCHOLAR_ID)
                    except Exception as e2:
                        print(f"❌ Retry with proxy failed: {e2}")

        print(f"❌ Error fetching Google Scholar data: {e}")
        sys.exit(1)


def normalize_title(title):
    """Normalize title for matching"""
    title = title.lower()
    title = re.sub(r'[^\w\s]', '', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()


def fuzzy_match_title(pub_title, scholar_publications):
    """Find best matching publication from scholar data"""
    pub_norm = normalize_title(pub_title)

    # Create mapping of normalized titles to publication objects
    scholar_map = {}
    for pub in scholar_publications:
        norm_title = normalize_title(pub.get('bib', {}).get('title', ''))
        if norm_title:
            scholar_map[norm_title] = pub

    # Try exact match first
    if pub_norm in scholar_map:
        return scholar_map[pub_norm]

    # Try partial match (contains)
    for norm_title, pub in scholar_map.items():
        if pub_norm in norm_title or norm_title in pub_norm:
            return pub

    return None


def update_publications_json():
    """Update publications.json with latest citation counts"""

    # Fetch scholar data
    author_data = fetch_scholar_data()
    scholar_pubs = author_data.get('publications', [])

    print(f"\n🔄 Updating publications...")

    # Load existing publications
    try:
        with open('data/publications.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"❌ Error: data/publications.json not found")
        sys.exit(1)

    updated_count = 0
    unchanged_count = 0
    not_found = []

    for pub in data['publications']:
        pub_title = pub['title']

        # Find matching publication
        matched_pub = fuzzy_match_title(pub_title, scholar_pubs)

        if matched_pub:
            # Get citation count from scholarly data
            new_citations = matched_pub.get('num_citations', 0)
            old_citations = pub.get('stats', {}).get('citations', 0)

            if new_citations != old_citations:
                if 'stats' not in pub:
                    pub['stats'] = {}
                pub['stats']['citations'] = new_citations

                # Truncate title for display
                display_title = pub_title[:57] + '...' if len(pub_title) > 60 else pub_title
                print(f"  ✓ {display_title}")
                print(f"    {old_citations} → {new_citations} citations")
                updated_count += 1
            else:
                unchanged_count += 1
        else:
            not_found.append(pub_title)
            display_title = pub_title[:57] + '...' if len(pub_title) > 60 else pub_title
            print(f"  ⚠️  Not found: {display_title}")

    # Save updated data
    with open('data/publications.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print summary
    total_pubs = len(data['publications'])
    print(f"\n{'='*60}")
    print(f"✅ Update complete!")
    print(f"   Updated: {updated_count} publications")
    print(f"   Unchanged: {unchanged_count} publications")
    if not_found:
        print(f"   ⚠️  Not found on Scholar: {len(not_found)} publications")
        for title in not_found:
            print(f"      - {title}")
    print(f"{'='*60}")

    # Return whether any changes were made
    return updated_count > 0


if __name__ == '__main__':
    update_publications_json()
