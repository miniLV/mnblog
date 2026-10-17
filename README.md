# mnblog

Warm editorial **Jekyll** theme plus a thin **agent CLI**. Ivory canvas, clay accent, optional dark mode. Extracted from [miniLV.github.io](https://github.com/miniLV/miniLV.github.io) (theme layer only).

中文说明见 [README.zh.md](./README.zh.md).

## What’s in the box

| Path | Purpose |
|------|---------|
| `_layouts/` `_includes/` `_sass/` `assets/` | Theme (remote_theme / gem friendly) |
| `bin/mnblog` | `init` · `new` · `check` · `publish` · `serve` · `editor` |
| `example/` | Minimal demo site + one sample post |
| `editor/` | Local human stub (File System Access); publish still via CLI |
| `AGENTS.md` · `skills/mnblog/` | Conventions for coding agents |
| `css/` `js/` | Same assets mirrored for copy-paste layouts |

License: **Apache-2.0** (same family as the source blog).

## Quick start

```bash
git clone https://github.com/miniLV/mnblog.git
cd mnblog
./bin/mnblog init ../my-blog
cd ../my-blog
# edit _config.yml
bundle install
bundle exec jekyll serve
```

Or without cloning the theme repo, once published on npm-style path / local install:

```bash
npx --yes github:miniLV/mnblog   # if you wire package bin later
# or:
node /path/to/mnblog/bin/mnblog init my-blog
```

### Agent loop

```text
mnblog new "Title" --tags notes,dev
# edit _posts/YYYY-MM-DD-slug.md
mnblog check
mnblog publish -m "post: Title"
```

GitHub: **`gh` / git / API only** — do not automate the github.com UI in a browser.

## Use as `remote_theme`

In your site `_config.yml`:

```yaml
remote_theme: miniLV/mnblog
plugins:
  - jekyll-remote-theme
  - jekyll-paginate
  - jekyll-sitemap
theme_stylesheet: "/assets/css/style.css"
theme_script: "/assets/js/site.js"
```

Keep your own `_posts`, `index.html`, `tags.html`, and identity fields in `_config.yml`. You can delete vendored `_layouts` / `_includes` / `_sass` / `assets` when remote_theme is active.

`mnblog init` **vendors** the theme into the new site so `jekyll serve` works offline without waiting on GitHub.

## Front matter

```yaml
layout: post
title: "Required"
subtitle: "Optional"
date: 2026-10-17 12:00:00 +0800
author: "you"
tags:
    - example
summary: "Optional"
```

Filename: `_posts/YYYY-MM-DD-slug.md`. Full rules in [AGENTS.md](./AGENTS.md).

## Editor

```bash
./bin/mnblog editor
# → http://127.0.0.1:4173/
```

v0.1: open a site folder (Chromium File System Access), edit `_posts/*.md`, save. **Publish** is intentionally external: `mnblog publish`.

## Design notes

- Light: ivory `#faf9f5`, clay accent `#d97757`
- Dark: warm charcoal `#191815` (not pure black)
- Type: Source Sans 3 / Source Serif 4 / JetBrains Mono

Palette is **inspired by** the Claude.ai / Anthropic marketing look; this is an independent theme, not an official product.

## Status

**v0.1.0** — theme extract + CLI + example + editor stub. Personal site migration (`miniLV.github.io` → consume mnblog) is a follow-up, not included here.

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
