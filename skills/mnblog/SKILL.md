# Skill: mnblog

## When to use

User wants a new blog post, a new mnblog site, front-matter validation, or git publish for a Jekyll site using this theme.

## Instructions

1. Prefer **files + CLI**. Do not open GitHub in a browser.
2. New post: run `mnblog new "Title" --tags a,b` from the site root (or write `_posts/YYYY-MM-DD-slug.md` with the schema in `AGENTS.md`).
3. Edit the Markdown body. Do **not** invent images.
4. Run `mnblog check` on the file or `_posts/`.
5. Publish only when the user asked: `mnblog publish -m "post: Title"` (or `git` / `gh` equivalent). Use `--dry-run` if unsure.
6. Do not modify theme SCSS unless the user asked for theme work. Content sites should stay in posts + `_config.yml`.
7. Local `mnblog editor` is optional for humans; agents should not depend on it.

## Front matter schema

Required: `layout: post`, `title`, `date`.  
Recommended: `author`, `tags`, `summary`.  
Optional: `subtitle`, `cover_image` / `header-img` (must exist).

## Paths

- Posts: `_posts/YYYY-MM-DD-slug.md`
- Drafts: `_drafts/slug.md`
- Theme: `_layouts`, `_includes`, `_sass`, `assets/`
