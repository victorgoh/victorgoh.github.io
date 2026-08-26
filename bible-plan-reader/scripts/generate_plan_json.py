import re
import json
import urllib.parse

def parse_day_block(day_num, title, body):
    # Passages
    passages = []
    # Find passage headers like **Genesis 50:15–21 (NIV)** or **Exodus 3:1-12 (NIV)**
    p_matches = re.findall(r'\*\*([A-Za-z0-9\s:]+(?:[–\-][0-9:]+)?(?:\s*,\s*[0-9–\-]+)?)\s*\((?:NIV|BSB)\)\*\*', body)
    for p in p_matches:
        ref = p.strip().replace('–', '-')
        # Normalize reference for BibleGateway query
        encoded_ref = urllib.parse.quote(ref)
        url = f"https://www.biblegateway.com/passage/?search={encoded_ref}&version=NIV"
        passages.append({
            "reference": ref,
            "url": url
        })

    # Bible Word Insight
    bwi_match = re.search(r'### 2\. Bible Word Insight\s*\n(.*?)(?=\n### 3\.)', body, re.DOTALL)
    bwi_text = bwi_match.group(1).strip() if bwi_match else ""

    # Devotional Reading / Main essay + optional Checkpoint
    dev_match = re.search(r'### 3\. ([^\n]+)\s*\n(.*?)(?=\n### 4\. Facilitator & Personal Reflection Questions)', body, re.DOTALL)
    if dev_match:
        dev_title = dev_match.group(1).strip()
        dev_body = dev_match.group(2).strip()
        # Remove trailing horizontal rules if present
        dev_body = re.sub(r'\n+---\s*$', '', dev_body)
    else:
        dev_title = "Devotional"
        dev_body = ""

    # Combine into devotional.content
    devotional_content = f"### Bible Word Insight\n\n{bwi_text}\n\n### {dev_title}\n\n{dev_body}"

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
        # Clean leading bold header if present or keep full text
        practice_items.append(p_text)

    # Personal Prayer
    prayer_match = re.search(r'### 6\. Personal Prayer\s*\n(.*?)(?=\n---|\Z)', body, re.DOTALL)
    prayer_text = ""
    if prayer_match:
        prayer_raw = prayer_match.group(1).strip()
        # Remove surrounding asterisks if italicized
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

def main():
    with open('content/30-days-of-growing-leaders-bsb.md', 'r', encoding='utf-8') as f:
        md_text = f.read()

    # Split into days
    day_blocks = re.split(r'\n(?=## Day \d+:)', md_text)

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
            "content": "### Welcome to 30 Days of Growing Leaders\n\nWhether you are stepping into Christian leadership for the first time, directing a ministry team, pastoring a congregation, or desiring to grow in spiritual maturity in your workplace and family, this 30-day devotional journey is designed to anchor your leadership in the character, wisdom, and heart of Jesus Christ.\n\n### The 4 Foundations of Holistic Leadership\n\nIn Kingdom leadership, God shapes us across four vital dimensions:\n\n1. **HEAD (Biblical Convictions & Mindset)**: Aligning our thinking with the truth of Scripture rather than secular power models.\n2. **HEART (Character & Spiritual Formation)**: Allowing the Holy Spirit to purify our motives, heal our insecurities, and cultivate Christlike fruit.\n3. **HANDS (Competence & Practical Skills)**: Developing our communication, delegation, decision-making, and relational skills.\n4. **HABITS (Sustainable Daily Rhythms)**: Embedding lifelong practices that sustain our stamina and prevent burnout.\n\n### The 6 Core Sessions (5 Days Each)\n\n- **Session 1: God Uses Your Story (Days 1–5)** — *Core Habit: Reflect and Grow*\n- **Session 2: God Forms Your Character (Days 6–10)** — *Core Habit: Pause and Pray*\n- **Session 3: God Builds Your Faithfulness (Days 11–15)** — *Core Habit: Capture and Clarify*\n- **Session 4: God Develops Your Gifts (Days 16–20)** — *Core Habit: Serve to Discover*\n- **Session 5: God Shapes How You Lead People (Days 21–25)** — *Core Habit: Understand before Solving*\n- **Session 6: God Deepens Your Life With Him (Days 26–30)** — *Core Habit: Abide to Grow*\n\nMay the Holy Spirit shape your heart over these 30 days to reflect the Shepherd-Leader, Jesus Christ."
        },
        "prayers": [
            {
                "topic": "Prayer for Transformation",
                "description": "Lord Jesus Christ, True Vine and Good Shepherd, as I begin this 30-day journey of leadership formation, align my heart with Yours. Search my motives, heal my wounds, teach me Your ways, and form the character of Christ within me. May my life and leadership bring enduring fruit for Your Kingdom. Amen."
            }
        ],
        "reflect": [
            "What is your primary prayer and expectation as you begin this 30-day leadership journey?",
            "Which of the four leadership dimensions (Head, Heart, Hands, Habits) feels like your biggest area for growth right now?",
            "Who is a mentor, peer, or group you can invite to walk through these 30 days with you?"
        ],
        "practice": [
            "Commit to setting aside 15 minutes of unhurried time each day for Scripture, reflection, and prayer.",
            "Keep a journal ready to record the weekly habits (Notice & Learn, Pause & Bring It, Record & Follow Through, Serve-Notice-Ask, Understand before Solving, Abide & Review)."
        ]
    }
    items.append(intro_item)

    day_count = 0
    for block in day_blocks:
        match = re.match(r'## Day (\d+):\s*([^\n]+)\n(.*)', block, re.DOTALL)
        if match:
            day_num = int(match.group(1))
            title = match.group(2).strip()
            body = match.group(3)
            parsed = parse_day_block(day_num, title, body)
            
            day_item = {
                "item": len(items) + 1,
                "title": f"Day {day_num}: {title}",
                "passages": parsed["passages"],
                "devotional": parsed["devotional"],
                "prayers": parsed["prayers"],
                "reflect": parsed["reflect"],
                "practice": parsed["practice"]
            }
            items.append(day_item)
            day_count += 1

    print(f"Parsed {day_count} days from markdown. Total items in plan: {len(items)}")

    plan_json = {
        "id": "growing-leaders",
        "title": "Growing Leaders: 30-Day Leadership Journey",
        "description": "A 30-day spiritual journey in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him.",
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

if __name__ == '__main__':
    main()
