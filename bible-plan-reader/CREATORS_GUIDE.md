# Content Creator's Guide & Sample Curriculum Templates

This guide is designed for pastors, ministry leaders, writers, and content creators. It explains how to structure your devotional and discipleship plans for **EQUIP: Rooted and Formed**, details mandatory vs. optional sections, and provides sample templates you can copy, edit, and convert using our AI Assistant Prompt.

---

## Content Rules & Section Structure

When writing plan content in markdown or plain text, adhere to the 6 core components for each session:

### 1. Plan-Level Information
* **Title (Mandatory)**: The main title of the series (e.g. *Apostolic Prayers: Cultivating Wisdom, Power, and Love*).
* **Description (Mandatory)**: A brief 1–2 sentence summary explaining the core focus of the plan.
* **Type (Mandatory)**: `reading` (for Bible Reading / Devotional studies) or `prayer_guide` (for Fasting / Intercession guides).
* **Creator (Optional)**: The attribution or ministry author (e.g. *Prayers of Paul*, *Growing Leaders Course*, *Andrew Murray (updated)*).
* **Tags (Optional)**: Array of categorical tags (e.g. `["Prayer", "Leadership", "Discipleship", "Bible Study"]`).

---

### 2. Session-Level Fields (Daily / Weekly)

Each session follows this standard 6-part structure:

1. **Scripture Text (`passages`) [Mandatory]**:
   * Passage reference and translation (e.g. `1 Timothy 2:1–4 (BSB)`).
   * Web links automatically point to Bible.com with USFM book codes.
2. **Context & Insight**:
   * Historical, cultural, and situational background explaining *why* the passage was written.
   * Lay-friendly keyword studies (transliterated English term with clear practical explanation).
3. **Devotional Reflection**:
   * Rich spiritual reflection and pastoral exposition.
   * Single-line memorable quote/axiom at the end:
     `> “We pray because every seed needs spiritual covering.” — Marcus Yong`
4. **Personal Prayer (`prayers`)**:
   * A 1-paragraph first-person prayer written in fluent, natural English with zero foreign/Greek words.
5. **Facilitator & Small Group Discussion (`reflect`)**:
   * 2–3 targeted questions for personal contemplation and group sharing.
6. **Posture & Practice (`practice`)**:
   * 2 concrete, actionable steps to live out during the week (e.g. `**Pray for Leaders**: Spend 3 minutes...`).

---

## Sample Plain-Text Template

```markdown
## Session 1: A Heart for All People

### 1. Scripture Text
**1 Timothy 2:1–4 (BSB)**

### 2. Context & Insight
Paul writes this letter to Timothy, who was leading the church in Ephesus—a bustling city under Roman imperial authority...

- **Key Word Study: "Intercessions" (*Enteuxis*)** (1 Timothy 2:1) — In the ancient world, enteuxis was a formal petition presented directly to a king on behalf of someone who could not speak for themselves...

### 3. Devotional Reflection: Widening the Circle of Grace
Prayer is the ultimate cure for self-centeredness. When our prayer lives shrink, they quickly become limited to our own comfort...

> “We pray because every seed needs spiritual covering.” — Marcus Yong

### 4. Personal Prayer
_Father in heaven, enlarge my heart today. Forgive me for when my prayers become narrow or guarded. Teach me to pray faithfully for all people—for our leaders, my neighbours, and my coworkers. In Jesus’ name, Amen._

### 5. Facilitator & Group Discussion
1. Who is one person in authority or in your daily circle you find difficult to pray for?
2. How does knowing you have direct royal access to God encourage you to advocate for others?

### 6. Posture & Practice
* **Pray for Leaders**: Spend 3 minutes praying for national, civic, and spiritual leaders.
* **Advocate in Secret**: Choose one difficult coworker or neighbor and silently pray God's grace over them this week.
```

---

## AI Prompt for Compiling JSON

Pastors and creators can copy and paste raw sermon transcripts, outlines, or study notes into ChatGPT, Claude, or Gemini along with this system prompt to get a valid plan JSON file:

````markdown
You are a structural data formatting assistant for the "EQUIP: Rooted and Formed" Bible Plan Reader app.
Convert the provided study outline into a strict JSON file matching the following schema.

Rules:
1. Ensure all scripture references generate valid Bible.com links (e.g., https://www.bible.com/bible/3034/1TI.2.1-4.BSB).
2. Format the closing quote in devotional content as a single line: `> “Quote text.” — Author`.
3. Keep the Personal Prayer in fluent, warm first-person English without Greek words.
4. Extract reflect questions as an array of strings.
5. Extract practice items as an array of strings formatted like `"**Action Title**: Description"`.

JSON Schema:
```json
{
  "id": "plan-slug",
  "title": "Series Title",
  "description": "Short summary",
  "type": "reading",
  "created": "YYYY-MM-DD",
  "items": [
    {
      "item": 1,
      "title": "Session Title",
      "passages": [
        {
          "reference": "1 Timothy 2:1-4",
          "url": "https://www.bible.com/bible/3034/1TI.2.1-4.BSB"
        }
      ],
      "devotional": {
        "author": "Reading Plan",
        "content": "### Context & Insight\n\n...\n\n### Title\n\n...\n\n> “...” — Author"
      },
      "prayers": [
        {
          "topic": "Personal Prayer",
          "description": "Prayer text..."
        }
      ],
      "reflect": [
        "Question 1",
        "Question 2"
      ],
      "practice": [
        "**Action 1**: Description",
        "**Action 2**: Description"
      ]
    }
  ]
}
```
````

---

## Adding Custom Plans to the App

1. Save your compiled plan JSON in `public/plans/[your-plan-id].json`.
2. Register your plan in `public/plans.json`:
   ```json
   {
     "id": "your-plan-id",
     "title": "Your Series Title",
     "description": "Your description",
     "type": "reading",
     "totalItems": 12,
     "url": "plans/your-plan-id.json",
     "creator": "Your Ministry",
     "version": "1.0",
     "created": "2026-08-24",
     "lastUpdated": "2026-08-24",
     "tags": ["Prayer", "Discipleship"],
     "featured": false
   }
   ```
3. Run `npm run build` to package for production deployment.
