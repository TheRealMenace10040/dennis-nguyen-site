# Dennis Nguyen — Personal Site

Personal portfolio site for Dennis Nguyen — microbiologist turned developer and data analyst.

Live: https://therealmenace10040.github.io/dennis-nguyen-site/

## Origin

This site was designed in [Claude Design](https://claude.ai) and exported as static HTML/CSS/JS, then set up here for version control and deployment.

## Stack

Plain static HTML/CSS/JS — no build step, no framework, no dependencies.

- `index.html` — page markup
- `styles.css` — styling
- `script.js` — scroll-spy nav highlighting
- `lims-case-study.html`, `case-study.css`, `case-study.js` — "From Bench to LIMS" case study with an interactive environmental-monitoring demo (all data synthetic, generated in the browser from a fixed seed)
- `manifest.json`, `icon-*.png`, `apple-touch-icon.png`, `favicon-32.png` — PWA/home-screen icon support (added post-export, generated with `generate_icons.py`)

## Development

Just open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Deployment

Deployed via GitHub Pages from the `main` branch root.
