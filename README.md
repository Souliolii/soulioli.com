# soulioli.com

Personal log/blog hosted on GitHub Pages.

## Pinning posts on the homepage

Add this to any post front matter:

```yaml
pinned: true
pin_order: 1
```

- `pinned: true` shows the post in the `Pinned Posts` card on the homepage.
- `pin_order` is optional and controls order (lower number appears first).

Posts are filtered into tabs by tags, based on `_config.yml`:

```yaml
pinned_sections:
  - id: all
    label: All
    tag: all
  - id: builds
    label: Builds
    tag: build
  - id: notes
    label: Notes
    tag: note
```

If a section has `tag: build`, only pinned posts with `tags: [build]` appear there.
