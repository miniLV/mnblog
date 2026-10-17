(function () {
  "use strict";

  var state = {
    posts: [],
    filter: "all",
    currentPath: null,
    content: "",
    savedContent: "",
    history: [],
    abort: null,
    preview: false,
  };

  var el = {
    title: document.getElementById("site-title"),
    path: document.getElementById("site-path"),
    list: document.getElementById("post-list"),
    listHint: document.getElementById("list-hint"),
    editor: document.getElementById("editor"),
    preview: document.getElementById("preview"),
    currentPath: document.getElementById("current-path"),
    dirty: document.getElementById("dirty-dot"),
    agentPick: document.getElementById("agent-pick"),
    agentBadge: document.getElementById("agent-badge"),
    limitNote: document.getElementById("limit-note"),
    chatLog: document.getElementById("chat-log"),
    chatInput: document.getElementById("chat-input"),
    chatForm: document.getElementById("chat-form"),
    btnSend: document.getElementById("btn-send"),
    btnStop: document.getElementById("btn-stop"),
    btnSave: document.getElementById("btn-save"),
    btnPublish: document.getElementById("btn-publish"),
    btnPreview: document.getElementById("btn-preview"),
    btnTheme: document.getElementById("btn-theme"),
    btnRefresh: document.getElementById("btn-refresh"),
    toast: document.getElementById("toast"),
    dialog: document.getElementById("publish-dialog"),
    publishMsg: document.getElementById("publish-message"),
    publishDry: document.getElementById("publish-dry"),
    publishOut: document.getElementById("publish-out"),
    publishForm: document.getElementById("publish-form"),
    editorPane: document.querySelector(".editor-pane"),
  };

  function toast(msg, isErr) {
    el.toast.textContent = msg;
    el.toast.classList.toggle("err", !!isErr);
    el.toast.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.toast.classList.add("hidden");
    }, 2800);
  }

  function setTheme(next) {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("mnblog-desk-theme", next);
    } catch (e) {}
  }

  try {
    if (location.hash === "#dark") setTheme("dark");
    else if (location.hash === "#light") setTheme("light");
    else {
      var stored = localStorage.getItem("mnblog-desk-theme");
      if (stored === "dark" || stored === "light") setTheme(stored);
      else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    }
  } catch (e) {}

  function isDirty() {
    return state.currentPath && state.content !== state.savedContent;
  }

  function syncDirty() {
    el.dirty.classList.toggle("hidden", !isDirty());
    el.btnSave.disabled = !state.currentPath || !isDirty();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  /** Minimal markdown → HTML for preview (not a full parser). */
  function simpleMarkdown(md) {
    var text = String(md || "");
    // strip front matter for preview body feel, but keep a note
    var body = text;
    var fm = "";
    if (text.startsWith("---")) {
      var end = text.indexOf("\n---", 3);
      if (end > 0) {
        fm = text.slice(0, end + 4);
        body = text.slice(end + 4).replace(/^\s+/, "");
      }
    }
    var html = escapeHtml(body)
      .replace(/^###### (.+)$/gm, "<h6>$1</h6>")
      .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
      .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    var head = fm
      ? '<p class="muted" style="font-family:var(--mono);font-size:0.75rem">front matter present · full Jekyll preview: <code>mnblog serve</code></p>'
      : "";
    return head + "<p>" + html + "</p>";
  }

  function renderPreview() {
    if (!state.preview) return;
    el.preview.innerHTML = simpleMarkdown(state.content);
  }

  function appendBubble(role, text, extraClass) {
    var div = document.createElement("div");
    div.className = "bubble " + (extraClass || role);
    var roleEl = document.createElement("span");
    roleEl.className = "role";
    roleEl.textContent = role;
    div.appendChild(roleEl);
    var body = document.createElement("div");
    body.textContent = text;
    div.appendChild(body);
    el.chatLog.appendChild(div);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;
    return body;
  }

  function renderList() {
    el.list.innerHTML = "";
    var items = state.posts.filter(function (p) {
      if (state.filter === "all") return true;
      return p.kind === state.filter;
    });
    if (!items.length) {
      el.listHint.textContent = "No posts yet. Run: mnblog new \"Title\"";
      el.listHint.classList.remove("hidden");
      return;
    }
    el.listHint.classList.add("hidden");
    items.forEach(function (p) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      if (p.path === state.currentPath) b.className = "active";
      b.innerHTML =
        '<span class="title"></span><span class="meta"></span>';
      b.querySelector(".title").textContent = p.title;
      b.querySelector(".meta").textContent =
        (p.kind === "draft" ? "draft · " : "") + p.name;
      b.addEventListener("click", function () {
        openPost(p.path);
      });
      li.appendChild(b);
      el.list.appendChild(li);
    });
  }

  async function api(path, opts) {
    var res = await fetch(path, opts);
    var data = null;
    var ct = res.headers.get("content-type") || "";
    if (ct.indexOf("application/json") >= 0) {
      data = await res.json();
    } else {
      data = await res.text();
    }
    if (!res.ok) {
      var err = (data && data.error) || res.statusText || "request failed";
      throw new Error(err);
    }
    return data;
  }

  async function loadSite() {
    var site = await api("/api/site");
    el.title.textContent = site.title || "mnblog Desk";
    el.path.textContent = site.siteRoot;
    el.limitNote.textContent =
      (site.limits && site.limits.note) ||
      "Each send is a one-shot local CLI turn.";
    el.agentBadge.textContent = (site.limits && site.limits.chat) || "one-shot";
    if (site.preferred) el.agentPick.value = "auto";
    if (!site.agents.claude && !site.agents.codex) {
      appendBubble(
        "system",
        "Neither `claude` nor `codex` is on PATH. Install Claude Code and/or Codex CLI, then refresh. List/edit/save still work.",
        "system"
      );
    } else {
      var avail = [];
      if (site.agents.claude) avail.push("claude");
      if (site.agents.codex) avail.push("codex");
      appendBubble(
        "system",
        "Desk ready · agents: " + avail.join(", ") + " · chat is one-shot per send.",
        "system"
      );
    }
  }

  async function loadPosts() {
    var data = await api("/api/posts");
    state.posts = data.posts || [];
    renderList();
  }

  async function openPost(relPath) {
    if (isDirty() && !confirm("Discard unsaved changes?")) return;
    var data = await api("/api/file?path=" + encodeURIComponent(relPath));
    state.currentPath = data.path;
    state.content = data.content;
    state.savedContent = data.content;
    el.editor.value = data.content;
    el.currentPath.textContent = data.path;
    el.editor.disabled = false;
    syncDirty();
    renderList();
    renderPreview();
  }

  async function savePost() {
    if (!state.currentPath) return;
    await api("/api/file", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: state.currentPath, content: state.content }),
    });
    state.savedContent = state.content;
    syncDirty();
    toast("Saved " + state.currentPath);
    await loadPosts();
  }

  async function sendChat(ev) {
    if (ev) ev.preventDefault();
    var message = el.chatInput.value.trim();
    if (!message) return;
    if (state.abort) return;

    el.chatInput.value = "";
    state.history.push({ role: "user", text: message });
    appendBubble("you", message, "user");

    var agentBody = document.createElement("div");
    var bubble = document.createElement("div");
    bubble.className = "bubble agent";
    var roleEl = document.createElement("span");
    roleEl.className = "role";
    roleEl.textContent = "agent";
    bubble.appendChild(roleEl);
    bubble.appendChild(agentBody);
    agentBody.textContent = "…";
    el.chatLog.appendChild(bubble);
    el.chatLog.scrollTop = el.chatLog.scrollHeight;

    el.btnSend.disabled = true;
    el.btnStop.disabled = false;

    var controller = new AbortController();
    state.abort = controller;
    var acc = "";

    try {
      var res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: message,
          agent: el.agentPick.value,
          path: state.currentPath,
          fileContent: state.content,
          history: state.history.slice(0, -1),
        }),
      });

      if (!res.ok) {
        var errJson = null;
        try {
          errJson = await res.json();
        } catch (e) {}
        throw new Error((errJson && errJson.error) || res.statusText);
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      agentBody.textContent = "";

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (var i = 0; i < parts.length; i++) {
          var line = parts[i].trim();
          if (!line.startsWith("data:")) continue;
          var payload = line.slice(5).trim();
          var evt;
          try {
            evt = JSON.parse(payload);
          } catch (e) {
            continue;
          }
          if (evt.type === "meta") {
            roleEl.textContent = "agent · " + (evt.agent || "") + " · one-shot";
          } else if (evt.type === "chunk" && evt.text) {
            acc += evt.text;
            agentBody.textContent = acc;
            el.chatLog.scrollTop = el.chatLog.scrollHeight;
          } else if (evt.type === "error") {
            acc += (acc ? "\n" : "") + "Error: " + evt.message;
            agentBody.textContent = acc || evt.message;
          } else if (evt.type === "done") {
            if (!acc) agentBody.textContent = "(no output, exit " + evt.code + ")";
          }
        }
      }

      state.history.push({ role: "assistant", text: acc || "(empty)" });
    } catch (err) {
      if (err.name === "AbortError") {
        agentBody.textContent = (acc || "") + "\n[stopped]";
      } else {
        agentBody.textContent = "Error: " + err.message;
        toast(err.message, true);
      }
    } finally {
      state.abort = null;
      el.btnSend.disabled = false;
      el.btnStop.disabled = true;
    }
  }

  function stopChat() {
    if (state.abort) state.abort.abort();
  }

  el.editor.addEventListener("input", function () {
    state.content = el.editor.value;
    syncDirty();
    renderPreview();
  });

  el.btnSave.addEventListener("click", function () {
    savePost().catch(function (e) {
      toast(e.message, true);
    });
  });

  el.btnRefresh.addEventListener("click", function () {
    loadPosts().catch(function (e) {
      toast(e.message, true);
    });
  });

  el.btnTheme.addEventListener("click", function () {
    var cur =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    setTheme(cur === "dark" ? "light" : "dark");
  });

  el.btnPreview.addEventListener("click", function () {
    state.preview = !state.preview;
    el.editorPane.classList.toggle("split", state.preview);
    el.preview.classList.toggle("hidden", !state.preview);
    el.btnPreview.classList.toggle("primary", state.preview);
    el.btnPreview.classList.toggle("ghost", !state.preview);
    renderPreview();
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".chip").forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");
      state.filter = chip.getAttribute("data-filter");
      renderList();
    });
  });

  function sketchPrompt(kind) {
    var title = "this post";
    if (state.content) {
      var m = state.content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
      if (m) title = m[1].trim();
    }
    var pathHint = state.currentPath || "_posts/…";
    if (kind === "cover") {
      return (
        "Use skills/sketchboard-diagram/SKILL.md and mnblog cover workflow.\n" +
        "Generate a homepage cover for: " + title + "\n" +
        "1) Run: mnblog cover " + JSON.stringify(title) + " --force\n" +
        "   (or scaffold HTML under _diagrams/, refine labels, then render-html-to-png.mjs)\n" +
        "2) Set cover_image in " + pathHint + " to the PNG under assets/img/covers/\n" +
        "3) Do not invent stock photos. Prefer sketchboard PNG."
      );
    }
    return (
      "Use skills/sketchboard-diagram/SKILL.md.\n" +
      "Draw an in-post diagram for: " + title + "\n" +
      "1) mnblog draw " + JSON.stringify(title + " architecture") + " --kind architecture --force\n" +
      "   (or --kind flow / flywheel)\n" +
      "2) Insert Markdown image pointing at assets/img/diagrams/…png in " + pathHint + "\n" +
      "3) Keep grid-paper sketchboard style; no stock photos."
    );
  }

  document.querySelectorAll("#sketch-presets .preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-preset");
      el.chatInput.value = sketchPrompt(kind);
      el.chatInput.focus();
    });
  });

  el.chatForm.addEventListener("submit", sendChat);
  el.btnStop.addEventListener("click", stopChat);

  el.chatInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendChat();
    }
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (!el.btnSave.disabled) {
        savePost().catch(function (err) {
          toast(err.message, true);
        });
      }
    }
  });

  el.btnPublish.addEventListener("click", function () {
    el.publishOut.classList.add("hidden");
    el.publishOut.textContent = "";
    el.dialog.showModal();
  });

  el.publishForm.addEventListener("submit", async function (e) {
    var submitter = e.submitter;
    if (!submitter || submitter.value !== "ok") return;
    e.preventDefault();
    try {
      var result = await api("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirm: true,
          message: el.publishMsg.value.trim(),
          dryRun: el.publishDry.checked,
        }),
      });
      el.publishOut.classList.remove("hidden");
      el.publishOut.textContent =
        (result.stdout || "") + (result.stderr || "") +
        (result.ok ? "\n✓ done" : "\n✗ failed");
      toast(result.ok ? (result.dryRun ? "Dry run ok" : "Published") : "Publish failed", !result.ok);
      if (result.ok && !result.dryRun) el.dialog.close();
    } catch (err) {
      el.publishOut.classList.remove("hidden");
      el.publishOut.textContent = err.message;
      toast(err.message, true);
    }
  });

  Promise.all([loadSite(), loadPosts()])
    .then(function () {
      if (state.posts.length) {
        return openPost(state.posts[0].path);
      }
    })
    .catch(function (e) {
      toast(e.message, true);
      appendBubble("system", "Failed to load: " + e.message, "system");
    });
})();
