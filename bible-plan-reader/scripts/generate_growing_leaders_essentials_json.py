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
    input_path = 'content/30-days-of-growing-leaders-essentials.md'
    output_public = 'public/plans/growing-leaders-essentials.json'
    output_dist = 'dist/plans/growing-leaders-essentials.json'
    plans_catalog = 'public/plans.json'
    dist_catalog = 'dist/plans.json'

    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    module_info = {
        1: {"name": "Module 1: God Uses Your Story", "lessons": "Lessons 1–5", "habit": "Notice and Learn"},
        2: {"name": "Module 2: God Forms Your Character", "lessons": "Lessons 6–10", "habit": "Pause and Bring It Before God"},
        3: {"name": "Module 3: God Builds Your Faithfulness", "lessons": "Lessons 11–15", "habit": "Record and Follow Through"},
        4: {"name": "Module 4: God Develops Your Gifts", "lessons": "Lessons 16–20", "habit": "Serve, Notice, Ask"},
        5: {"name": "Module 5: God Shapes How You Lead People", "lessons": "Lessons 21–25", "habit": "Listen Before Responding"},
        6: {"name": "Module 6: God Deepens Your Life With Him", "lessons": "Lessons 26–30", "habit": "Abide and Review"}
    }

    def get_module_num(lesson_num):
        return (lesson_num - 1) // 5 + 1

    lesson_blocks = re.split(r'\n(?=## Lesson \d+:)', content)[1:]

    items = []

    for idx, block in enumerate(lesson_blocks, 1):
        m = re.match(r'## Lesson (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if not m:
            print(f"Error matching lesson block {idx}")
            continue
        lesson_num = int(m.group(1))
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
                ref = header_m.group(1).strip().replace('–', '-')
                url = get_bible_url(ref, "NLT", 116)
                
                # Extract blockquote lines
                quote_lines = re.findall(r'^[>\s]*(.*)', p_block, re.MULTILINE)
                clean_lines = ' '.join([l.lstrip('>').strip() for l in quote_lines if l.lstrip('>').strip()])
                clean_text = re.sub(r'<sup>(\d+)</sup>\s*', r'\1 ', clean_lines)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                passages.append({
                    "reference": ref,
                    "url": url,
                    "text": clean_text
                })
        else:
            # Fallback if no scripture section found
            p_matches = re.findall(r'\*\*([^*]+)\s*\((?:NLT|BSB|NIV)\)\*\*', body)
            for p in p_matches:
                ref = p.strip().replace('–', '-')
                url = get_bible_url(ref, "NLT", 116)
                passages.append({
                    "reference": ref,
                    "url": url
                })

        # 2. Historical & Cultural Context
        hist_match = re.search(r'### 2\. Historical & Cultural Context\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        # 3. Main Devotional Reading + Checkpoint if present
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

        # 5. Action Step (Key Practice)
        practice_match = re.search(r'### 5\. Action Step\s*\n(.*?)(?=\n### 6\. Prayer)', body, re.DOTALL)
        practice_items = []
        if practice_match:
            p_text = practice_match.group(1).strip()
            practice_items.append(p_text)

        # 6. Personal Prayer
        prayer_match = re.search(r'### 6\. Prayer\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            raw_prayer = prayer_match.group(1).strip()
            if raw_prayer.startswith('*') and raw_prayer.endswith('*'):
                raw_prayer = raw_prayer[1:-1].strip()
            prayer_text = raw_prayer

        mod = module_info[get_module_num(lesson_num)]
        mod_header = f"> 📌 **{mod['name']}** *({mod['lessons']})*  \n> **Core Habit**: *{mod['habit']}*\n\n"

        if lesson_num == 1:
            intro_prefix = (
                "### 📖 Welcome to Growing Leaders (Essentials Edition)\n\n"
                "Whether you are stepping into Christian leadership for the first time, directing a team, serving in your church, "
                "or desiring to grow in spiritual maturity in your daily workplace and family, this 30-lesson leadership journey is "
                "designed to anchor your leadership in the character, wisdom, and heart of Jesus Christ.\n\n"
                "#### The 4 Foundations of Christian Leadership\n"
                "1. **HEAD (Biblical Mindset)**: Thinking with the truth of the Bible rather than the world's ideas about power.\n"
                "2. **HEART (Spiritual Character)**: Letting the Holy Spirit heal your insecurities, purify your motives, and build love.\n"
                "3. **HANDS (Practical Skills)**: Growing in how you communicate, make decisions, handle conflict, and help others succeed.\n"
                "4. **HABITS (Daily Rhythms)**: Practicing simple daily routines that give you strength and keep you from burning out.\n\n"
                "---\n\n"
            )
            devotional_content = f"{intro_prefix}{mod_header}### Historical & Cultural Context\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"
            practice_items = [
                "**Course Onboarding**: Commit to setting aside 10 unhurried minutes each day for Scripture, reflection, and prayer.",
                *practice_items
            ]
        else:
            devotional_content = f"{mod_header}### Historical & Cultural Context\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"

        item = {
            "item": lesson_num,
            "title": f"Lesson {lesson_num}: {title}",
            "passages": passages,
            "devotional": {
                "author": "Growing Leaders Course",
                "content": devotional_content
            },
            "prayers": [
                {
                    "topic": "Personal Prayer",
                    "description": prayer_text
                }
            ],
            "reflect": reflect_questions,
            "practice": practice_items
        }
        items.append(item)
        print(f"Lesson {lesson_num:2d}: {title[:36]:<36} | {passages[0]['url'] if passages else 'No passage'}")

    print(f"\nSuccessfully parsed {len(items)} lessons.")

    plan_json = {
        "id": "growing-leaders-essentials",
        "title": "Growing Leaders (Essentials Edition)",
        "description": "A 30-lesson practical leadership journey in clear, accessible everyday language with NLT Scripture, exploring how God shapes your story, character, faithfulness, gifts, relationships, and life with Him.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-25",
        "version": "1.0",
        "iconUrl": "https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?auto=format&fit=crop&w=320&h=320&q=80",
        "bannerUrl": "https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?auto=format&fit=crop&w=1440&h=810&q=80",
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

    # Update public/plans.json and dist/plans.json
    for catalog_file in [plans_catalog, dist_catalog]:
        if os.path.exists(catalog_file):
            with open(catalog_file, 'r', encoding='utf-8') as f:
                catalog = json.load(f)

            # Check if growing-leaders-essentials already in catalog
            found = False
            new_entry = {
                "id": "growing-leaders-essentials",
                "title": "Growing Leaders (Essentials Edition)",
                "description": "A 30-lesson practical leadership journey in clear, accessible everyday language with NLT Scripture, exploring how God shapes your story, character, faithfulness, gifts, relationships, and life with Him.",
                "type": "reading",
                "totalItems": len(items),
                "url": "plans/growing-leaders-essentials.json",
                "creator": "Growing Leaders Course",
                "version": "1.0",
                "created": "2026-08-25",
                "lastUpdated": "2026-08-25",
                "tags": [
                    "Leadership",
                    "Character",
                    "Spiritual Formation",
                    "Devotional",
                    "Discipleship",
                    "Essentials"
                ],
                "featured": False
            }

            for idx, plan in enumerate(catalog.get('plans', [])):
                if plan.get('id') == 'growing-leaders-essentials':
                    catalog['plans'][idx] = new_entry
                    found = True
                    break

            if not found:
                # Insert right after growing-leaders if present
                inserted = False
                for idx, plan in enumerate(catalog.get('plans', [])):
                    if plan.get('id') == 'growing-leaders':
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
