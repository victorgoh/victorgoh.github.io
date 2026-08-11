# Beginner's Hosting Guide

Since this app is a **static single-page application**, it does not require a database server or custom backend hosting. All files (HTML, CSS, JavaScript, and JSON plans) can be hosted on free/low-cost static hosting platforms. 

This guide details three popular options: **GitHub Pages**, **Cloudflare Pages**, and **Firebase Hosting**.

---

## 1. Option A: GitHub Pages (Recommended - 100% Free)
GitHub Pages is perfect if your project is already stored on GitHub. It builds your React/Vite app automatically whenever you update the repository.

### Step 1: Push Your Code to GitHub
1. Create a repository on [GitHub](https://github.com) (e.g., `bible-reading-app`).
2. Follow the instructions on GitHub to push your local workspace to this repository.

### Step 2: Configure GitHub Actions for Automatic Deployment
Create a new file in your project under `.github/workflows/deploy.yml` with the following content. This script compiles and publishes your app automatically:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main # Or your default branch

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build App
        run: npm run build

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Enable Pages in GitHub Settings
1. Go to your repository on GitHub.
2. Click **Settings** (the gear icon on the top tab).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** -> **Source**, select **GitHub Actions** from the dropdown menu.
5. Once your next commit is pushed (or you run the workflow manually), your site will be live at `https://<username>.github.io/<repo-name>/`.

> [!NOTE]
> If hosting on a subpath (e.g., `https://<username>.github.io/<repo-name>/`), make sure to configure the `base` option in your `vite.config.ts` to `/<repo-name>/` so assets load correctly.

---

## 2. Option B: Cloudflare Pages (Unmatched Speed & Generous Free Tier)
Cloudflare Pages connects directly to GitHub or GitLab, compiling and hosting your app on Cloudflare's global edge network.

### Step 1: Sign Up & Connect
1. Create a free account on [Cloudflare Pages](https://pages.cloudflare.com/).
2. In the dashboard, click **Create a project** -> **Connect to Git**.
3. Authenticate with GitHub and select your repository.

### Step 2: Configure Build Settings
During the setup wizard, configure the build parameters:
- **Framework preset**: `Vite` (if using React/Vite) or `Create React App`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty or default)

### Step 3: Deploy
1. Click **Save and Deploy**.
2. Cloudflare will automatically build and publish your app. It will provide a free `.pages.dev` subdomain (e.g., `bible-reading.pages.dev`).
3. You can also bind your church's custom domain (e.g., `reading.yourchurch.com`) for free in the **Custom domains** tab of your project.

---

## 3. Option C: Firebase Hosting (Easy Setup & Part of the Google Cloud Ecosystem)
Firebase Hosting is extremely reliable and lets you manage deployment from your terminal.

### Step 1: Install Firebase CLI
Install the Firebase command-line interface on your computer:
```bash
npm install -g firebase-tools
```

### Step 2: Log In and Initialize
1. Run the login command and follow the browser instructions:
   ```bash
   firebase login
   ```
2. Navigate to your project directory and initialize Firebase:
   ```bash
   firebase init hosting
   ```
3. Complete the prompt answers:
   - **Choose/Create Project**: Select or create a Firebase project for your church.
   - **What do you want to use as your public directory?**: Type `dist` (this is where Vite builds compiled files).
   - **Configure as a single-page app (rewrite all urls to /index.html)?**: Select `Yes`.
   - **Set up automatic builds and deploys with GitHub?**: Select `No` (or `Yes` if you want automatic GitHub deployments).

### Step 3: Build and Deploy
Every time you want to deploy updates to your site:
1. Build the production files:
   ```bash
   npm run build
   ```
2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```
3. Your site will be live at `https://<your-project-id>.web.app`.

---

## How to Add or Update Reading Plans
Once the website is hosted, you do not need to re-code the application to change your congregation's reading plans. To add or update plans:

1. **Format Content**: Use the AI prompt (in [README.md](file:///Users/victorgoh/Projects/bible-plan-reader/README.md)) to turn your devotional text into a plan JSON file (e.g., `advent-prayer.json`).
2. **Add to Code**: Put this JSON file in the `public/plans/` folder.
3. **Register the Plan**: Open `public/plans.json` and add an entry pointing to your new file (specifying its URL, title, description, and creator).
4. **Push/Deploy**: Push your changes to GitHub or run your deploy command. The app will automatically fetch the new list and plans for users!
