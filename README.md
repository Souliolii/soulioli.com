# soulioli.com

Personal log/blog hosted on GitHub Pages (Jekyll).

## Local development

1. Install Ruby + Bundler.
2. Install dependencies:
   `bundle install`
3. Run locally:
   `bundle exec jekyll serve`
4. Open:
   `http://127.0.0.1:4000`

## Publish/deploy

- Push to `main`.
- GitHub Pages rebuilds and deploys automatically.

## Create a new post

1. Create a file in `_posts/` with this naming format:
   `YYYY-MM-DD-title.md`
2. Use front matter like:

```yaml
---
layout: post
title: "My Post Title"
date: 2026-02-24 15:00:00 -0500
tags: [note]
pinned: false
---
```

Important:
- `date` should include time/timezone.
- `tags` should be single-tag in your current setup.
- If `date` is in the future, the post will not show by default.

Shortcut command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-post.ps1 -Title "My Post Title" -Tag note
```

## Pin a post on Home

Add to post front matter:

```yaml
pinned: true
pin_order: 1
```

- `pinned: true` shows it in `Pinned Posts`.
- `pin_order` is optional and sorts pinned posts (lower first).

Pin management policy:
- `guide` posts use `100-199`
- `note` posts use `200-299`
- `game` posts use `300-399`

Auto-normalize command:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/normalize-pin-order.ps1
```

## Draft workflow

Create a draft:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-draft.ps1 -Title "Draft Title" -Tag guide
```

Promote draft to `_posts` with today's date:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/promote-draft.ps1 -Name draft-title
```

Optional:
- pass `-KeepDate` to preserve an existing `date:` value in the draft.

## Pinned section tabs (Home + Archive)

Tabs are controlled by `_config.yml`:

```yaml
pinned_sections:
  - id: all
    label: All
    tag: all
  - id: guides
    label: Guides
    tag: guide
  - id: notes
    label: Notes
    tag: note
  - id: game
    label: Games
    tag: game
```

Rules:
- `tag: all` shows all posts.
- Other sections show posts where `tags` contains that value.

## Theme and colors

- Main color tokens live in:
  `_layouts/default.html`
- Edit the `:root` token block near the top.
- Theme picker (`Light / Dark / AMOLED`) is in the top-right menu and saves to localStorage.

## Logo and favicon

In `_config.yml`:

```yaml
hero_logo: "/assets/logo.png"
favicon: "/assets/logo.png"
```

- `hero_logo` = image in hero area on Home.
- `favicon` = browser tab icon.

## Social links (top-right icons)

In `_config.yml`:

```yaml
social:
  github: "https://github.com/..."
  discord: "https://discord.com/..."
  reddit: "https://reddit.com/..."
```

## External links behavior

External `http/https` links auto-open in new tabs.
Internal links (`/...`) stay in the same tab.

## Quick testing checklist

1. Home page:
   - Latest entries scroll area works.
   - Pinned section tabs switch.
2. Archive page:
   - Tag tabs switch.
   - Post list scrolls inside the card (page itself should stay stable).
3. Post page:
   - Shows date + timestamp.
4. Header tools:
   - Theme menu opens above hero image.
   - Home icon appears on non-home pages.
   - About icon appears on home page only.
   - Dividers between nav/social icon groups render correctly.
   - Social icons open correct links.

## Pre-push validation

Run this before pushing:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pre-push-check.ps1
```

It checks:
- future-dated posts
- tag validity against `_config.yml`
- single-tag rule
- pinned posts have `pin_order`
- unique `pin_order`
- `pin_order` is in the correct tag range

## Private notes (recommended)

Keep personal/internal notes in:

- `OWNER_NOTES.local.md` (already git-ignored in `.gitignore`)

Avoid putting private operational details in `README.md`, since README is typically public-facing.
