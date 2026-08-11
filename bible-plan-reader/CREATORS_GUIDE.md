# Content Creator's Guide & Sample Plain-Text Templates

This guide is designed for pastors, ministry leaders, and content creators. It explains how to structure your devotional plans, details which sections are mandatory versus optional, and provides sample templates you can copy, edit, and convert using our AI Assistant Prompt.

---

## Content Rules: Mandatory vs. Optional Fields

When writing plan content in plain text for the AI converter, use the following rules to ensure the resulting app features work correctly:

### 1. Plan-Level Information
- **Title (Mandatory)**: The main name of the plan (e.g. *30 Days in the Gospels*).
- **Description (Mandatory)**: A brief 1-2 sentence description explaining the purpose of the plan.
- **Type (Mandatory)**: Must specify if it is a `Reading Plan` or a `Prayer Guide`.
- **Creator (Optional)**: The name of your church or ministry.
- **Version (Optional)**: Set to `1.0` by default.
- **Banner Image (Optional)**: A custom image link (recommended size: `1440 x 810` px, 16:9). If not provided, a default word-only gradient banner is automatically generated using the plan title.
- **Icon (Optional)**: A custom squared listing icon link (recommended size: `320 x 320` px, 1:1). If not provided, a default styled emoji icon (`📖` or `🙏`) is displayed based on the plan type.

### 2. Daily Content Fields
- **Day Number (Mandatory)**: A sequential number starting from `1` (e.g. `Day 1`, `Day 2`).
- **Day Title (Mandatory)**: The title of the day's reflection (e.g. *The Great Light*).
- **Scripture Passages (Mandatory)**: 
  - Each day **must include at least 1 passage reference** (e.g., *John 1:1-4* or *Psalm 23:1*). 
  - You only need to write the **Passage Reference**. The AI will automatically generate the correct web links to BibleGateway.
  - You can optionally paste the **Scripture Text** inline. If provided, readers can read the verses directly within the app without opening a web link.
- **Devotional Reflection (Mandatory)**: The main reading content written by the author.
- **Devotional Media (Optional)**:
  - You can provide **one image link**, **one video link**, and/or **one audio link** per day to accompany the devotional. Leave these out if not needed.
- **Prayer Topics (Optional)**:
  - Highly recommended for *Prayer Guides*. 
  - Provide a short `Topic` and a detailed `Description` of what to pray for.
- **Reflection Questions (Optional)**:
  - A list of questions for personal contemplation or small group discussion. Omit if not needed.
- **Action Steps (Optional)**:
  - Practical application tasks for the day. Omit if not needed.

---

## Example 1: Minimum Content Template
This is the absolute minimum text you need to supply to generate a valid plan. It contains exactly one passage reference, a title, a description, and the devotional text.

```text
Title: A Simple Weekend Rest Plan
Description: A minimalist 2-day plan focused on physical and spiritual rest.
Type: Reading Plan
Creator: Grace Chapel

---

Day 1: Rest for the Weary
Passage Reference: Matthew 11:28-30

Devotional Reflection:
In a world that values constant hustle and productivity, Jesus invites us to rest. True rest isn't just the absence of work; it is the presence of Christ. Spend time sitting quietly with Him today, letting Him carry your heavy burdens.

---

Day 2: The Gift of Sabbath
Passage Reference: Genesis 2:2-3

Devotional Reflection:
God did not rest on the seventh day because He was tired. He rested to set a pattern of rhythm for us. Sabbath is a holy boundary that declares our trust in God's provision rather than our own efforts. Rest today, and praise Him for His goodness.
```

---

## Example 2: Complete Devotional Reading Plan (Rich Content)
Use this structure when you want to supply scripture passages, reflection questions, action checklists, and media files.

```text
Title: Walk in the Light: A 3-Day Devotional
Description: Discover what it means to follow Jesus as the Light of the World in our daily choices.
Type: Reading Plan
Creator: Faith Community Church
Version: 1.1

---

Day 1: The Great Light
Passage Reference: John 8:12
Passage Scripture Text (Optional): When Jesus spoke again to the people, he said, "I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life."

Devotional Reflection:
Light does two things: it exposes what is hidden, and it guides our path. When Jesus claims to be the Light of the World, He is offering us direction in a confusing world. Following Him means letting His teachings illuminate our choices, relationships, and priorities. If you are feeling lost or in the dark today, look to His word for guidance.

Devotional Media:
- Image: https://images.unsplash.com/photo-1490730141103-6cac27aaab94 (Caption: The sunrise represents new beginnings in Christ.)
- Video: https://www.youtube.com/watch?v=G-2e9mMf7E8 (Title: Bible Project: Gospel of John Overview)
- Audio: https://church-sermons.s3.amazonaws.com/devos/walk-in-light-day1.mp3 (Title: Day 1 Audio Reflection)

Reflection Questions:
1. In what areas of your life do you feel like you are walking in the dark right now?
2. What does following the Light of Life look like practically in your decisions today?

Action Steps:
- Spend 5 minutes reading Psalm 119:105, meditating on God's Word as a lamp.
- Send a text message to a friend offering to pray for them if they are going through a difficult season.

---

Day 2: Children of Light
Passage Reference: Ephesians 5:8-10
Passage Scripture Text (Optional): For you were once darkness, but now you are light in the Lord. Live as children of light (for the fruit of the light consists in all goodness, righteousness and truth) and find out what pleases the Lord.

Devotional Reflection:
Paul tells us that we aren't just people who *see* the light—we are now *made* of light in the Lord. Because our identity has changed, our behavior must change too. Living as "children of light" means our lives should produce goodness, righteousness, and truth. If someone looks at your actions today, would they see a reflection of Jesus' light?

Devotional Media:
- Image: https://images.unsplash.com/photo-1507434965515-61970f2bd7c6 (Caption: Live as children of light.)
- Video: (none)
- Audio: https://church-sermons.s3.amazonaws.com/devos/walk-in-light-day2.mp3 (Title: Day 2 Audio Reflection)

Reflection Questions:
1. What does the "fruit of the light" (goodness, righteousness, truth) look like in a workplace or school environment?
2. Is there anything in your life right now that you are trying to keep hidden in the dark?

Action Steps:
- Make a conscious choice to speak only encouraging, truthful words today, avoiding gossip entirely.
- Write down one thing that you know pleases the Lord and make plans to do it this week.
```

---

## Example 3: Daily Prayer Guide Template
Notice that even for a Prayer Guide, at least 1 passage reference is mandatory for each day.

```text
Title: 3 Days of Breakthrough Prayer
Description: A focused guide to align our hearts with God through personal, community, and global prayer.
Type: Prayer Guide
Creator: Hope Ministries
Version: 1.1

---

Day 1: Praying for Renewal
Passage Reference: 2 Chronicles 7:14

Devotional Reflection:
True breakthrough begins when we ask God to renew our own hearts. It is easy to point out the problems in the world around us, but spiritual renewal starts from within. Today, we ask God to create in us clean hearts and to restore the joy of our salvation.

Devotional Media:
- Image: https://images.unsplash.com/photo-1544764200-d834fd210a22 (Caption: A heart turned toward God.)
- Video: (none)
- Audio: https://church-sermons.s3.amazonaws.com/prayers/breakthrough-day1.mp3 (Title: Day 1 Guided Prayer Podcast)

Prayer Topics:
1. Topic: Personal Repentance
   Description: Ask the Holy Spirit to reveal any secret sins or areas of pride in your life. Yield them to Him and thank Him for His forgiveness.
2. Topic: Spiritual Hunger
   Description: Pray for a fresh hunger for God's Word, His presence, and His righteousness in this season.

Reflection Questions:
1. What does a "renewed heart" feel and look like in your daily habits?
2. What distractions are currently dulling your desire for prayer?

Action Steps:
- Turn off your phone notifications for 1 hour today to spend uninterrupted time in prayer and reading.
- Write down your top three prayer requests for this week in a journal.

---

Day 2: Praying for Others
Passage Reference: Colossians 4:2

Devotional Reflection:
Intercession is the act of praying on behalf of others. Throughout the Gospels, we see Jesus constantly praying for His disciples and those who were hurting. When we pray for others, we carry their burdens and fulfill the law of Christ. Today, look outward.

Devotional Media:
- Image: https://images.unsplash.com/photo-1490730141103-6cac27aaab94 (Caption: Interceding for our community.)
- Video: https://www.youtube.com/watch?v=G-2e9mMf7E8 (Title: Gospel of John: Jesus' Final Prayer Overview)
- Audio: https://church-sermons.s3.amazonaws.com/prayers/breakthrough-day2.mp3 (Title: Day 2 Guided Prayer Podcast)

Prayer Topics:
1. Topic: Family and Friends
   Description: Pray for the physical health, emotional well-being, and spiritual growth of your immediate family and close friends.
2. Topic: Government and Leaders
   Description: Pray for wisdom, integrity, and justice for local and national leaders, that they would lead with humility.

Reflection Questions:
1. Who is someone in your life who is currently carrying a heavy burden? How can you pray for them today?
2. Why is it sometimes harder to pray for our leaders than for our friends?

Action Steps:
- Reach out to one person you prayed for today and let them know you are praying for them.
- Commit to praying for a specific leader (pastor, boss, or official) every day this week.
```

---

## Church Branding Customization & Link Sharing

Churches can white-label and customize the interface of the Bible Reader app dynamically, and distribute pre-configured lists or plans to their congregations using smart web links.

### 1. White-Labeling Your App (`plans.json` Structure)

To customize the app interface (adding your church logo, name, and website), structure your root `plans.json` registry file as an **object** instead of a flat array:

```json
{
  "organization": {
    "name": "Grace Community Church",
    "logoUrl": "https://gracecommunity.org/assets/logo.png",
    "website": "https://gracecommunity.org",
    "email": "info@gracecommunity.org"
  },
  "plans": [
    {
      "id": "30-days-gospels",
      "title": "30 Days in the Gospels",
      "description": "Walk through the life and teachings of Jesus.",
      "type": "reading_plan",
      "url": "plans/30-days-gospels.json"
    }
  ]
}
```

#### Customizable Branding Fields:
*   `organization.name`: Changes the title shown in the app header and browser tab.
*   `organization.logoUrl`: Standard logo displayed in the header and home welcome screen.
*   `organization.website`: Adds a "Visit Website" shortcut to the home screen.

---

### 2. URL Link Sharing Methods

Churches can share custom links that configure the app automatically for their congregation.

#### A. Share Your Entire Custom Catalog (`?repo=`)
Provide a link pointing the app shell to your hosted `plans.json` registry file. When opened, the app automatically switches to your church catalog, loads your branding, and saves it in `localStorage` for future visits:
```text
https://bible-reader.pages.dev/?repo=https://gracecommunity.org/assets/plans.json
```

#### B. Share a Specific Devotional Plan Directly (`?plan=`)
Direct users to open and launch a specific reading plan instantly on Day 1. You can optionally define a starting date using `&start=YYYY-MM-DD`:
```text
https://bible-reader.pages.dev/?plan=https://gracecommunity.org/assets/plans/advent-devotional.json&start=2026-12-01
```

---

### 3. Server Hosting Requirements (CORS)

If you are hosting your JSON files on your own church server or website, your web server must allow cross-origin requests from the app's hosting domain:

*   **The Header**: Ensure your server returns the following HTTP header on JSON requests:
    `Access-Control-Allow-Origin: *`
*   **Static Hosting Alternative**: Hosting your files on standard platforms like **GitHub Pages** or **Cloudflare Pages** automatically enables CORS by default, requiring no additional server configuration.

