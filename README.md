# LawAssist AI

React + Vite app: AI legal assistant chat, document generator, lawyer marketplace, matters tracking, and compliance dashboard.

## Deploy to Netlify (recommended: drag-and-drop)

1. Unzip this project.
2. In a terminal, inside the unzipped `lawassist-ai` folder, run:
   ```
   npm install
   npm run build
   ```
3. Go to https://app.netlify.com/drop and drag the folder in AS-IS (the whole `lawassist-ai` folder, not just `dist`) if you're using Netlify's "Import from folder" via CLI — or for the simplest path, use "Add new site" → "Deploy manually" and drag in the `dist` folder for a static-only deploy.

### For the Assistant tab to actually work (recommended path — full site incl. functions)

Drag-and-drop of just the `dist` folder does NOT include the serverless function that powers the Assistant chat. To get everything working, connect this project to Netlify via Git instead:

1. Push this unzipped folder to a new GitHub repository.
2. In Netlify: "Add new site" → "Import an existing project" → connect the repo.
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Netlify will auto-detect the `netlify/functions` folder and deploy the function alongside your site.
3. Once deployed, go to **Site configuration → Environment variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your own Anthropic API key (get one at console.anthropic.com)
4. Trigger a redeploy (Deploys → Trigger deploy) so the function picks up the new environment variable.

Your live link (e.g. `yoursite.netlify.app`) will now have a fully working Assistant tab — the API key stays server-side in the function and never reaches the browser.

## What works without any setup

Documents, Lawyers, Matters, and Compliance are fully client-side — they work immediately on any deploy, no API key needed.

## Local development

```
npm install
npm run dev
```

To test the Assistant locally with functions, use the Netlify CLI instead of plain Vite:
```
npm install -g netlify-cli
netlify dev
```
