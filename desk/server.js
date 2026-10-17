#!/usr/bin/env node
/**
 * mnblog Desk — local zero-dep HTTP server (bind 127.0.0.1 only).
 * Serves the three-pane UI and APIs for posts + one-shot agent turns.
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { URL } = require("url");

const DESK_ROOT = __dirname;
const PUBLIC = path.join(DESK_ROOT, "public");
const VERSION = "0.3.0";

function die(msg, code = 1) {
  process.stderr.write(`mnblog desk: ${msg}\n`);
  process.exit(code);
}

function commandExists(name) {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return null;
  const r = spawnSync("sh", ["-c", `command -v ${name}`], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  return null;
}

function readConfigTitle(siteRoot) {
  const cfg = path.join(siteRoot, "_config.yml");
  if (!fs.existsSync(cfg)) return null;
  const text = fs.readFileSync(cfg, "utf8");
  const m = text.match(/^title:\s*["']?([^"'#\n]+)/m);
  return m ? m[1].trim() : null;
}

function extractTitle(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const m = fm[1].match(/^title:\s*(.+)$/m);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

/** Resolve a relative post path under site; reject traversal. */
function safePostPath(siteRoot, rel) {
  if (!rel || typeof rel !== "string") return null;
  const normalized = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (normalized.includes("\0") || normalized.includes("..")) return null;
  if (!/^(?:_posts|_drafts)\//.test(normalized)) return null;
  if (!/\.md$/i.test(normalized)) return null;
  const abs = path.resolve(siteRoot, normalized);
  const posts = path.resolve(siteRoot, "_posts");
  const drafts = path.resolve(siteRoot, "_drafts");
  if (!(abs.startsWith(posts + path.sep) || abs.startsWith(drafts + path.sep) || abs === posts || abs === drafts)) {
    return null;
  }
  return { abs, rel: normalized };
}

function listPosts(siteRoot) {
  const out = [];
  for (const kind of ["_posts", "_drafts"]) {
    const dir = path.join(siteRoot, kind);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".md")) continue;
      const abs = path.join(dir, name);
      let st;
      try {
        st = fs.statSync(abs);
      } catch (_) {
        continue;
      }
      if (!st.isFile()) continue;
      let title = null;
      try {
        title = extractTitle(fs.readFileSync(abs, "utf8"));
      } catch (_) {
        /* ignore */
      }
      out.push({
        path: `${kind}/${name}`,
        name,
        kind: kind === "_posts" ? "post" : "draft",
        title: title || name,
        mtime: st.mtimeMs,
      });
    }
  }
  out.sort((a, b) => b.mtime - a.mtime);
  return out;
}

function mime(filePath) {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function readBody(req, limit = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error("body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function resolveAgent(preference) {
  const claude = commandExists("claude");
  const codex = commandExists("codex");
  const want = preference || "auto";
  if (want === "claude") {
    if (!claude) return { error: "claude not found on PATH" };
    return { name: "claude", bin: claude };
  }
  if (want === "codex") {
    if (!codex) return { error: "codex not found on PATH" };
    return { name: "codex", bin: codex };
  }
  if (claude) return { name: "claude", bin: claude };
  if (codex) return { name: "codex", bin: codex };
  return {
    error:
      "neither claude nor codex found on PATH. Install Claude Code and/or Codex CLI. mnblog does not store API keys.",
  };
}

function agentAvailability() {
  return {
    claude: Boolean(commandExists("claude")),
    codex: Boolean(commandExists("codex")),
  };
}

function buildAskPrompt({ siteRoot, message, filePath, fileContent, history }) {
  const parts = [
    "You are helping edit a Jekyll blog that uses the mnblog theme (warm ivory / clay).",
    `Site root: ${siteRoot}`,
    "Follow AGENTS.md and skills/mnblog/SKILL.md in this directory.",
    "Prefer editing Markdown under _posts/ or _drafts/. Do not invent image URLs.",
    "Do not open GitHub in a browser — use gh / git when publishing is requested.",
    "This turn is a one-shot CLI invocation (no persistent agent session). Be concrete.",
  ];
  if (filePath) {
    parts.push(`Current open file: ${filePath}`);
    if (fileContent != null && fileContent.length < 80000) {
      parts.push("----- begin current file -----");
      parts.push(fileContent);
      parts.push("----- end current file -----");
    }
  }
  if (Array.isArray(history) && history.length) {
    parts.push("Recent chat (for context only; answer the latest user message):");
    for (const turn of history.slice(-8)) {
      if (!turn || !turn.role || !turn.text) continue;
      parts.push(`${turn.role}: ${String(turn.text).slice(0, 4000)}`);
    }
  }
  parts.push("User request:");
  parts.push(String(message || "").trim());
  return parts.join("\n\n");
}

function createServer(siteRoot, opts = {}) {
  const packageRoot = opts.packageRoot || path.resolve(DESK_ROOT, "..");

  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res, siteRoot, packageRoot);
    } catch (err) {
      if (!res.headersSent) {
        sendJson(res, 500, { error: String(err && err.message ? err.message : err) });
      } else {
        try {
          res.end();
        } catch (_) {
          /* ignore */
        }
      }
    }
  });
  return server;
}

async function handle(req, res, siteRoot, packageRoot) {
  const host = "127.0.0.1";
  const u = new URL(req.url || "/", `http://${host}`);
  const method = req.method || "GET";

  // Static UI
  if (method === "GET" && (u.pathname === "/" || u.pathname === "/index.html")) {
    return serveFile(res, path.join(PUBLIC, "index.html"));
  }
  if (method === "GET" && u.pathname.startsWith("/static/")) {
    const name = path.basename(u.pathname);
    if (!name || name.includes("..")) {
      sendJson(res, 400, { error: "bad path" });
      return;
    }
    return serveFile(res, path.join(PUBLIC, name));
  }

  if (u.pathname === "/api/health" && method === "GET") {
    sendJson(res, 200, { ok: true, version: VERSION });
    return;
  }

  if (u.pathname === "/api/site" && method === "GET") {
    const agents = agentAvailability();
    sendJson(res, 200, {
      version: VERSION,
      siteRoot,
      title: readConfigTitle(siteRoot) || path.basename(siteRoot),
      agents,
      preferred: agents.claude ? "claude" : agents.codex ? "codex" : null,
      limits: {
        chat: "one-shot",
        note:
          "Each chat send spawns a fresh `claude -p` or `codex exec`. No persistent multi-turn agent state inside mnblog.",
      },
    });
    return;
  }

  if (u.pathname === "/api/posts" && method === "GET") {
    sendJson(res, 200, { posts: listPosts(siteRoot) });
    return;
  }

  if (u.pathname === "/api/file" && method === "GET") {
    const safe = safePostPath(siteRoot, u.searchParams.get("path"));
    if (!safe) {
      sendJson(res, 400, { error: "path must be under _posts/ or _drafts/ and end with .md" });
      return;
    }
    if (!fs.existsSync(safe.abs)) {
      sendJson(res, 404, { error: "not found" });
      return;
    }
    const content = fs.readFileSync(safe.abs, "utf8");
    sendJson(res, 200, { path: safe.rel, content });
    return;
  }

  if (u.pathname === "/api/file" && method === "PUT") {
    const raw = await readBody(req);
    let body;
    try {
      body = JSON.parse(raw);
    } catch (_) {
      sendJson(res, 400, { error: "invalid JSON" });
      return;
    }
    const safe = safePostPath(siteRoot, body.path);
    if (!safe) {
      sendJson(res, 400, { error: "path must be under _posts/ or _drafts/ and end with .md" });
      return;
    }
    if (typeof body.content !== "string") {
      sendJson(res, 400, { error: "content string required" });
      return;
    }
    fs.mkdirSync(path.dirname(safe.abs), { recursive: true });
    fs.writeFileSync(safe.abs, body.content, "utf8");
    sendJson(res, 200, { ok: true, path: safe.rel, bytes: Buffer.byteLength(body.content) });
    return;
  }

  if (u.pathname === "/api/publish" && method === "POST") {
    const raw = await readBody(req);
    let body;
    try {
      body = JSON.parse(raw || "{}");
    } catch (_) {
      sendJson(res, 400, { error: "invalid JSON" });
      return;
    }
    if (!body.confirm) {
      sendJson(res, 400, { error: "set confirm:true to publish" });
      return;
    }
    const message =
      (body.message && String(body.message).trim()) ||
      `content: update ${new Date().toISOString().slice(0, 10)}`;
    const dryRun = Boolean(body.dryRun);
    const cli = path.join(packageRoot, "bin", "mnblog");
    const args = ["publish", "-m", message];
    if (dryRun) args.push("--dry-run");
    const r = spawnSync(process.execPath, [cli, ...args], {
      cwd: siteRoot,
      encoding: "utf8",
      env: process.env,
    });
    sendJson(res, r.status === 0 ? 200 : 500, {
      ok: r.status === 0,
      status: r.status,
      stdout: r.stdout || "",
      stderr: r.stderr || "",
      dryRun,
      message,
    });
    return;
  }

  if (u.pathname === "/api/ask" && method === "POST") {
    const raw = await readBody(req, 512 * 1024);
    let body;
    try {
      body = JSON.parse(raw);
    } catch (_) {
      sendJson(res, 400, { error: "invalid JSON" });
      return;
    }
    const message = String(body.message || "").trim();
    if (!message) {
      sendJson(res, 400, { error: "message required" });
      return;
    }
    const agent = resolveAgent(body.agent || "auto");
    if (agent.error) {
      sendJson(res, 400, { error: agent.error });
      return;
    }

    let fileContent = null;
    let filePath = null;
    if (body.path) {
      const safe = safePostPath(siteRoot, body.path);
      if (!safe) {
        sendJson(res, 400, { error: "bad path" });
        return;
      }
      filePath = safe.rel;
      if (typeof body.fileContent === "string") {
        fileContent = body.fileContent;
      } else if (fs.existsSync(safe.abs)) {
        fileContent = fs.readFileSync(safe.abs, "utf8");
      }
    }

    const prompt = buildAskPrompt({
      siteRoot,
      message,
      filePath,
      fileContent,
      history: body.history,
    });

    const args =
      agent.name === "claude" ? ["-p", prompt] : ["exec", prompt];

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });

    const writeEvent = (obj) => {
      res.write(`data: ${JSON.stringify(obj)}\n\n`);
    };

    writeEvent({
      type: "meta",
      agent: agent.name,
      bin: agent.bin,
      mode: "one-shot",
      filePath,
    });

    const child = spawn(agent.bin, args, {
      cwd: siteRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let closed = false;
    const finish = (code) => {
      if (closed) return;
      closed = true;
      writeEvent({ type: "done", code: code == null ? 1 : code });
      res.end();
    };

    child.stdout.on("data", (buf) => {
      writeEvent({ type: "chunk", stream: "stdout", text: buf.toString("utf8") });
    });
    child.stderr.on("data", (buf) => {
      writeEvent({ type: "chunk", stream: "stderr", text: buf.toString("utf8") });
    });
    child.on("error", (err) => {
      writeEvent({ type: "error", message: err.message });
      finish(1);
    });
    child.on("close", (code) => finish(code));

    req.on("close", () => {
      if (!closed) {
        try {
          child.kill("SIGTERM");
        } catch (_) {
          /* ignore */
        }
      }
    });
    return;
  }

  sendJson(res, 404, { error: "not found" });
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath)) {
    sendJson(res, 404, { error: "missing static file" });
    return;
  }
  const data = fs.readFileSync(filePath);
  res.writeHead(200, {
    "Content-Type": mime(filePath),
    "Content-Length": data.length,
    "Cache-Control": "no-store",
  });
  res.end(data);
}

function parseArgs(argv) {
  const out = { port: Number(process.env.MNBLOG_DESK_PORT || 4177), site: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--port") out.port = Number(argv[++i]);
    else if (a.startsWith("--port=")) out.port = Number(a.slice(7));
    else if (a === "--site") out.site = argv[++i];
    else if (a.startsWith("--site=")) out.site = a.slice(7);
    else if (a === "--help" || a === "-h") {
      process.stdout.write(
        "Usage: node desk/server.js [--port 4177] [--site /path/to/blog]\n"
      );
      process.exit(0);
    }
  }
  if (!Number.isFinite(out.port) || out.port < 1 || out.port > 65535) {
    die("bad --port");
  }
  return out;
}

function findBlogSiteRoot(start) {
  let dir = path.resolve(start || process.cwd());
  for (;;) {
    if (
      fs.existsSync(path.join(dir, "_config.yml")) &&
      fs.existsSync(path.join(dir, "_posts"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      die(
        "no blog site found (need _config.yml + _posts/). Run from a site created by `mnblog init`."
      );
    }
    dir = parent;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const siteRoot = args.site
    ? path.resolve(args.site)
    : findBlogSiteRoot(process.cwd());
  if (
    !fs.existsSync(path.join(siteRoot, "_config.yml")) ||
    !fs.existsSync(path.join(siteRoot, "_posts"))
  ) {
    die(`not a blog site: ${siteRoot}`);
  }

  const server = createServer(siteRoot, {
    packageRoot: path.resolve(DESK_ROOT, ".."),
  });
  server.listen(args.port, "127.0.0.1", () => {
    process.stdout.write(
      `mnblog Desk ${VERSION}\n` +
        `  site:  ${siteRoot}\n` +
        `  open:  http://127.0.0.1:${args.port}/\n` +
        `  chat:  one-shot via local claude -p / codex exec (no API keys in mnblog)\n` +
        `  stop:  Ctrl+C\n`
    );
  });
  server.on("error", (err) => {
    die(err.message);
  });
}

if (require.main === module) {
  main();
}

module.exports = { createServer, VERSION, safePostPath, listPosts };
