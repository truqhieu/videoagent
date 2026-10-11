// Player pane: custom transport bar (play/pause, timecode, fullscreen), render overlays, seek requests.
import { actions, store } from "./editor-store.js";
import { esc, media } from "./format-helpers.js";
import { updatePlayhead } from "./timeline-view.js";

const $ = (id) => document.getElementById(id);
const tc = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${(s % 60).toFixed(1).padStart(4, "0")}`;
let loadedUrl = "";

export function initPlayer() {
  const v = $("player");
  const sync = () => {
    $("timecode").textContent = `${tc(v.currentTime || 0)} / ${tc(v.duration || store.job?.timeline.duration || 0)}`;
    $("play-btn").textContent = v.paused ? "▶" : "❚❚";
    updatePlayhead(v.currentTime || 0);
  };
  ["timeupdate", "play", "pause", "loadedmetadata"].forEach((ev) => v.addEventListener(ev, sync));
  $("play-btn").addEventListener("click", () => (v.paused ? v.play() : v.pause()));
  $("fullscreen-btn").addEventListener("click", () => v.requestFullscreen?.());
  document.addEventListener("keydown", (e) => {
    if (["TEXTAREA", "INPUT", "SELECT"].includes(e.target.tagName)) return;
    if (e.code === "Space") { e.preventDefault(); v.paused ? v.play() : v.pause(); }
    if ((e.metaKey || e.ctrlKey) && e.key === "z" && store.job?.history?.length && !store.busy) { e.preventDefault(); actions.undo(); }
  });
}

export function renderPlayer(s) {
  const v = $("player"), r = s.job?.render;
  $("empty-state").classList.toggle("hidden", !!s.job || !!s.busy);
  const overlay = $("render-overlay");
  const busyText = s.busy || (r?.status === "rendering" ? `Đang dựng video (bản ${r.revision})…` : "");
  overlay.classList.toggle("hidden", !busyText && r?.status !== "error");
  overlay.textContent = r?.status === "error" ? `Lỗi render: ${r.error}` : `${busyText}…`.replace("……", "…");
  if (r?.status === "done" && r.url !== loadedUrl) {
    loadedUrl = r.url;
    const t = v.currentTime;
    v.poster = media(r.poster || "");
    v.src = `${media(r.url)}?r=${r.revision}`;
    v.addEventListener("loadedmetadata", () => { v.currentTime = Math.min(t, v.duration || t); }, { once: true });
  }
  if (s.seekTo != null && r?.status === "done") {
    v.currentTime = s.seekTo + 0.05;
    s.seekTo = null;
  }
  $("render-meta").innerHTML = r?.status === "done" ? `bản ${r.revision} · render ${r.seconds}s · ${esc(s.job.template_label)}` : "";
}
