---
layout: post
title: "Hello, mnblog"
subtitle: "A sample post for the starter site"
date: 2026-10-17 12:00:00 +0800
author: "mnblog"
tags:
    - mnblog
    - jekyll
summary: "How this theme expects posts to look, and how agents should create them."
---

This is a **sample post**. Delete it after you start writing.

## Front matter

Use this shape (also what `mnblog new` writes):

```yaml
layout: post
title: "Your title"
subtitle: "Optional"
date: 2026-10-17 12:00:00 +0800
author: "you"
tags:
    - example
summary: "One or two sentences for cards and SEO."
```

Filename: `_posts/YYYY-MM-DD-slug.md`.

## Agent path

```text
mnblog new "Title" --tags a,b
# edit the markdown
mnblog check
mnblog publish -m "post: Title"
```

No browser for GitHub. Prefer `gh` / `git`. Do not invent cover images unless they exist in the repo.

## Look

Warm ivory canvas, clay accent, optional dark mode (sun/moon in the header). That is the whole visual idea.
