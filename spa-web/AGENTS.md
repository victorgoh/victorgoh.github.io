# Workspace Rules — Antigravity Coding Assistant Guidelines

This file defines the architecture, design guidelines, and rules for the `spa-web` (Being With Jesus) project. Any Antigravity agent working on this workspace in the future **must** adhere strictly to these rules.

---

## 🛠️ Architecture Rules

1. **Strict Single-File Self-Contained Design**
   - The application **must** remain a single, self-contained HTML file (`being-with-jesus.html`).
   - All CSS styling, JavaScript logic, and graphic assets (like SVGs) **must** be embedded inline.
   - Do **not** split the styles into a separate `.css` file or scripts into a separate `.js` file, as the app is shared directly as a WhatsApp attachment and must run completely offline.
   - Do **not** import third-party CSS or JS libraries (e.g., Tailwind, jQuery, Bootstrap) via CDN. Only standard web APIs are permitted.

2. **Google Fonts Fallbacks**
   - Google Fonts (`Playfair Display` and `Inter`) are imported for online users, but all typography styles **must** define clear, readable system-level serif and sans-serif fallbacks (e.g., Georgia, -apple-system, sans-serif) to ensure premium styling works offline.

3. **Local Storage Persistence**
   - All interactive states (checkboxes, text inputs, theme settings, and font sizes) **must** auto-save instantly to `localStorage` so that refreshing or reopening the file resumes progress.

---

## 🎨 Design & Aesthetic Rules

1. **Quiet Meditative Aesthetic**
   - Maintain the premium, calming HSL-based dual-theme color palettes:
     - **Dark Mode (Default - Misty Forest)**: Deep slate green gradient background, translucent glassmorphic cards, sage and gold accents.
     - **Light Mode (Warm Stone)**: Warm cream backdrop, white cards with soft shadows, rich sage and ochre accents.
   - All modifications must preserve this visual hierarchy and feel premium, calming, and clean.

2. **No Checkbox Score Tracking / Grading**
   - Ticking checklist items serves strictly as a personal, meditative reflection aid. 
   - **Do not** add quantitative score counters (`X of Y checked`), progress bars, checklist tallies, or grade metrics to any section or summary panel.

3. **Senior-Friendly Font Scaling**
   - Text sizing accessibility is implemented by adjusting the root `html` font-size via the `data-size` attribute on the `<html>` element (`normal` / `large` / `xlarge`).
   - Any new text, card padding, or margin elements added to the stylesheet **must** use relative `rem` units (instead of `px`) so they scale proportionally when the user toggles text sizing.

---

## 📤 Sharing Rules

1. **WhatsApp Plain Text Format**
   - The WhatsApp export function (`copyWhatsAppText`) must copy a clean, markdown-friendly text summary containing reflections and selections with checkmarks (✓) and bullet points (•).
   - **Do not** output checklist scores, completion percentages, or total count tallies in the copied WhatsApp clipboard text.

2. **Print-to-PDF Formatting**
   - Maintain the `@media print` stylesheet rules, which hide all UI controls (buttons, navigation elements, theme toggles, toast notifications) and render the reflection worksheet as a high-contrast print page suitable for physical printing or saving as a PDF.
