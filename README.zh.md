# mnblog

偏编辑气质的 **Jekyll** 主题，外加一层给 agent 用的 **CLI**。浅色是暖象牙 + clay 强调色，深色是暖褐黑。主题从 [miniLV.github.io](https://github.com/miniLV/miniLV.github.io) 抽出来（只含主题层，不含个人文章）。

English: [README.md](./README.md).

## 里面有什么

| 路径 | 用途 |
|------|------|
| `_layouts/` `_includes/` `_sass/` `assets/` | 主题（可 `remote_theme` / gem） |
| `bin/mnblog` | `init` · `new` · `check` · `publish` · `serve` · `editor` |
| `example/` | 最小演示站 + 一篇样例文 |
| `editor/` | 本地给人点的编辑页；发布仍走 CLI |
| `AGENTS.md` · `skills/mnblog/` | 给编程 agent 的约定 |

协议：**Apache-2.0**。

## 快速开始

```bash
git clone https://github.com/miniLV/mnblog.git
cd mnblog
./bin/mnblog init ../my-blog
cd ../my-blog
# 改 _config.yml
bundle install
bundle exec jekyll serve
```

### Agent 主路径

```text
mnblog new "标题" --tags notes,dev
# 改 _posts/YYYY-MM-DD-slug.md
mnblog check
mnblog publish -m "post: 标题"
```

GitHub 只用 **`gh` / git / API**，不要用浏览器自动化 github.com。

## `remote_theme`

```yaml
remote_theme: miniLV/mnblog
plugins:
  - jekyll-remote-theme
  - jekyll-paginate
  - jekyll-sitemap
```

自己的文章和 `_config.yml` 身份字段留在站点仓。`mnblog init` 默认会把主题文件拷进新站点，方便离线 `jekyll serve`。

## 文章 front matter

见 [AGENTS.md](./AGENTS.md)。文件名：`_posts/YYYY-MM-DD-slug.md`。

## 编辑器

```bash
./bin/mnblog editor
```

v0.1：Chromium 下可选文件夹、改 `_posts`、保存。发布请另开终端跑 `mnblog publish`。

## 观感

浅色象牙底 + clay；深色暖褐黑。字体 Source Sans 3 / Source Serif 4 / JetBrains Mono。配色受 Claude.ai 一类产品站启发，本主题与 Anthropic 无官方关系。

## 状态

**v0.1.0** — 主题抽取 + CLI + example + 编辑器雏形。把 `miniLV.github.io` 迁到消费本主题是后续工作，本仓库发布不包含迁移。

## 许可

Apache-2.0，见 [LICENSE](./LICENSE)。
