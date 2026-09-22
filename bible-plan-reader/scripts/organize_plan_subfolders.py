#!/usr/bin/env python3
import os
import json
import shutil

PUBLIC_PLANS_DIR = "public/plans"
PRAYER_DIR = os.path.join(PUBLIC_PLANS_DIR, "prayer")
LEADERSHIP_DIR = os.path.join(PUBLIC_PLANS_DIR, "leadership")
NEW_BELIEVERS_DIR = os.path.join(PUBLIC_PLANS_DIR, "new-believers")
ARCHIVED_DIR = os.path.join(PUBLIC_PLANS_DIR, "archived")

os.makedirs(PRAYER_DIR, exist_ok=True)
os.makedirs(LEADERSHIP_DIR, exist_ok=True)
os.makedirs(NEW_BELIEVERS_DIR, exist_ok=True)
os.makedirs(ARCHIVED_DIR, exist_ok=True)

def update_plan_file(src_path, dest_path, creator, devotional_author, description=None):
    if not os.path.exists(src_path):
        if os.path.exists(dest_path):
            src_path = dest_path
        else:
            print(f"Warning: neither {src_path} nor {dest_path} exists")
            return

    with open(src_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if creator:
        data['creator'] = creator
    if description:
        data['description'] = description

    if 'items' in data and isinstance(data['items'], list):
        for it in data['items']:
            if 'devotional' in it and isinstance(it['devotional'], dict):
                if devotional_author:
                    it['devotional']['author'] = devotional_author

    with open(dest_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated and saved: {dest_path}")

    # If src_path is in PUBLIC_PLANS_DIR directly (not dest_path), remove it to avoid duplication
    if os.path.abspath(src_path) != os.path.abspath(dest_path) and os.path.dirname(os.path.abspath(src_path)) == os.path.abspath(PUBLIC_PLANS_DIR):
        os.remove(src_path)
        print(f"Removed legacy root file: {src_path}")

print("--- 1. Updating & Moving Prayer Plans ---")
update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "prayers-of-paul.json"),
    os.path.join(PRAYER_DIR, "prayers-of-paul.json"),
    creator="Prayer Lessons",
    devotional_author="Prayer Lessons",
    description="A 12-session devotional study on prayer, spiritual formation, and kingdom growth drawn from the transformative prayers of Paul."
)

update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "prayers-of-paul-essentials.json"),
    os.path.join(PRAYER_DIR, "prayers-of-paul-essentials.json"),
    creator="Prayer Lessons",
    devotional_author="Prayer Lessons",
    description="A 12-session practical prayer journey in clear, accessible everyday language, exploring the life-changing prayers of the Apostle Paul for spiritual wisdom, inner strength, and love."
)

update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "with-christ-in-school-of-prayer.json"),
    os.path.join(PRAYER_DIR, "with-christ-in-school-of-prayer.json"),
    creator="Prayer Lessons",
    devotional_author="Prayer Lessons",
    description="A 31-day devotional reading plan exploring the secrets, spiritual power, and sacred ministry of prevailing prayer. Adapted and updated from Andrew Murray's original classic work."
)

print("\n--- 2. Updating & Moving Leadership Plans ---")
update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "leadership-lessons.json"),
    os.path.join(LEADERSHIP_DIR, "leadership-lessons.json"),
    creator="Leadership Lessons",
    devotional_author="Leadership Lessons",
    description="A 6-session Bible study on character, calling, and influence drawn from the lives, struggles, and triumphs of biblical figures."
)

update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "growing-leaders.json"),
    os.path.join(LEADERSHIP_DIR, "growing-leaders.json"),
    creator="Leadership Lessons",
    devotional_author="Leadership Lessons",
    description="A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him."
)

update_plan_file(
    os.path.join(PUBLIC_PLANS_DIR, "growing-leaders-essentials.json"),
    os.path.join(LEADERSHIP_DIR, "growing-leaders-essentials.json"),
    creator="Leadership Lessons",
    devotional_author="Leadership Lessons",
    description="A 30-lesson practical leadership journey in clear, accessible everyday language, exploring how God shapes your story, character, faithfulness, gifts, relationships, and life with Him."
)

print("\n--- 3. Updating New Believers Plans ---")
update_plan_file(
    os.path.join(NEW_BELIEVERS_DIR, "new-life-in-christ.json"),
    os.path.join(NEW_BELIEVERS_DIR, "new-life-in-christ.json"),
    creator="SET FGA",
    devotional_author="SET FGA",
    description="A 10-session foundational discipleship guide for new believers designed for personal study and small group discussion, covering assurance of salvation, prayer, the Word, fellowship, overcoming temptation, and sharing your faith. Compiled by Jeff Tan, updated by Victor Goh."
)

update_plan_file(
    os.path.join(NEW_BELIEVERS_DIR, "new-life-in-christ-booklet.json"),
    os.path.join(NEW_BELIEVERS_DIR, "new-life-in-christ-booklet.json"),
    creator="SET FGA",
    devotional_author="SET FGA",
    description="The complete digitized discipleship manual for new believers, containing all 10 in-depth chapters, full scriptural expositions, foundational doctrines, and memory verses. Compiled by Jeff Tan, updated by Victor Goh."
)

print("\n--- 4. Generating Category Sub-Manifests ---")

# Prayer Manifest
prayer_manifest = {
    "customization": {
        "name": "Prayer Lessons"
    },
    "plans": [
        {
            "id": "prayers-of-paul",
            "title": "Apostolic Prayers: Cultivating Wisdom, Power, and Love",
            "description": "A 12-session devotional study on prayer, spiritual formation, and kingdom growth drawn from the transformative prayers of Paul.",
            "type": "reading",
            "totalItems": 12,
            "url": "plans/prayer/prayers-of-paul.json",
            "creator": "Prayer Lessons",
            "version": "1.1",
            "created": "2026-08-24",
            "lastUpdated": "2026-09-18",
            "tags": [
                "Prayer",
                "Spiritual Formation",
                "Devotional",
                "Discipleship",
                "Bible Study"
            ],
            "featured": True
        },
        {
            "id": "prayers-of-paul-essentials",
            "title": "Apostolic Prayers (Essentials Edition)",
            "description": "A 12-session practical prayer journey in clear, accessible everyday language, exploring the life-changing prayers of the Apostle Paul for spiritual wisdom, inner strength, and love.",
            "type": "reading",
            "totalItems": 12,
            "url": "plans/prayer/prayers-of-paul-essentials.json",
            "creator": "Prayer Lessons",
            "version": "1.1",
            "created": "2026-08-25",
            "lastUpdated": "2026-09-18",
            "tags": [
                "Prayer",
                "Spiritual Formation",
                "Devotional",
                "Discipleship",
                "Essentials"
            ],
            "featured": False
        },
        {
            "id": "with-christ-in-school-of-prayer",
            "title": "With Christ in the School of Prayer",
            "description": "A 31-day devotional reading plan exploring the secrets, spiritual power, and sacred ministry of prevailing prayer. Adapted and updated from Andrew Murray's original classic work.",
            "type": "reading",
            "totalItems": 31,
            "url": "plans/prayer/with-christ-in-school-of-prayer.json",
            "creator": "Prayer Lessons",
            "version": "1.1",
            "created": "2026-08-12",
            "lastUpdated": "2026-09-18",
            "tags": [
                "Prayer",
                "Devotional",
                "Classic",
                "Spiritual Growth"
            ],
            "featured": False
        }
    ]
}
with open(os.path.join(PRAYER_DIR, "plans.json"), 'w', encoding='utf-8') as f:
    json.dump(prayer_manifest, f, indent=2, ensure_ascii=False)
print(f"Wrote {os.path.join(PRAYER_DIR, 'plans.json')}")

# Leadership Manifest
leadership_manifest = {
    "customization": {
        "name": "Leadership Lessons"
    },
    "plans": [
        {
            "id": "growing-leaders",
            "title": "Growing Leaders: 30-Lesson Leadership Journey",
            "description": "A 30-lesson leadership journey across 6 foundational modules in calling, character, competence, and community, exploring how God shapes your story, integrity, faithfulness, gifts, relationships, and intimacy with Him.",
            "type": "reading",
            "totalItems": 30,
            "url": "plans/leadership/growing-leaders.json",
            "creator": "Leadership Lessons",
            "version": "1.1",
            "created": "2026-08-21",
            "lastUpdated": "2026-09-18",
            "tags": [
                "Leadership",
                "Character",
                "Spiritual Formation",
                "Devotional",
                "Discipleship"
            ],
            "featured": True
        },
        {
            "id": "growing-leaders-essentials",
            "title": "Growing Leaders (Essentials Edition)",
            "description": "A 30-lesson practical leadership journey in clear, accessible everyday language, exploring how God shapes your story, character, faithfulness, gifts, relationships, and life with Him.",
            "type": "reading",
            "totalItems": 30,
            "url": "plans/leadership/growing-leaders-essentials.json",
            "creator": "Leadership Lessons",
            "version": "1.1",
            "created": "2026-08-25",
            "lastUpdated": "2026-09-18",
            "tags": [
                "Leadership",
                "Character",
                "Spiritual Formation",
                "Devotional",
                "Discipleship",
                "Essentials"
            ],
            "featured": False
        },
        {
            "id": "leadership-lessons",
            "title": "Lessons in Leadership: Biblical Wisdom from God's Servants",
            "description": "A 6-session Bible study on character, calling, and influence drawn from the lives, struggles, and triumphs of biblical figures.",
            "type": "reading",
            "totalItems": 6,
            "url": "plans/leadership/leadership-lessons.json",
            "creator": "Leadership Lessons",
            "version": "1.3",
            "created": "2026-08-24",
            "lastUpdated": "2026-09-22",
            "tags": [
                "Leadership",
                "Character",
                "Calling",
                "Discipleship",
                "Bible Study"
            ],
            "featured": False
        }
    ]
}
with open(os.path.join(LEADERSHIP_DIR, "plans.json"), 'w', encoding='utf-8') as f:
    json.dump(leadership_manifest, f, indent=2, ensure_ascii=False)
print(f"Wrote {os.path.join(LEADERSHIP_DIR, 'plans.json')}")

# New Believers Manifest
new_believers_manifest = {
    "customization": {
        "name": "New Believers"
    },
    "plans": [
        {
            "id": "new-life-in-christ",
            "title": "New Life in Christ (Interactive Small Group Study)",
            "description": "A 10-session interactive discipleship guide structured for small group discussion, with key passage studies, personal prayers, and actionable steps. Compiled by Jeff Tan, updated by Victor Goh.",
            "type": "reading",
            "totalItems": 10,
            "url": "plans/new-believers/new-life-in-christ.json",
            "creator": "SET FGA",
            "version": "1.0",
            "created": "2026-09-18",
            "lastUpdated": "2026-09-18",
            "tags": [
                "New Believers",
                "Discipleship",
                "Small Group",
                "Foundations"
            ],
            "featured": True
        },
        {
            "id": "new-life-in-christ-booklet",
            "title": "New Life in Christ (Complete Booklet Edition)",
            "description": "The complete 10-chapter discipleship manual with comprehensive expositions, all sub-points, S.O.A.P. devotional models, and memory verses. Compiled by Jeff Tan, updated by Victor Goh.",
            "type": "reading",
            "totalItems": 10,
            "url": "plans/new-believers/new-life-in-christ-booklet.json",
            "creator": "SET FGA",
            "version": "1.0",
            "created": "2026-09-18",
            "lastUpdated": "2026-09-18",
            "tags": [
                "New Believers",
                "Discipleship",
                "Booklet",
                "Comprehensive"
            ],
            "featured": False
        }
    ]
}
with open(os.path.join(NEW_BELIEVERS_DIR, "plans.json"), 'w', encoding='utf-8') as f:
    json.dump(new_believers_manifest, f, indent=2, ensure_ascii=False)
print(f"Wrote {os.path.join(NEW_BELIEVERS_DIR, 'plans.json')}")

print("\n--- 5. Generating Root public/plans.json ---")
root_manifest = {
    "customization": {
        "name": "EQUIP: Formed Together",
        "website": "",
        "email": ""
    },
    "plans": [
        {
            "id": "new-believers-plans",
            "title": "New Believers",
            "description": "Foundational discipleship guides and interactive studies for new believers and small group mentoring.",
            "type": "category",
            "url": "plans/new-believers/plans.json",
            "tags": [
                "New Believers",
                "Discipleship",
                "Foundations"
            ],
            "featured": True
        },
        {
            "id": "prayer-plans",
            "title": "Prayer",
            "description": "Devotional studies and prayer journeys exploring apostolic prayers and prevailing communion with God.",
            "type": "category",
            "url": "plans/prayer/plans.json",
            "tags": [
                "Prayer",
                "Intercession",
                "Devotional"
            ],
            "featured": True
        },
        {
            "id": "leadership-plans",
            "title": "Leadership",
            "description": "Leadership journeys, character formation, and biblical wisdom from God's servants.",
            "type": "category",
            "url": "plans/leadership/plans.json",
            "tags": [
                "Leadership",
                "Character",
                "Spiritual Formation"
            ],
            "featured": False
        },
        {
            "id": "archived-plans",
            "title": "Archived Plans",
            "description": "Archived reading and prayer plans from past church campaigns and seasons.",
            "type": "category",
            "url": "plans/archived/plans.json",
            "tags": [
                "Archived"
            ],
            "featured": False
        }
    ]
}
with open("public/plans.json", 'w', encoding='utf-8') as f:
    json.dump(root_manifest, f, indent=2, ensure_ascii=False)
print("Wrote public/plans.json successfully!")
