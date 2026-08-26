import re
import json
import urllib.parse
import os

# --- 1. Update GROWING-LEADERS-COMPLETE-COURSE.md in both locations ---
def update_course_markdown(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace top-level Session headers
    content = re.sub(r'# Session (\d+):', r'# Module \1:', content)
    content = re.sub(r'## I\.9 Before the first session', r'## I.9 Before the first module', content)
    content = re.sub(r'through these six sessions\?', r'through these six modules?', content)
    content = re.sub(r'across six sessions', r'across six modules', content)
    content = re.sub(r'over six sessions', r'over six modules', content)
    content = re.sub(r'Six sessions exploring', r'Six modules exploring', content)
    content = re.sub(r'between sessions', r'between modules', content)
    content = re.sub(r'in this session', r'in this module', content)
    content = re.sub(r'in each session', r'in each module', content)
    content = re.sub(r'during the session', r'during the module', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath} successfully!")

# --- 2. Update content/30-days-of-growing-leaders-updated.md ---
def update_devotional_markdown():
    filepath = 'content/30-days-of-growing-leaders-updated.md'
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # Title & Intro
    text = re.sub(r'# 30 Days of Growing Leaders: Daily Devotional & Leadership Guide',
                  r'# Growing Leaders: 30-Lesson Devotional & Leadership Guide', text)
    text = re.sub(r'> \*\*A 30-Day Spiritual Journey in Calling, Character, Competence, and Community\*\*',
                  r'> **A 30-Lesson Leadership Journey Across 6 Modules**', text)
    text = re.sub(r'Welcome to \*\*30 Days of Growing Leaders\*\*',
                  r'Welcome to **Growing Leaders**', text)
    text = re.sub(r'this 30-day devotional journey',
                  r'this 30-lesson devotional journey', text)
    text = re.sub(r'30 daily devotionals',
                  r'30 standalone lessons', text)
    text = re.sub(r'30-day journey',
                  r'30-lesson journey', text)
    text = re.sub(r'# Session (\d+):', r'# Module \1:', text)
    text = re.sub(r'\bSession (\d+)\b', r'Module \1', text)
    text = re.sub(r'\(Days (\d+)–(\d+)\)', r'(Lessons \1–\2)', text)
    text = re.sub(r'\(Days (\d+)-(\d+)\)', r'(Lessons \1–\2)', text)
    text = re.sub(r'## Day (\d+):', r'## Lesson \1:', text)
    text = re.sub(r'### Session (\d+) Review Checkpoint', r'### Module \1 Review Checkpoint', text)
    text = re.sub(r'### 🔍 Session (\d+) Review Checkpoint', r'### 🔍 Module \1 Review Checkpoint', text)
    text = re.sub(r'30 Days of Growing Leaders', r'Growing Leaders: 30-Lesson Leadership Journey', text)
    text = re.sub(r'30-Day Growth Synthesis', r'30-Lesson Growth Synthesis', text)
    text = re.sub(r'over Days (\d+) to (\d+)', r'over Lessons \1 to \2', text)
    text = re.sub(r'over Days (\d+) and (\d+)', r'over Lessons \1 and \2', text)
    text = re.sub(r'over the past 30 days', r'over these 30 lessons', text)
    text = re.sub(r'across all 30 days', r'across all 30 lessons', text)
    text = re.sub(r'over these 30 days', r'over these 30 lessons', text)
    text = re.sub(r'over the next 30 days', r'over the next 30 lessons', text)
    text = re.sub(r'these 30 days', r'these 30 lessons', text)
    text = re.sub(r'a 30-day event', r'a 30-lesson event', text)

    # Table of contents update
    text = re.sub(r'\[Session (\d+): ([^\]]+) \(Days (\d+)–(\d+)\)\]\(#session-(\d+)-([^\)]+)\)',
                  r'[Module \1: \2 (Lessons \3–\4)](#module-\1-\6)', text)
    text = re.sub(r'\[Day (\d+): ([^\]]+)\]\(#day-(\d+)-([^\)]+)\)',
                  r'[Lesson \1: \2](#lesson-\1-\4)', text)

    # Module definitions for context badges
    modules = {
        1: ("Module 1: God Uses Your Story", "Reflect and Grow", range(1, 6)),
        2: ("Module 2: God Forms Your Character", "Pause and Pray", range(6, 11)),
        3: ("Module 3: God Builds Your Faithfulness", "Capture and Clarify", range(11, 16)),
        4: ("Module 4: God Develops Your Gifts", "Serve to Discover", range(16, 21)),
        5: ("Module 5: God Shapes How You Lead People", "Understand before Solving", range(21, 26)),
        6: ("Module 6: God Deepens Your Life With Him", "Abide to Grow", range(26, 31)),
    }

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"Updated {filepath} with Module & Lesson taxonomy successfully!")

# --- 3. Generate public/plans/growing-leaders.json ---
def generate_json_plan():
    with open('content/30-days-of-growing-leaders-updated.md', 'r', encoding='utf-8') as f:
        md_text = f.read()

    modules_info = [
        (1, "God Uses Your Story", "Reflect and Grow", 1, 5),
        (2, "God Forms Your Character", "Pause and Pray", 6, 10),
        (3, "God Builds Your Faithfulness", "Capture and Clarify", 11, 15),
        (4, "God Develops Your Gifts", "Serve to Discover", 16, 20),
        (5, "God Shapes How You Lead People", "Understand before Solving", 21, 25),
        (6, "God Deepens Your Life With Him", "Abide to Grow", 26, 30),
    ]

    def get_module_for_lesson(lesson_num):
        for mod_num, mod_name, habit, start_l, end_l in modules_info:
            if start_l <= lesson_num <= end_l:
                return mod_num, mod_name, habit, start_l, end_l
        return 1, "God Uses Your Story", "Reflect and Grow", 1, 5

    def parse_lesson_block(lesson_num, title, body):
        passages = []
        p_matches = re.findall(r'\*\*([A-Za-z0-9\s:]+(?:[–\-][0-9:]+)?(?:\s*,\s*[0-9–\-]+)?)\s*\((?:NIV|BSB)\)\*\*', body)
        for p in p_matches:
            ref = p.strip().replace('–', '-')
            encoded_ref = urllib.parse.quote(ref)
            url = f"https://www.biblegateway.com/passage/?search={encoded_ref}&version=NIV"
            passages.append({
                "reference": ref,
                "url": url
            })

        # Bible Word Insight
        bwi_match = re.search(r'### 2\. Bible Word Insight\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        bwi_text = bwi_match.group(1).strip() if bwi_match else ""

        # Devotional essay + optional Checkpoint
        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Facilitator & Personal Reflection Questions)', body, re.DOTALL)
        if dev_match:
            dev_title = dev_match.group(1).strip()
            dev_body = dev_match.group(2).strip()
            dev_body = re.sub(r'\n+---\s*$', '', dev_body)
        else:
            dev_title = "Devotional"
            dev_body = ""

        mod_num, mod_name, habit, start_l, end_l = get_module_for_lesson(lesson_num)
        context_badge = f"> 📌 **Module {mod_num}: {mod_name}** *(Lessons {start_l}–{end_l})*  \n> **Core Habit**: *{habit}*"

        devotional_content = f"{context_badge}\n\n### Bible Word Insight\n\n{bwi_text}\n\n### {dev_title}\n\n{dev_body}"

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
            p_text = practice_match.group(1).strip()
            practice_items.append(p_text)

        # Personal Prayer
        prayer_match = re.search(r'### 6\. Personal Prayer\s*\n(.*?)(?=\n---|\Z)', body, re.DOTALL)
        prayer_text = ""
        if prayer_match:
            prayer_raw = prayer_match.group(1).strip()
            if prayer_raw.startswith('*') and prayer_raw.endswith('*'):
                prayer_raw = prayer_raw[1:-1].strip()
            prayer_text = prayer_raw

        prayers = [
            {
                "topic": "Personal Prayer",
                "description": prayer_text
            }
        ]

        return {
            "title": title,
            "passages": passages,
            "devotional": {
                "author": "Growing Leaders",
                "content": devotional_content
            },
            "prayers": prayers,
            "reflect": reflect_questions,
            "practice": practice_items
        }

    day_blocks = re.split(r'\n(?=## Lesson \d+:)', md_text)

    items = []

    # Item 1: Introduction
    intro_item = {
        "item": 1,
        "title": "Introduction: The 4 Foundations of Growing Leaders",
        "passages": [
            {
                "reference": "Mark 10:42-45",
                "url": "https://www.biblegateway.com/passage/?search=Mark%2010%3A42-45&version=NIV"
            },
            {
                "reference": "2 Timothy 2:1-2",
                "url": "https://www.biblegateway.com/passage/?search=2%20Timothy%202%3A1-2&version=NIV"
            }
        ],
        "devotional": {
            "author": "Growing Leaders Course",
            "content": "### Welcome to Growing Leaders\n\nWhether you are stepping into Christian leadership for the first time, directing a ministry team, pastoring a congregation, or desiring to grow in spiritual maturity in your workplace and family, this 30-lesson leadership journey is designed to anchor your leadership in the character, wisdom, and heart of Jesus Christ.\n\n### The 4 Foundations of Holistic Leadership\n\nIn Kingdom leadership, God shapes us across four vital dimensions:\n\n1. **HEAD (Biblical Convictions & Mindset)**: Aligning our thinking with the truth of Scripture rather than secular power models.\n2. **HEART (Character & Spiritual Formation)**: Allowing the Holy Spirit to purify our motives, heal our insecurities, and cultivate Christlike fruit.\n3. **HANDS (Competence & Practical Skills)**: Developing our communication, delegation, decision-making, and relational skills.\n4. **HABITS (Sustainable Daily Rhythms)**: Embedding lifelong practices that sustain our stamina and prevent burnout.\n\n### The 6 Core Modules (5 Lessons Each)\n\n- **Module 1: God Uses Your Story (Lessons 1–5)** — *Core Habit: Reflect and Grow*\n- **Module 2: God Forms Your Character (Lessons 6–10)** — *Core Habit: Pause and Pray*\n- **Module 3: God Builds Your Faithfulness (Lessons 11–15)** — *Core Habit: Capture and Clarify*\n- **Module 4: God Develops Your Gifts (Lessons 16–20)** — *Core Habit: Serve to Discover*\n- **Module 5: God Shapes How You Lead People (Lessons 21–25)** — *Core Habit: Understand before Solving*\n- **Module 6: God Deepens Your Life With Him (Lessons 26–30)** — *Core Habit: Abide to Grow*\n\nMay the Holy Spirit shape your heart over these 30 lessons to reflect the Shepherd-Leader, Jesus Christ."
        },
        "prayers": [
            {
                "topic": "Prayer for Transformation",
                "description": "Lord Jesus Christ, True Vine and Good Shepherd, as I begin this 30-lesson journey of leadership formation, align my heart with Yours. Search my motives, heal my wounds, teach me Your ways, and form the character of Christ within me. May my life and leadership bring enduring fruit for Your Kingdom. Amen."
            }
        ],
        "reflect": [
            "What is your primary prayer and expectation as you begin this 30-lesson leadership journey?",
            "Which of the four leadership dimensions (Head, Heart, Hands, Habits) feels like your biggest area for growth right now?",
            "Who is a mentor, peer, or group you can invite to walk through these 30 lessons with you?"
        ],
        "practice": [
            "Commit to setting aside unhurried time for each lesson for Scripture, reflection, and prayer.",
            "Keep a journal ready to record the weekly habits (Notice & Learn, Pause & Bring It, Record & Follow Through, Serve-Notice-Ask, Understand before Solving, Abide & Review)."
        ]
    }
    items.append(intro_item)

    lesson_count = 0
    for block in day_blocks:
        match = re.match(r'## Lesson (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if match:
            lesson_num = int(match.group(1))
            title = match.group(2).strip()
            body = match.group(3)
            parsed = parse_lesson_block(lesson_num, title, body)

            day_item = {
                "item": len(items) + 1,
                "title": f"Lesson {lesson_num}: {title}",
                "passages": parsed["passages"],
                "devotional": parsed["devotional"],
                "prayers": parsed["prayers"],
                "reflect": parsed["reflect"],
                "practice": parsed["practice"]
            }
            items.append(day_item)
            lesson_count += 1

    print(f"Parsed {lesson_count} lessons from markdown. Total items in plan: {len(items)}")

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

    with open('public/plans/growing-leaders.json', 'w', encoding='utf-8') as f:
        json.dump(plan_json, f, indent=2, ensure_ascii=False)

    print("Created public/plans/growing-leaders.json successfully!")

# --- 4. Update public/plans.json ---
def update_plans_json():
    with open('public/plans.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    for p in data.get('plans', []):
        if p.get('id') == 'growing-leaders':
            p['title'] = "Growing Leaders: 30-Lesson Leadership Journey"
            p['description'] = "A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him."
            p['totalItems'] = 31

    with open('public/plans.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Updated public/plans.json successfully!")

if __name__ == '__main__':
    update_course_markdown('content/GROWING-LEADERS-COMPLETE-COURSE.md')
    update_course_markdown('/Users/victorgoh/Projects/agentic-code/growing-leaders/GROWING-LEADERS-COMPLETE-COURSE.md')
    update_devotional_markdown()
    generate_json_plan()
    update_plans_json()
