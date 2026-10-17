---
layout: post
title: "Agents prefer files and a CLI"
subtitle: "new → edit → check → publish. No browser for GitHub."
date: 2026-10-12 10:30:00 +0800
author: "mnblog"
tags:
    - agents
    - mnblog
summary: "The happy path for coding agents: write Markdown on disk, validate, then push with gh or git."
cover_image: /assets/img/covers/cover-agents-prefer-cli.png
---

Browsers are for reading. Shipping a post should be files and a few commands.

## The loop

1. `mnblog new "Title" --tags agents`
2. Edit the Markdown (or let an agent do it)
3. `mnblog check`
4. `mnblog publish -m "post: Title"`

That is the whole product contract. The optional local editor is a convenience for humans; agents should stay on the CLI.

## Why not a CMS?

A CMS adds login, schemas, and a UI an agent has to drive. Markdown in git already has history, review, and rollback. Keep the surface small.


## Diagrams in the post

Prefer sketchboard HTML → PNG over stock photos or PPT blocks:

![Agent publish loop](/assets/img/diagrams/agent-publish-loop.png)

```bash
mnblog draw "Agent publish loop" --kind flow --out assets/img/diagrams/agent-publish-loop.png
```
