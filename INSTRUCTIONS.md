# Publishing Instructions

Run all commands from:

`e:\GitHub\soulioli.com`

Use VS Code terminal (`Ctrl + ``) and PowerShell.

## 1) Create a New Post

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-post.ps1 -Title "My Post Title" -Tag note
```

Allowed tags:
- `guide`
- `note`
- `game`

## 2) Create a Draft

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-draft.ps1 -Title "My Draft Title" -Tag guide
```

Draft file goes into `_drafts/`.

## 3) Promote Draft to Published Post

```powershell
powershell -ExecutionPolicy Bypass -File scripts/promote-draft.ps1 -Name my-draft-title
```

Notes:
- Use the draft filename without `.md`.
- This moves the file from `_drafts/` to `_posts/`.
- It sets `date:` to now.

Keep existing draft date instead:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/promote-draft.ps1 -Name my-draft-title -KeepDate
```

## 4) Normalize Pinned Post Order (If You Changed Pinned Posts)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/normalize-pin-order.ps1
```

Pin ranges:
- `guide` => `100-199`
- `note` => `200-299`
- `game` => `300-399`

## 5) Run Pre-Push Validation (Always)

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pre-push-check.ps1
```

Checks:
- future dates
- tag validity vs `_config.yml`
- single-tag rule
- pinned posts have `pin_order`
- duplicate `pin_order`
- `pin_order` is in the correct tag range

## 6) Commit and Push

```powershell
git add .
git commit -m "your update message"
git push
```

## Quick Daily Flow

1. Create post or draft
2. Promote draft (if needed)
3. Normalize pin order (if pinned changed)
4. Run pre-push check
5. Commit and push











# Owner Notes (Local / Private)

This file is gitignored and should stay local-only.

## Fast post template

```yaml
---
layout: post
title: "Post title"
date: 2026-02-24 15:00:00 -0500
tags: [note]
pinned: false
pin_order:
---
```

## Common edits

- New post:
  - Add file to `_posts/` with `YYYY-MM-DD-title.md`
- Pin a post:
  - `pinned: true`
  - Optional `pin_order: 1`
- Change tab sections:
  - Edit `pinned_sections` in `_config.yml`
- Change social links:
  - Edit `social` in `_config.yml`
- Change colors:
  - Edit `:root` tokens in `_layouts/default.html`

## Gotchas

- Future dates do not show until that date/time.
- Use one tag per post (current setup expectation).
- Keep filenames lowercase with hyphens.

## Local run

- `bundle exec jekyll serve`
- Open `http://127.0.0.1:4000`
