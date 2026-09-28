# Ember & Oak

## Deploy to Netlify

This project uses Netlify Functions and Netlify Blobs for the shared menu, site settings, page edits, and uploaded photos. The first menu request seeds the persistent store from `data/menu.json`; the existing `uploads/` photos are also included in the published site.

1. Put this entire project folder in a GitHub repository. Do not upload only `dist/`.
2. In Netlify, choose **Add new project → Import an existing project** and connect that repository.
3. Set the **Base directory** to `ember-and-oak-website` if this folder is nested in a repository. If this folder itself is the repository root, leave Base directory blank. The included `netlify.toml` sets the build command and publish folder (`dist`).
4. In **Project configuration → Environment variables**, set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` to private values of your own. Do not copy example text as a value, and never put the actual values in repository files.
5. If you change `ADMIN_EMAIL`, update the seeded admin account email in `js/seed-data.js` to match. The server validates the password from Netlify's environment; the password does not belong in the source code.
6. Deploy. The first visit to the menu initializes the Netlify Blobs menu store. Admin edits and photos are then shared with all browsers and persist across new deploys.

The site-wide blob store is named `ember-oak-uploads`. Menu records, uploaded photos, shared restaurant and brand settings, page text and imagery edits, and the display currency are stored there. The currency selector changes the symbol only; it does not convert menu prices. Static food photos already present in `uploads/` are copied to the site during each build.

Admin Settings includes a visual editor for public pages. Choose a page and click its text or an image area in the preview, then save the change to publish it for every visitor.

## Run locally with the Node server

Install Node.js 18 or newer, open a terminal in this folder, and run:

```sh
npm start
```

Then open <http://localhost:4173>. Shared menu, site settings, and uploaded photo data are saved in `data/menu.json`, `data/site-settings.json`, and `uploads/`.

## Preview Netlify locally

Install the Netlify CLI, configure the environment variables above in its local environment, then run:

```sh
npm run build
netlify dev
```

Netlify Blobs local development uses the local Netlify CLI runtime; use `netlify dev` for the serverless API paths.
