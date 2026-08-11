# Walkthrough: Bible Reading & Daily Prayer SPA Beta 1.0 (Minimalist & Timer Toggle Update)

We have successfully initialized, built, and compiled the first beta test version of the Single Page Application (SPA) for the Bible Reading Plan & Daily Prayer Guide.

---

## 🚀 Key Beta 1.0 Features

### 1. 🧘 Minimalist & Unified Single-Column Design
To keep the application focused on personal spiritual growth and contemplation (rather than feeling like gamified work), we stripped out pressured tracking metrics and interactive checkboxes, and streamlined the layout:
- **No Checklists or Tapping Noise**: Completely removed interactive checklist checkboxes from scripture lists, action steps, and prayer lists. Content is now formatted as clean, flowing editorial lists and text blocks, removing the pressure of checking off tasks.
- **Single Flowing Content Page**: Removed the tab selectors entirely. Scripture readings, devotional text, reflection questions, action steps, and prayers are now rendered as a single cohesive column that flows naturally from start to end.
- **Days Navigator at the End of Content**: Removed the sidebar completely. The days grid selector (`🗓️ Jump to Day`) is now rendered cleanly at the end of the content column, allowing the user to read through the day's text before navigating to other days.
- **Single Bottom-Docked Completion Button**: Day completion tracking is now handled by a single, soft, non-intrusive "Mark as Read" button (fully localized under `dayView.markComplete`) at the very bottom of the daily reading view.
- **Soothing Muted Color Palette**: Replaced the loud, highly saturated purple and orange brand colors with a calming, muted Sage Green (`hsl(158, 23%, 38%)`) and warm sand gold (`hsl(35, 30%, 55%)`) color scheme that reduces visual fatigue and enhances readability.
- **No More Gamified Streaks**: Removed the streak counters, fire icons (`🔥`), and consecutive day counting systems entirely.

### 2. ⛪ Collapsible Branded Header & Banner
To maximize screen space for scripture and devotional texts:
- **Single-Row Inline Header**: The header is aligned horizontally as a single row even on small mobile screens. All control triggers—Theme (`🌙`/`☀️`), Browse Plans (`📋`), and Settings (`⚙️`)—are consolidated into compact circular icon buttons next to the branding.
- **Collapsed Header on Startup**: By default, the header renders in a compact collapsed state showing just the church logo next to the inline controls.
- **Interactive Branding Details**: Tapping the brand header toggles between the collapsed and expanded states, revealing the full church subtitle and expanding the active plan title banner card with rich Unsplash background imagery.

### 3. ⏱️ Toggleable Quiet Time Timer at the Bottom
Instead of forcing a large timer in the reading viewport:
- **Bottom Toggle Button**: The timer toggle button is located at the very bottom of the page below the completion buttons.
- **Inline Rendering**: Toggling the timer mounts the countdown widget inline directly below the toggle button, keeping the reading flow distraction-free.

### 4. 🗓️ Vertical Session Selector List (With Titles & Completion Status)
To make session navigation clear, premium, and informative:
- **Spiritually Aligned Headings**: Uses **`Session X`** for all reading plans and prayer guides, completely removing the total count to emphasize experiencing God rather than finishing content.
- **Toggled Dropdown Popover**: Tapping the `Session X ▾` subtitle in the header opens an interactive session selector popover. It uses absolute positioning relative to `.item-view-header` to stay bounded by the card's inner width, avoiding page overflow.
- **Vertical Scrollable list of Session Titles**: Replaced the horizontal scrubber slider and number chips with a clean, scrollable vertical menu. Each row displays the session number (e.g. `Session 8`) and the detailed session title (e.g. `The Lord's Prayer`).
- **Completion Checkmarks**: Displays a clear status icon next to each title—a green circle with a checkmark (`✓`) for completed sessions, and an empty circle for uncompleted sessions.
- **Auto-Scrolling Active Session**: When opening the popover, the list dynamically auto-scrolls to center the active session in the menu viewport.
- **Visual Reference**:
  ![Session Selector Open](/Users/victorgoh/.gemini/antigravity-ide/brain/4ae16074-1385-4627-9dc6-e9ccf8850d25/session_popover_open_1784395113524.png)
  ![Session 9 Completed Popover](/Users/victorgoh/.gemini/antigravity-ide/brain/4ae16074-1385-4627-9dc6-e9ccf8850d25/session_9_completed_popover_1784395208543.png)


### 5. 📖 Inline Scripture Fetcher (No More BibleGateway)
To keep users fully centered inside the reading shell:
- **Tapped Expansion**: Clicking a scripture reference (e.g. `Colossians 4:2` or `John 1:1-4`) immediately toggles the scripture text inline.
- **Offline / Local Text Fallback**: If the plan Day JSON includes pre-defined scripture text, the app renders it instantly. If the plan Day JSON only provides a reference, the app dynamically fetches the text on demand from the public `bible-api.com` service with a smooth loading indicator.
- **External Redirection Removed**: Completely removed BibleGateway integrations, external linking buttons, and outbound redirection triggers.

### 6. ⛪ Church-Level App Customizations
Churches can white-label the SPA application dynamically:
- **Branded Registry Schema**: The root `plans.json` can be configured as a structured object containing an `"organization"` block specifying the church's `name`, `logoUrl`, `website`, and contact email.
- **Branded Landing Section**: The Welcome/Launch page automatically displays the church logo, welcome notes, and a direct link to the church website.

### 7. 🔗 Link Sharing & URL Parameters
Churches can share custom links that configure the app automatically, and users can share specific sessions with others:
- **Load Custom Catalog (`?repo=`)**: Appending `?repo=https://mychurch.org/plans.json` switches the app to use the custom catalog directory, loading their custom branding and saving the repository URL in the user's browser settings for future visits.
- **Direct Plan Launcher (`?plan=`)**: Appending `?plan=https://mychurch.org/plans/devotional.json` loads and starts a specific reading plan automatically, with optional date configuration using `&start=YYYY-MM-DD`.
- **Direct Session Sharing (`?session=`)**: Appending `?session=X` overrides default date tracking/progress and focuses the app instantly on Session X. It is automatically swept from the address bar after loading to keep navigation clean.
- **Header Share Trigger**: Tapping the `🔗 Share Session` button next to the Session trigger in the header copies a universal dynamic link to the clipboard and gives instant visual feedback ("✅ Link Copied!").

### 8. 📁 Nested Plan Directories & Cycle Checker
To support scaling to hundreds of reading plans, the registry now supports nested lists:
- **Sub-Registry Categories**: Plan lists (`plans.json`) can link to other sub-lists (using `type: "category"` and a `url` pointing to another list JSON). The modal renders breadcrumbs (`All Plans › Category Name`) at the top, allowing easy pop-back navigation.
- **Mathematical Cycle Detection**: If a nested category attempts to point to a URL path already present in the active navigation history, the app intercepts it, displays a localized warning alert, and blocks navigation to prevent infinite recursion loop crashes.

### 9. 🖼️ Custom Banners & Listing Icons
Churches can brand their reading plans and prayer guides with custom visual elements:
- **Plan Icons**: Displays a custom square image (320 x 320 px) in the plan list. If none is provided, the app generates a fallback circular icon displaying a large emoji corresponding to the plan type (`📖` for Bible reading, `🙏` for prayer guides).
- **Plan Banners**: Displays a custom banner image (1440 x 810 px) behind the active plan progress headers. If no banner is provided, it generates a default word-only banner styling that renders the plan title overlaying a premium diagonal linear gradient.

### 10. 🏷️ Decoupled Content Schema (`items` & `item`)
Decoupled the database schema from chronological calendar days to support general spiritual progression models (e.g. Sessions, Focuses):
- **General Elements**: Renamed `"days"` array to `"items"`, `"day"` object keys to `"item"`, and registry `"durationDays"` to `"totalItems"`.
- **TypeScript Alignment**: Updated typescript interface definitions (`ItemConfig`, `Plan`, `PlanListItem`) to align compile-time checks.
- **Creator Tooling**: Rewrote dataset generation scripts and documentation (`README.md`, `CREATORS_GUIDE.md`) to utilize the new non-time-pressured nomenclature.
- **Self-Healing State Initializer**: Added a `migratePlanSchema` utility that intercepts and maps legacy cached plans (with `"days"`) or external plan URLs into the new schema structure inline, ensuring returning users do not experience blank screen errors.

---

## 🔬 Compilation & Build Status
The application compiled successfully using Vite's production bundler (`npm run build`) with **zero warnings or errors**:

```text
vite v8.1.5 building client environment for production...
transforming...✓ 22 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-BKqVzy1n.css   21.13 kB │ gzip:  4.41 kB
dist/assets/index-Clh03wO7.js   222.09 kB │ gzip: 69.63 kB
✓ built in 69ms
```

---

## 🚀 How to Manually Run & Test the Beta
You can run the application locally on your computer to test the interactive flows:

1. **Start the Dev Server**:
   ```bash
   npm run dev
   ```
2. **Access the App**:
   Navigate to `http://localhost:5173/` and select a plan.
3. **Verify the Minimalist Header**:
   Observe the active plan header. The progress percentage metrics, fill bar, and daily streak cards are completely removed.
4. **Test the Toggle Timer**:
   * Click the stopwatch icon (`⏱️`) in the header next to the theme switcher.
   * Observe the circular Timer widget sliding into view inside the sidebar card right below the day navigator.
   * Toggle it off to hide it again. Go to the **Prayers** tab and verify that the default timer has been removed from the bottom layout.
5. **Verify the i18n Nomenclature**:
   * Swap between English, Chinese, and Malay translations.
   * Confirm that all labels (scrub labels, titles, section headers) render "Session X" and "Reset Progress" instead of days/streaks.
