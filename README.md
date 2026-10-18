# The Midnight Workshop

Siddharth’s standalone Node.js portfolio, built with HTML, CSS, JavaScript, original SVG illustrations, and his two original Connect X Python agents.

[Visit the portfolio](https://hiooooopji.github.io/portfolio/)

## Run locally

From the repository directory:

```sh
npm run dev
```

Open http://localhost:4173. Node.js 20 or newer is required. There are no npm dependencies, installation steps, or builds. The Node server serves the website and bundled browser Python runtime; Python does not need to be installed to use the portfolio or play either bot. Opening `index.html` directly through `file://` does not support module scripts or Web Workers; use the server.

Edit files in `dist/` and refresh the browser to see changes. Stop the server with Ctrl+C. Use `npm run dev -- --port 3000` to select another port.

## What’s included

- An original illustrated workshop with project, notebook, and game hotspots.
- A real Three.js room behind **Come on in**, with drag-to-orbit navigation, clickable 3D objects, and animated camera moves. Its dependencies are served locally and load only when entering the room.
- A project browser attached to the monitor’s 3D screen, with individual project tabs and a repository drawer.
- A physical notebook with turnable pages and a drawing canvas. Doodles stay in this browser’s local storage and can be cleared.
- A modeled Connect X board with real holes, animated pieces, and clickable columns, driven by the same original Python agents and shared game state as the page.
- A dimmable room and optional original ambient music, “After Hours”: slow, soft keys over warm chords, with gentle fades and no percussion. Generated locally with Web Audio in `dist/music.js`; off by default and paused when the tab is hidden.
- Featured work: Learn Up Smart Note and Android app (developer), botas, The Full Picture (game developer), and Connect X.
- Expandable build stories for botas and Connect X on the page and the 3D monitor. The game links to its story, and the Best Bot challenge shortcut selects Connect 4 with the bot first.
- All 12 supplied public repositories, including 11 in the expandable experiments drawer and botas as a featured project.
- Connect X with targets of 3, 4, or 5 on a 7 × 6 board, selectable first player, rematches, win highlighting, and scores for the current visit.
- Best Bot runs the unmodified `submission.py`; Worst Bot runs the unmodified `opponent_win.py`.
- Locally served Pyodide 0.27.7 in a Web Worker. The approximately 14 MB runtime loads only when the visitor starts a game. No game data is sent to a server.
- Locally served fonts, keyboard-accessible controls, reduced-motion support, and responsive layouts.

Best Bot uses the embedded WeakC4 first-player policy on standard Connect 4 and bounded search in other positions. It is not advertised as universally unbeatable. Worst Bot deliberately prefers continuations that help its opponent; it cannot guarantee a human win.

## Content and artwork

Edit `dist/index.html` for biography, featured work, and outgoing links. Edit the repository list in `dist/app.js`. No email address, résumé, employment history, or specific team contributions beyond the user-confirmed roles have been invented. The project graphics are original illustrative compositions, not product screenshots or game assets.

Build stories are in `dist/index.html`, styled by `dist/stories.css`, and shared with the monitor by cloning the project content. Technical descriptions follow the supplied Python agents and the public botas navigation, acquisition, and feature documentation. WeakC4’s perfect first-player foundation is credited separately from the adapter and bounded search fallback.

The artwork source is `illustrate.py`; run `python3 illustrate.py` to regenerate `dist/assets/workshop.svg` and `dist/assets/botas.svg`.

The 3D scene is in `dist/room-model.js`; camera motion and interactions are in `dist/room3d.js`; the monitor and notebook surfaces are in `dist/room-surfaces.js`. Their styles are in `dist/room3d.css`. Static lighting shadows are cached and the scene redraws when the view or pieces change.

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
python3 tests/room_check.py
```

Browser screenshots and results are written to `/tmp/midnight-workshop-qa/`.

The 3D checks write to `/tmp/midnight-workshop-3d-qa/` and cover camera transitions, actual object clicks, project tabs, notebook pages/drawing, both bots, exiting/re-entering, and portrait layouts.

The Python agent tests and optional illustration generator require Python 3. Running the website only requires Node.js.

## Hosting

The portfolio runs independently of any hosting service. For deployment to a static host, serve `dist/` as the document root with support for JavaScript modules, workers, and `application/wasm` for `.wasm` files. No secrets or accounts are required. All assets, bot code, fonts, and the Python runtime are bundled locally.

GitHub Pages publishes `dist/` at **https://hiooooopji.github.io/portfolio/**. The workflow in `.github/workflows/pages.yml` checks the JavaScript and runs the game tests before deploying each push to `main`. It can also be run manually from the repository’s Actions tab. In Settings → Pages, the source is **GitHub Actions**.

The Node server is for local development. The published portfolio, 3D room, music, and Python agents all run in the visitor’s browser. Asset URLs are relative so the site works under the `/portfolio/` path.

## Third-party notices

- `dist/agents/submission.py` includes 2swap/WeakC4 and contributors’ GPL-3.0-only strategy, as documented in its original source header. Full license: `dist/agents/WEAKC4-LICENSE.txt`. Source: https://github.com/2swap/WeakC4.
- Pyodide 0.27.7: `dist/vendor/pyodide/LICENSE`, including its runtime component notices.
- Playfair Display and DM Sans: SIL Open Font License files in `dist/assets/`.
- Three.js 0.180.0, OrbitControls, and CSS3DRenderer: MIT license in `dist/vendor/three/LICENSE`.

Original agent source files are available for download in the portfolio’s game section.
