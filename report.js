// AEO Dedicated Report Page Controller (report.js)
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = (urlParams.get("d") || urlParams.get("domain") || "").trim();
  const refreshParam = urlParams.get("refresh") === "true";

  if (!domainParam) {
    window.location.href = "/";
    return;
  }

  const cleanDomain = domainParam.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // DOM Elements
  const navDomainBadge = document.getElementById("nav-domain-badge");
  const navCacheTag = document.getElementById("nav-cache-tag");
  const rerunBtn = document.getElementById("rerun-btn");
  const stepperCard = document.getElementById("stepper-card");
  const stepperTitle = document.getElementById("stepper-title");
  const stepperSubtitle = document.getElementById("stepper-subtitle");
  const reportResults = document.getElementById("report-results");
  const reportError = document.getElementById("report-error");
  const errorMessage = document.getElementById("error-message");

  const targetDomain = document.getElementById("target-domain");
  const targetMeta = document.getElementById("target-meta");
  const scoreNum = document.getElementById("score-num");
  const scoreBandBadge = document.getElementById("score-band-badge");
  const pillarsList = document.getElementById("pillars-list");
  const enginesGrid = document.getElementById("engines-grid");
  const queriesList = document.getElementById("queries-list");
  const fixesList = document.getElementById("fixes-list");
  const competitorChips = document.getElementById("competitor-chips");
  const downloadPlanBtn = document.getElementById("download-plan-btn");

  if (navDomainBadge) navDomainBadge.textContent = cleanDomain;
  if (targetDomain) targetDomain.textContent = cleanDomain;

  // Re-run handler
  rerunBtn?.addEventListener("click", () => {
    window.location.href = `report.html?d=${encodeURIComponent(cleanDomain)}&refresh=true`;
  });

  // Download plan handler
  downloadPlanBtn?.addEventListener("click", () => {
    window.location.href = `/aeo/${encodeURIComponent(cleanDomain)}/plan.md`;
  });

  // ── Render Helpers ───────────────────────────────────────────────────────
  function renderScore(score) {
    if (!score) return;
    if (scoreNum) scoreNum.textContent = score.total || 0;
    if (scoreBandBadge) {
      scoreBandBadge.textContent = `GRADE ${score.band || "B"}`;
    }

    if (pillarsList && score.pillars) {
      pillarsList.innerHTML = score.pillars.map(p => {
        const pct = Math.round((p.score / p.max) * 100);
        return `
          <div class="pillar-row">
            <div class="pillar-meta">
              <span class="pillar-name">${p.name}</span>
              <span class="pillar-score-text">${p.score}/${p.max} (${pct}%)</span>
            </div>
            <div class="pillar-track">
              <div class="pillar-fill" style="width: ${pct}%"></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  const engineState = {};
  function renderEngine(eng) {
    engineState[eng.engine] = eng;
    if (!enginesGrid) return;

    const names = {
      chatgpt: "ChatGPT",
      claude: "Claude",
      gemini: "Gemini",
      grok: "Grok",
      perplexity: "Perplexity"
    };

    enginesGrid.innerHTML = Object.values(engineState).map(e => `
      <div class="engine-card">
        <div class="engine-card-header">
          <span class="engine-name">${names[e.engine] || e.engine}</span>
          <span class="engine-band">Band ${e.band}</span>
        </div>
        <div class="engine-stat-row">
          <span>Brand Mention:</span>
          <span class="engine-stat-val">${e.mentionRate}%</span>
        </div>
        <div class="engine-stat-row">
          <span>Direct Citation:</span>
          <span class="engine-stat-val">${e.citationRate}%</span>
        </div>
      </div>
    `).join("");
  }

  function renderQueries(queries) {
    if (!queriesList || !queries) return;
    queriesList.innerHTML = queries.map(q => {
      const text = typeof q === "string" ? q : (q.query || "");
      return `
        <span class="query-chip">
          <span class="query-chip-dot"></span>
          ${text}
        </span>
      `;
    }).join("");
  }

  function renderFixes(fixes) {
    if (!fixesList || !fixes) return;
    fixesList.innerHTML = fixes.map((fix, idx) => `
      <div class="fix-card">
        <div class="fix-card-header">
          <span class="severity-badge severity-${fix.severity}">${fix.severity}</span>
          <h3 class="fix-card-title">${fix.title}</h3>
        </div>
        <p class="fix-desc">${fix.description}</p>
        <div class="code-container">
          <span class="code-target-file">${fix.filename}</span>
          <button type="button" class="code-copy-btn" data-code-idx="${idx}">Copy</button>
          <pre class="code-block"><code>${escapeHtml(fix.code)}</code></pre>
        </div>
      </div>
    `).join("");

    // Wire copy buttons
    document.querySelectorAll(".code-copy-btn").forEach(btn => {
      btn.addEventListener("click", function() {
        const idx = this.getAttribute("data-code-idx");
        const code = fixes[idx]?.code;
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            this.textContent = "Copied!";
            setTimeout(() => { this.textContent = "Copy"; }, 2000);
          });
        }
      });
    });
  }

  function renderCompetitors(brands) {
    if (!competitorChips || !brands) return;
    competitorChips.innerHTML = brands.map(b => `
      <span class="comp-chip">
        ${b.name}
        <span class="comp-count">${b.queryCount}x</span>
      </span>
    `).join("");
  }

  function escapeHtml(str) {
    return (str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ── Cache Check or Live Run ───────────────────────────────────────────────
  async function init() {
    if (!refreshParam) {
      try {
        const res = await fetch(`/aeo/${encodeURIComponent(cleanDomain)}`);
        if (res.ok) {
          const cached = await res.json();
          navCacheTag?.classList.remove("is-hidden");
          renderScore(cached.score);
          if (cached.engineResults) cached.engineResults.forEach(renderEngine);
          if (cached.queries) renderQueries(cached.queries);
          if (cached.fixes) renderFixes(cached.fixes);
          if (cached.also_cited) renderCompetitors(cached.also_cited);
          
          stepperCard?.classList.add("is-hidden");
          reportResults?.classList.remove("is-hidden");
          return;
        }
      } catch (e) {
        // Cache miss -> proceed to live run
      }
    }

    // Run Live SSE
    stepperCard?.classList.remove("is-hidden");
    reportResults?.classList.remove("is-hidden");

    try {
      const linkupKey = sessionStorage.getItem("AEO_LINKUP_KEY") || "";
      const res = await fetch("/aeo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: cleanDomain, linkupKey })
      });

      if (!res.ok) throw new Error("HTTP error " + res.status);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep last incomplete line

        let currentEvent = null;
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ") && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              handleSSE(currentEvent, data);
            } catch (e) {}
            currentEvent = null;
          }
        }
      }

      stepperCard?.classList.add("is-hidden");
    } catch (err) {
      stepperCard?.classList.add("is-hidden");
      if (reportError) {
        reportError.classList.remove("is-hidden");
        if (errorMessage) errorMessage.textContent = err.message || "Assessment stream failed";
      }
    }
  }

  function handleSSE(event, data) {
    switch (event) {
      case "stage":
        if (stepperTitle) stepperTitle.textContent = `Stage 0${data.stage}: ${data.text}`;
        break;
      case "score":
        renderScore(data);
        break;
      case "engine":
        renderEngine(data);
        break;
      case "queries":
        renderQueries(data.queries);
        break;
      case "fixes":
        renderFixes(data.fixes);
        break;
      case "also_cited":
        renderCompetitors(data.brands);
        break;
      case "done":
        stepperCard?.classList.add("is-hidden");
        break;
    }
  }

  init();
})();
