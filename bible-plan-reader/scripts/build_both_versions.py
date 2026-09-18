#!/usr/bin/env python3
import os
import json
import re
from generate_all import (
    SESSIONS_INTERACTIVE,
    generate_interactive_markdown,
    generate_interactive_json,
    make_bible_url
)

CHAPTER_PASSAGES = [
    {"reference": "1 John 5:11-13"},
    {"reference": "2 Timothy 3:14-17"},
    {"reference": "Matthew 6:9-13"},
    {"reference": "Psalm 119:9-16"},
    {"reference": "1 Corinthians 10:12-14"},
    {"reference": "Hebrews 10:23-25"},
    {"reference": "2 Corinthians 9:6-11"},
    {"reference": "Romans 6:3-5"},
    {"reference": "Acts 1:4-8"},
    {"reference": "Matthew 28:18-20"}
]

CHAPTER_PRAYERS = [
    "Father in heaven, thank You for the rock-solid assurance of eternal life through Jesus Christ. When doubts arise, help me stand firmly upon the facts of Your Word and the finished work of the cross rather than my fluctuating emotions. In Jesus' name, Amen.",
    "Lord God, thank You for the gift of Your holy, inspired Word. Grant me a deep hunger to read, meditate on, and obey Scripture daily. Let Your Word be a lamp to my feet and the sword of the Spirit in every trial. In Jesus' name, Amen.",
    "Heavenly Father, thank You for the privilege of direct access into Your presence. Teach me to pray with faith, reverence, and persistence. Forgive my sins, protect me from temptation, and align my heart with Your kingdom purposes. In Jesus' name, Amen.",
    "Lord Jesus, thank You that You desire intimate daily fellowship with me. Help me build a faithful 21-day habit of meeting with You in Quiet Time. Open my eyes to understand Your Word and guide my daily steps. In Jesus' name, Amen.",
    "Holy God, thank You for Your faithfulness and the promise that You will never let me be tempted beyond what I can bear. Give me the wisdom and courage to flee temptation and take the way of escape You provide. In Jesus' name, Amen.",
    "Father, thank You for adopting me into the Body of Christ. Deliver me from spiritual isolation. Give me a servant's heart to encourage, forgive, and build up my brothers and sisters in true Christian fellowship. In Jesus' name, Amen.",
    "Lord, I acknowledge that You are the Owner of all things and I am simply a steward of Your blessings. Grant me the wisdom to manage my time, talents, and finances faithfully, and give me a generous and cheerful heart. In Jesus' name, Amen.",
    "Lord Jesus, thank You for the sacred ordinances of Water Baptism and Holy Communion. May my public confession of faith bring You glory, and may each remembrance at Your Table deepen my gratitude for Calvary. In Jesus' name, Amen.",
    "Father, I ask You to fill and baptize me afresh with the Holy Spirit. Release Your gifts in my life, cultivate the fruit of the Spirit within my heart, and empower me to be a bold witness for Christ. In Jesus' name, Amen.",
    "Lord of the harvest, give me a heart that beats with compassion for those who do not know You. Strip away all fear, and grant me boldness, wisdom, and love as I share the Good News of Jesus with family, friends, and coworkers. In Jesus' name, Amen."
]

def clean_booklet_text(raw_text):
    text = raw_text

    # 1. Train illustration
    train_ascii = r"```\s*\+[-+]+.*?ENGINE.*?```"
    train_replacement = """* 🚂 **1. ENGINE = FACT (God's Word)**  
  The unchanging truth revealed in Scripture. God's facts exist whether we feel them or not.
* 🪵 **2. COAL = FAITH (Believing God's Word)**  
  Our personal trust that fuels the engine, putting God's promises into active effect in our lives.
* 🚃 **3. CARRIAGE = FEELINGS (Human Emotions)**  
  Natural emotions that follow behind. The engine pulls the carriage—the carriage can never pull the engine!"""
    text = re.sub(train_ascii, train_replacement, text, flags=re.DOTALL)

    # 2. Fellowship diagram
    fellowship_ascii = r"""```\s*\[ GOD \].*?Horizontal Fellowship\s*```"""
    fellowship_replacement = """> 👆 **(1) Vertical Fellowship (God-ward)**  
> Our personal communion with God the Father through faith in Jesus Christ. This is the bedrock foundation of all true fellowship.
> 
> 👉 **(2) Horizontal Fellowship (Man-ward)**  
> Our mutual love, care, and partnership with fellow believers in the Body of Christ. When vertical fellowship is secure, horizontal community naturally thrives."""
    text = re.sub(fellowship_ascii, fellowship_replacement, text, flags=re.DOTALL)

    # 3. Ownership vs Stewardship Table
    table_ascii = r"""\| Ownership \(God\) \| Stewardship \(Man\) \|\s*\n\| :--- \| :--- \|\s*\n\| \*\*Owner\*\* \| \*\*Steward\*\* \|\s*\n\| \*\*Giver\*\* \| \*\*Receiver\*\* \|\s*\n\| \*\*Possessor\*\* \| \*\*Manager\*\* \|\s*\n\| \*\*Rewarder\*\* \| \*\*Rewarded\*\* \|"""
    table_replacement = """> **God: The True Owner**  
> • **Owner:** Holds title and possession of all creation (**Psalm 24:1**).  
> • **Giver:** Supplies life, breath, and every good gift (**Acts 17:25**).  
> • **Possessor:** Sovereignly directs how resources are used.  
> • **Rewarder:** Evaluates faithfulness and rewards diligent service.  
>  
> **Man: The Entrusted Steward**  
> • **Steward:** Caretaker of another's household and affairs (**1 Corinthians 4:2**).  
> • **Receiver:** Gratefully receives God's provision with thanksgiving.  
> • **Manager:** Accountable for managing life, time, talents, and finances wisely.  
> • **Rewarded:** Enters into the joy and reward of the Master (**Matthew 25:21**)."""
    text = re.sub(table_ascii, table_replacement, text)

    # 4. Telephone number in Chapter 6
    text = text.replace("(e.g., Tel: 03-79814755)", "(e.g., contact your local church office or small group coordinator)")

    # 5. Underline blanks in Chapter 10
    text = re.sub(
        r'\*Commitment:\* Write down the names of two people to whom you will commit to praying and sharing with in the next two months:\s*\n1\. _+\s*\n2\. _+',
        r"""> **Personal Commitment:**
> Write down the names of two people in your life (family members, friends, neighbors, or colleagues) whom you will commit to praying for and sharing Christ with over the next two months. You can record these names in the **Personal Notes** panel of this reading app or in your prayer journal.""",
        text
    )

    # 6. Gospel outline acronym clarification in Chapter 10
    text = text.replace("The 5 Fingers Gospel Outline (G-R-A-C-E)", "The 5-Point Gospel Outline (Grace, Man, God, Christ, Faith)")

    # 7. Old date in Chapter 4
    text = text.replace("- **Date:** 3/6/08", "- **Date:** Sample Devotional Date")

    return text

def main():
    print("1. Generating Version 1 (Interactive Study)...")
    interactive_md = generate_interactive_markdown()
    with open('content/new-life-in-christ-interactive.md', 'w', encoding='utf-8') as f:
        f.write(interactive_md)
    print("   -> Wrote content/new-life-in-christ-interactive.md")

    interactive_json = generate_interactive_json()
    with open('public/plans/new-believers/new-life-in-christ.json', 'w', encoding='utf-8') as f:
        json.dump(interactive_json, f, indent=2, ensure_ascii=False)
    print("   -> Wrote public/plans/new-believers/new-life-in-christ.json")

    print("\n2. Generating Version 2 (Digitized Booklet)...")
    with open('content/new_life_in_christ_all_chapters.md', 'r', encoding='utf-8') as f:
        raw_source = f.read()

    booklet_md = clean_booklet_text(raw_source)
    # Update main headers for booklet edition
    booklet_md = booklet_md.replace(
        "## Complete Discipleship Guide (Chapters 1–10)",
        "## Complete Discipleship Guide (Digitized Booklet Edition)\n\n_A comprehensive foundational discipleship manual for personal grounding and study_"
    )
    with open('content/new-life-in-christ-booklet.md', 'w', encoding='utf-8') as f:
        f.write(booklet_md)
    print("   -> Wrote content/new-life-in-christ-booklet.md")

    # Build booklet JSON
    chapter_blocks = re.split(r'\n(?=# Chapter \d+:)', booklet_md)
    # chapter_blocks[0] is intro, 1..10 are chapters
    booklet_items = []
    for idx in range(1, 11):
        ch_text = chapter_blocks[idx].strip()
        lines = ch_text.split('\n')
        # Title is lines[0] e.g. "# Chapter 1: How Can I Be Sure I Am Saved?"
        title_raw = lines[0].lstrip('#').strip()
        
        # Passages
        p_info = CHAPTER_PASSAGES[idx - 1]
        passages = [{
            "reference": p_info["reference"],
            "url": make_bible_url(p_info["reference"], "BSB", 3034)
        }]

        # Content is the full chapter text minus the first header line
        body_content = "\n".join(lines[1:]).strip()
        # Clean up leading horizontal rule if present
        body_content = re.sub(r'^\s*---\s*\n', '', body_content)

        # Reflection questions derived from interactive
        interactive_item = SESSIONS_INTERACTIVE[idx - 1]

        booklet_items.append({
            "item": idx,
            "title": title_raw,
            "passages": passages,
            "devotional": {
                "author": "SET FGA",
                "content": body_content
            },
            "prayers": [
                {
                    "topic": "Personal Prayer",
                    "description": CHAPTER_PRAYERS[idx - 1]
                }
            ],
            "reflect": interactive_item["reflect"],
            "practice": interactive_item["practice"]
        })

    booklet_json = {
        "id": "new-life-in-christ-booklet",
        "title": "New Life in Christ: Discipleship Guide (Booklet Edition)",
        "description": "The complete digitized discipleship manual for new believers, containing all 10 in-depth chapters, full scriptural expositions, foundational doctrines, and memory verses. Compiled by Jeff Tan, updated by Victor Goh.",
        "type": "reading",
        "totalItems": 10,
        "created": "2026-09-18",
        "version": "1.0",
        "creator": "SET FGA",
        "tags": [
            "New Believers",
            "Discipleship",
            "Booklet",
            "Foundations",
            "Comprehensive"
        ],
        "items": booklet_items
    }
    with open('public/plans/new-believers/new-life-in-christ-booklet.json', 'w', encoding='utf-8') as f:
        json.dump(booklet_json, f, indent=2, ensure_ascii=False)
    print("   -> Wrote public/plans/new-believers/new-life-in-christ-booklet.json")

    print("\n3. Generating Category Sub-Manifest...")
    category_manifest = {
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
    with open('public/plans/new-believers/plans.json', 'w', encoding='utf-8') as f:
        json.dump(category_manifest, f, indent=2, ensure_ascii=False)
    print("   -> Wrote public/plans/new-believers/plans.json")

    print("\nAll plan assets generated successfully!")

if __name__ == '__main__':
    main()
