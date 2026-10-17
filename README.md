<h1 align="center">mnblog</h1>

<p align="center">
  <strong>偏编辑气质的 Jekyll 主题，加上一层给人和编程 agent 用的 CLI。</strong>
</p>

<p align="center">
  浅色是暖象牙底 + clay 强调色，Source Serif / Source Sans，字号偏大、留白偏多；深色是暖褐黑，不是纯黑。观感受 Claude.ai 产品站启发；本仓库与 Anthropic 无官方关系。
</p>

<p align="center">
  <a href="https://github.com/miniLV/mnblog/releases/latest">Latest Release</a> ·
  <a href="https://github.com/miniLV/mnblog">GitHub</a> ·
  <strong>简体中文</strong> · <a href="./README.en.md">English</a>
</p>

<p align="center">
  <code>./bin/mnblog init ../my-blog</code>
</p>

<p align="center">
  Markdown 进 <code>_posts/</code> · agent 走 CLI · GitHub Pages 原生构建
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
  <img src="docs/assets/readme/home-light.png" alt="mnblog 浅色首页" width="860" />
</p>

<p align="center">
  <img src="docs/assets/readme/home-dark.png" alt="mnblog 深色首页" width="860" />
</p>

<p align="center">
  <img src="docs/assets/readme/post-light.png" alt="mnblog 文章页" width="860" />
</p>

<p align="center">
  <img src="docs/assets/readme/editor.png" alt="mnblog 本地编辑器" width="860" />
</p>

主题从 [miniLV.github.io](https://github.com/miniLV/miniLV.github.io) 的主题层抽出。文章、个人配图、站点身份留在你自己的博客仓。

---

## 你会得到什么

- 继续在 `_posts/` 里写 Markdown
- 首页、文章页、标签页、404 —— 只用 Jekyll Sass，不依赖 Grunt / webpack / Bootstrap
- 兼容 GitHub Pages（`github-pages` gem / `remote_theme`）
- 可选 front matter：`summary`、`subtitle`、`cover_image` / `header-img`
- 深浅色切换，会记住选择（否则跟系统）
- **`mnblog` CLI**：`init` → `new` → `check` → `publish`
- 可选的本地 **编辑器雏形**（给人点；发布仍走 CLI）

---

## 三步上手

### 1. 建站

```bash
git clone https://github.com/miniLV/mnblog.git
cd mnblog
./bin/mnblog init ../my-blog
cd ../my-blog
```

`init` 会拷贝 example，并把主题目录 **vendoring** 进新站点（`_layouts`、`_includes`、`_sass`、`assets` 等），本地预览不必等 GitHub 拉远程主题。

改 `_config.yml`：`title`、`url`、`nav_items`、首页文案、社交链接。

### 2. 本地预览

需要 Ruby + Bundler：

```bash
bundle install
bundle exec jekyll serve
# 或：mnblog serve
```

打开 `http://127.0.0.1:4000`。

### 3. 写文章并发布

人和 agent 用同一套文件：

```bash
mnblog new "文章标题" --tags jekyll,notes
# 编辑 _posts/ 下的文件
mnblog check
mnblog publish -m "post: 文章标题"
```

推到 GitHub Pages 仓库（常见是 `<user>.github.io`）。Pages 用 Jekyll 自动构建，默认链路不需要额外 Actions。

Agent 访问 GitHub：**只用 `gh` / git / API**，不要用浏览器自动化 github.com。

---

## 新建文章

`mnblog new` 会写出下面这种 front matter；也可以手写 `_posts/YYYY-MM-DD-slug.md`：

```md
---
layout: post
title: "文章标题"
subtitle: "可选副标题"
date: 2026-10-17 12:00:00 +0800
author: "你的名字"
tags:
  - Jekyll
  - Notes
summary: "可选，自定义卡片摘要。"
# cover_image: /assets/your-image.png   # 仅当文件真实存在
---

正文写在这里。
```

说明：

- `_posts/` 下文件名必须是 `YYYY-MM-DD-slug.md`
- `summary` 可选；不填时卡片会回退到 `subtitle` 或正文摘要
- `cover_image` / `header-img` 可选；没有图也能正常渲染 —— **不要编造图片 URL**
- 草稿：`mnblog new "标题" --draft` → `_drafts/`

更完整的 agent 约定：[AGENTS.md](./AGENTS.md) · skill：[skills/mnblog/SKILL.md](./skills/mnblog/SKILL.md)

---

## Agent 主路径（推荐）

Agent 应走文件系统和 CLI，而不是网页：

```text
mnblog new "标题" --tags a,b
→ 改 _posts/YYYY-MM-DD-slug.md
→ mnblog check
→ mnblog publish -m "post: 标题"
```

| 命令 | 作用 |
|------|------|
| `mnblog init [dir]` | 示例站 + 本地主题 |
| `mnblog new "title"` | 带 front matter 的新文章 |
| `mnblog check [path]` | 校验 front matter 与日期文件名 |
| `mnblog publish` | `git add` / `commit` / `push`（支持 `--dry-run`） |
| `mnblog serve` | 有 Bundler 时跑 `jekyll serve` |
| `mnblog editor` | 在 `http://127.0.0.1:4173/` 打开编辑器页 |

CLI 无 npm 依赖（Node ≥ 18）。`package.json` 里挂了 `mnblog` bin，可按需安装。

---

## 用作 `remote_theme`

已有 Jekyll 站、只想换皮时：

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

自己的 `_posts`、`index.html`、`tags.html` 和身份字段留在站点仓。启用 `remote_theme` 后，本地的 `_layouts` / `_includes` / `_sass` / `assets` 可以删掉。

也提供了 `mnblog.gemspec`，若你更习惯 gem theme 也可以。

---

## 站点配置

和源站一样，站点级文案主要在 `_config.yml`：

| 字段 | 作用 |
|------|------|
| `title` · `SEOTitle` · `description` | 身份 |
| `brand_mark` | 顶栏字母标 |
| `default_eyebrow` | 标题下的小标签 |
| `hero_title` · `hero_description` · `hero_*_cta` | 首页 |
| `nav_items` · `social_links` · `footer_note` | 导航与页脚 |
| `theme_stylesheet` · `theme_script` · `favicon` | 资源路径 |
| `timezone` | 示例默认 `Asia/Shanghai` |

配色 token 在 `_sass/_tokens.scss`。只有打算改皮肤时才动它们。

---

## 本地编辑器（可选）

```bash
mnblog editor
# → http://127.0.0.1:4173/
```

v0.1：Chromium 下用 File System Access 打开站点目录、改 `_posts/*.md`、保存。**页面里不负责发布** —— 保存后另跑 `mnblog publish`（或 git）。Agent 不要依赖这个界面。

---

## 字体

默认通过 Google Fonts 加载 Source Sans 3、Source Serif 4、JetBrains Mono；没网时回退到系统字体。不必本机安装字体文件。

---

## 仓库结构

```text
_layouts/  _includes/  _sass/   主题
assets/                     样式入口、JS、favicon
css/  js/                   同套资源，方便整仓拷贝
bin/mnblog                  agent CLI
example/                    最小演示 + 一篇样例
editor/                     给人用的雏形
docs/assets/readme/         README 截图
AGENTS.md  skills/          agent 文档
```

**不包含**：个人文章、个人 `img/`、子模块，也不包含把 [miniLV.github.io](https://github.com/miniLV/miniLV.github.io) 迁到消费本主题 —— 那是后续工作。

---

## 状态

**v0.1.1** — 主题抽取、CLI、example、编辑器雏形、README 截图与中英切换。可以开新的 Pages 博客，或把 `remote_theme` 指过来。CLI / 编辑器后续还会改，可能有小的不兼容。

## 许可

[Apache License 2.0](./LICENSE)
