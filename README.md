# soulioli.com

Personal log/blog hosted on GitHub Pages.

## Local development

1. Install Ruby and Bundler.
2. Install dependencies:
   `bundle install`
3. Run the site locally:
   `bundle exec jekyll serve`
4. Open:
   `http://127.0.0.1:4000`

## Publishing

Push to `main`. GitHub Pages builds and deploys from this repository.

## Writing posts

- Use `_drafts/_post_template.md` as a starting point.
- Move finished posts to `_posts/` with filename format:
  `YYYY-MM-DD-title.md`
- Set `date` with time and timezone (example: `2026-02-24 10:00:00 -0500`) so ordering is deterministic.
