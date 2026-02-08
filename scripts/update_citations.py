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
    print("❌ Error: scholarly library not found.")
    print("   Please install it: pip install scholarly")
    sys.exit(1)

try:
    from scholarly._proxy_generator import MaxTriesExceededException
except ImportError:
    MaxTriesExceededException = Exception  # fallback if location changes

# Your Google Scholar ID (can be overridden by environment variable)
SCHOLAR_ID = os.environ.get('SCHOLAR_ID', '93URqlsAAAAJ')

# Use proxy in CI (GitHub Actions / data center IPs are often blocked by Google Scholar)
USE_PROXY = os.environ.get('GITHUB_ACTIONS') == 'true' or os.environ.get('SCHOLAR_USE_PROXY', '').lower() in ('1', 'true', 'yes')


def _setup_proxy():
    """Use free rotating proxies (for CI). Reference: BugMaker-Boyan/BugMaker-Boyan.github.io"""
    pg = ProxyGenerator()
    # timeout=2, wait_time=60: balance between speed and proxy list availability
    ok = pg.FreeProxies(timeout=2, wait_time=60)
    if ok:
        scholarly.use_proxy(pg)
        print("   Using free proxies (CI mode).")
    return ok


def fetch_scholar_data():
    """Fetch publications from Google Scholar using scholarly library"""
    print(f"📚 Fetching data from Google Scholar...")
    print(f"   Scholar ID: {SCHOLAR_ID}")

    if USE_PROXY:
        if not _setup_proxy():
            print("   ⚠️ Free proxy setup failed, trying without proxy...")

    try:
        # Search for author by ID
        author = scholarly.search_author_id(SCHOLAR_ID)

        # Fill in complete author information
        scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])

        print(f"✓ Found author: {author.get('name', 'Unknown')}")
        print(f"   Total citations: {author.get('citedby', 0)}")
        print(f"   Publications: {len(author.get('publications', []))}")

        return author

    except MaxTriesExceededException as e:
        print(f"❌ Error (proxy max retries): {e}")
        if not USE_PROXY:
            print("   Tip: In CI, GITHUB_ACTIONS is set so proxy is used automatically.")
        sys.exit(1)
    except Exception as e:
        err_msg = str(e).lower()
        # First attempt failed (often blocked in CI); retry with proxy if we didn't use it yet
        if not USE_PROXY and ("cannot fetch" in err_msg or "blocked" in err_msg or "403" in err_msg or "429" in err_msg):
            print("   Request failed (likely blocked). Retrying with free proxies...")
            if _setup_proxy():
                try:
                    author = scholarly.search_author_id(SCHOLAR_ID)
                    scholarly.fill(author, sections=['basics', 'indices', 'counts', 'publications'])
                    print(f"✓ Found author: {author.get('name', 'Unknown')}")
                    print(f"   Total citations: {author.get('citedby', 0)}")
                    print(f"   Publications: {len(author.get('publications', []))}")
                    return author
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
