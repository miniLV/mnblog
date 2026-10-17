---
layout: post
title: "Warm ivory, clay accent, quiet chrome"
subtitle: "Dark mode is warm charcoal, not pure black."
date: 2026-10-08 09:00:00 +0800
author: "mnblog"
tags:
    - jekyll
    - design
summary: "The visual idea in one sentence: Claude-warm paper, restrained type, and covers that feel like parchment — not PPT blocks."
cover_image: /assets/img/covers/cover-warm-ivory.png
---

mnblog borrows the ivory / clay editorial mood people associate with Claude: soft paper background, serif headlines, restrained UI chrome.

## Covers

When a post has no `cover_image`, cards fall back to a soft parchment wash. Prefer real covers under `assets/img/covers/` — soft gradients and grain beat flat geometric placeholders.

## Dark mode

Toggle lives in the header. Preference sticks in `localStorage`; first visit follows the system. Dark canvas is a brown-black, not `#000`.


## Sketchboard covers

Homepage thumbs in this starter are **sketchboard** PNGs (`mnblog cover` / `mnblog draw`), not soft-gradient placeholders. Regenerate with:

```bash
mnblog cover "Warm ivory, clay accent, quiet chrome"
# or: node skills/sketchboard-diagram/scripts/render-html-to-png.mjs …
```
