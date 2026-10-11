// Inspector tabs "Giọng" (emotion direction + re-voice) and "Tốc độ & khung" (speed / punch-in zoom).
import { actions, store } from "./editor-store.js";
import { esc, media } from "./format-helpers.js";

const EMOTION_VI = { "": "Tự nhiên", "[intrigued]": "Gợi tò mò", "[curious]": "Tò mò, hỏi", "[excited]": "Hào hứng", "[serious]": "Nghiêm túc",
  "[thoughtful]": "Trầm ngâm", "[softly, emotional]": "Nhẹ nhàng, xúc động", "[heartfelt]": "Chân thành, sâu lắng",
  "[warm, grateful]": "Ấm áp, biết ơn", "[admiring]": "Trầm trồ", "[playful]": "Dí dỏm", "[warm, confident]": "Ấm, tự tin (kết)" };
const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function renderVoiceTab(s, part) {
  if (!part.vo) return '<p class="hint">Phần này chỉ có hình + nhạc (không có lời đọc).</p>';
  const isEleven = part.vo.provider?.startsWith("elevenlabs");
  const auto = part.emotion_override === undefined || part.emotion_override === null;
  const options = [`<option value="__auto" ${auto ? "selected" : ""}>Tự động (agent chọn) — hiện: ${esc(EMOTION_VI[part.vo.direction || ""] || part.vo.direction || "Tự nhiên")}</option>`]
    .concat(s.boot.emotions.map((t) => `<option value="${esc(t)}" ${!auto && part.emotion_override === t ? "selected" : ""}>${esc(EMOTION_VI[t] || t)} ${t ? esc(t) : ""}</option>`));
  return `<div class="part-head"><h3>Giọng đọc · ${esc(part.role_label)}</h3><span class="chip ${isEleven ? "ok" : "warn"}">${isEleven ? "HuyK · eleven_v4" : "giọng demo"}</span></div>
    <div class="vo">${esc(part.vo_text)}</div>
    <audio controls src="${media(part.vo.audio)}" style="width:100%;margin:6px 0"></audio>
    <div class="hint">${part.vo.duration.toFixed(1)}s · ${esc(part.vo.provider)}${part.vo.direction ? ` · tag <b>${esc(part.vo.direction)}</b>` : ""}</div>
    <div class="sec-title" style="margin-top:14px">Cảm xúc (audio tag eleven_v4)</div>
    <select id="emotion-select" ${isEleven && !store.busy ? "" : "disabled"}>${options.join("")}</select>
    <button id="revoice-btn" class="primary" ${isEleven && !store.busy ? "" : "disabled"}>🎙 Đọc lại với cảm xúc này</button>
    <p class="hint" style="margin-top:8px">Đọc lại cả kịch bản trong 1 lượt để cảm xúc nối mạch (~10–25s, ≈ $0,07). Tag không bị đọc thành lời (đã kiểm bằng Scribe).
      ${isEleven ? "" : "<br>Bật giọng HuyK ở tab Âm thanh (cần ElevenLabs API key)."}</p>`;
}

export function wireVoiceTab(el, part) {
  el.querySelector("#revoice-btn")?.addEventListener("click", () => {
    const v = el.querySelector("#emotion-select").value;
    actions.emotion(part.part_id, v === "__auto" ? null : v);
  });
}

export function renderSpeedTab(s, part, shot) {
  const sel = shot.selected;
  if (sel.kind !== "clip") return '<p class="hint">Shot đang dùng đề xuất AI — chọn footage thật ở tab Cảnh để chỉnh tốc độ/khung.</p>';
  const clip = s.job.clips[sel.clip_id] || {};
  const zoom = sel.zoom || 1;
  return `<div class="part-head"><h3>Tốc độ & khung · shot ${shot.index + 1}</h3><span class="chip">${shot.duration.toFixed(1)}s</span></div>
    <div class="hint" style="margin:6px 0">${esc(clip.name)} — nguồn ${sel.src_in.toFixed(1)}s, khả dụng ${(clip.usable || [0, 0]).join("–")}s</div>
    <div class="sec-title" style="margin-top:12px">Tốc độ</div>
    <div class="chips">${SPEEDS.map((v) => `<button class="small-btn ${Math.abs(sel.speed - v) < 0.01 ? "on" : ""}" data-speed="${v}">${v}×</button>`).join("")}</div>
    <p class="hint">Cảnh chế tác mặc định 1,25× (như project CapCut thật dùng 1–2×). Nếu clip ngắn, agent tự giảm tốc độ để đủ thời lượng.</p>
    <div class="sec-title" style="margin-top:14px">Phóng khung (punch-in)</div>
    <div class="range-row"><input id="zoom-range" type="range" min="1" max="1.4" step="0.05" value="${zoom}"><output id="zoom-out">${zoom.toFixed(2)}×</output></div>
    <button id="apply-frame" class="primary" ${store.busy ? "disabled" : ""}>Áp dụng cho shot này</button>`;
}

export function wireSpeedTab(el, part, shot) {
  let speed = shot.selected.speed;
  const zoomInput = el.querySelector("#zoom-range");
  zoomInput?.addEventListener("input", () => { el.querySelector("#zoom-out").textContent = `${Number(zoomInput.value).toFixed(2)}×`; });
  el.querySelectorAll("[data-speed]").forEach((b) => b.addEventListener("click", () => {
    speed = Number(b.dataset.speed);
    el.querySelectorAll("[data-speed]").forEach((x) => x.classList.toggle("on", x === b));
  }));
  el.querySelector("#apply-frame")?.addEventListener("click", () => actions.choose(part.part_id, shot.index,
    { kind: "clip", clip_id: shot.selected.clip_id, speed, zoom: Number(zoomInput.value) }));
}
