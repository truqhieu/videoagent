// CapCut-style multi-track timeline: track headers with toggles, parts, picture shots, subtitles, VO, music, SFX, logo.
import { actions, setUi, store } from "./editor-store.js";
import { esc, fmtTime, media, GEN_LABEL } from "./format-helpers.js";

let pxPerSec = 20;
let playheadEl = null;
const HEAD = 132;

function block(cls, start, dur, inner, attrs = "", extraStyle = "") {
  const style = `left:${start * pxPerSec}px;width:${Math.max(dur * pxPerSec - 2, 3)}px;${extraStyle}`;
  return `<div class="tl-block ${cls}" style="${style}" ${attrs}>${inner}</div>`;
}

function shotBlock(job, shot, active) {
  const sel = shot.selected;
  const isActive = active.part === shot.part_id && active.shot === shot.index ? " active" : "";
  const attrs = `data-part="${shot.part_id}" data-shot="${shot.index}" title="${fmtTime(shot.start)} · ${shot.duration.toFixed(1)}s"`;
  if (sel.kind === "clip") {
    const clip = job.clips[sel.clip_id] || {};
    const fx = [sel.speed && Math.abs(sel.speed - 1) > 0.01 ? `${sel.speed}×` : "", sel.zoom ? `⊕${sel.zoom}` : ""].filter(Boolean).join(" ");
    return block(`shot${clip.rights === "collected" ? " collected" : ""}${isActive}`, shot.start, shot.duration,
      `<span class="tag">${esc(clip.rights === "collected" ? "SƯU TẦM" : clip.product_set || "VCB")}</span>${fx ? `<span class="fx">${fx}</span>` : ""}`,
      attrs, `background-image:url('${media(clip.thumb)}')`);
  }
  const gen = job.parts.flatMap((p) => p.gen_options || []).find((g) => g.gen_id === sel.gen_id);
  const label = sel.kind === "gen" ? (gen?.type === "shoot_request" ? "⚑ QUAY BỔ SUNG" : "AI") : "⚠ THIẾU";
  return block(`${sel.kind === "gen" ? "shot gen" : "shot missing"}${isActive}`, shot.start, shot.duration,
    `<b>${label}</b><br><small>${esc(GEN_LABEL[gen?.type] || "")}</small>`, attrs);
}

function head(name, toggle) {
  if (!toggle) return `<div class="tl-head"><span class="name">${name}</span></div>`;
  const [key, on, icons] = toggle;
  return `<div class="tl-head"><span class="name">${name}</span>
    <button class="${on ? "" : "off"}" data-track-toggle="${key}" title="Bật/tắt" ${store.busy ? "disabled" : ""}>${on ? icons[0] : icons[1]}</button></div>`;
}

function row(name, html, cls = "", toggle = null) {
  const muted = toggle && !toggle[1] ? " muted" : "";
  return `<div class="tl-row ${cls}${muted}">${head(name, toggle)}${html}</div>`;
}

export function renderTimeline(container, s) {
  const job = s.job;
  if (!job) { container.innerHTML = '<p class="muted pad">Timeline sẽ hiện sau khi dựng video.</p>'; return; }
  const cfg = job.settings || {};
  const T = job.timeline.duration;
  pxPerSec = Math.max(12, Math.floor((container.clientWidth - HEAD - 20) / Math.max(T, 1))) * s.zoom;
  const width = T * pxPerSec;
  const step = s.zoom >= 2 ? 1 : 5;
  const ticks = Array.from({ length: Math.ceil(T / step) + 1 }, (_, i) => `<span style="left:${i * step * pxPerSec}px">${i * step}s</span>`).join("");
  const parts = job.parts.map((p) => block(`part ${p.status}`, p.start, p.duration,
    `<b>${esc(p.role_label)}</b>${p.craft_step ? " · " + esc(p.craft_step.replace(/_/g, " ")) : ""}`, `data-part="${p.part_id}" data-shot="0"`)).join("");
  const shots = job.timeline.shots.map((sh) => shotBlock(job, sh, s.sel)).join("");
  const subs = job.timeline.subtitles.map((c) => block("sub", c.start, c.end - c.start, esc(c.text))).join("");
  const vo = job.timeline.vo.map((v) => block("voice", v.start, v.duration, `🎙 ${v.direction ? esc(v.direction) : ""} ${v.duration.toFixed(1)}s`)).join("");
  const sfx = job.timeline.sfx.map((x) => block("sfx", x.start, 1.2, x.kind)).join("");
  const logo = job.timeline.logo.map((l) => block("logo", l.start, l.end - l.start, "◆ logo HuyK")).join("");
  const music = block("music", 0, T, `♪ ${esc(s.boot.music.find((m) => m.id === cfg.music_track)?.name || "nhạc nền")} · ${Math.round((cfg.music_volume ?? 0.32) * 100)}% · tự hạ khi có giọng`);
  container.innerHTML = `<div class="tl-inner" style="width:${width + HEAD + 20}px">
    <div class="tl-ruler" style="width:${width}px">${ticks}</div>
    ${row("Phần kịch bản", parts, "parts")}
    ${row("Văn bản", subs, "", ["subtitles", cfg.subtitles !== false, ["👁", "🚫"]])}
    ${row("Hình chính", shots, "main")}
    ${row("Lồng tiếng", vo)}
    ${row("Nhạc nền", music, "", ["music", (cfg.music_volume ?? 0.32) > 0, ["🔊", "🔇"]])}
    ${row("SFX", sfx, "", ["sfx", cfg.sfx !== false, ["🔊", "🔇"]])}
    ${row("Logo", logo, "", ["logo", cfg.logo !== false, ["👁", "🚫"]])}
    <div class="tl-playhead" style="left:${HEAD}px"></div></div>`;
  playheadEl = container.querySelector(".tl-playhead");
  container.querySelectorAll(".tl-block[data-part]").forEach((el) => el.addEventListener("click", () =>
    setUi({ sel: { part: el.dataset.part, shot: Number(el.dataset.shot) }, seekTo: job.parts.find((p) => p.part_id === el.dataset.part).shots[Number(el.dataset.shot)]?.start })));
  container.querySelector(".tl-ruler").addEventListener("click", (e) => setUi({ seekTo: (e.clientX - e.currentTarget.getBoundingClientRect().left) / pxPerSec }));
  container.querySelectorAll("[data-track-toggle]").forEach((b) => b.addEventListener("click", () => {
    const key = b.dataset.trackToggle;
    actions.settings(key === "music" ? { music_volume: (cfg.music_volume ?? 0.32) > 0 ? 0 : 0.32 } : { [key]: cfg[key] === false });
  }));
}

export function updatePlayhead(seconds) {
  if (playheadEl) playheadEl.style.left = `${HEAD + seconds * pxPerSec}px`;
}
