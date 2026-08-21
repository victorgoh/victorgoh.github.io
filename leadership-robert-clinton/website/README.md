# How God Develops Leaders — Website

A static, data-driven course website for the six-session *How God Develops Leaders* curriculum.

## Editing the lesson content

The Markdown files in the parent course folder are the source of truth. Edit those files rather than editing the generated JSON.

When the site starts or builds, `scripts/sync-content.mjs` automatically:

1. Reads the Course Introduction, participant Sessions 1–6 and the separate Facilitator Guide.
2. Creates `public/data/course.json` for the website.
3. Copies the current PNG diagrams into `public/assets`.

To refresh the website data without starting the site:

```bash
npm run content:sync
```

## Local preview

Requires Node.js 22 or later.

```bash
npm install
npm run dev
```

Open the local address shown after the site starts.

## Production build

```bash
npm run build
```

The deployable static website is created in `dist/client`.

## GitHub Pages

The course repository includes `.github/workflows/deploy-pages.yml`, which builds and publishes the website whenever the `main` branch is updated.

In the GitHub repository settings, select **GitHub Actions** as the Pages source. The workflow automatically sets the repository-name base path required by project Pages sites.

For a custom domain hosted at the root, remove `NEXT_PUBLIC_BASE_PATH` from the workflow.

## Cloudflare Pages

Connect the repository to Cloudflare Pages and use:

- **Root directory:** `website`
- **Build command:** `npm run build`
- **Build output directory:** `dist/client`
- **Node.js version:** `22`

Leave `NEXT_PUBLIC_BASE_PATH` unset for a root-domain Cloudflare Pages deployment. Set `NEXT_PUBLIC_SITE_URL` to the final public origin, such as `https://course.example.org`, so social-sharing metadata uses an absolute image URL.

## Participant responses

Answers, fillable table entries and checkbox selections are stored only in the participant's browser using `localStorage`. They are not uploaded or shared. Saved fields use content-based identifiers and compatible answers automatically migrate from the original line-number format.

The sidebar **Settings** section can download or restore a private JSON backup. It also includes a guarded reset for cases where saved data becomes corrupted or no longer matches revised lesson content. The reset clears all `localStorage` for the current website origin but does not alter the course files or generated lesson data.

Each session integrates teaching with related reflection exercises, distinguishes **Core** and **Go Deeper** exercises, and gives every main section a session-based reference. The **In this session** menu and permanent heading links use stable anchors even when visible reference numbers are added. Whole-session completion appears both in the session and beside completed sessions in the grouped Course Contents. A **Continue where you left off** path returns participants to their latest section. Settings also provides larger text and relaxed line-spacing options.

The separate Facilitator Guide links directly to each participant session and to the main exercises used in the group meeting.

The **Print this document** menu can print without responses or include saved responses. Empty response fields and blank table cells become ruled writing areas on paper.

Previously visited course content and assets are cached for temporary offline access. Mobile navigation, dialogs, touch targets, keyboard focus, reduced-motion preferences and screen-reader announcements have dedicated accessibility support.
