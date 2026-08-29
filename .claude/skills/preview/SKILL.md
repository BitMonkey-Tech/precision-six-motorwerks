---
name: preview
description: Start a local static web server for the P6 Motorwerks site so routes and absolute-path links resolve. Use when the user wants to preview or view the site locally.
---

# Preview the site locally

The site is static files served from the repo root. Routes are directory-based and links use absolute paths, so it must be served from the web root (opening `index.html` as a file will not work).

## Steps

1. From the repo root, start the server in the background:

   ```
   python3 -m http.server 4173
   ```

2. Tell the user it is running at http://localhost:4173/ (home) and http://localhost:4173/contact/ (contact page).

3. Note that the contact form uses Netlify Forms and will not submit in local preview — that is expected.

4. To stop it, kill the background `http.server` process.

Port 4173 matches `.claude/launch.json`. If it is already in use, pick the next free port and tell the user which one.
