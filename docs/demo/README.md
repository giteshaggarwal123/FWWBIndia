# Portal Demo – HTML Presentation

A single-file HTML “slide deck” to demo the portal (web + mobile) with a logical flow, then switch to a live walkthrough.

## How to use

1. **Open the presentation**  
   Open `docs/demo/index.html` in a browser (double-click or `file:///.../docs/demo/index.html`).

2. **Navigate**
   - **Previous / Next** buttons at the bottom.
   - **Keyboard**: ← and → to change slides.
   - **Dots**: click a dot to jump to that slide.

3. **Flow**
   - Slides 1–2: Title and agenda.
   - Slides 3–7: Platform overview, web (login, dashboard, modules, roles).
   - Slides 8–9: Mobile (tabs, key features).
   - Slide 10: Wrap-up and “next: live walkthrough”.

4. **Screenshots**  
   Place images in `screenshots/` as described in `screenshots/README.md`. If a screenshot is missing, a placeholder is shown. Adding the image with the expected filename refreshes the slide.

## Optional: capture web screenshots

With the **web app running** (e.g. `npm run dev` in `client/`):

```bash
cd docs/demo
npm install puppeteer   # once
node capture-web-screenshots.js
```

Set `BASE_URL`, `LOGIN_EMAIL`, and `LOGIN_PASSWORD` at the top of `capture-web-screenshots.js` or via environment variables. Screenshots are written to `screenshots/web/`.

Mobile screenshots are taken manually from the emulator or device and saved to `screenshots/mobile/`.
