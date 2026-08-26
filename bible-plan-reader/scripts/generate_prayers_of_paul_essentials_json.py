import re
import json
import urllib.parse
import os

BOOK_TO_USFM = {
    "genesis": "GEN",
    "exodus": "EXO",
    "leviticus": "LEV",
    "numbers": "NUM",
    "deuteronomy": "DEU",
    "joshua": "JOS",
    "judges": "JDG",
    "ruth": "RUT",
    "1 samuel": "1SA",
    "2 samuel": "2SA",
    "1 kings": "1KI",
    "2 kings": "2KI",
    "1 chronicles": "1CH",
    "2 chronicles": "2CH",
    "ezra": "EZR",
    "nehemiah": "NEH",
    "esther": "EST",
    "job": "JOB",
    "psalm": "PSA",
    "psalms": "PSA",
    "proverbs": "PRO",
    "ecclesiastes": "ECC",
    "song of solomon": "SNG",
    "isaiah": "ISA",
    "jeremiah": "JER",
    "lamentations": "LAM",
    "ezekiel": "EZK",
    "daniel": "DAN",
    "hosea": "HOS",
    "joel": "JOL",
    "amos": "AMO",
    "obadiah": "OBA",
    "jonah": "JON",
    "micah": "MIC",
    "nahum": "NAM",
    "habakkuk": "HAB",
    "zephaniah": "ZEP",
    "haggai": "HAG",
    "zechariah": "ZEC",
    "malachi": "MAL",
    "matthew": "MAT",
    "mark": "MRK",
    "luke": "LUK",
    "john": "JHN",
    "acts": "ACT",
    "romans": "ROM",
    "1 corinthians": "1CO",
    "2 corinthians": "2CO",
    "galatians": "GAL",
    "ephesians": "EPH",
    "philippians": "PHP",
    "colossians": "COL",
    "1 thessalonians": "1TH",
    "2 thessalonians": "2TH",
    "1 timothy": "1TI",
    "2 timothy": "2TI",
    "titus": "TIT",
    "philemon": "PHM",
    "hebrews": "HEB",
    "james": "JAS",
    "1 peter": "1PE",
    "2 peter": "2PE",
    "1 john": "1JN",
    "2 john": "2JN",
    "3 john": "3JN",
    "jude": "JUD",
    "revelation": "REV"
}

def get_bible_url(ref, version="NLT", version_id=116):
    ref_clean = ref.strip().replace('–', '-')
    m = re.match(r'^((?:\d\s+)?[A-Za-z\s]+)\s+(\d+)(?::([0-9\-]+))?$', ref_clean)
    if not m:
        encoded_ref = urllib.parse.quote(ref_clean)
        return f"https://www.biblegateway.com/passage/?search={encoded_ref}&version={version}"
    
    book_raw = m.group(1).strip().lower()
    chapter = m.group(2).strip()
    verses = m.group(3)
    
    usfm = BOOK_TO_USFM.get(book_raw)
    if usfm:
        if verses:
            return f"https://www.bible.com/bible/{version_id}/{usfm}.{chapter}.{verses}.{version}"
        else:
            return f"https://www.bible.com/bible/{version_id}/{usfm}.{chapter}.{version}"
    
    encoded_ref = urllib.parse.quote(ref_clean)
    return f"https://www.biblegateway.com/passage/?search={encoded_ref}&version={version}"

def main():
    input_path = 'content/prayers-of-paul-essentials.md'
    output_public = 'public/plans/prayers-of-paul-essentials.json'
    output_dist = 'dist/plans/prayers-of-paul-essentials.json'
    plans_catalog = 'public/plans.json'
    dist_catalog = 'dist/plans.json'

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    session_blocks = re.split(r'\n(?=## Session \d+:)', content)[1:]

    items = []

    for idx, block in enumerate(session_blocks, 1):
        m = re.match(r'## Session (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if not m:
            print(f"Error matching session block {idx}")
            continue
        session_num = int(m.group(1))
        title = m.group(2).strip()
        body = m.group(3)

        # 1. Passages with Bible URLs and Bundled NLT Text
        passages = []
        m_scripture = re.search(r'### 1\. Scripture Reading\s*\n(.*?)(?=\n### 2\.)', body, re.DOTALL)
        if m_scripture:
            scripture_section = m_scripture.group(1).strip()
            passages_raw = re.split(r'\n(?=\*\*[^*]+\((?:NLT|BSB|NIV)\)\*\*)', scripture_section)
            for p_block in passages_raw:
                header_m = re.search(r'\*\*([^*]+)\s*\((?:NLT|BSB|NIV)\)\*\*', p_block)
                if not header_m:
                    continue
                full_ref_header = header_m.group(1).strip()
                
                # Extract blockquote lines
                quote_lines = re.findall(r'^[>\s]*(.*)', p_block, re.MULTILINE)
                clean_lines = ' '.join([l.lstrip('>').strip() for l in quote_lines if l.lstrip('>').strip()])
                clean_text = re.sub(r'<sup>(\d+)</sup>\s*', r'\1 ', clean_lines)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                # If multiple sub-passages separated by semicolon (e.g. 2 Thess 1:11-12; Philemon 1:4, 6-7)
                sub_refs = [r.strip().replace('–', '-') for r in full_ref_header.split(';')]
                if len(sub_refs) == 1:
                    passages.append({
                        "reference": sub_refs[0],
                        "url": get_bible_url(sub_refs[0], "NLT", 116),
                        "text": clean_text
                    })
                else:
                    for sub_r in sub_refs:
                        passages.append({
                            "reference": sub_r,
                            "url": get_bible_url(sub_r, "NLT", 116),
                            "text": clean_text
                        })
        else:
            p_matches = re.findall(r'\*\*([^*]+)\s*\((?:NLT|BSB|NIV)\)\*\*', body)
            for p in p_matches:
                for sub_p in p.split(';'):
                    ref = sub_p.strip().replace('–', '-')
                    url = get_bible_url(ref, "NLT", 116)
                    passages.append({
                        "reference": ref,
                        "url": url
                    })

        # 2. Historical Context
        hist_match = re.search(r'### 2\. Historical & Cultural Context\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        # 3. Main Devotional
        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Questions to Think About)', body, re.DOTALL)
        if dev_match:
            dev_title = dev_match.group(1).strip()
            dev_body = dev_match.group(2).strip()
            dev_body = re.sub(r'\n+---\s*$', '', dev_body)
        else:
            dev_title = "Devotional Reading"
            dev_body = ""

        # 4. Reflection Questions
        reflect_match = re.search(r'### 4\. Questions to Think About\s*\n(.*?)(?=\n### 5\. Action Step)', body, re.DOTALL)
        reflect_questions = []
        if reflect_match:
            for line in reflect_match.group(1).strip().split('\n'):
                line = line.strip()
                q_m = re.match(r'^\d+\.\s*(.*)', line)
                if q_m:
                    reflect_questions.append(q_m.group(1).strip())

        # 5. Action Step
        action_match = re.search(r'### 5\. Action Step\s*\n(.*?)(?=\n### 6\. Prayer)', body, re.DOTALL)
        action_items = []
        if action_match:
            action_items.append(action_match.group(1).strip())

        # 6. Prayer
        prayer_match = re.search(r'### 6\. Prayer\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            raw_prayer = prayer_match.group(1).strip()
            if raw_prayer.startswith('*') and raw_prayer.endswith('*'):
                raw_prayer = raw_prayer[1:-1].strip()
            prayer_text = raw_prayer

        devotional_content = f"### Historical & Cultural Context\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"

        item = {
            "item": session_num,
            "title": f"Session {session_num}: {title}",
            "passages": passages,
            "devotional": {
                "author": "Reading Plan",
                "content": devotional_content
            },
            "prayers": [
                {
                    "topic": "Personal Prayer",
                    "description": prayer_text
                }
            ],
            "reflect": reflect_questions,
            "practice": action_items
        }
        items.append(item)
        print(f"Session {session_num:2d}: {title[:36]:<36} | {passages[0]['url'] if passages else 'No passage'}")

    print(f"\nSuccessfully parsed {len(items)} sessions.")

    plan_json = {
        "id": "prayers-of-paul-essentials",
        "title": "Apostolic Prayers (Essentials Edition)",
        "description": "A 12-session practical prayer journey in clear, accessible everyday language with NLT Scripture, exploring the life-changing prayers of the Apostle Paul for spiritual wisdom, inner strength, and love.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-25",
        "version": "1.1",
        "iconUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=320&h=320&q=80",
        "bannerUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1440&h=810&q=80",
        "items": items
    }

    os.makedirs(os.path.dirname(output_public), exist_ok=True)
    with open(output_public, 'w', encoding='utf-8') as f:
        json.dump(plan_json, f, indent=2, ensure_ascii=False)
    print(f"Written: {output_public}")

    if os.path.exists(os.path.dirname(output_dist)):
        with open(output_dist, 'w', encoding='utf-8') as f:
            json.dump(plan_json, f, indent=2, ensure_ascii=False)
        print(f"Written: {output_dist}")

    # Update catalogs
    for catalog_file in [plans_catalog, dist_catalog]:
        if os.path.exists(catalog_file):
            with open(catalog_file, 'r', encoding='utf-8') as f:
                catalog = json.load(f)

            new_entry = {
                "id": "prayers-of-paul-essentials",
                "title": "Apostolic Prayers (Essentials Edition)",
                "description": "A 12-session practical prayer journey in clear, accessible everyday language with NLT Scripture, exploring the life-changing prayers of the Apostle Paul for spiritual wisdom, inner strength, and love.",
                "type": "reading",
                "totalItems": len(items),
                "url": "plans/prayers-of-paul-essentials.json",
                "creator": "Prayers of Paul",
                "version": "1.1",
                "created": "2026-08-25",
                "lastUpdated": "2026-08-25",
                "tags": [
                    "Prayer",
                    "Spiritual Formation",
                    "Devotional",
                    "Discipleship",
                    "Essentials"
                ],
                "featured": False
            }

            found = False
            for idx, plan in enumerate(catalog.get('plans', [])):
                if plan.get('id') == 'prayers-of-paul-essentials':
                    catalog['plans'][idx] = new_entry
                    found = True
                    break

            if not found:
                inserted = False
                for idx, plan in enumerate(catalog.get('plans', [])):
                    if plan.get('id') == 'prayers-of-paul':
                        catalog['plans'].insert(idx + 1, new_entry)
                        inserted = True
                        break
                if not inserted:
                    catalog['plans'].append(new_entry)

            with open(catalog_file, 'w', encoding='utf-8') as f:
                json.dump(catalog, f, indent=2, ensure_ascii=False)
            print(f"Updated catalog: {catalog_file}")

if __name__ == '__main__':
    main()
