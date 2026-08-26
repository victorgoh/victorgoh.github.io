import re
import json
import os
import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BOOK_TO_USFM = {
    "genesis": "GEN", "exodus": "EXO", "leviticus": "LEV", "numbers": "NUM", "deuteronomy": "DEU",
    "joshua": "JOS", "judges": "JDG", "ruth": "RUT", "1 samuel": "1SA", "2 samuel": "2SA",
    "1 kings": "1KI", "2 kings": "2KI", "1 chronicles": "1CH", "2 chronicles": "2CH", "ezra": "EZR",
    "nehemiah": "NEH", "esther": "EST", "job": "JOB", "psalm": "PSA", "psalms": "PSA",
    "proverbs": "PRO", "ecclesiastes": "ECC", "song of solomon": "SNG", "isaiah": "ISA",
    "jeremiah": "JER", "lamentations": "LAM", "ezekiel": "EZK", "daniel": "DAN", "hosea": "HOS",
    "joel": "JOL", "amos": "AMO", "obadiah": "OBA", "jonah": "JON", "micah": "MIC",
    "nahum": "NAM", "habakkuk": "HAB", "zephaniah": "ZEP", "haggai": "HAG", "zechariah": "ZEC",
    "malachi": "MAL", "matthew": "MAT", "mark": "MRK", "luke": "LUK", "john": "JHN",
    "acts": "ACT", "romans": "ROM", "1 corinthians": "1CO", "2 corinthians": "2CO",
    "galatians": "GAL", "ephesians": "EPH", "philippians": "PHP", "colossians": "COL",
    "1 thessalonians": "1TH", "2 thessalonians": "2TH", "1 timothy": "1TI", "2 timothy": "2TI",
    "titus": "TIT", "philemon": "PHM", "hebrews": "HEB", "james": "JAS", "1 peter": "1PE",
    "2 peter": "2PE", "1 john": "1JN", "2 john": "2JN", "3 john": "3JN", "jude": "JUD",
    "revelation": "REV"
}

def get_bible_url(ref, version="BSB", version_id=3034):
    ref_clean = ref.strip().replace('–', '-')
    m = re.match(r'^((?:\d\s+)?[A-Za-z\s]+)\s+(\d+)(?::([0-9\-]+))?$', ref_clean)
    if not m:
        encoded = urllib.parse.quote(ref_clean)
        return f"https://www.biblegateway.com/passage/?search={encoded}&version={version}"
    
    book_raw = m.group(1).strip().lower()
    chapter = m.group(2).strip()
    verses = m.group(3)
    usfm = BOOK_TO_USFM.get(book_raw)
    if usfm:
        if verses:
            return f"https://www.bible.com/bible/{version_id}/{usfm}.{chapter}.{verses}.{version}"
        else:
            return f"https://www.bible.com/bible/{version_id}/{usfm}.{chapter}.{version}"
    encoded = urllib.parse.quote(ref_clean)
    return f"https://www.biblegateway.com/passage/?search={encoded}&version={version}"

# HelloAO chapter cache
helloao_cache = {}

def fetch_helloao_verses(ref, translation="BSB"):
    ref_clean = ref.strip().replace('–', '-')
    m = re.match(r'^((?:\d\s+)?[A-Za-z\s]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$', ref_clean)
    if not m:
        return ""
    
    book_raw = m.group(1).strip().lower()
    chapter = int(m.group(2).strip())
    start_v = int(m.group(3)) if m.group(3) else None
    end_v = int(m.group(4)) if m.group(4) else start_v
    
    usfm = BOOK_TO_USFM.get(book_raw)
    if not usfm:
        return ""
    
    cache_key = f"{translation}_{usfm}_{chapter}"
    if cache_key not in helloao_cache:
        url = f"https://bible.helloao.org/api/{translation}/{usfm}/{chapter}.json"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=10) as res:
                data = json.loads(res.read().decode('utf-8'))
                helloao_cache[cache_key] = data
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
            return ""
    
    data = helloao_cache.get(cache_key)
    if not data:
        return ""
    
    verse_texts = []
    
    def extract_text(item_content):
        res = []
        for elem in item_content:
            if isinstance(elem, str):
                res.append(elem)
            elif isinstance(elem, dict):
                if 'text' in elem:
                    res.append(elem['text'])
                elif 'content' in elem and isinstance(elem['content'], list):
                    res.append(extract_text(elem['content']))
        return " ".join(res)

    for item in data.get('chapter', {}).get('content', []):
        if isinstance(item, dict) and item.get('type') == 'verse':
            v_num = item.get('number')
            if v_num is not None:
                if start_v is None or (v_num >= start_v and v_num <= end_v):
                    v_str = extract_text(item.get('content', []))
                    clean_v = re.sub(r'\s+', ' ', v_str).strip()
                    if clean_v:
                        verse_texts.append(f"{v_num} {clean_v}")
    
    return " ".join(verse_texts)

# -------------------------------------------------------------
# 1. Update Growing Leaders (BSB Edition)
# -------------------------------------------------------------
def update_growing_leaders_bsb():
    print("\n--- Updating growing-leaders (BSB) ---")
    with open('content/30-days-of-growing-leaders-bsb.md', 'r', encoding='utf-8') as f:
        content = f.read()

    lesson_blocks = re.split(r'\n(?=## Lesson \d+:)', content)[1:]
    items = []

    module_info = {
        1: {"name": "Module 1: God Uses Your Story", "lessons": "Lessons 1–5", "habit": "Reflect and Grow"},
        2: {"name": "Module 2: God Forms Your Character", "lessons": "Lessons 6–10", "habit": "Pause and Pray"},
        3: {"name": "Module 3: God Builds Your Faithfulness", "lessons": "Lessons 11–15", "habit": "Capture and Clarify"},
        4: {"name": "Module 4: God Develops Your Gifts", "lessons": "Lessons 16–20", "habit": "Serve to Discover"},
        5: {"name": "Module 5: God Shapes How You Lead People", "lessons": "Lessons 21–25", "habit": "Understand before Solving"},
        6: {"name": "Module 6: God Deepens Your Life With Him", "lessons": "Lessons 26–30", "habit": "Abide to Grow"}
    }

    for idx, block in enumerate(lesson_blocks, 1):
        m = re.match(r'## Lesson (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if not m:
            continue
        lesson_num = int(m.group(1))
        title = m.group(2).strip()
        body = m.group(3)

        # Scripture passages with bundled BSB text
        passages = []
        m_scripture = re.search(r'### 1\. Scripture Text\s*\n(.*?)(?=\n### 2\.)', body, re.DOTALL)
        if m_scripture:
            scripture_section = m_scripture.group(1).strip()
            passages_raw = re.split(r'\n(?=\*\*[^*]+\((?:BSB|NIV)\)\*\*)', scripture_section)
            for p_block in passages_raw:
                header_m = re.search(r'\*\*([^*]+)\s*\((?:BSB|NIV)\)\*\*', p_block)
                if not header_m:
                    continue
                ref = header_m.group(1).strip().replace('–', '-')
                url = get_bible_url(ref, "BSB", 3034)
                
                quote_lines = re.findall(r'^[>\s]*(.*)', p_block, re.MULTILINE)
                clean_lines = ' '.join([l.lstrip('>').strip() for l in quote_lines if l.lstrip('>').strip()])
                clean_text = re.sub(r'<sup>(\d+)</sup>\s*', r'\1 ', clean_lines)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                passages.append({
                    "reference": ref,
                    "url": url,
                    "text": clean_text
                })

        # Historical Context
        hist_match = re.search(r'### 2\. Historical & Cultural Context\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        # Devotional
        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Facilitator & Personal Reflection Questions)', body, re.DOTALL)
        if dev_match:
            dev_title = re.sub(r"^Devotional Reflection:\s*", "", dev_match.group(1).strip())
            dev_body = dev_match.group(2).strip()
            dev_body = re.sub(r'\n+---\s*$', '', dev_body)
        else:
            dev_title = "Devotional Reading"
            dev_body = ""

        # Reflection Questions
        reflect_match = re.search(r'### 4\. Facilitator & Personal Reflection Questions\s*\n(.*?)(?=\n### 5\. Key Practice)', body, re.DOTALL)
        reflect_questions = []
        if reflect_match:
            for line in reflect_match.group(1).strip().split('\n'):
                line = line.strip()
                q_m = re.match(r'^\d+\.\s*(.*)', line)
                if q_m:
                    reflect_questions.append(q_m.group(1).strip())

        # Key Practice
        practice_match = re.search(r'### 5\. Key Practice\s*\n(.*?)(?=\n### 6\. Personal Prayer)', body, re.DOTALL)
        practice_items = []
        if practice_match:
            practice_items.append(practice_match.group(1).strip())

        # Prayer
        prayer_match = re.search(r'### 6\. Personal Prayer\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            raw_prayer = prayer_match.group(1).strip()
            if raw_prayer.startswith('*') and raw_prayer.endswith('*'):
                raw_prayer = raw_prayer[1:-1].strip()
            prayer_text = raw_prayer

        mod = module_info[(lesson_num - 1) // 5 + 1]
        mod_header = f"> 📌 **{mod['name']}** *({mod['lessons']})*  \n> **Core Habit**: *{mod['habit']}*\n\n"

        if lesson_num == 1:
            intro_prefix = (
                "### 📖 Welcome to Growing Leaders\n\n"
                "Whether you are stepping into Christian leadership for the first time, directing a team, pastoring a congregation, "
                "or desiring to grow in spiritual maturity in your daily workplace and family, this 30-lesson leadership journey is "
                "designed to anchor your leadership in the character, wisdom, and heart of Jesus Christ.\n\n"
                "#### The 4 Foundations of Holistic Leadership\n"
                "1. **HEAD (Biblical Convictions & Mindset)**: Aligning our thinking with the truth of Scripture rather than secular power models.\n"
                "2. **HEART (Character & Spiritual Formation)**: Allowing the Holy Spirit to purify our motives, heal our insecurities, and cultivate Christlike fruit.\n"
                "3. **HANDS (Competence & Practical Skills)**: Developing our communication, delegation, decision-making, and relational skills.\n"
                "4. **HABITS (Sustainable Daily Rhythms)**: Embedding lifelong practices that sustain our stamina and prevent burnout.\n\n"
                "---\n\n"
            )
            devotional_content = f"{intro_prefix}{mod_header}### Historical & Cultural Context\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"
            practice_items = [
                "**Course Onboarding**: Commit to setting aside unhurried time each day for Scripture, reflection, and prayer.",
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

    plan_json = {
        "id": "growing-leaders",
        "title": "Growing Leaders: 30-Lesson Leadership Journey",
        "description": "A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-21",
        "version": "1.1",
        "iconUrl": "https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?auto=format&fit=crop&w=320&h=320&q=80",
        "bannerUrl": "https://images.unsplash.com/reserve/bOvf94dPRxWu0u3QsPjF_tree.jpg?auto=format&fit=crop&w=1440&h=810&q=80",
        "items": items
    }

    for target in ['public/plans/growing-leaders.json', 'dist/plans/growing-leaders.json']:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(plan_json, f, indent=2, ensure_ascii=False)
        print(f"Saved: {target}")

# -------------------------------------------------------------
# 2. Update Apostolic Prayers (BSB Edition)
# -------------------------------------------------------------
def update_prayers_of_paul_bsb():
    print("\n--- Updating prayers-of-paul (BSB) ---")
    with open('content/prayers-of-paul.md', 'r', encoding='utf-8') as f:
        content = f.read()

    session_blocks = re.split(r'\n(?=## Session \d+:)', content)[1:]
    items = []

    for idx, block in enumerate(session_blocks, 1):
        m = re.match(r'## Session (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if not m:
            continue
        session_num = int(m.group(1))
        title = m.group(2).strip()
        body = m.group(3)

        passages = []
        m_scripture = re.search(r'### 1\. Scripture Text\s*\n(.*?)(?=\n### 2\.)', body, re.DOTALL)
        if m_scripture:
            scripture_section = m_scripture.group(1).strip()
            passages_raw = re.split(r'\n(?=\*\*[^*]+\((?:BSB|NIV)\)\*\*)', scripture_section)
            for p_block in passages_raw:
                header_m = re.search(r'\*\*([^*]+)\s*\((?:BSB|NIV)\)\*\*', p_block)
                if not header_m:
                    continue
                full_ref_header = header_m.group(1).strip()
                quote_lines = re.findall(r'^[>\s]*(.*)', p_block, re.MULTILINE)
                clean_lines = ' '.join([l.lstrip('>').strip() for l in quote_lines if l.lstrip('>').strip()])
                clean_text = re.sub(r'\[(\d+)\]\s*', r'\1 ', clean_lines)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()

                sub_refs = [r.strip().replace('–', '-') for r in full_ref_header.split(';')]
                if len(sub_refs) == 1:
                    passages.append({
                        "reference": sub_refs[0],
                        "url": get_bible_url(sub_refs[0], "BSB", 3034),
                        "text": clean_text
                    })
                else:
                    for sub_r in sub_refs:
                        passages.append({
                            "reference": sub_r,
                            "url": get_bible_url(sub_r, "BSB", 3034),
                            "text": clean_text
                        })

        hist_match = re.search(r'### 2\. Context & Insight\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Personal Prayer)', body, re.DOTALL)
        if dev_match:
            dev_title = re.sub(r"^Devotional Reflection:\s*", "", dev_match.group(1).strip())
            dev_body = dev_match.group(2).strip()
        else:
            dev_title = "Devotional Reflection"
            dev_body = ""

        reflect_match = re.search(r'### 5\. Facilitator & Group Discussion\s*\n(.*?)(?=\n### 6\. Posture & Practice)', body, re.DOTALL)
        reflect_questions = []
        if reflect_match:
            for line in reflect_match.group(1).strip().split('\n'):
                line = line.strip()
                q_m = re.match(r'^\d+\.\s*(.*)', line)
                if q_m:
                    reflect_questions.append(q_m.group(1).strip())

        practice_match = re.search(r'### 6\. Posture & Practice\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
        practice_items = []
        if practice_match:
            for line in practice_match.group(1).strip().split('\n'):
                line = line.strip()
                if line.startswith('* '):
                    practice_items.append(line[2:].strip())

        prayer_match = re.search(r'### 4\. Personal Prayer\s*\n(.*?)(?=\n### 5\.)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            raw_prayer = prayer_match.group(1).strip()
            if raw_prayer.startswith('_') and raw_prayer.endswith('_'):
                raw_prayer = raw_prayer[1:-1].strip()
            prayer_text = raw_prayer

        devotional_content = f"### Context & Insight\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"

        item = {
            "item": session_num,
            "title": title,
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
            "practice": practice_items
        }
        items.append(item)

    plan_json = {
        "id": "prayers-of-paul",
        "title": "Apostolic Prayers: Cultivating Wisdom, Power, and Love",
        "description": "A 12-session devotional study on prayer, spiritual formation, and kingdom growth drawn from the transformative prayers of Paul.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-24",
        "version": "1.1",
        "iconUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=320&h=320&q=80",
        "bannerUrl": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1440&h=810&q=80",
        "items": items
    }

    for target in ['public/plans/prayers-of-paul.json', 'dist/plans/prayers-of-paul.json']:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(plan_json, f, indent=2, ensure_ascii=False)
        print(f"Saved: {target}")

# -------------------------------------------------------------
# 3. Update Leadership Lessons (BSB Edition)
# -------------------------------------------------------------
def update_leadership_lessons_bsb():
    print("\n--- Updating leadership-lessons (BSB) ---")
    with open('content/leadership-lessons-from-the-bible.md', 'r', encoding='utf-8') as f:
        content = f.read()

    session_blocks = re.split(r'\n(?=## Session \d+:)', content)[1:]
    items = []

    for idx, block in enumerate(session_blocks, 1):
        m = re.match(r'## Session (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if not m:
            continue
        session_num = int(m.group(1))
        title = m.group(2).strip()
        body = m.group(3)

        passages = []
        m_scripture = re.search(r'### 1\. Scripture Text\s*\n(.*?)(?=\n### 2\.)', body, re.DOTALL)
        if m_scripture:
            scripture_section = m_scripture.group(1).strip()
            passages_raw = re.split(r'\n(?=\*\*[^*]+\((?:BSB|NIV)\)\*\*)', scripture_section)
            for p_block in passages_raw:
                header_m = re.search(r'\*\*([^*]+)\s*\((?:BSB|NIV)\)\*\*', p_block)
                if not header_m:
                    continue
                ref = header_m.group(1).strip().replace('–', '-')
                url = get_bible_url(ref, "BSB", 3034)
                
                quote_lines = re.findall(r'^[>\s]*(.*)', p_block, re.MULTILINE)
                clean_lines = ' '.join([l.lstrip('>').strip() for l in quote_lines if l.lstrip('>').strip()])
                clean_text = re.sub(r'^\d+:\d+\s*', '', clean_lines)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                passages.append({
                    "reference": ref,
                    "url": url,
                    "text": clean_text
                })

        hist_match = re.search(r'### 2\. Context & Insight\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Personal Prayer)', body, re.DOTALL)
        if dev_match:
            dev_title = re.sub(r"^Devotional Reflection:\s*", "", dev_match.group(1).strip())
            dev_body = dev_match.group(2).strip()
        else:
            dev_title = "Devotional Reflection"
            dev_body = ""

        reflect_match = re.search(r'### 5\. Facilitator Discussion Guide\s*\n(.*?)(?=\n### 6\. Posture & Practice)', body, re.DOTALL)
        reflect_questions = []
        if reflect_match:
            for line in reflect_match.group(1).strip().split('\n'):
                line = line.strip()
                q_m = re.match(r'^\d+\.\s*(.*)', line)
                if q_m:
                    reflect_questions.append(q_m.group(1).strip())

        practice_match = re.search(r'### 6\. Posture & Practice\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
        practice_items = []
        if practice_match:
            for line in practice_match.group(1).strip().split('\n'):
                line = line.strip()
                if line.startswith('* '):
                    practice_items.append(line[2:].strip())

        prayer_match = re.search(r'### 4\. Personal Prayer\s*\n(.*?)(?=\n### 5\.)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            raw_prayer = prayer_match.group(1).strip()
            if raw_prayer.startswith('_') and raw_prayer.endswith('_'):
                raw_prayer = raw_prayer[1:-1].strip()
            prayer_text = raw_prayer

        devotional_content = f"### Context & Insight\n\n{hist_text}\n\n### {dev_title}\n\n{dev_body}"

        item = {
            "item": session_num,
            "title": title,
            "passages": passages,
            "devotional": {
                "author": "Leadership Lesson Material",
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

    plan_json = {
        "id": "leadership-lessons",
        "title": "Lessons in Leadership: Biblical Wisdom from God's Servants",
        "description": "A 6-session Bible study on character, calling, and influence drawn from the lives, struggles, and triumphs of biblical figures.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-24",
        "version": "1.3",
        "items": items
    }

    for target in ['public/plans/leadership-lessons.json', 'dist/plans/leadership-lessons.json']:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(plan_json, f, indent=2, ensure_ascii=False)
        print(f"Saved: {target}")

# -------------------------------------------------------------
# 4. Update With Christ in the School of Prayer (BSB Text from API)
# -------------------------------------------------------------
def update_with_christ_in_school_of_prayer_bsb():
    print("\n--- Updating with-christ-in-school-of-prayer (BSB) ---")
    plan_path = 'public/plans/with-christ-in-school-of-prayer.json'
    with open(plan_path, 'r', encoding='utf-8') as f:
        plan = json.load(f)

    for item in plan.get('items', []):
        for p in item.get('passages', []):
            ref = p.get('reference', '')
            if ref and not p.get('text'):
                text = fetch_helloao_verses(ref, "BSB")
                if text:
                    p['text'] = text
                    print(f"  Day {item['item']:2d} [{ref}]: {text[:60]}...")
                else:
                    print(f"  Day {item['item']:2d} [{ref}]: Could not fetch text")

    plan['totalItems'] = len(plan.get('items', []))

    for target in ['public/plans/with-christ-in-school-of-prayer.json', 'dist/plans/with-christ-in-school-of-prayer.json']:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with open(target, 'w', encoding='utf-8') as f:
            json.dump(plan, f, indent=2, ensure_ascii=False)
        print(f"Saved: {target}")

def main():
    update_growing_leaders_bsb()
    update_prayers_of_paul_bsb()
    update_leadership_lessons_bsb()
    update_with_christ_in_school_of_prayer_bsb()
    print("\nAll plans updated successfully with bundled Scripture text!")

if __name__ == '__main__':
    main()
