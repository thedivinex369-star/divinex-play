# DivineX Play — Free-to-Play Demo

A responsive, static browser game portal built with plain HTML, CSS and JavaScript. It has no build step, no server, no account system, and no paid dependencies.

## Included
- Responsive gaming homepage
- Four playable games: Fruit Spin Demo, Memory Match, Star Rush, Number Guess
- Virtual coins and daily bonus stored locally in the browser
- Local leaderboard
- Premium preview and advertising placeholder
- Basic terms/privacy notices
- No real-money deposits, withdrawals, betting, cash prizes, or purchases

## Run on Windows
1. Install VS Code and a current Node.js LTS release only if you want to use a local dev server. This static site does not require Node.
2. Extract the `DivineX-Play.zip` file.
3. In VS Code choose **File → Open Folder** and select `DivineX-Play`.
4. Open `index.html` in a browser. For a better development experience, install the VS Code extension **Live Server**, then right-click `index.html` → **Open with Live Server**.
5. Edit `index.html`, `style.css`, or `app.js`. Refresh the browser to see changes.

### Optional PowerShell local server
From the project folder, run:
```powershell
py -m http.server 5500
```
Then open `http://localhost:5500`. If `py` is unavailable, use Live Server in VS Code.

## Free deployment using GitHub Pages
1. Create/sign in to GitHub and create a new public repository named `divinex-play`.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then Save.
6. Wait for the published URL shown in Settings → Pages. It typically resembles `https://YOUR-USERNAME.github.io/divinex-play/`.
7. Open the URL on desktop and mobile and test all four games.

GitHub UI labels can change. GitHub Pages is static hosting: this project does not need environment variables or a backend.

## Before public launch
- Replace `hello@example.com` with a monitored contact address.
- Write and publish clear Terms of Use and Privacy Policy appropriate to the actual service and jurisdiction.
- Test keyboard navigation, mobile layouts, and browser storage behavior.
- Add analytics only after reviewing consent/privacy requirements.
- Ad network approval is not guaranteed; apply only after the site has original content and complies with the network's policies.
- Premium features are only a preview. If later collecting payments for non-wagering digital features, use a compliant payment provider, transparent pricing/refund terms, and applicable tax/legal review.
- Never add cash wagering, deposits/withdrawals for betting, or cash prizes without specialist legal advice and a lawful operating basis. This starter is intentionally not designed for real-money gaming.

## Important technical limitations
- Coins, scores, and daily bonus live only in the visitor's own browser (`localStorage`); clearing browser data resets them.
- There is no secure login, server database, multiplayer, server-side anti-cheat, payment processing, or real global leaderboard.
- The daily bonus is a convenience feature, not secure identity-based enforcement.
- Do not treat local scores or client-side coin balances as authoritative.

## Folder structure
```text
DivineX-Play/
├── index.html
├── style.css
├── app.js
└── README.md
```
