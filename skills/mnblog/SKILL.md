# Skill: mnblog

## When to use

User wants a new blog post, a new mnblog site, front-matter validation, git publish, or a local Claude Code / Codex session inside a Jekyll site using this theme.

## Instructions

1. Prefer **files + CLI**. Do not open GitHub in a browser.
2. New post: run `mnblog new "Title" --tags a,b` from the site root (or write `_posts/YYYY-MM-DD-slug.md` with the schema in `AGENTS.md`).
3. Edit the Markdown body. Do **not** invent images.
4. Run `mnblog check` on the file or `_posts/`.
5. Publish only when the user asked: `mnblog publish -m "post: Title"` (or `git` / `gh` equivalent). Use `--dry-run` if unsure.
6. Do not modify theme SCSS unless the user asked for theme work. Content sites should stay in posts + `_config.yml`.
7. Local `mnblog editor` is optional for humans; agents should not depend on it.
8. To open a coding agent **in the blog site directory**: `mnblog desk` (interactive) or `mnblog ask "…"` (one-shot). These wrap local `claude` / `codex` binaries — they do not call cloud APIs themselves.

## ask / desk notes

| Command | Behavior |
|---------|----------|
| `mnblog desk [--agent auto\|claude\|codex]` | Interactive session, cwd = site root |
| `mnblog ask [--agent …] "prompt"` | `claude -p` or `codex exec`; no prompt → desk |
| flags after `--` | Passed through to the agent CLI |

Site root = nearest folder with `_config.yml` **and** `_posts/`. Missing `AGENTS.md` / `skills/mnblog/` are copied from the mnblog package.

## Front matter schema

Required: `layout: post`, `title`, `date`.  
Recommended: `author`, `tags`, `summary`.  
Optional: `subtitle`, `cover_image` / `header-img` (must exist).

## Paths

- Posts: `_posts/YYYY-MM-DD-slug.md`
- Drafts: `_drafts/slug.md`
- Theme: `_layouts`, `_includes`, `_sass`, `assets/`
- Agent docs: `AGENTS.md`, `skills/mnblog/SKILL.md`
