# Skill: mnblog

## When to use

User wants a new blog post, a new mnblog site, front-matter validation, git publish, sketchboard covers/diagrams, a local Claude Code / Codex session, or the local Desk UI inside a Jekyll site using this theme.

## Instructions

1. Prefer **files + CLI**. Do not open GitHub in a browser.
2. New post: `mnblog new "Title" --tags a,b` (add `--with-cover` to stub `cover_image`). Or write `_posts/YYYY-MM-DD-slug.md` per `AGENTS.md`.
3. Edit the Markdown body.
4. **Images:** use sketchboard — never invent stock photos.
   - Cover: `mnblog cover "Title"` → `assets/img/covers/…png` + front-matter `cover_image`.
   - Diagram: `mnblog draw "…" --kind architecture|flow|flywheel` → `assets/img/diagrams/…png`.
   - Follow `skills/sketchboard-diagram/SKILL.md` when refining HTML geometry.
5. Run `mnblog check` on the file or `_posts/`.
6. Publish only when the user asked: `mnblog publish -m "post: Title"` (or `git` / `gh`). Use `--dry-run` if unsure.
7. Do not modify theme SCSS unless the user asked for theme work.
8. Local Desk (`mnblog desk --ui`) is optional for humans; agents prefer CLI + files.
9. Coding agent in the site: `mnblog desk` or `mnblog ask "…"`.

## ask / desk / ui notes

| Command | Behavior |
|---------|----------|
| `mnblog desk [--agent auto\|claude\|codex]` | Interactive TTY, cwd = site root |
| `mnblog desk --ui` / `mnblog ui` | Local Desk (posts + editor + one-shot chat + sketchboard presets) |
| `mnblog ask [--agent …] "prompt"` | `claude -p` or `codex exec`; no prompt → desk |
| `mnblog cover` / `mnblog draw` | Sketchboard scaffold + optional Chrome PNG |
| flags after `--` | Passed through to the agent CLI |

Site root = nearest folder with `_config.yml` **and** `_posts/`. Missing `AGENTS.md` / `skills/mnblog/` / `skills/sketchboard-diagram/` are copied from the mnblog package.

Desk chat is **one-shot per send**. No cloud keys; no GitHub browser OAuth.

## Front matter schema

Required: `layout: post`, `title`, `date`.  
Recommended: `author`, `tags`, `summary`.  
Optional: `subtitle`, `cover_image` / `header-img` (**must exist** — generate with `mnblog cover`).

## Paths

- Posts: `_posts/YYYY-MM-DD-slug.md`
- Drafts: `_drafts/slug.md`
- Covers: `assets/img/covers/` · Diagrams: `assets/img/diagrams/` · Sources: `_diagrams/`
- Theme: `_layouts`, `_includes`, `_sass`, `assets/`
- Desk: `desk/server.js`, `desk/public/`
- Skills: `AGENTS.md`, `skills/mnblog/SKILL.md`, `skills/sketchboard-diagram/`
