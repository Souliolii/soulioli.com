# soulioli.com

Public personal archive site powered by Jekyll and deployed on GitHub Pages.

## What This Repo Contains

- `index.html`:
  Home page layout and home-specific behavior.
- `archive.html`:
  Archive page and tag-filter behavior.
- `_layouts/default.html`:
  Shared layout, theme tokens, header, and global styles.
- `_layouts/post.html`:
  Individual post layout.
- `_posts/`:
  Published posts.
- `_config.yml`:
  Site config, social links, and pinned section definitions.
- `scripts/`:
  Local automation for post creation, pin normalization, and validation.

## Local Development

```powershell
bundle install
bundle exec jekyll serve
```

Open:

`http://127.0.0.1:4000`

## Deployment

- Push to `main`.
- GitHub Pages rebuilds and deploys automatically.

## Content and Publishing Workflow

Operational publishing steps and script usage live in:

- [INSTRUCTIONS.md](INSTRUCTIONS.md)

## Private Local Notes

Use:

- `OWNER_NOTES.local.md`

This file is gitignored and intended for local-only notes.

## License

See [LICENSE](LICENSE).
