# Bible Reading Plan & Prayer Guide SPA

This project is a premium, lightweight, responsive Single Page Application (SPA) designed for churches and Christian ministries to easily create, host, and share structured Bible reading plans and prayer guides with their congregations.

The application operates entirely on the client side, pulling structured JSON data from a directory, caching it locally in the user's browser, and tracking their daily reading and prayer progress dynamically.

---

## App Features & Content Structure

To make this application as impactful and interactive as possible, it supports two types of plans: **Bible Reading Plans** and **Prayer Guides**. The content is organized day-by-day and includes:

1. **Scripture Passages (Mandatory)**: A list of Bible references to read. **Each day must contain at least 1 passage reference**. The app supports a hybrid rendering model:
   - **Inline Display**: If the creator includes the text of the scripture directly in the JSON file, the app renders it inline in a clean, highly readable layout.
   - **External Reader Link**: If the text is not included, the app renders a button that links directly to BibleGateway.
2. **Dynamic Bible Translation Overrides**: Users can select their preferred Bible version (e.g., NIV, ESV, NASB, CUV, AVB) in the Settings. When opening external links to BibleGateway, the app dynamically updates the version query parameter to match the user's choice.
3. **Multi-language App Internationalization (i18n)**: The application's UI is localized into **English**, **Chinese (Simplified/Traditional)**, and **Bahasa Melayu (BM)**. Adding future languages (like Spanish or Indonesian) is as simple as adding a translation dictionary file.
4. **Daily Devotional/Reflection**: Inspirational reading material written by pastors or ministry leaders, featuring clean typography for maximum legibility.
5. **Rich Devotional Media**: Each day can include one optional image, one video link (e.g., YouTube/Vimeo embed), and one audio link (e.g., podcast/sermonette mp3) to enrich the devotional.
6. **Prayer Topics** *(Primary focus for Prayer Guides)*: Specific prayer requests, targets (e.g., local community, world missions, family), and guided prayer text.
7. **Reflection Questions**: Questions designed to help readers contemplate the passages and devotional content personally or in a small group context.
8. **Action Steps (List)**: Practical tasks or challenges to help readers put their faith into action during the day.
9. **Quiet Time Timer**: An interactive, visual count-up/countdown timer to assist users in dedicated silent reflection or prayer.
10. **Progress Tracking**: Automatic progress bars, checkboxes for completed elements, and a calendar grid to navigate through days and see their history.

---

## Language & Translation Setup (i18n)

The app features a lightweight localization hook. The UI translations are separated into dictionary files:
- `src/locales/en.ts` (English)
- `src/locales/zh.ts` (Chinese - 中文)
- `src/locales/ms.ts` (Bahasa Melayu - BM)

Adding a new language (e.g., `es.ts` for Spanish or `id.ts` for Indonesian) is done by creating the file and adding it to the language manager in `src/utils/i18n.ts`.

---

## Ways to Make JSON Plan Creation Easier

Writing raw JSON files can be difficult for non-technical church staff. Here are several methods we recommend to simplify content creation:

### 1. The Visual Form Builder (Recommended)
We can build a hidden **"Creator Portal"** or admin page in the app (e.g., `/create.html` or accessible via a button in settings). This page displays a clean, user-friendly form where creators can:
- Fill out text fields for title, descriptions, etc.
- Add passages, prayer points, reflection questions, and action steps dynamically.
- Upload media links.
- View a live mobile-responsive preview of their day.
- Click a button to automatically download the compiled `.json` file, ready to be uploaded to their website.

### 2. Google Sheets to JSON Converter
Creators write their reading plans in a shared Google Sheet or Microsoft Excel sheet where:
- Columns are mapped to plan fields (e.g., `Day`, `Title`, `Passages`, `Devotional Content`, `Image URL`, `Video URL`, `Audio URL`, `Prayer Points`, etc.).
- Multiple rows represent consecutive days.
- A simple importer tool inside the app's admin page allows creators to upload the exported `.csv` or paste a Google Sheets share link, instantly converting it into the app's JSON format.

### 3. Dedicated AI Prompts (Self-Service)
Pastors can paste raw sermon series outlines or word documents directly into an LLM using our tailored **AI Prompt for Content Creators** (detailed below) to receive a perfect JSON file.

---

## JSON Data Formats

### 1. The Plan Registry: `plans.json`
Place this file in the `public/` directory of the web server. It acts as the catalog that the app fetches to list available plans. The registry can be structured either as a **flat array** (legacy) or a **branded object** (recommended) for custom church white-labeling:

#### A. Branded Registry Format (Recommended)
```json
{
  "organization": {
    "name": "Faith Community Church",
    "logoUrl": "https://faithchurch.org/assets/logo.png",
    "website": "https://faithchurch.org",
    "email": "info@faithchurch.org"
  },
  "plans": [
    {
      "id": "30-days-gospels",
      "title": "30 Days in the Gospels",
      "description": "Walk through the life, teachings, and resurrection of Jesus across the four gospels.",
      "type": "reading",
      "totalItems": 30,
      "url": "plans/30-days-gospels.json",
      "creator": "Faith Community Church",
      "version": "1.1",
      "iconUrl": "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=320&h=320&q=80"
    }
  ]
}
```

#### B. Flat Registry Format (Legacy)
```json
[
  {
    "id": "30-days-gospels",
    "title": "30 Days in the Gospels",
    "description": "Walk through the life, teachings, and resurrection of Jesus across the four gospels.",
    "type": "reading",
    "totalItems": 30,
    "url": "plans/30-days-gospels.json",
    "creator": "Faith Community Church",
    "version": "1.1"
  }
]
```

### 2. Plan Detail Structure: `plans/[plan-id].json`
Each plan has its own JSON file describing its metadata and an array of items.

```json
{
  "id": "30-days-gospels",
  "title": "30 Days in the Gospels",
  "type": "reading",
  "items": [
    {
      "item": 1,
      "title": "The Word Became Flesh",
      "passages": [
        {
          "reference": "John 1:1-4",
          "url": "https://www.biblegateway.com/passage/?search=John+1%3A1-4&version=NIV",
          "text": "[Optional] In the beginning was the Word, and the Word was with God, and the Word was God..."
        }
      ],
      "devotional": {
        "author": "Pastor Marcus",
        "content": "Before time began, Jesus existed. He is the true light that enters the darkness..."
      },
      "media": {
        "image": {
          "url": "https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=800&q=80",
          "caption": "The Light shines in the darkness."
        },
        "video": {
          "url": "https://www.youtube.com/watch?v=G-2e9mMf7E8",
          "title": "Bible Project: John 1 Overview"
        },
        "audio": {
          "url": "https://church-sermons.s3.amazonaws.com/devotionals/john-1.mp3",
          "title": "John 1 Devotional Audio Podcast"
        }
      },
      "prayers": [
        {
          "topic": "Seeking Truth",
          "description": "Pray for a heart that is receptive to the light of Christ today."
        }
      ],
      "reflect": [
        "What does it mean for Jesus to be the 'Word'?",
        "How can you let His light shine in your circle of influence today?"
      ],
      "practice": [
        "Reach out to someone who is going through a hard time and share a word of encouragement.",
        "Write down John 1:1 on a sticky note and place it where you will see it throughout the day."
      ]
    }
  ]
}
```

---

## AI Prompt for Content Creators

Churches can copy the prompt below and paste it into any modern LLM (e.g., ChatGPT, Claude, Gemini) along with a text document containing their devotional or prayer guide to output the correct format.

```text
You are a structural data formatting assistant. Your task is to compile plain-text devotional or prayer guides into a valid, strict JSON file compatible with the Bible Reading & Prayer Guide App.

I will provide you with a text document representing the plan, including the title, description, and day-by-day readings.

### JSON SCHEMA
Translate the input text into a single JSON object matching this structure:

{
  "id": "[kebab-case-plan-unique-id]",
  "title": "[Title of the Plan]",
  "type": "reading" | "prayer",
  "iconUrl": "[OPTIONAL: URL to 1:1 listing icon image or omit if not provided]",
  "items": [
    {
      "item": 1,
      "title": "[Title of the Session]",
      "passages": [
        {
          "reference": "[Book Chapter:Verse-Verse]",
          "url": "https://www.biblegateway.com/passage/?search=[URL_ENCODED_REFERENCE]&version=NIV",
          "text": "[OPTIONAL: Include the full scripture text block if provided, otherwise omit]"
        }
      ],
      "devotional": {
        "author": "[Author Name - omit if unknown/not specified]",
        "content": "[Full paragraph text of the devotional. Use normal paragraph spacing.]"
      },
      "media": {
        "image": {
          "url": "[URL to image or omit]",
          "caption": "[Optional caption for the image]"
        },
        "video": {
          "url": "[URL to Youtube/Vimeo video or omit]",
          "title": "[Title of the video link]"
        },
        "audio": {
          "url": "[URL to MP3/podcast audio file or omit]",
          "title": "[Title of the audio track]"
        }
      },
      "prayers": [
        {
          "topic": "[Topic of the prayer, e.g., Missions, Community, Gratitude]",
          "description": "[Specific guidance or written prayer text]"
        }
      ],
      "reflect": [
        "[Reflection question 1?]",
        "[Reflection question 2?]"
      ],
      "practice": [
        "[Practical application challenge 1]",
        "[Practical application challenge 2]"
      ]
    }
  ]
}

### Formatting & Schema Rules:
1. Every day MUST have at least 1 scripture passage reference populated in the "passages" array. Empty arrays are not allowed. If the source text is a prayer guide and does not specify a passage reference, select a relevant default scripture or request the user to provide one.
2. Make sure to generate standard URLs for BibleGateway. Replace spaces in the reference with '+' and colons with '%3A' (e.g., "John 3:16" becomes "https://www.biblegateway.com/passage/?search=John+3%3A16&version=NIV"). Use the NIV version by default unless another translation is specified in the text.
3. If the text of the Bible passage is included in the source document, extract it exactly and populate the "text" property for that passage. This allows the app to render the Bible text inline so users don't have to leave the app. If the text is not in the source document, do not include the "text" property in the JSON.
4. If no media is provided, please still output the "media" object with empty strings for the "url" and "title" keys, rather than omitting it. Each day must support exactly one "image", one "video", and one "audio".
5. Ensure "actionSteps" is always an array of strings, even if there is only one step.
6. Ensure every day has a "day" number, starting at 1 and progressing sequentially.
7. Keep the JSON strictly valid. Do not wrap the JSON in Markdown formatting other than the standard code block. Do not provide conversational responses before or after the JSON block. Output ONLY the JSON block.

Here is the plain-text plan to format:
=========================================
[PASTE YOUR PLAIN TEXT CONTENT HERE]
=========================================
```

> [!TIP]
> For complete, copy-pasteable plain-text templates that you can customize before sending to the AI, refer to the [CREATORS_GUIDE.md](file:///Users/victorgoh/Projects/bible-plan-reader/CREATORS_GUIDE.md) file in this repository.

---

## 🔗 Custom URL Sharing & Link Parameters

Churches can distribute the web reader with query parameters in the URL to automatically override settings for their users:

1. **Load Custom Catalog (`?repo=[URL]`)**:
   Points the app to a custom `plans.json` file hosted anywhere on the web. The app will fetch that catalog, apply any embedded organization branding styling, and save the custom repository source in the user's browser settings.
   ```text
   https://bible-reader.pages.dev/?repo=https://mychurch.org/bible-app/plans.json
   ```

2. **Launch Plan Directly (`?plan=[URL]`)**:
   Starts a specific reading plan automatically on Day 1. You can optionally couple this with `&start=YYYY-MM-DD` to anchor the calendar.
   ```text
   https://bible-reader.pages.dev/?plan=https://mychurch.org/bible-app/plans/john-study.json&start=2026-12-01
   ```

*Note: Custom hosted JSON endpoints must enable CORS (Cross-Origin Resource Sharing) with the response header `Access-Control-Allow-Origin: *` to load correctly in user web browsers. GitHub Pages and Cloudflare Pages enable this automatically.*

