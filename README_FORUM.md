Forum page added

The site now has a topic-based forum at `/forum`.

What it does:
- Show a public topic index at `/forum`
- Open each topic in a detail view at `/forum/topic/:id`
- Let the admin create topics and replies from `/forum/admin`
- Save threads in `uploads/forum.json`

Files added:
- `forum.html`
- `forum.css`
- `forum.js`

API endpoints:
- `GET /api/forum` — list threads
- `POST /api/forum` — create a thread
- `GET /api/forum/:id` — read a single thread
- `POST /api/forum/:id/posts` — add a reply to a thread

Admin access:
- Open `/forum/admin` in a browser and sign in with HTTP basic auth
- Set `FORUM_ADMIN_PASSWORD` to change the editor password

Navigation:
- `server.js` now serves `/forum`
