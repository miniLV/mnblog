<h1 align="center">mnblog</h1>

<p align="center">
  <strong>A warm editorial Jekyll theme with a thin CLI for people and coding agents.</strong>
</p>

<p align="center">
  Ivory canvas · clay accent · Source Serif / Source Sans<br />
  Markdown in <code>_posts/</code> · agents on the CLI · sketchboard covers
</p>

<p align="center">
  <a href="https://minilv.github.io/mnblog/">Site</a> ·
  <a href="https://github.com/miniLV/mnblog/releases/latest">Latest Release</a> ·
  <a href="https://github.com/miniLV/mnblog">GitHub</a> ·
  <a href="./README.md">简体中文</a> · <strong>English</strong>
</p>

<p align="center">
  <code>./bin/mnblog init ../my-blog</code>
</p>

<p align="center">
  <a href="https://github.com/miniLV/mnblog/releases">
    <img alt="Release" src="https://img.shields.io/github/v/release/miniLV/mnblog?include_prereleases" />
  </a>
  <a href="./LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/miniLV/mnblog" />
  </a>
  <img alt="Jekyll" src="https://img.shields.io/badge/jekyll-theme-d97757" />
  <img alt="Agent CLI" src="https://img.shields.io/badge/agent-CLI-141413" />
</p>

<p align="center">
  <img src="docs/assets/readme/home-light.png" alt="mnblog home — light" width="860" />
</p>

<p align="center">
  <img src="docs/assets/readme/cover-hello-mnblog.png" alt="sketchboard cover sample" width="560" />
</p>

Extracted from the theme layer of [miniLV.github.io](https://github.com/miniLV/miniLV.github.io). Visual layer inspired by Claude.ai’s product site; independent, not affiliated with Anthropic. Content and site identity stay in your own blog repo.

---

## What you get

- Markdown posts in `_posts/`; home / post / tags / 404 — Sass only
- GitHub Pages–friendly (`github-pages` gem / `remote_theme`)
- Light / dark toggle (warm charcoal, not pure black)
- **`mnblog` CLI**: `init` → `new` → `check` → `publish`, plus `ask` / `desk`
- **sketchboard images**: `mnblog cover` / `mnblog draw`
- Local **Desk** (`mnblog desk --ui`): post list + Markdown + one-shot local agent panel

---

## Three steps

```bash
git clone https://github.com/miniLV/mnblog.git
cd mnblog
./bin/mnblog init ../my-blog
cd ../my-blog

# Needs Ruby + Bundler
bundle install && bundle exec jekyll serve   # or: mnblog serve
# → http://127.0.0.1:4000

mnblog new "Your title" --tags jekyll,notes
mnblog check
mnblog publish -m "post: Your title"
```

`init` copies the example and **vendors** the theme. Edit `_config.yml` for `title`, `url`, nav, and hero copy.

Push to a GitHub Pages repo; Jekyll builds natively. Agent GitHub access: **`gh` / git / API only** — no browser automation on github.com.

---

## Write a post

```md
---
layout: post
title: "Your title"
subtitle: "Optional subtitle"
date: 2026-10-17 12:00:00 +0800
author: "Your name"
tags:
  - Jekyll
summary: "Optional card summary"
# cover_image: /assets/img/covers/cover-hello-mnblog.png
---
```

- Filename: `_posts/YYYY-MM-DD-slug.md`
- Posts render fine without covers — **do not invent image URLs**
- Drafts: `mnblog new "Title" --draft`

Conventions: [AGENTS.md](./AGENTS.md) · skill: [skills/mnblog/SKILL.md](./skills/mnblog/SKILL.md)

---

## Agent path

```text
mnblog new "Title" --tags a,b
→ edit _posts/YYYY-MM-DD-slug.md
→ mnblog check
→ mnblog publish -m "post: Title"
```

```bash
mnblog desk                 # interactive local claude / codex
mnblog desk --ui            # local Desk (http://127.0.0.1:4177/)
mnblog ask "draft a post about X"
mnblog cover "Title"        # sketchboard cover
mnblog draw "Loop" --kind flow
```

| Command | Role |
|---------|------|
| `init` / `new` / `check` / `publish` / `serve` | Site, posts, validate, push, preview |
| `desk` / `desk --ui` / `ui` / `ask` | Local agent + Desk |
| `cover` / `draw` | sketchboard cover / in-post diagram |

**mnblog never stores cloud API keys** — it reuses your local Claude Code / Codex login. Desk chat is one-shot per send; PNG render needs local Chrome.

---

## Images (sketchboard)

```bash
mnblog cover "Post title"              # → assets/img/covers/<slug>.png
mnblog draw "Publish loop" --kind flow # architecture | flow | flywheel
mnblog new "Title" --with-cover
```

Vendored sparse copy of [sketchboard-diagram](https://github.com/miniLV/sketchboard-diagram). Without Chrome you still get `_diagrams/*.html` plus an agent prompt.

---

## Local Desk

```bash
mnblog desk --ui   # or: mnblog ui
```

Three panes: post list, Markdown (Ctrl/Cmd+S saves), local agent stream. Binds `127.0.0.1` only; zero npm dependencies.

---

## Use as `remote_theme`

```yaml
remote_theme: miniLV/mnblog
plugins:
  - jekyll-remote-theme
  - jekyll-paginate
  - jekyll-sitemap
theme_stylesheet: "/assets/css/style.css"
theme_script: "/assets/js/site.js"
favicon: "/assets/favicon.svg"
```

`mnblog.gemspec` is also available.

---

## Site config

| Key | Role |
|-----|------|
| `title` · `SEOTitle` · `description` | Identity |
| `brand_mark` · `default_eyebrow` | Nav mark + label |
| `hero_*` · `nav_items` · `social_links` | Home + chrome |
| `theme_stylesheet` · `theme_script` · `favicon` | Asset paths |
| `timezone` | Examples use `Asia/Shanghai` |

Tokens: `_sass/_tokens.scss`.

---

## Repository layout

```text
_layouts/  _includes/  _sass/   theme
assets/  css/  js/              styles & scripts
bin/mnblog                      CLI (ask / desk / cover / draw …)
desk/                           local Desk
example/                        demo + sketchboard covers
docs/                           promo landing + README screenshots
AGENTS.md  skills/              agent docs + skill
```

**Not** included: personal posts, or migrating miniLV.github.io onto this theme (follow-up).

---

## Status

**v0.4.0+** — sketchboard covers / diagrams (`cover` / `draw`) · local Desk · agent CLI (`ask` / `desk`). Apache-2.0.

## License

[Apache License 2.0](./LICENSE)
