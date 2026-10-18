# The Midnight Workshop

Siddharth’s interactive portfolio, built with HTML, CSS, JavaScript, original SVG illustrations, and his two original Connect X Python agents.

## Run locally

From this directory:

```sh
npm run dev
```

Open http://127.0.0.1:4173. Python 3 is required for the local server. There are no npm dependencies or build steps. Opening `index.html` directly through `file://` does not support module scripts or Web Workers; use the server.

## What’s included

- An original illustrated workshop with project, notebook, and game hotspots.
- A dimmable room and optional, locally generated rain audio. Audio is off by default.
- Featured work: Learn Up Smart Note and Android app (developer), botas, and The Full Picture (game developer).
- All 12 supplied public repositories, including 11 in the expandable experiments drawer and botas as a featured project.
- Connect X with targets of 3, 4, or 5 on a 7 × 6 board, selectable first player, rematches, win highlighting, and scores for the current visit.
- Best Bot runs the unmodified `submission.py`; Worst Bot runs the unmodified `opponent_win.py`.
- Locally served Pyodide 0.27.7 in a Web Worker. The approximately 14 MB runtime loads only when the visitor starts a game. No game data is sent to a server.
- Locally served fonts, keyboard-accessible controls, reduced-motion support, and responsive layouts.

Best Bot uses the embedded WeakC4 first-player policy on standard Connect 4 and bounded search in other positions. It is not advertised as universally unbeatable. Worst Bot deliberately prefers continuations that help its opponent; it cannot guarantee a human win.

## Content and artwork

Edit `dist/index.html` for biography, featured work, and outgoing links. Edit the repository list in `dist/app.js`. No email address, résumé, employment history, or specific team contributions beyond the user-confirmed roles have been invented. The project graphics are original illustrative compositions, not product screenshots or game assets.

The artwork source is `illustrate.py`; run `python3 illustrate.py` to regenerate `dist/assets/workshop.svg` and `dist/assets/botas.svg`.

Verified project sources:

- https://learnupsmartnote.com/
- https://play.google.com/store/apps/details?id=com.nplus.learnup&hl=en_AU
- https://100devs.itch.io/the-full-picture
- https://github.com/hiooooopji

## Checks

```sh
npm run check
npm test
```

Optional browser integration checks require Selenium, `/usr/bin/chromium`, `/usr/bin/chromedriver`, and the local server:

```sh
python3 tests/browser_check.py
```

Browser screenshots and results are written to `/tmp/midnight-workshop-qa/`.

## Hosting

This is a static site. Serve `dist/` as the document root with support for JavaScript modules, workers, and `application/wasm` for `.wasm` files. The Sites identity is preserved in `.openai/hosting.json`. No secrets or environment variables are required. All assets, bot code, fonts, and the Python runtime are bundled locally.

## Third-party notices

- `dist/agents/submission.py` includes 2swap/WeakC4 and contributors’ GPL-3.0-only strategy, as documented in its original source header. Full license: `dist/agents/WEAKC4-LICENSE.txt`. Source: https://github.com/2swap/WeakC4.
- Pyodide 0.27.7: `dist/vendor/pyodide/LICENSE`, including its runtime component notices.
- Playfair Display and DM Sans: SIL Open Font License files in `dist/assets/`.

Original agent source files are available for download in the portfolio’s game section.
