#!/usr/bin/env python3
"""
Update Google Scholar citation counts automatically.
Fetches data from your Google Scholar profile and updates publications.json
"""

import json
import re
import sys
from urllib.parse import quote
import time
import requests
from bs4 import BeautifulSoup

# Your Google Scholar ID
SCHOLAR_ID = "93URqlsAAAAJ"
SCHOLAR_URL = f"https://scholar.google.com/citations?user={SCHOLAR_ID}&hl=en&pagesize=100"

# 更接近真实浏览器的请求头，降低被 Google 识别为爬虫的概率
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://scholar.google.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

def fetch_scholar_data():
    """Fetch publications from Google Scholar profile with retry logic"""
    print(f"📚 Fetching data from Google Scholar...")

    session = requests.Session()
    session.headers.update(HEADERS)

    last_error = None
    for attempt in range(1, 4):  # 最多重试 3 次
        try:
            if attempt > 1:
                wait_sec = 5 * attempt
                print(f"   Retry {attempt}/3 in {wait_sec}s...")
                time.sleep(wait_sec)
            response = session.get(SCHOLAR_URL, timeout=15)
            response.raise_for_status()
            break
        except requests.RequestException as e:
            last_error = e
            if attempt == 3:
                print(f"❌ Error fetching Google Scholar data: {last_error}")
                sys.exit(1)
            continue

    try:

        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract all publication rows
        publications = []
        rows = soup.select('tr.gsc_a_tr')

        for row in rows:
            try:
                # Title and link
                title_cell = row.select_one('td.gsc_a_t a')
                if not title_cell:
                    continue

                title = title_cell.get_text(strip=True)

                # Citation count
                citation_cell = row.select_one('td.gsc_a_c a')
                if citation_cell:
                    citations_text = citation_cell.get_text(strip=True)
                    citations = int(citations_text) if citations_text.isdigit() else 0
                else:
                    citations = 0

                # Year
                year_cell = row.select_one('td.gsc_a_y')
                year = year_cell.get_text(strip=True) if year_cell else ""

                publications.append({
                    'title': title,
                    'citations': citations,
                    'year': year
                })

            except Exception as e:
                print(f"⚠️  Error parsing row: {e}")
                continue

        print(f"✓ Found {len(publications)} publications on Google Scholar")
        return publications

    except Exception as e:
        print(f"❌ Error fetching Google Scholar data: {e}")
        sys.exit(1)

def normalize_title(title):
    """Normalize title for matching"""
    # Remove common punctuation and convert to lowercase
    title = title.lower()
    title = re.sub(r'[^\w\s]', '', title)
    title = re.sub(r'\s+', ' ', title)
    return title.strip()

def fuzzy_match_title(pub_title, scholar_titles):
    """Find best matching title from scholar data"""
    pub_norm = normalize_title(pub_title)

    # Try exact match first
    if pub_norm in [normalize_title(t) for t in scholar_titles]:
        for s in scholar_titles:
            if normalize_title(s) == pub_norm:
                return s

    # Try partial match (contains)
    for s_title in scholar_titles:
        s_norm = normalize_title(s_title)
        if pub_norm in s_norm or s_norm in pub_norm:
            return s_title

    return None

def update_publications_json():
    """Update publications.json with latest citation counts"""

    # Fetch scholar data
    scholar_pubs = fetch_scholar_data()
    scholar_titles = [p['title'] for p in scholar_pubs]

    # Create title -> citations mapping
    scholar_data = {p['title']: p['citations'] for p in scholar_pubs}

    # Load existing publications
    with open('data/publications.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"\n🔄 Updating {len(data['publications'])} publications...")

    updated_count = 0
    not_found = []

    for pub in data['publications']:
        pub_title = pub['title']

        # Find matching title
        matched_title = fuzzy_match_title(pub_title, scholar_titles)

        if matched_title:
            new_citations = scholar_data[matched_title]
            old_citations = pub.get('stats', {}).get('citations', 0)

            if new_citations != old_citations:
                pub['stats']['citations'] = new_citations
                print(f"  ✓ {pub_title[:60]}...")
                print(f"    {old_citations} → {new_citations} citations")
                updated_count += 1
            else:
                print(f"  ○ {pub_title[:60]}... (unchanged: {new_citations})")
        else:
            not_found.append(pub_title)
            print(f"  ⚠️  Not found: {pub_title[:60]}...")

    # Save updated data
    with open('data/publications.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n{'='*60}")
    print(f"✅ Update complete!")
    print(f"   Updated: {updated_count} publications")
    print(f"   Unchanged: {len(data['publications']) - updated_count} publications")
    if not_found:
        print(f"   ⚠️  Not found on Scholar: {len(not_found)} publications")
        for title in not_found:
            print(f"      - {title}")
    print(f"{'='*60}")

if __name__ == '__main__':
    update_publications_json()
