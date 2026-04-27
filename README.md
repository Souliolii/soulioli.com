# soulioli.com
This repo contains a simple static website scaffold for `soulioli.com`.

## What was created
- `index.html` — the main page with an OSRS profit calculator UI
- `styles.css` — the site styles
- `app.js` — live Runescape pricing, name search, and icon support
- `favicon.svg` — browser tab logo
- `CNAME` — optional GitHub Pages custom domain file

## Notes on item search and pricing
- Craft and ingredient fields now support searching by item name instead of raw IDs.
- Item selections show a small OSRS wiki icon and name for each chosen item.
- The calculator still uses live prices from the OSRS wiki price API.
- The API does not provide a dedicated item search route, so item names are indexed locally after a one-time mapping fetch.
- Prices are fetched in batches for the selected item set, and repeated quotes during the same session reuse cached results when available.

## Next steps
1. Open `index.html` and edit the text, headings, and links.
2. Replace the placeholder links with your real GitHub, social, or contact URLs.
3. Push this repo to your hosting platform of choice.
4. Point your domain `soulioli.com` to that host.

## Deploy notes
- If you use GitHub Pages, keep `CNAME` in the repository root.
- If you use Vercel or Cloudflare Pages, follow their custom domain setup and point DNS to the values they provide.
