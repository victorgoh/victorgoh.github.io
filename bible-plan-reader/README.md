# EQUIP: Rooted and Formed

A premium, lightweight, responsive Single Page Application (SPA) designed for churches, discipleship groups, and Christian ministries to host, explore, and share structured Bible reading plans, prayer guides, and leadership formation journeys.

The application operates 100% on the client side, fetching structured JSON curriculum from a configurable repository, caching content offline in the browser (`localStorage`), tracking reading progress, and providing rich tools for personal quiet time and small group discussions.

---

## Key Pillars & Core Purpose

* **Rooted in Scripture**: Daily readings with inline scripture text (Berean Standard Bible - BSB) and deep-linking to **Bible.com (YouVersion)** across 10 major English translations.
* **Formed in Character**: In-depth devotional reflections, historical/cultural context, word studies, and dedicated personal prayers.
* **Equipped for Community**: Facilitator discussion questions, practical action points, and 1-click WhatsApp sharing to foster growth in small groups and ministry teams.

---

## Active Curriculum & Reading Plans

The repository comes pre-loaded with curated discipleship curriculum:

1. **Apostolic Prayers: Cultivating Wisdom, Power, and Love** (12 Sessions)
   - A deep devotional study on prayer, spiritual formation, and kingdom growth drawn from the transformative prayers of the Apostle Paul.
2. **Lessons in Leadership: Biblical Wisdom from God's Servants** (6 Sessions)
   - A study on character, calling, and resilience drawn from the lives, struggles, and triumphs of biblical figures.
3. **Growing Leaders: 30-Lesson Leadership Journey** (30 Lessons)
   - A 30-lesson leadership journey across 6 foundational modules exploring calling, integrity, character in the secret place, gifts, and intimacy with God.
4. **With Christ in the School of Prayer** (31 Days)
   - Andrew Murray's classic devotional exploring the secrets, authority, and ministry of prevailing prayer.
5. **Archived Plans** (Category Sub-Folder)
   - Contains past church-wide campaigns (e.g. *2026 14-Day Fast & Pray Prayer Guide*).

---

## App Features & Content Structure

Each daily lesson/session in a plan contains up to 6 modular sections:

1. **Scripture Passages (Mandatory)**: 
   - **Inline Display**: Verse text rendered directly within the app card for distraction-free reading.
   - **External Bible.com Link**: Directly opens the specific chapter/verse on Bible.com in the user's preferred translation (`BSB`, `ESV`, `CSB`, `NIV`, `NLT`, `NKJV`, `NASB2020`, `MSG`, `NRSVUE`, `AMP`).
2. **Context & Devotional Reflection**:
   - Historical & cultural background, original language insights (lay-friendly transliterated word studies), and practical life application.
3. **Personal Prayer (`prayers`)**:
   - A dedicated scriptural prayer card formatted in the first person for personal quiet time.
4. **Facilitator & Small Group Discussion (`reflect`)**:
   - Targeted discussion questions designed for community sharing and group application.
5. **Posture & Practice (`practice`)**:
   - Tangible action steps to live out the truth during the week.
6. **Community Sharing & WhatsApp Integration**:
   - 1-click **WhatsApp button** formatting a clean summary, passage references, and direct deep-link to the session for group chats.
   - Native Web Share API support on mobile and 1-click clipboard copy on desktop.
7. **Session Navigation**:
   - Symmetrical full-width top and bottom drop-down popovers with live scroll-to-active session tracking.
   - Sequential Previous / Next controls.
8. **Settings & Customization**:
   - Dark / Light mode toggle.
   - Adjustable font sizing (`small`, `medium`, `large`, `xl`).
   - Advanced Settings: Bible.com translation selector, manual cache sync / revalidation, restart plan progress, and whole-app reset.

---

## JSON Data Formats

### 1. The Plan Catalog: `plans.json`
Located in `public/plans.json` (and mirrored to `dist/plans.json`). It acts as the root registry that the application loads:

```json
{
  "customization": {
    "name": "EQUIP: Rooted and Formed",
    "website": "https://yourchurch.org",
    "email": "info@yourchurch.org"
  },
  "plans": [
    {
      "id": "prayers-of-paul",
      "title": "Apostolic Prayers: Cultivating Wisdom, Power, and Love",
      "description": "A 12-session devotional study on prayer, spiritual formation, and kingdom growth drawn from the transformative prayers of Paul.",
      "type": "reading",
      "totalItems": 12,
      "url": "plans/prayers-of-paul.json",
      "creator": "Prayers of Paul",
      "version": "1.0",
      "created": "2026-08-24",
      "lastUpdated": "2026-08-24",
      "tags": ["Prayer", "Spiritual Formation", "Discipleship"],
      "featured": true
    },
    {
      "id": "archived-plans",
      "title": "Archived Plans",
      "description": "Archived reading and prayer plans from past church campaigns.",
      "type": "category",
      "url": "plans/archived/plans.json",
      "tags": ["Archived"]
    }
  ]
}
```

### 2. Plan Curriculum Format: `[plan-id].json`
Located in `public/plans/[plan-id].json`. Each file contains the full structured curriculum:

```json
{
  "id": "prayers-of-paul",
  "title": "Apostolic Prayers: Cultivating Wisdom, Power, and Love",
  "description": "A 12-session devotional study...",
  "type": "reading",
  "created": "2026-08-24",
  "items": [
    {
      "item": 1,
      "title": "A Heart for All People",
      "passages": [
        {
          "reference": "1 Timothy 2:1-4",
          "url": "https://www.bible.com/bible/3034/1TI.2.1-4.BSB"
        }
      ],
      "devotional": {
        "author": "Reading Plan",
        "content": "### Context & Insight\n\nPaul writes to Timothy in Ephesus...\n\n### Widening the Circle of Grace\n\nPrayer is the ultimate cure for self-centeredness...\n\n> “We pray because every seed needs spiritual covering.” — Marcus Yong"
      },
      "prayers": [
        {
          "topic": "Personal Prayer",
          "description": "Father in heaven, enlarge my heart today..."
        }
      ],
      "reflect": [
        "Who is one person in authority or in your daily life you find difficult to pray for?",
        "How does knowing you have direct access to God encourage you to intercede for others?"
      ],
      "practice": [
        "**Pray for Leaders**: Spend 3 minutes praying for national and local leaders.",
        "**Advocate in Secret**: Choose one difficult colleague or neighbor and silently pray blessing over them."
      ]
    }
  ]
}
```

---

## Development & Build

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Commands
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle (TypeScript check & Vite build)
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment & Hosting

The compiled output in `dist/` is completely static and can be deployed directly to:
* **GitHub Pages** (via GitHub Actions)
* **Cloudflare Pages**
* **Firebase Hosting** / **Vercel** / **Netlify** / **AWS S3**

For detailed deployment instructions, see [HOSTING.md](HOSTING.md).
For guide on writing and converting custom curriculum, see [CREATORS_GUIDE.md](CREATORS_GUIDE.md).
