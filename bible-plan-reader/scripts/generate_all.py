import os
import json
import re
import urllib.parse

BOOK_TO_USFM = {
    "genesis": "GEN", "exodus": "EXO", "levicitus": "LEV", "numbers": "NUM", "deuteronomy": "DEU",
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

def make_bible_url(ref, version="BSB", version_id=3034):
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
        return f"https://www.bible.com/bible/{version_id}/{usfm}.{chapter}.{version}"
    encoded = urllib.parse.quote(ref_clean)
    return f"https://www.biblegateway.com/passage/?search={encoded}&version={version}"

# Data for 10 sessions (Version 1: Interactive Small Group Study for New Believers)
# Designed with a clean 5-part structure (Scripture Text, Devotional Reflection, Personal Prayer, Facilitator & Group Discussion, Posture & Practice)
SESSIONS_INTERACTIVE = [
    {
        "item": 1,
        "title": "Assurance of Salvation: How Can I Be Sure I Am Saved?",
        "passages": [
            {"reference": "1 John 5:11-13"}
        ],
        "devotional_title": "Anchored in Truth, Not Wavering Feelings",
        "devotional_body": """A person becomes a Christian not by personal merit, family background, or moral perfection, but by **trusting in Jesus Christ alone** and what He accomplished on the cross. This trust is our biblical faith.

Yet almost every new believer experiences moments of hesitation:
- Feeling confused or overwhelmed by new spiritual concepts
- Experiencing seasons where they "feel nothing" emotionally
- Wondering if God truly heard their prayer of repentance
- Facing anxiety over family members or coworkers who may oppose their new faith

Irrespective of our doubts, our confidence is built upon three unshakeable pillars:

#### 1. Because the Bible Says So
God cannot lie (**Hebrews 6:18**). When Scripture declares that whoever receives Jesus is given the right to become a child of God (**John 1:12**), and whoever believes in the Son has eternal life (**John 3:36**), we have the infallible testimony of the Almighty. Salvation is validated by the mouth of God, not our internal emotional state.

#### 2. Because of What Jesus Has Done
The Gospel is anchored in five historical, indisputable facts:
1. **God loves us** (**Romans 5:8**).
2. **God sent His only Son to rescue mankind** (**John 3:16**).
3. **Jesus died on the cross as our substitute**, taking our sin upon Himself so that we might receive the righteousness of God (**2 Corinthians 5:21**).
4. **God validated Christ's sacrifice by raising Him bodily from the dead** on the third day (**1 Peter 1:21**).
5. **Jesus ascended to heaven and will return** for His people to establish His eternal kingdom (**1 Thessalonians 4:14–17**).

As Acts 16:31 declares: *"Believe in the Lord Jesus, and you will be saved—you and your household."* Trusting Jesus Christ is God's only requirement for salvation.

#### 3. Because Our Lives Are Changed
When Christ enters a human heart, transformation begins. For some, like Zacchaeus (**Luke 19:1–10**), repentance and restitution occur dramatically overnight. For others, like the Apostle Paul (**1 Timothy 1:12–16**), growth unfolds progressively over years. But in every true believer, God implants new desires, a tender conscience, and a longing to walk in His love.

#### The Train Illustration: Fact, Faith, and Feelings
Consider how a steam locomotive operates:

* 🚂 **1. ENGINE = FACT (God's Word)**  
  The unchanging truth revealed in Scripture. God's facts exist whether we feel them or not.
* 🪵 **2. COAL = FAITH (Believing God's Word)**  
  Our personal trust that fuels the engine, putting God's promises into active effect in our lives.
* 🚃 **3. CARRIAGE = FEELINGS (Human Emotions)**  
  Natural emotions that follow behind. The engine pulls the carriage—the carriage can never pull the engine!

The engine can pull the carriage, but the carriage can never pull the engine! You may "feel" spiritually energized one day and emotionally drained the next. Feelings are real, but they are never the compass of your salvation. Keep your faith hooked to the Engine of God's Word.

#### What If I Still Stumble?
Being saved does not mean instant perfection. We will still battle sin; however, the mark of a believer is that we no longer enjoy sin or make peace with it. When we stumble:
1. **Confess immediately:** *"If we confess our sins, He is faithful and just to forgive us our sins and to cleanse us from all unrighteousness"* (**1 John 1:9**).
2. **Repent and walk forward:** Turn away from the offense and claim Christ's cleansing.

Take heart in **Philippians 1:6**: *He who began a good work in you will carry it on to completion until the day of Christ Jesus.*

> “Faith is not the absence of doubt; faith is anchoring our soul to God's unchanging facts when our feelings waver.” — Discipleship Ministry""",
        "prayer": "Father in heaven, thank You for the incredible gift of eternal life through Jesus Christ. When doubts or fluctuating emotions try to shake my confidence, remind me that my salvation does not rest on my performance, but on the finished work of Jesus on the cross and the unfailing promises of Your Word. Cleanse me from every sin, deepen my trust, and help me walk boldly as Your beloved child today. In Jesus' name, Amen.",
        "reflect": [
            "What doubts, fears, or misunderstandings did you wrestle with after first accepting Jesus Christ?",
            "In your own life, how often do you allow feelings (the carriage) to steer your faith rather than God's facts (the engine)?",
            "How does 1 John 1:9 change how you respond when you stumble into sin—does it lead you to run away from God, or run directly to Him?"
        ],
        "practice": [
            "**Anchor in Truth**: Memorize **1 John 5:12–13** this week. Whenever self-doubt arises, speak these verses aloud to declare God's assurance.",
            "**Grace Journal**: Write down 2 concrete changes you have observed in your desires, attitudes, or worldview since you gave your life to Jesus."
        ]
    },
    {
        "item": 2,
        "title": "The Word of God: Hearing and Living Scripture",
        "passages": [
            {"reference": "2 Timothy 3:14-17"}
        ],
        "devotional_title": "The Lamp, the Bread, and the Sword",
        "devotional_body": """The Bible is not just one book—it is a divine library of **66 books** written by approximately **44 authors** across three continents over **1,500 years**, yet bound together by one unified story of redemption in Jesus Christ.

It is organized into two foundational testaments:
- **Old Testament (39 Books):** The Law (5), History (12), Poetry (5), Major Prophets (5), and Minor Prophets (12)—laying the foundation, covenant, and prophetic promise of the coming Savior.
- **New Testament (27 Books):** The Gospels (4), Church History (Acts), Pauline Epistles (14), General Epistles (7), and Prophecy (Revelation)—witnessing to the arrival, teachings, resurrection, and return of Jesus Christ.

#### Four Purposes of God's Word (2 Timothy 3:16)
Paul reveals that all Scripture is profitable for four transformative works:
1. **Teaching (Doctrine):** Showing us the right path to walk.
2. **Reproof:** Showing us where we have stepped off the path.
3. **Correction:** Showing us how to get back on the path.
4. **Training in Righteousness:** Teaching us how to stay on the path.

#### Four Vivid Metaphors of Scripture
1. **A Lamp and Light for Guidance (**Psalm 119:105**):** In the ancient world, small clay oil lamps illuminated only one step ahead in the darkness. God's Word does not show us the entire distant future, but gives clear guidance for the very next step of obedience.
2. **Spiritual Bread for Sustenance (**Matthew 4:4**):** Physical bodies starve without food; our spiritual souls become malnourished without daily Bible intake.
3. **A Living, Discerning Sword (**Hebrews 4:12**):** The Word penetrates deep into our motives, untangling our rationalizations and exposing our true heart before God.
4. **The Sword of the Spirit for Warfare (**Ephesians 6:17**):** When Jesus was tempted by Satan in the desert (**Matthew 4:1–11**), He refuted every demonic lie with the spoken Word: *"It is written!"* The devil cannot refute God's truth.

#### What Must We Do with the Word?
- **Meditate on it (**Joshua 1:8**):** Let it soak into your thoughts day and night.
- **Practice it (**James 1:22**):** Be doers of the Word and not hearers only.
- **Study it diligently (**2 Timothy 2:15**):** Handle the Word of truth with reverence and precision.
- **Hold fast to it (**2 Timothy 1:13**):** Guard sound doctrine in a culture of shifting values.

> “The Bible was not given merely to increase our knowledge, but to transform our character and equip our lives.” — Discipleship Ministry""",
        "prayer": "Lord God, thank You for breathing Your life into the Holy Scriptures and giving me an infallible lamp for my feet. Forgive me for the times I have neglected Your Word or sought worldly counsel before seeking Your truth. Give me a ravenous hunger for Scripture. Teach me, correct me, and mold me into a doer of Your Word who honors You in thought, word, and deed. In Jesus' name, Amen.",
        "reflect": [
            "Which of the four metaphors of Scripture (Lamp, Bread, Discerning Sword, Weapon of Warfare) resonates most with your current season?",
            "What are the biggest obstacles or distractions that prevent you from reading God's Word consistently every day?",
            "Can you share an experience where a specific Bible verse brought clarity, comfort, or conviction into a difficult decision?"
        ],
        "practice": [
            "**Daily Word Rhythm**: Commit to reading 1 chapter of the New Testament every morning or evening this week (start with the Gospel of Mark).",
            "**Sword in Hand**: Pick one scripture promise (such as **Psalm 119:105** or **Joshua 1:8**) and write it on an index card or phone lock-screen to meditate on throughout the day."
        ]
    },
    {
        "item": 3,
        "title": "Talking with God: The Discipline and Joy of Prayer",
        "passages": [
            {"reference": "Matthew 6:9-13"}
        ],
        "devotional_title": "The Child's Access to the Heavenly Father",
        "devotional_body": """**Prayer is simply talking with God.** It is the sacred privilege of a child walking into the presence of a loving Father. Though God upholds the galaxies, He bends His ear to hear the whispers of His children.

#### Why We Pray
1. **Command and Privilege (**1 Timothy 2:8**):** God invites us to pray everywhere with holy hands and confident trust.
2. **Focusing on God:** Prayer re-centers our minds away from worldly anxieties and onto His sovereignty.
3. **Inner Spiritual Strength (**Jude 1:20**):** Praying in the Holy Spirit fortifies our spiritual life against weariness.
4. **Following Christ's Example (**Mark 1:35**):** Even Jesus, the Son of God, regularly woke before dawn to seek solitude in communion with the Father.

#### The A.C.T.S. Pattern for Balanced Prayer
When learning to pray, the acronym **A.C.T.S.** provides a balanced spiritual framework:
- **A — Adoration:** Praising God for who He is—His holiness, grace, wisdom, majesty, and love.
- **C — Confession:** Honestly opening our hearts, naming our failures, and receiving His cleansing forgiveness (**1 John 1:9**).
- **T — Thanksgiving:** Expressing gratitude for answered prayers, daily protection, family, and spiritual blessings (**Philippians 4:6**).
- **S — Supplication:** Presenting our practical needs, petitions, and intercessions for our family, church, community, and nation.

#### The Lord's Prayer: Our Daily Roadmap
In **Matthew 6:9–13**, Jesus gave us six foundational petitions:
1. *"Our Father in heaven, hallowed be Your name"* — **Praise & Worship.**
2. *"Your kingdom come, Your will be done..."* — **Submission & Alignment.**
3. *"Give us today our daily bread"* — **Trusting for Daily Needs.**
4. *"Forgive us our debts, as we also have forgiven our debtors"* — **Mercy & Reconciliation.**
5. *"Lead us not into temptation, but deliver us from evil"* — **Spiritual Protection.**
6. *"For Yours is the kingdom, the power, and the glory forever"* — **Triumphant Praise.**

#### Overcoming Hindrances to Prayer
Scripture honestly identifies obstacles that clog our communion with God:
- **Selfish motives (**James 4:3**):** Asking merely for selfish indulgence rather than God's glory.
- **Pride (**James 4:6**):** God opposes the proud but gives grace to the humble.
- **Unconfessed sin (**Isaiah 59:2; Psalm 66:18**):** Known disobedience breaks relational fellowship.
- **Unforgiveness (**Matthew 6:14–15**):** Harboring resentment shuts down the flow of God's grace in our own hearts.

> “Prayer does not change God's purpose; prayer aligns our heart with God's power and unleashes His will on earth.” — Discipleship Ministry""",
        "prayer": "Our Father in heaven, hallowed be Your holy name. Thank You that through Jesus Christ, the veil is torn and I can step boldly into Your presence. Teach me to pray with faith, humility, and persistence. Forgive my sins, search my heart, and release me from any bitterness or unforgiveness I have held against others. Guard my steps today, lead me away from temptation, and let Your kingdom be advanced in my home, workplace, and community. In Jesus' mighty name, Amen.",
        "reflect": [
            "Which element of the A.C.T.S. pattern (Adoration, Confession, Thanksgiving, Supplication) comes most naturally to you, and which is most neglected?",
            "How does viewing God as a loving Father reshape how you approach Him when you have failed or made mistakes?",
            "Is there someone in your life toward whom you are holding bitterness or resentment that needs to be brought to the Lord for forgiveness today?"
        ],
        "practice": [
            "**Prayer Journal**: Dedicate a section in your notebook or use the web app's Notes tab to write down 3 specific requests and the date. Watch how God answers!",
            "**10-Minute ACTS Practice**: Spend 10 intentional minutes today praying through the ACTS pattern: 2 mins Adoration, 2 mins Confession, 2 mins Thanksgiving, 4 mins Supplication."
        ]
    },
    {
        "item": 4,
        "title": "Daily Devotions: Cultivating a Fruitful Quiet Time",
        "passages": [
            {"reference": "Psalm 119:9-11"}
        ],
        "devotional_title": "The Sacred Appointment: The 4 R's and S.O.A.P.",
        "devotional_body": """**Quiet Time** is a daily, deliberate appointment with God in His Word and in prayer. We were created in God's image with the unique capacity to fellowship with Him. Just as our physical body cannot survive on one meal a week, our spiritual inner man cannot remain vibrant on Sunday sermons alone.

#### The 4 R's of a Fruitful Quiet Time
Everyone develops their own personal rhythm, but a healthy Quiet Time generally incorporates these four movements:
1. **Reading:** Read a biblical passage slowly, repeatedly, and with an open heart.
2. **Reflect & Remember:** Meditate on what you have read. Ask:
   - Is there an **Example** to follow?
   - Is there a **Command** to obey?
   - Is there an **Error** to avoid?
   - Is there a **Sin** to forsake?
   - Is there a **Promise** to claim?
   - Are there **Fresh truths** revealed about the Father, Son, or Holy Spirit?
3. **Record:** Write down in a journal what God has highlighted to you. Writing crystallizes spiritual thoughts.
4. **Request:** Turn what you read into prayer, bringing your daily needs and loved ones before the Lord.

#### Building the Habit: The 21-Day Principle
It takes roughly **3 weeks (21 days)** of intentional practice for any new activity to become an established habit.
- **Pick the best time:** Give God the prime 15–30 minutes of your day when you are alert (morning for early risers, evening for night owls).
- **Find a quiet place:** Choose a solitary place without notifications, noise, or interruptions (**Mark 1:35**).
- **Gather your tools:** Bible, journal, and a ready heart.

#### The S.O.A.P. Devotional Journaling Method
One of the most practical tools for daily devotions is the **S.O.A.P.** method:
- **S — Scripture:** Write out 1–2 key verses that stirred your heart during reading.
- **O — Observation:** Summarize the core truth in your own words. What was God saying to the original audience?
- **A — Application:** Personalize it: *"How does this apply to my life right now at home, work, or school?"*
- **P — Prayer:** Write a short, honest prayer asking the Holy Spirit to help you obey what He showed you.

#### Model S.O.A.P. Entry (Joshua 14:10–12)
- **Scripture:** *"So here I am today, eighty-five years old! I am still as strong today as the day Moses sent me out... Now give me this hill country that the Lord promised me."*
- **Observation:** At 85 years old, Caleb was as enthusiastic and courageous as he was 45 years earlier. His faith in God's promise never aged or grew cynical.
- **Application:** Age and fatigue are no excuse to stop serving God. I will not say *"let the young people do it."* I will volunteer for the outreach ministry with joy!
- **Prayer:** *Lord, give me Caleb's spirit. Let me hold onto Your vision with passion as long as I live. Amen!*

> “Quiet Time is not an item to check off a religious checklist; it is showing up for a daily love relationship with your Creator.” — Discipleship Ministry""",
        "prayer": "Loving Father, thank You that You desire intimate daily fellowship with me. Forgive me for the rushed mornings and cluttered days that crowd You out. Help me establish a faithful 21-day rhythm of meeting with You. Give me ears to hear Your voice in Scripture, a humble heart to apply Your truth, and eyes to see where You are working in my life today. In Jesus' name, Amen.",
        "reflect": [
            "What time of day and physical location could realistically serve as your undistracted 'Quiet Time' sanctuary?",
            "What has been your biggest past frustration with Bible reading, and how does the S.O.A.P. method provide a fresh start?",
            "How does recording your insights in a journal help you retain spiritual lessons that would otherwise be forgotten?"
        ],
        "practice": [
            "**21-Day Habit Challenge**: Set a reminder on your calendar for the same 20-minute window every day for the next 21 days.",
            "**First S.O.A.P. Entry**: Read **Psalm 23** today and write your very first S.O.A.P. entry in your journal or the Notes tab."
        ]
    },
    {
        "item": 5,
        "title": "Overcoming Temptation: Standing Firm in God's Power",
        "passages": [
            {"reference": "1 Corinthians 10:12-14"}
        ],
        "devotional_title": "The Anatomy of Temptation and the Way of Escape",
        "devotional_body": """God calls His children to walk in holiness: *"...because it is written, 'Be holy, for I am holy'"* (**1 Peter 1:16**). Yet every believer experiences the fierce pull of temptation. Learning how to overcome temptation is one of the most vital battlegrounds of the Christian life.

#### What Is Temptation?
The word *temptation* means to test or prove. It occurs when our human desires are enticed toward what God has forbidden. 

According to **1 John 2:16**, temptation attacks through three primary avenues:
1. **Lust of the Flesh:** Craving sinful physical or sensual indulgence (sexual immorality, substance abuse, gluttony).
2. **Lust of the Eyes:** Coveting material possessions, luxury, and visual stimulation (**Genesis 3:6**).
3. **Pride of Life:** Craving human praise, status, power, and self-glorification.

> **Crucial Truth:** Being tempted is **not** a sin. Jesus Himself was tempted in all points as we are, yet without sin (**Hebrews 4:15**). It is **yielding** to temptation that becomes sin.

#### The Dangerous Chain Reaction (James 1:14–15)
James maps the spiritual downward spiral:
1. **Internal Desire:** Drawn away and enticed by selfish craving.
2. **Conception:** Entertaining the thought and deciding to act.
3. **Birth of Sin:** The outward sinful action or attitude.
4. **Death:** Spiritual dryness, guilt, broken fellowship, and eventual destruction.

#### God's Ironclad Guarantee (1 Corinthians 10:13)
When temptation strikes, remember three eternal facts:
- Temptation is **common to all**—you are not fighting a unique or weird struggle.
- God is **faithful**—He will never permit you to be tested beyond what you can bear.
- God will always supply the **way of escape**!

#### Seven Practical Weapons for Victory
1. **Hide God's Word in Your Heart (**Psalm 119:11**):** Memorize specific scriptures that target your weak points.
2. **Flee Temptation (**2 Timothy 2:22**):** Do not stay to debate the devil or test your willpower. Like Joseph running from Potiphar's wife (**Genesis 39:12**), sprint away from compromising environments.
3. **Guard Your Thought Life (**Proverbs 23:7; 2 Corinthians 10:5**):** You cannot stop a bird from flying over your head, but you can stop it from building a nest in your hair! Cast down sinful thoughts immediately.
4. **Watch and Pray (**Matthew 26:41**):** Stay spiritually alert. Weariness and prayerlessness make us easy targets.
5. **Stay Active in Kingdom Service:** An idle mind is fertile ground for temptation. David stumbled into adultery when he stayed behind in leisure instead of fulfilling his royal calling (**2 Samuel 11:1–4**).
6. **Walk with Godly Believers (**Proverbs 13:20**):** Surround yourself with friends whose faith and purity inspire you.
7. **Seek Accountability (**Galatians 6:1**):** If you are trapped in a repeating cycle, break the secrecy. Confide in a pastor, cell leader, or mature believer who can pray and walk with you.

> “Enduring temptation is not about grit and willpower; it is about keeping our eyes glued to the greater beauty and satisfaction found in Jesus Christ.” — Discipleship Ministry""",
        "prayer": "Holy God, You are pure, righteous, and faithful. Thank You that You never leave me defenseless when temptation attacks. Forgive me for the times I have lingered near sin or trusted in my own strength. Open my eyes to see the escape route You provide in every trial. Give me the holy courage of Joseph to run from evil, a mind renewed by Your Word, and the wisdom to walk in honest accountability with brothers and sisters in Christ. In Jesus' victorious name, Amen.",
        "reflect": [
            "In which of the three areas (lust of the flesh, lust of the eyes, pride of life) do you find yourself most vulnerable to spiritual attacks?",
            "What is the difference between feeling guilty for being tempted versus feeling convicted for yielding to temptation?",
            "Who is one mature Christian or leader in your life with whom you can be completely honest when struggling with persistent weaknesses?"
        ],
        "practice": [
            "**Identify the Trigger**: Pinpoint one digital app, late-night habit, or relational setting that frequently leads you toward temptation, and set up a concrete boundary today.",
            "**Memorize 1 Corinthians 10:13**: Commit this verse to memory so you can recite it the next time temptation presents itself."
        ]
    },
    {
        "item": 6,
        "title": "Fellowship & Church Life: Growing Together in Community",
        "passages": [
            {"reference": "Hebrews 10:23-25"}
        ],
        "devotional_title": "The Charcoal Principle and the Two Axes of Fellowship",
        "devotional_body": """In God's kingdom, there is no such thing as a "lone-ranger Christian." When God saves you, He does not just give you a private ticket to heaven—He adopts you into a local and global spiritual family called the **Body of Christ**.

#### The Charcoal Illustration
An individual Christian is like a glowing piece of charcoal:
- **In isolation:** Pull an ember away from the fire, and within minutes it turns gray, loses its heat, and dies out.
- **In community:** Place that same ember back among the heap of burning coals, and it blazes with vibrant, radiant heat.

Fellowship is not optional luxury; it is the spiritual oxygen that keeps our faith burning bright.

#### The Two Axes of Christian Fellowship
Biblical fellowship operates along two essential axes:

> 👆 **(1) Vertical Fellowship (God-ward)**  
> Our personal communion with God the Father through faith in Jesus Christ. This is the bedrock foundation of all true fellowship.
> 
> 👉 **(2) Horizontal Fellowship (Man-ward)**  
> Our mutual love, care, and partnership with fellow believers in the Body of Christ. When vertical fellowship is secure, horizontal community naturally thrives.

#### Seven Expressions of Daily Fellowship
1. **Pray for One Another (**James 5:16**):** Carrying each other's petitions to God.
2. **Forgive One Another (**Ephesians 4:32**):** Refusing to nurture grudges when misunderstandings arise.
3. **Receive One Another as Friends (**Romans 15:7**):** Extending hospitality across demographic and cultural divides.
4. **Serve One Another (**Galatians 5:13**):** Laying down rights to wash each other's feet in practical service.
5. **Be Considerate (**Philippians 2:4**):** Valuing others' feelings, needs, and schedules above our own.
6. **Share Material Blessings (**1 John 3:17–18**):** Meeting practical needs within the church family.
7. **Build Up and Encourage (**Hebrews 3:13**):** Speaking words of life and courage daily.

#### Why You Need a Small Group / Life Group
A growing local church operates on two wings: **the large Sunday celebration** (for corporate worship and proclamation of the Word) and **the small group / Life Group** (for personal relationships, pastoral care, and discipleship).

In a small group, you experience:
- **Personal pastoral care** that a large crowd cannot offer
- **A safe place to share struggles** and receive confidential prayer
- **Opportunities to discover and exercise your spiritual gifts**
- **Inspiration from real-life testimonies** of God's work in others
- **Spiritual protection** against deception and backsliding

> “We cannot love Jesus and despise His Bride. God did not call us to be solitary stones, but to be built together into a living temple.” — Discipleship Ministry""",
        "prayer": "Father of our Lord Jesus Christ, thank You for adopting me into Your royal family and making me a living member of the Body of Christ. Deliver me from the temptation to isolate myself or live as a spectator. Give me a deep love for Your church, grace to forgive when others let me down, and a servant's heart to minister to those around me. Plant me firmly in a loving small group where I can grow, serve, and glorify Your name. In Jesus' name, Amen.",
        "reflect": [
            "Have you ever experienced a season where you withdrew from fellowship—what happened to your spiritual passion during that time?",
            "Which of the 7 expressions of fellowship (praying, forgiving, receiving, serving, considerateness, sharing, encouraging) do you feel called to practice more intentionally this week?",
            "What fears or hesitations make it hard for people to be vulnerable in a small group setting, and how can we foster a safe community?"
        ],
        "practice": [
            "**Join a Small Group**: If you are not yet connected to a Life Group, speak with your church pastoral team or cell leader this week to get plugged in.",
            "**Reach Out to an Ember**: Send a message or call one brother or sister who was absent from church recently to encourage them and let them know they are valued."
        ]
    },
    {
        "item": 7,
        "title": "Stewardship & Generosity: Managing God's Entrusted Resources",
        "passages": [
            {"reference": "2 Corinthians 9:6-8"}
        ],
        "devotional_title": "Owner vs. Steward: The Theology of Open Hands",
        "devotional_body": """Who is the true owner of your life, your time, and your bank account? 

According to **Psalm 24:1**, the answer is absolute: *"The earth is the Lord's, and all its fullness, the world and those who dwell therein."* God is the Creator, Sustainer, and sole Possessor of all things. When we surrender to Jesus, we step out of the role of "Owner" and embrace our true biblical identity: **Stewards of God's Kingdom**.

#### The Great Paradigm Shift

> **God: The True Owner**  
> • **Owner:** Holds title and possession of all creation (**Psalm 24:1**).  
> • **Giver:** Supplies life, breath, and every good gift (**Acts 17:25**).  
> • **Possessor:** Sovereignly directs how resources are used.  
> • **Rewarder:** Evaluates faithfulness and rewards diligent service.  
>  
> **Man: The Entrusted Steward**  
> • **Steward:** Caretaker of another's household and affairs (**1 Corinthians 4:2**).  
> • **Receiver:** Gratefully receives God's provision with thanksgiving.  
> • **Manager:** Accountable for managing life, time, talents, and finances wisely.  
> • **Rewarded:** Enters into the joy and reward of the Master (**Matthew 25:21**).

#### Three Arenas of Stewardship
1. **Our Lives (**Acts 17:25**):** We do not belong to ourselves; we were bought with a price (**1 Corinthians 6:20**).
2. **Our Time (**Psalm 90:12; Ephesians 5:16**):** Time is our most non-renewable currency. God expects us to prioritize eternal kingdom investments.
3. **Our Talents and Abilities (**Matthew 25:14–30**):** Every natural skill and spiritual gift is loaned to us to build up the church and serve humanity.

#### Stewardship of Finances: Tithes and Offerings
Money is often the greatest competitor for the human heart (**Matthew 6:24**). God instituted financial generosity to break the grip of mammon and teach us faith.
- **The Tithe (**Leviticus 27:30; Malachi 3:10**):** The word *tithe* means one-tenth (10%). Returning the first 10% of our income to God's storehouse (the local church) acknowledges that God is the provider of 100%. In Malachi 3:10, God gives a unique invitation: *"Test Me now in this... and see if I will not open for you the windows of heaven and pour out for you such blessing that there will not be room enough to receive it."*
- **Offerings:** Voluntary gifts given beyond the tithe out of a heart of gratitude for mission, the poor, and kingdom projects.

#### New Testament Principles of Giving (2 Corinthians 9:6–8)
1. **The Law of Sowing and Reaping:** Whoever sows sparingly will reap sparingly; whoever sows bountifully will reap bountifully.
2. **Cheerful, Voluntary Giving:** God does not want reluctant giving extracted under guilt. *"God loves a cheerful giver"* (giving with a joyful, willing heart).
3. **Divine Sufficiency:** As you honor God, He promises to make all grace abound so that you have all sufficiency in all things for every good work.

> “You cannot outgive God. When we hold our resources with open hands, God has room to place His blessings into our palms.” — Discipleship Ministry""",
        "prayer": "Lord God, Maker of heaven and earth, I confess that everything I possess belongs to You. Forgive me for the times I have lived like an anxious owner rather than a faithful steward. Break the spirit of greed, fear, and materialism off my life. Teach me to manage my time, energy, and finances with kingdom purpose. Give me the joy of a cheerful giver who honors You with the first-fruits of my labor and blesses those in need. In Jesus' name, Amen.",
        "reflect": [
            "How does shifting from the mindset of 'Owner' to 'Steward' change the way you view your paycheck, your calendar, and your possessions?",
            "What makes financial generosity difficult or frightening for many people, and what promises in 2 Corinthians 9 give us courage?",
            "Can you share a testimony of God's faithfulness when you or your family chose to give faithfully even during lean seasons?"
        ],
        "practice": [
            "**Faithful First-Fruits**: Take a step of faith this coming Sunday by returning your tithe (10%) to your local church storehouse with a joyful heart.",
            "**Time & Talent Audit**: Review your weekly schedule. Identify 2 hours this week that can be redeemed from mindless scrolling or entertainment to serve someone in need."
        ]
    },
    {
        "item": 8,
        "title": "Water Baptism & Holy Communion: The Two Ordinances",
        "passages": [
            {"reference": "Romans 6:3-5"}
        ],
        "devotional_title": "Public Declaration and Sacred Remembrance",
        "devotional_body": """Jesus instituted two perpetual ordinances for His followers: **Water Baptism** and **Holy Communion**. Both are physical, tangible signs of spiritual realities that anchor our faith.

---

### Part 1: Water Baptism

#### 1. What Is Water Baptism?
Water baptism is the immersion of a born-again believer in water in the name of the Father, Son, and Holy Spirit (**Matthew 28:19**).

> **The Wedding Ring Analogy:**
> Wearing a wedding ring does not make two people married; rather, it is the public, outward symbol that an inward covenant has already taken place. In the same way, water does not save you—salvation happens in the heart through faith in Jesus. Water baptism is your **public wedding ceremony**, declaring openly to God, angels, the church, and the world: *"I belong to Jesus Christ!"*

#### 2. Why Should a Believer Be Baptized?
- **Christ's Direct Command (**Matthew 28:19**):** It is an essential component of the Great Commission.
- **Christ's Personal Example (**Matthew 3:13–17**):** Jesus Himself was baptized to fulfill all righteousness.
- **Public Confession of Faith (**Matthew 10:32**):** *"Whoever confesses Me before men, him I will also confess before My Father in heaven."*

#### 3. The Spiritual Meaning (Romans 6:3–5)
When you step into the baptismal waters, you reenact the Gospel:
1. **Going into the water:** Acknowledging that your old, sinful self died with Christ on the cross.
2. **Submerged under the water:** Acknowledging the burial of your past—your sins, guilt, and old nature are buried forever.
3. **Rising out of the water:** Stepping into the resurrected, new life of Jesus Christ with power to walk in holiness!

---

### Part 2: Holy Communion (The Lord's Supper)

Instituted on the night Jesus was betrayed (**1 Corinthians 11:23–26**), the Lord's Supper is a sacred meal of remembrance:
- **The Bread (His Body):** Represents Christ's physical body broken on the cross to bear the punishment for our iniquities.
- **The Cup (His Blood):** Represents the shed blood of Jesus that ratified the New Covenant, washing away all sin.

#### Proper Attitudes at the Lord's Table
1. **Heartfelt Gratitude:** Praising Jesus for the infinite cost He paid to purchase our salvation.
2. **Oneness & Unity (**1 Corinthians 10:17**):** Celebrating that we are one family in Christ.
3. **Reverent Self-Examination (**1 Corinthians 11:28–29**):** Pausing to examine our hearts, confessing known sin, and reconciling with any brother or sister before eating.

> “Water baptism is our public declaration that the old life is buried; Holy Communion is our ongoing proclamation that Christ is alive and returning soon.” — Discipleship Ministry""",
        "prayer": "Lord Jesus, thank You for instituting these holy ordinances to anchor my faith. Thank You that when I was baptized, my old life was buried and I was raised up to walk in brand-new life. Whenever I partake of the bread and the cup, flood my heart with awe at the price You paid on Calvary. Cleanse my heart from any hidden fault, heal any division between me and my brothers and sisters, and keep me faithful until the day You return. In Your holy name, Amen.",
        "reflect": [
            "If you have already been water-baptized, what did that public moment mean to you? If not, what is holding you back from taking this step of obedience?",
            "How does the wedding ring analogy help explain baptism to non-believing friends and family members?",
            "Why does the Apostle Paul place so much emphasis on self-examination and unity before eating the bread and drinking the cup of Communion?"
        ],
        "practice": [
            "**Take the Step of Baptism**: If you have never been baptized as a believer, contact your church office or pastor this week to register for the next baptism service.",
            "**Communion Preparation**: Before your next church service, take 5 quiet minutes to examine your heart, confess any unrepented sin, and extend forgiveness to anyone who has offended you."
        ]
    },
    {
        "item": 9,
        "title": "Empowered by the Holy Spirit: Walking in Power, Gifts, and Fruit",
        "passages": [
            {"reference": "Acts 1:4-8"}
        ],
        "devotional_title": "The Promise of the Father for Every Believer",
        "devotional_body": """One of the most thrilling promises in Scripture is found in **Acts 1:8**: *"You shall receive power when the Holy Spirit has come upon you; and you shall be witnesses to Me in Jerusalem, and in all Judea and Samaria, and to the end of the earth."*

The baptism in the Holy Spirit is not reserved for an elite spiritual class. As Peter proclaimed on the Day of Pentecost: *"For the promise is to you and to your children, and to all who are afar off, as many as the Lord our God will call"* (**Acts 2:39**). It is God's heart that every child of His be filled with the Spirit.

#### The Purpose of the Infilling
1. **Bold Witness (**Acts 1:8**):** The Spirit transforms timid disciples into courageous witnesses who speak God's Word without fear (**Acts 4:31**).
2. **Cleansing Fire (**Matthew 3:11; Hebrews 12:29**):** The Holy Spirit burns away worldly compromises and purifies our desires.
3. **Supernatural Communication:**
   - Deeper prayer through the Spirit when human words run dry (**Romans 8:26**).
   - Richer spiritual worship (**Ephesians 5:18–19**).
   - Illumination of Scripture (**John 14:26**).

#### Character and Competence: Fruit and Gifts
The Holy Spirit produces both His nature and His supernatural ministry through us:
- **The Fruit of the Spirit (9-fold character — Galatians 5:22–23):** Love, joy, peace, longsuffering, kindness, goodness, faithfulness, gentleness, and self-control.
- **The Gifts of the Spirit (9-fold empowerment — 1 Corinthians 12:8–10):** Word of wisdom, word of knowledge, faith, gifts of healings, working of miracles, prophecy, discerning of spirits, different kinds of tongues, and interpretation of tongues.

#### How to Receive the Baptism in the Holy Spirit
Receiving the Spirit is an act of simple, expectant faith:
1. **Confirm foundational faith:** You must be born again by trusting in Jesus Christ.
2. **Ask with childlike confidence:** *"If you then, being evil, know how to give good gifts to your children, how much more will your heavenly Father give the Holy Spirit to those who ask Him!"* (**Luke 11:13**).
3. **Release your voice in faith:** When the Holy Spirit comes upon you, He gives the inspiration, but you must open your mouth to speak the new spiritual language (**Acts 2:4**). Do not wait for an overwhelming emotion; step out in faith.

#### Clearing Hindrances
- **Fear:** Fear of being deceived or looking foolish. Remember that God only gives good gifts (**Luke 11:11–13**).
- **Doubt/Unbelief:** Trust God's Word above intellectual skepticism (**Hebrews 11:6**).
- **Feelings of Inadequacy:** The Spirit is a free gift of grace, not a prize earned by spiritual maturity.
- **Unforgiveness & Sin:** Cleanse your heart by confessing known sin and releasing any bitterness (**Psalm 66:18; Mark 11:25**).

> “The Christian life is not difficult; it is impossible without the Holy Spirit. He is the divine wind in our sails.” — Discipleship Ministry""",
        "prayer": "Heavenly Father, I thank You that You have not left me to live the Christian life in my own fragile strength. I hunger for all that You have promised. Lord Jesus, baptize me afresh with the Holy Spirit and with fire. Fill me to overflowing. Release Your spiritual gifts in my life, grant me boldness to witness for Christ, and produce the beautiful fruit of love, joy, and peace in my daily walk. By faith, I receive Your supernatural empowerment right now. In Jesus' mighty name, Amen.",
        "reflect": [
            "Why did Jesus command the early disciples to wait for the Holy Spirit before launching out into global mission?",
            "What misunderstandings, fears, or reservations have you heard regarding the baptism in the Holy Spirit or speaking in tongues?",
            "How does the balance between the Fruit of the Spirit (character) and the Gifts of the Spirit (power) keep a Christian healthy and humble?"
        ],
        "practice": [
            "**Prayer of Infilling**: Spend 15 minutes in quiet prayer tonight asking the Lord Jesus to baptize you afresh in the Holy Spirit.",
            "**Fruit Check**: Choose one fruit of the Spirit (e.g., patience or gentleness) where you struggle most, and consciously ask the Holy Spirit to guide your reactions today."
        ]
    },
    {
        "item": 10,
        "title": "Sharing Your Faith: Ambassadors for Christ",
        "passages": [
            {"reference": "Matthew 28:18-20"}
        ],
        "devotional_title": "The Ministry of Reconciliation: Friendship and the Gospel",
        "devotional_body": """As Christians, having tasted the goodness of God and received the free gift of eternal life, we are commissioned as **Ambassadors for Christ** (**2 Corinthians 5:20**). Sharing our faith is simply one beggar telling another beggar where to find bread.

#### Why We Must Share Our Faith
1. **There is no other way to be saved (**John 14:6; Acts 4:12**):** Good works and moral effort cannot bridge the chasm of sin. Only Jesus saves.
2. **God's heart desires all to be saved (**1 Timothy 2:3–4; 2 Peter 3:9**):** God takes no pleasure in the destruction of the wicked.
3. **Jesus commanded it (**Matthew 28:19–20**):** Witnessing is not a suggestion, but an act of loving obedience.
4. **Eternal rewards (**Proverbs 11:30; Daniel 12:3**):** Those who lead many to righteousness will shine like the stars forever.

#### Friendship Evangelism: The Natural Process
Effective witnessing flows naturally through authentic relationships:
1. **Connect over Daily Life:** Build genuine rapport through conversations about family, hobbies, work, and challenges.
2. **Explore Spiritual Backgrounds:** Listen with care to their beliefs, upbringing, and worldview without arguing.
3. **Share Natural Spiritual Activities:** Mention your church family, prayer answers, and what God is teaching you.
4. **The 1–10 Bridge Question:** Ask: *"On a scale of 1 to 10, how spiritually fulfilled do you feel your life is right now?"* This gently pivots into spiritual conversations.

#### The Two Diagnostic Questions
- **Question 1:** *"Do you know for sure that if you were to die today, you would be with God in heaven?"*
- **Question 2:** *"If God were to ask you, 'Why should I let you into My heaven?' what would you say?"*

#### The 5-Point Gospel Outline (The Five Fingers)
1. **G — Grace:** Eternal life is a free gift of God (**Romans 6:23b**). It cannot be earned or deserved (**Ephesians 2:8–9**). *Illustration:* You cannot pay a friend for a birthday present without insulting their love.
2. **M — Man:** All have sinned and fall short of God's glory (**Romans 3:23**). Man cannot save himself. *Illustration:* Just one rotten egg ruins the entire omelet; a single sin contaminates our moral record before a holy God (**Matthew 5:48**).
3. **G — God:** God is merciful and loves us (**Jeremiah 31:3**), but He is also completely just and must punish sin (**Exodus 34:7**). *Illustration:* A civil judge who lets a bank robber walk free without penalty is corrupt. How does God resolve this dilemma? In Christ!
4. **C — Christ:** Jesus is God who became man (**John 1:1, 14**). He died on the cross to pay our sin penalty in full and rose victoriously from the dead.
5. **F — Faith:** Saving faith is not mere head knowledge or temporary trust for earthly needs; it is trusting in Jesus Christ alone for eternal salvation. *Illustration:* Stepping into the lifeboat, or Blondin pushing the wheelbarrow across Niagara Falls—believing the tightrope walker can do it is head knowledge; climbing into the wheelbarrow is saving faith!

#### Leading Someone to Christ: The Commitment Prayer
*"Lord Jesus, I know I am a sinner and cannot save myself. I believe You died on the cross for my sins and rose from the grave. Lord Jesus, come into my life, forgive my sins, and take control of my heart. I place my trust in You alone as my Lord and Savior. Thank You for the free gift of eternal life. Amen."*

#### What If Someone Declines?
- Remember that they are not rejecting you; they are responding to Christ. Never take rejection personally.
- Keep the relationship warm, kind, and loving. An angry response shuts the door; unconditional kindness keeps the door wide open.
- Never stop praying for them!

> “Evangelism is not high-pressure salesmanship; it is introducing your friends to the greatest Friend you have ever known.” — Discipleship Ministry""",
        "prayer": "Lord of the harvest, thank You for sending someone into my life to share the Good News of Jesus with me. Fill my heart with Your compassion for the lost. Strip away my fear of man, my self-consciousness, and my hesitation. Give me eyes to see the people around me through Your love. Open doors of conversation in my home, workplace, and neighborhood, and give me the wisdom and gentleness to point people to the Savior. In Jesus' name, Amen.",
        "reflect": [
            "Who was the person God used to first share the Gospel with you, and what about their life or words touched your heart?",
            "What is your greatest fear or hesitation when it comes to sharing your faith with colleagues, friends, or family members?",
            "How does the distinction between intellectual head knowledge and saving faith (climbing into the wheelbarrow) help you explain true faith to others?"
        ],
        "practice": [
            "**The Top 2 Prayer List**: Write down the names of two non-believing friends, relatives, or coworkers in the Notes tab. Pray for their salvation by name every day this week.",
            "**Practice the Bridge Question**: Practice asking the 1–10 spiritual fulfillment question or sharing your 2-minute personal testimony with a fellow Christian so you are ready when God opens a door."
        ]
    }
]

def generate_interactive_markdown():
    lines = []
    lines.append("# New Life in Christ: Discipleship Guide for New Believers")
    lines.append("## Interactive Small Group & Devotional Study Edition")
    lines.append("")
    lines.append("_A 10-Session Foundational Journey in Following Jesus, Growing in Faith, and Walking in Community_")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Overview: 10 Foundations of New Life")
    lines.append("")
    lines.append("| Session | Title | Primary Scripture | Core Focus |")
    lines.append("| :---: | :--- | :--- | :--- |")
    for s in SESSIONS_INTERACTIVE:
        p_ref = s["passages"][0]["reference"]
        lines.append(f"| **{s['item']}** | **{s['title'].split(':')[0]}** | {p_ref} | {s['title'].split(':')[-1].strip()} |")
    lines.append("")
    lines.append("---")
    lines.append("")

    for s in SESSIONS_INTERACTIVE:
        lines.append(f"## Session {s['item']}: {s['title']}")
        lines.append("")
        lines.append("### 1. Scripture Text")
        lines.append("")
        for p in s["passages"]:
            lines.append(f"**{p['reference']} (BSB)**")
        lines.append("")
        lines.append(f"### 2. Devotional Reflection: {s['devotional_title']}")
        lines.append("")
        lines.append(s["devotional_body"])
        lines.append("")
        lines.append("### 3. Personal Prayer")
        lines.append("")
        lines.append(f"_{s['prayer']}_")
        lines.append("")
        lines.append("### 4. Facilitator & Group Discussion")
        lines.append("")
        for idx, q in enumerate(s["reflect"], 1):
            lines.append(f"{idx}. {q}")
        lines.append("")
        lines.append("### 5. Posture & Practice")
        lines.append("")
        for pr in s["practice"]:
            lines.append(f"* {pr}")
        lines.append("")
        lines.append("---")
        lines.append("")

    return "\n".join(lines)

def generate_interactive_json():
    items = []
    for s in SESSIONS_INTERACTIVE:
        passages = []
        for p in s["passages"]:
            ref = p["reference"]
            url = make_bible_url(ref, "BSB", 3034)
            passages.append({
                "reference": ref,
                "url": url
            })
        
        dev_content = f"### {s['devotional_title']}\n\n{s['devotional_body']}"
        
        item_obj = {
            "item": s["item"],
            "title": s["title"],
            "passages": passages,
            "devotional": {
                "author": "SET FGA",
                "content": dev_content
            },
            "prayers": [
                {
                    "topic": "Personal Prayer",
                    "description": s["prayer"]
                }
            ],
            "reflect": s["reflect"],
            "practice": s["practice"]
        }
        items.append(item_obj)

    plan = {
        "id": "new-life-in-christ",
        "title": "New Life in Christ: Discipleship Guide (Interactive Study)",
        "description": "A 10-session foundational discipleship guide for new believers designed for personal study and small group discussion, covering assurance of salvation, prayer, the Word, fellowship, overcoming temptation, and sharing your faith. Compiled by Jeff Tan, updated by Victor Goh.",
        "type": "reading",
        "totalItems": 10,
        "created": "2026-09-18",
        "version": "1.0",
        "creator": "SET FGA",
        "tags": [
            "New Believers",
            "Discipleship",
            "Foundations",
            "Small Group",
            "Bible Study"
        ],
        "items": items
    }
    return plan

print("Updated interactive study generator without Context & Insight.")
