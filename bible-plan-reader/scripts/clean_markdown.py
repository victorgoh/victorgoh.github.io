import re
import json
import urllib.parse

def clean_markdown():
    with open('content/30-days-of-growing-leaders-updated.md', 'r', encoding='utf-8') as f:
        text = f.read()

    # Replace '### 3. Devotional Reading: ' with '### 3. '
    text = re.sub(r'### 3\. Devotional Reading:\s*', '### 3. ', text)

    # Box 1: Day 5 - Weekly Reflection Checkpoint
    box1_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      WEEKLY REFLECTION CHECKPOINT                       │\n│                                                                        │\n│ 1. NOTICE: What was the most challenging leadership or relational      │\n│    moment you experienced this week?                                   │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. NAME: What emotion, fear, or instinct did that moment trigger       │\n│    in you (e.g., anxiety, anger, defensiveness, avoidance)?            │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 3. LEARN: What is God teaching you about your story, your character,  │\n│    or your need for His presence through that moment?                  │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 4. RESPOND: What is one concrete action of trust or obedience you      │\n│    will practice next week?                                            │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box1_new = """- **1. NOTICE**: What was the most challenging leadership or relational moment you experienced this week?
- **2. NAME**: What emotion, fear, or instinct did that moment trigger in you (e.g., anxiety, anger, defensiveness, avoidance)?
- **3. LEARN**: What is God teaching you about your story, your character, or your need for His presence through that moment?
- **4. RESPOND**: What is one concrete action of trust or obedience you will practice next week?"""
    text = text.replace(box1_old, box1_new)

    # Box 2: Day 10 - Session 2 Review Checkpoint
    box2_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      SESSION 2 REVIEW CHECKPOINT                       │\n│                                                                        │\n│ 1. NOTICE: What is a current pressure, conflict, or demand that has    │\n│    triggered anxiety or frustration in you this week?                  │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. NAME: Speak the unedited truth to God:                              │\n│    \"Lord, right now I am feeling ___________________________________   │\n│     and I am afraid that __________________________________________\"   │\n│                                                                        │\n│ 3. RECEIVE: Take three slow breaths in silence. Welcome God's grace:   │\n│    \"Jesus, I receive Your peace, Your wisdom, and Your timing.\"       │\n│                                                                        │\n│ 4. RESPOND: What is the faithful, non-reactive next step God is        │\n│    calling you to take?                                                │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box2_new = """- **1. NOTICE**: What is a current pressure, conflict, or demand that has triggered anxiety or frustration in you this week?
- **2. NAME**: Speak the unedited truth to God: *"Lord, right now I am feeling... and I am afraid that..."*
- **3. RECEIVE**: Take three slow breaths in silence. Welcome God's grace: *"Jesus, I receive Your peace, Your wisdom, and Your timing."*
- **4. RESPOND**: What is the faithful, non-reactive next step God is calling you to take?"""
    text = text.replace(box2_old, box2_new)

    # Box 3: Day 15 - The Capture and Clarify Workflow
    box3_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│               THE \"RECORD AND FOLLOW THROUGH\" WORKFLOW                  │\n│                                                                        │\n│ 1. RECORD IMMEDIATELY: Never rely on your memory. The moment a         │\n│    commitment is made, write it down in one trusted place.             │\n│                                                                        │\n│ 2. CLARIFY NEXT ACTION: Define the exact next physical step required   │\n│    (e.g., \"Draft 3-point agenda for Tuesday's team sync\").             │\n│                                                                        │\n│ 3. SCHEDULE EXECUTION: Assign a realistic time block on your calendar  │\n│    to complete the work before the deadline.                           │\n│                                                                        │\n│ 4. FOLLOW THROUGH AS WORSHIP: Complete the task with diligence as unto │\n│    the Lord Jesus (*Colossians 3:23*), closing the loop with clarity.  │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box3_new = """- **1. RECORD IMMEDIATELY**: Never rely on your memory. The moment a commitment is made, write it down in one trusted place.
- **2. CLARIFY NEXT ACTION**: Define the exact next physical step required (e.g., *"Draft 3-point agenda for Tuesday's team sync"*).
- **3. SCHEDULE EXECUTION**: Assign a realistic time block on your calendar to complete the work before the deadline.
- **4. FOLLOW THROUGH AS WORSHIP**: Complete the task with diligence as unto the Lord Jesus (*Colossians 3:23*), closing the loop with clarity."""
    text = text.replace(box3_old, box3_new)

    # Box 4: Day 15 - Session 3 Review Checkpoint
    box4_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      SESSION 3 REVIEW CHECKPOINT                       │\n│                                                                        │\n│ 1. INVENTORY: What commitments have I made this week to my team,       │\n│    family, or leaders that are currently unrecorded or pending?        │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. CALENDAR REALITY: Do I have realistic time blocks scheduled to       │\n│    execute these commitments, or am I overcommitted?                   │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 3. DELEGATION CHECK: What task am I hoarding that should be shared     │\n│    with an emerging leader to prevent withering (*navol*)?             │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 4. WORSHIP CHECK: How can I approach my administrative work next       │\n│    week as direct service to King Jesus (*ek psyches*)?               │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box4_new = """- **1. INVENTORY**: What commitments have I made this week to my team, family, or leaders that are currently unrecorded or pending?
- **2. CALENDAR REALITY**: Do I have realistic time blocks scheduled to execute these commitments, or am I overcommitted?
- **3. DELEGATION CHECK**: What task am I hoarding that should be shared with an emerging leader to prevent withering (*navol*)?
- **4. WORSHIP CHECK**: How can I approach my administrative work next week as direct service to King Jesus (*ek psyches*)?"""
    text = text.replace(box4_old, box4_new)

    # Box 5: Day 20 - The Serve Notice Ask Pathway
    box5_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                   THE \"SERVE, NOTICE, ASK\" PATHWAY                     │\n│                                                                        │\n│ 1. SERVE: Step forward where there is a tangible need. Volunteer to    │\n│    host, teach, visit the sick, organize logistics, or pray.          │\n│                                                                        │\n│ 2. NOTICE: Pay attention to where the Holy Spirit brings fruit:        │\n│    • Where do you experience spiritual energy and joy?                 │\n│    • Where do others experience genuine breakthrough and edification?  │\n│    • Where do tasks feel draining, clumsy, or ineffective?             │\n│                                                                        │\n│ 3. ASK: Seek discernment from mature leaders and the community:        │\n│    • \"When I served in that role, did you see fruit?\"                  │\n│    • \"What strengths did you observe in my contribution?\"              │\n│    • \"Where do you think my gifts could best build up the body?\"      │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box5_new = """- **1. SERVE**: Step forward where there is a tangible need. Volunteer to host, teach, visit the sick, organize logistics, or pray.
- **2. NOTICE**: Pay attention to where the Holy Spirit brings fruit:
  - Where do you experience spiritual energy and joy?
  - Where do others experience genuine breakthrough and edification?
  - Where do tasks feel draining, clumsy, or ineffective?
- **3. ASK**: Seek discernment from mature leaders and the community:
  - *"When I served in that role, did you see fruit?"*
  - *"What strengths did you observe in my contribution?"*
  - *"Where do you think my gifts could best build up the body?"*"""
    text = text.replace(box5_old, box5_new)

    # Box 6: Day 20 - Session 4 Review Checkpoint
    box6_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      SESSION 4 REVIEW CHECKPOINT                       │\n│                                                                        │\n│ 1. SERVE: What areas of service have you engaged in over the past      │\n│    month (formal or informal)?                                         │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. NOTICE: Where did you notice spiritual fruit, life, and energy      │\n│    flowing through your service? Where did you feel clumsy?            │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 3. ASK: Who is one mature leader or peer you will approach this week   │\n│    to ask for confirmation regarding your spiritual gifts?             │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 4. CHARACTER CHECK: Is the container of your character (love,          │\n│    patience, humility) growing alongside your public gifting?          │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box6_new = """- **1. SERVE**: What areas of service have you engaged in over the past month (formal or informal)?
- **2. NOTICE**: Where did you notice spiritual fruit, life, and energy flowing through your service? Where did you feel clumsy?
- **3. ASK**: Who is one mature leader or peer you will approach this week to ask for confirmation regarding your spiritual gifts?
- **4. CHARACTER CHECK**: Is the container of your character (love, patience, humility) growing alongside your public gifting?"""
    text = text.replace(box6_old, box6_new)

    # Box 7: Day 25 - Session 5 Review Checkpoint
    box7_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      SESSION 5 REVIEW CHECKPOINT                       │\n│                                                                        │\n│ 1. SERVANTHOOD: Where am I currently tempted to \"lord over\" others     │\n│    (*katakyrieuo*) rather than washing feet in humble love?            │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. LISTENING HABIT: Did I practice \"Understand before Solving\" this     │\n│    week? Where did I rush to give quick answers?                       │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 3. PEACEMAKING: Is there any gossip, triangulation, or unspoken        │\n│    resentment I need to clear up through private reconciliation?       │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 4. EMPOWERING SUCCESSORS: Who is one specific person I am              │\n│    intentionally investing in, mentoring, or delegating to?            │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box7_new = """- **1. SERVANTHOOD**: Where am I currently tempted to \"lord over\" others (*katakyrieuo*) rather than washing feet in humble love?
- **2. LISTENING HABIT**: Did I practice \"Understand before Solving\" this week? Where did I rush to give quick answers?
- **3. PEACEMAKING**: Is there any gossip, triangulation, or unspoken resentment I need to clear up through private reconciliation?
- **4. EMPOWERING SUCCESSORS**: Who is one specific person I am intentionally investing in, mentoring, or delegating to?"""
    text = text.replace(box7_old, box7_new)

    # Box 8: Day 30 - The Abide to Grow Cycle
    box8_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                      THE \"ABIDE AND REVIEW\" CYCLE                      │\n│                                                                        │\n│ 1. DAILY ABIDING: Sit at Jesus' feet daily in Scripture and prayer,   │\n│    drawing life from the True Vine (*John 15:5*).                      │\n│                                                                        │\n│ 2. WEEKLY REVIEW: Take 20 minutes every week to review your 5 Core     │\n│    Habits:                                                             │\n│    • Did I *Notice & Learn* from my reactions?                         │\n│    • Did I *Pause & Bring* pressures before God?                       │\n│    • Did I *Record & Follow Through* on my commitments?                │\n│    • Did I *Serve to Discover* to develop gifts?                      │\n│    • Did I *Understand before Solving* in conversations?                │\n│                                                                        │\n│ 3. MONTHLY CELEBRATION: Give thanks for areas of visible progress      │\n│    (*prokope*) and surrender areas of failure to God's mercy.          │\n│                                                                        │\n│ 4. LIFELONG MULTIPLICATION: Pour what you have learned into the next   │\n│    generation of emerging leaders (*2 Timothy 2:2*).                   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box8_new = """- **1. DAILY ABIDING**: Sit at Jesus' feet daily in Scripture and prayer, drawing life from the True Vine (*John 15:5*).
- **2. WEEKLY REVIEW**: Take 20 minutes every week to review your 5 Core Habits:
  - Did I *Notice & Learn* from my reactions?
  - Did I *Pause & Bring* pressures before God?
  - Did I *Record & Follow Through* on my commitments?
  - Did I *Serve to Discover* to develop gifts?
  - Did I *Understand before Solving* in conversations?
- **3. MONTHLY CELEBRATION**: Give thanks for areas of visible progress (*prokope*) and surrender areas of failure to God's mercy.
- **4. LIFELONG MULTIPLICATION**: Pour what you have learned into the next generation of emerging leaders (*2 Timothy 2:2*)."""
    text = text.replace(box8_old, box8_new)

    # Box 9: Day 30 - Master Course Integration Checkpoint
    box9_old = "```\n┌────────────────────────────────────────────────────────────────────────┐\n│                 MASTER 30-DAY COURSE REVIEW CHECKPOINT                 │\n│                                                                        │\n│ 1. STORY (Session 1): What is the most significant insight you gained  │\n│    about how your background influences your leadership?               │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 2. CHARACTER (Session 2): Where did God convict you regarding          │\n│    shortcuts, integrity in the secret place, or pausing before Him?    │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 3. FAITHFULNESS (Session 3): How has your reliability in small tasks   │\n│    and recording commitments improved?                                 │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 4. GIFTS (Session 4): What spiritual gifts did you identify or fan     │\n│    into flame through active service and feedback?                     │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 5. PEOPLE (Session 5): How has your posture shifted toward foot-       │\n│    washing servanthood and listening before speaking?                  │\n│    _________________________________________________________________   │\n│                                                                        │\n│ 6. INTIMACY (Session 6): What is your non-negotiable daily rhythm      │\n│    to abide in the True Vine moving forward?                           │\n│    _________________________________________________________________   │\n└────────────────────────────────────────────────────────────────────────┘\n```"
    box9_new = """- **1. STORY (Session 1)**: What is the most significant insight you gained about how your background influences your leadership?
- **2. CHARACTER (Session 2)**: Where did God convict you regarding shortcuts, integrity in the secret place, or pausing before Him?
- **3. FAITHFULNESS (Session 3)**: How has your reliability in small tasks and recording commitments improved?
- **4. GIFTS (Session 4)**: What spiritual gifts did you identify or fan into flame through active service and feedback?
- **5. PEOPLE (Session 5)**: How has your posture shifted toward foot-washing servanthood and listening before speaking?
- **6. INTIMACY (Session 6)**: What is your non-negotiable daily rhythm to abide in the True Vine moving forward?"""
    text = text.replace(box9_old, box9_new)

    with open('content/30-days-of-growing-leaders-updated.md', 'w', encoding='utf-8') as f:
        f.write(text)

    print('Updated content/30-days-of-growing-leaders-updated.md successfully!')

clean_markdown()
