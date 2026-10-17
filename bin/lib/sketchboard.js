"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function commandExists(name) {
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) return null;
  const r = spawnSync("sh", ["-c", `command -v ${name}`], { encoding: "utf8" });
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  return null;
}

function skillRoot(ROOT, site) {
  const local = path.join(site, "skills", "sketchboard-diagram");
  if (fs.existsSync(path.join(local, "SKILL.md"))) return local;
  const pkg = path.join(ROOT, "skills", "sketchboard-diagram");
  if (fs.existsSync(path.join(pkg, "SKILL.md"))) return pkg;
  return null;
}

function templateForKind(kind) {
  return (
    {
      cover: "examples/templates/cover.html",
      architecture: "examples/templates/architecture.html",
      flow: "examples/templates/flow.html",
      flywheel: "examples/templates/flywheel.html",
    }[kind] || null
  );
}

function fillPlaceholders(html, fields) {
  let out = html;
  for (const [k, v] of Object.entries(fields)) out = out.split(k).join(v);
  return out;
}

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  return (
    commandExists("google-chrome") ||
    commandExists("chromium") ||
    commandExists("chromium-browser") ||
    null
  );
}

function tryRenderPng(skillDir, htmlPath, pngPath) {
  const script = path.join(skillDir, "scripts", "render-html-to-png.mjs");
  if (!fs.existsSync(script)) {
    return { ok: false, reason: `render script missing: ${script}` };
  }
  const chrome = findChrome();
  if (!chrome) {
    return {
      ok: false,
      reason:
        "Chrome/Chromium not found. Set CHROME_PATH or install google-chrome / chromium.",
    };
  }
  const env = { ...process.env, CHROME_PATH: chrome };
  fs.mkdirSync(path.dirname(pngPath), { recursive: true });
  const r = spawnSync(
    process.execPath,
    [script, htmlPath, pngPath, "--skip-geometry-validation"],
    { encoding: "utf8", env }
  );
  if (r.status !== 0 || !fs.existsSync(pngPath)) {
    const err = (r.stderr || r.stdout || "")
      .trim()
      .split("\n")
      .slice(-8)
      .join("\n");
    return { ok: false, reason: err || `render failed (exit ${r.status})` };
  }
  return { ok: true, chrome };
}

function agentPromptForDiagram({ kind, description, htmlRel, pngRel, skillRel }) {
  return [
    `Use the sketchboard-diagram skill (${skillRel}/SKILL.md).`,
    `Kind: ${kind}. Description: ${description}`,
    `Edit ${htmlRel} (scaffolded from the template) — replace placeholder labels, keep grid-paper style and one explicit .page size.`,
    `Validate then export:`,
    `  node ${skillRel}/scripts/validate-html-geometry.mjs ${htmlRel}`,
    `  node ${skillRel}/scripts/render-html-to-png.mjs ${htmlRel} ${pngRel}`,
    `Do not invent stock photos. Prefer this PNG in the post (cover_image or Markdown image).`,
  ].join("\n");
}

function posixRel(from, to) {
  return path.relative(from, to).split(path.sep).join("/");
}

function cmdDraw(ctx) {
  const { ROOT, site, flags, description, slugify, die } = ctx;
  const kind = (flags.kind || "architecture").toLowerCase();
  const tplRel = templateForKind(kind);
  if (!tplRel) die(`unknown --kind ${kind} (use cover|architecture|flow|flywheel)`);

  const skillDir = skillRoot(ROOT, site);
  if (!skillDir) {
    die(
      "sketchboard-diagram skill not found. Use an mnblog package that vendors skills/sketchboard-diagram/, or run mnblog init."
    );
  }

  const slug = slugify(description);
  const defaultHtml =
    kind === "cover"
      ? path.join(site, "_diagrams", `cover-${slug}.html`)
      : path.join(site, "_diagrams", `${kind}-${slug}.html`);
  const defaultPng =
    kind === "cover"
      ? path.join(site, "assets", "img", "covers", `cover-${slug}.png`)
      : path.join(site, "assets", "img", "diagrams", `${slug}.png`);

  let htmlPath = defaultHtml;
  let outPng = flags.out ? path.resolve(site, flags.out) : defaultPng;
  if (flags.out && String(flags.out).endsWith(".html")) {
    htmlPath = path.resolve(site, flags.out);
    outPng = path.resolve(site, String(flags.out).replace(/\.html$/i, ".png"));
  }

  if (fs.existsSync(htmlPath) && !flags.force) {
    process.stdout.write(`html exists (use --force to overwrite): ${htmlPath}\n`);
  } else {
    const tplPath = path.join(skillDir, tplRel);
    if (!fs.existsSync(tplPath)) die(`template missing: ${tplPath}`);
    let html = fs.readFileSync(tplPath, "utf8");
    html = fillPlaceholders(html, {
      __TITLE__: description,
      __SUBTITLE__:
        kind === "cover"
          ? "Sketchboard cover for mnblog — edit labels, then render PNG."
          : `Scaffolded ${kind} diagram — edit cards/connectors per SKILL.md, then render.`,
      __KICKER__: `mnblog · ${kind}`,
      __STEP1__: "Start",
      __STEP2__: "Middle",
      __STEP3__: "Done",
    });
    if (!html.includes(description) && kind !== "cover" && kind !== "flow") {
      html = html.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${description.replace(/[<>]/g, "")}</title>`
      );
    }
    fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
    fs.writeFileSync(htmlPath, html, "utf8");
    process.stdout.write(`wrote ${htmlPath}\n`);
  }

  const htmlRel = posixRel(site, htmlPath) || htmlPath;
  const pngRel = posixRel(site, outPng) || outPng;
  const skillRel = posixRel(site, skillDir) || skillDir;
  const prompt = agentPromptForDiagram({
    kind,
    description,
    htmlRel,
    pngRel,
    skillRel,
  });

  if (flags.noRender) {
    process.stdout.write(`\n[no-render] agent prompt:\n${prompt}\n`);
    return { htmlPath, outPng, prompt };
  }

  if (fs.existsSync(outPng) && !flags.force) {
    process.stdout.write(`png exists (use --force): ${outPng}\n`);
    process.stdout.write(`agent prompt (refine HTML then re-render):\n${prompt}\n`);
    return { htmlPath, outPng, prompt };
  }

  const rendered = tryRenderPng(skillDir, htmlPath, outPng);
  if (rendered.ok) {
    process.stdout.write(`rendered ${outPng}\n`);
    if (kind === "cover") {
      process.stdout.write(`\nfront matter:\ncover_image: /${pngRel}\n`);
    } else {
      process.stdout.write(
        `\nmarkdown:\n![${description}](/${pngRel})\n`
      );
    }
    process.stdout.write(`\nTip: refine geometry with the agent using:\n${prompt}\n`);
  } else {
    process.stdout.write(
      `render skipped: ${rendered.reason}\n` +
        `HTML is ready; finish with a local agent + Chrome, or copy a pattern PNG from\n` +
        `  ${path.join(skillRel, "docs/patterns/")}\n\n` +
        `agent prompt:\n${prompt}\n`
    );
  }
  return { htmlPath, outPng, prompt, rendered };
}

function cmdCover(ctx) {
  return cmdDraw({ ...ctx, flags: { ...ctx.flags, kind: "cover" } });
}

module.exports = {
  skillRoot,
  cmdDraw,
  cmdCover,
  tryRenderPng,
  findChrome,
};
