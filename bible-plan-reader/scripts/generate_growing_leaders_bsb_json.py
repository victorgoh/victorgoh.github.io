import re
import json
import urllib.parse
import os

def get_biblehub_url(ref):
    ref_clean = ref.strip().replace('–', '-')
    m = re.match(r'^((?:\d\s+)?[A-Za-z\s]+)\s+(\d+)(?::.*)?$', ref_clean)
    if not m:
        encoded_ref = urllib.parse.quote(ref_clean)
        return f"https://biblehub.com/bsb/{encoded_ref}.htm"
    book_raw = m.group(1).strip()
    chapter = m.group(2).strip()
    book_slug = book_raw.lower().replace(' ', '_')
    if book_slug == 'psalm':
        book_slug = 'psalms'
    return f"https://biblehub.com/bsb/{book_slug}/{chapter}.htm"

def main():
    input_path = 'content/30-days-of-growing-leaders-bsb.md'
    output_public = 'public/plans/growing-leaders.json'
    output_dist = 'dist/plans/growing-leaders.json'
    plans_catalog = 'public/plans.json'

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

        # 1. Passages with BibleHub BSB URLs
        passages = []
        p_matches = re.findall(r'\*\*([A-Za-z0-9\s:]+(?:[–\-][0-9:]+)?(?:\s*,\s*[0-9–\-]+)?)\s*\((?:BSB|NIV)\)\*\*', body)
        for p in p_matches:
            ref = p.strip().replace('–', '-')
            url = get_biblehub_url(ref)
            passages.append({
                "reference": ref,
                "url": url
            })

        # 2. Historical & Cultural Context
        hist_match = re.search(r'### 2\. Historical & Cultural Context\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
        hist_text = hist_match.group(1).strip() if hist_match else ""

        # 3. Main Devotional Reading + Checkpoint if present
        dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Facilitator & Personal Reflection Questions)', body, re.DOTALL)
        if dev_match:
            dev_title = dev_match.group(1).strip()
            dev_body = dev_match.group(2).strip()
            dev_body = re.sub(r'\n+---\s*$', '', dev_body)
        else:
            dev_title = "Devotional Reading"
            dev_body = ""

        # 4. Reflection Questions
        reflect_match = re.search(r'### 4\. Facilitator & Personal Reflection Questions\s*\n(.*?)(?=\n### 5\. Key Practice)', body, re.DOTALL)
        reflect_questions = []
        if reflect_match:
            for line in reflect_match.group(1).strip().split('\n'):
                line = line.strip()
                q_m = re.match(r'^\d+\.\s*(.*)', line)
                if q_m:
                    reflect_questions.append(q_m.group(1).strip())

        # 5. Key Practice
        practice_match = re.search(r'### 5\. Key Practice\s*\n(.*?)(?=\n### 6\. Personal Prayer)', body, re.DOTALL)
        practice_items = []
        if practice_match:
            p_text = practice_match.group(1).strip()
            practice_items.append(p_text)

        # 6. Personal Prayer
        prayer_match = re.search(r'### 6\. Personal Prayer\s*\n(.*?)(?=\n---|\n## |\Z)', body, re.DOTALL)
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
        print(f"Lesson {lesson_num:2d}: {title[:36]:<36} | {passages[0]['url']}")

    print(f"\nSuccessfully parsed {len(items)} lessons.")

    plan_json = {
        "id": "growing-leaders",
        "title": "Growing Leaders: 30-Lesson Leadership Journey",
        "description": "A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him.",
        "type": "reading",
        "totalItems": len(items),
        "created": "2026-08-21",
        "version": "1.0",
        "iconUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=320&h=320&q=80",
        "bannerUrl": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1440&h=810&q=80",
        "items": items
    }

    with open(output_public, 'w', encoding='utf-8') as f:
        json.dump(plan_json, f, indent=2, ensure_ascii=False)
    print(f"Written: {output_public}")

    if os.path.exists(os.path.dirname(output_dist)):
        with open(output_dist, 'w', encoding='utf-8') as f:
            json.dump(plan_json, f, indent=2, ensure_ascii=False)
        print(f"Written: {output_dist}")

    # Update public/plans.json
    if os.path.exists(plans_catalog):
        with open(plans_catalog, 'r', encoding='utf-8') as f:
            catalog = json.load(f)

        for plan in catalog.get('plans', []):
            if plan.get('id') == 'growing-leaders':
                plan['totalItems'] = len(items)
                plan['title'] = "Growing Leaders: 30-Lesson Leadership Journey"
                plan['description'] = "A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him."
                print(f"Updated catalog entry for growing-leaders (totalItems: {len(items)})")

        with open(plans_catalog, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
        print(f"Written: {plans_catalog}")

if __name__ == '__main__':
    main()
