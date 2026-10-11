// Studio controller: bootstrap, wire panes to the store, top-bar tabs, deep links (?job=&part=&shot=&lib=&insp=).
import { api } from "./api-client.js";
import { actions, emit, store, subscribe } from "./editor-store.js";
import { initExportMenu, renderExportMenu } from "./export-menu.js";
import { esc } from "./format-helpers.js";
import { initInspector, renderInspector } from "./inspector-panel.js";
import { initLibrary, renderLibrary } from "./library-panel.js";
import { initPlayer, renderPlayer } from "./player-controls.js";
import { renderTimeline } from "./timeline-view.js";

const $ = (id) => document.getElementById(id);

function renderTopbar(s) {
  const b = s.boot;
  $("env-chip").textContent = `${b.clip_count} clip · giọng: ${b.eleven_available ? "HuyK (ElevenLabs v4)" : "demo"} · planner: ${b.claude_available ? "Claude" : "offline"}`;
  $("env-chip").className = `chip ${b.eleven_available ? "ok" : "warn"}`;
  if (s.job) {
    const sample = b.samples.find((x) => x.script === s.job.script);
    $("project-title").innerHTML = `<b style="color:var(--ink)">${esc(sample?.title || "Kịch bản tự nhập")}</b> · ${esc(s.job.product_name || "không gắn SKU")}`;
  }
  $("undo-btn").disabled = !s.job?.history?.length || !!s.busy;
  $("busy-chip").classList.toggle("hidden", !s.busy && s.job?.render.status !== "rendering");
  $("busy-chip").textContent = s.busy ? `⏳ ${s.busy}…` : "⏳ đang dựng lại video…";
}

function wireTabs() {
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", async () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t === tab));
    $("tab-studio").classList.toggle("hidden", tab.dataset.tab !== "studio");
    $("tab-models").classList.toggle("hidden", tab.dataset.tab !== "models");
    if (tab.dataset.tab === "models" && !$("tab-models").dataset.ready) {
      const { renderModelsTab } = await import("./ai-models-tab.js");
      renderModelsTab($("tab-models"), await api.aiModels());
      $("tab-models").dataset.ready = "1";
    }
    if (tab.dataset.tab === "studio") emit();
  }));
}

async function applyDeepLink() {
  const q = new URLSearchParams(location.search);
  if (q.get("lib")) store.libTab = q.get("lib");
  if (q.get("insp")) store.inspTab = q.get("insp");
  if (q.get("part")) store.sel = { part: q.get("part"), shot: Number(q.get("shot") || 0) };
  if (q.get("zoom")) store.zoom = Number(q.get("zoom"));
  if (q.get("job")) await actions.load(q.get("job"));
  if (q.get("tab") === "models") document.querySelector('.tab[data-tab="models"]').click();
}

async function init() {
  store.boot = await api.bootstrap();
  initLibrary();
  initInspector();
  initPlayer();
  initExportMenu();
  wireTabs();
  $("undo-btn").addEventListener("click", () => actions.undo());
  $("tl-zoom").addEventListener("input", (e) => { store.zoom = Number(e.target.value); emit(); });
  subscribe((s) => { renderTopbar(s); renderLibrary(s); renderInspector(s); renderTimeline($("timeline"), s); renderPlayer(s); renderExportMenu(s); });
  emit();
  await applyDeepLink();
  window.addEventListener("resize", () => emit());
}

init().catch((err) => document.body.insertAdjacentHTML("afterbegin", `<p style="color:#e66767;padding:12px">Lỗi khởi động: ${esc(err.message)}</p>`));
