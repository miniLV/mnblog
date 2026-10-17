# AGENTS.md — working with mnblog

You are editing a **Jekyll** site that uses the **mnblog** theme (warm ivory / clay / charcoal, optional dark mode). Prefer the CLI and files over browsers.

## Do

- Create posts with `mnblog new "Title" --tags a,b` or by writing `_posts/YYYY-MM-DD-slug.md` yourself.
- Validate with `mnblog check` before commit.
- Publish with `mnblog publish` (git add/commit/push) or equivalent `gh` / Contents API. Never drive github.com in a browser.
- Keep front matter honest. Put substance in the Markdown body.
- For a local coding-agent session in this site: `mnblog desk` or `mnblog ask "…"`. Those launch **Claude Code** (`claude`) or **Codex** (`codex`) already installed on the machine — mnblog does not hold API keys.

## Do not

- Invent cover images, header images, or asset URLs that are not in the repo.
- Commit personal secrets, private emails, or large binary dumps into the theme.
- Change theme CSS casually in a content-only site; prefer content + config.
- Use the local web editor as the agent primary path — it is a human stub. Agents use CLI + files.
- Expect a browser “Desk” UI yet (planned for v0.3). v0.2 is CLI launch only.

## Post front matter

```yaml
---
layout: post
title: "Required title"
subtitle: "Optional"
date: 2026-10-17 12:00:00 +0800
author: "site-or-person"
tags:
    - tag-one
summary: "Optional card / SEO blurb"
# cover_image: /assets/...   # only if file exists
# header-img: /assets/...    # legacy alias; same rule
---
```

- Filename under `_posts/`: `YYYY-MM-DD-slug.md` (date prefix required).
- Drafts: `_drafts/slug.md` via `mnblog new "Title" --draft`.
- Timezone for this project default: **Asia/Shanghai** (`+0800`).

## Config knobs (site `_config.yml`)

| Key | Role |
|-----|------|
| `title`, `SEOTitle`, `description` | Identity |
| `brand_mark` | Single letter in the nav mark |
| `default_eyebrow` | Small label under title / heroes |
| `nav_items`, `social_links` | Nav + footer |
| `hero_*` | Home hero copy / CTAs |
| `theme_stylesheet`, `theme_script`, `favicon` | Asset paths (defaults under `/assets/...`) |
| `remote_theme: miniLV/mnblog` | Optional instead of vendored theme dirs |

## Theme vs content

| Theme (shareable) | Content (yours) |
|-------------------|-----------------|
| `_layouts`, `_includes`, `_sass` | `_posts`, `_drafts` |
| `assets/css`, `assets/js` | `index.html`, `tags.html`, `about` |
| | `_config.yml` identity fields |

## CLI cheat sheet

```text
mnblog init my-blog
mnblog new "Title" --tags codex,notes
mnblog check
mnblog publish -m "post: Title"
mnblog serve          # needs Ruby/Bundler
mnblog editor         # human stub only
mnblog desk [--agent claude|codex|auto]
mnblog ask  [--agent claude|codex|auto] "prompt…"
```

### ask / desk (v0.2)

- Resolve the nearest directory that has **both** `_config.yml` and `_posts/`.
- Copy `AGENTS.md` and `skills/mnblog/` from the mnblog package if missing.
- Detect `claude` / `codex` on PATH. `--agent auto` prefers Claude Code when both exist.
- `desk`: interactive TTY in the site root. Extra flags after `--` go to the agent CLI.
- `ask`: one-shot when possible — `claude -p "…"` or `codex exec "…"`. No prompt → falls back to `desk`.
- Auth stays with those CLIs (whatever login you already use). mnblog never asks for cloud API keys.

## Skill

See `skills/mnblog/SKILL.md` for a short skill pack you can point coding agents at.
