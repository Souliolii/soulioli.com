# Site Operations Instructions

Run commands from:

`e:\GitHub\soulioli.com`

Use PowerShell in VS Code terminal.

## Local Development

```powershell
bundle install
bundle exec jekyll serve
```

Open:

`http://127.0.0.1:4000`

## Create a New Post

```powershell
powershell -ExecutionPolicy Bypass -File scripts/new-post.ps1 -Title "My Post Title" -Tag note
```

Allowed tags:
- `guide`
- `note`
- `game`

Post files are created in `_posts/`.

## Post Front Matter (Reference)

```yaml
---
layout: post
title: "My Post Title"
date: 2026-02-24 15:00:00 -0500
tags: [note]
pinned: false
---
```

Rules:
- Use exactly one tag per post.
- If `date` is in the future, the post will not appear until that time.

## Pinned Post Management

To normalize `pin_order` for pinned posts:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/normalize-pin-order.ps1
```

Pin ranges:
- `guide` => `100-199`
- `note` => `200-299`
- `game` => `300-399`

## Pre-Push Validation

Always run before pushing:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/pre-push-check.ps1
```

Validation checks:
- future-dated posts
- valid tags from `_config.yml`
- single-tag rule
- pinned posts include `pin_order`
- duplicate `pin_order`
- `pin_order` range compliance by tag

## Publish

```powershell
git add .
git commit -m "your update message"
git push
```

## Quick Workflow

1. Create post
2. Normalize pin order (if pinned posts changed)
3. Run pre-push check
4. Commit and push
