// "So sánh model AI" tab: real benchmark results + per-activity model picker + monthly cost calculator.
import { esc, money } from "./format-helpers.js";

const pct = (v) => (v == null ? "—" : `${Math.round(v * 100)}%`);
const PER_LANG = { tts: 1, asr: 1, avatar_video: 1 };          // multiplied by number of languages
let data, picks = {}, inputs = { videos: 10000, langs: 4, clips: 3000, fx: 26000 };

function benchmarkCard(b) {
  const blind = b.planning_blind?.per_model || {};
  const rows = ["haiku", "sonnet", "opus"].map((m) => {
    const r = b.models?.[m];
    if (!r) return "";
    const t = r.tagging, rs = r.run_stats || {};
    return `<tr><td><b>${esc(r.model_id)}</b></td><td>${pct(t.role_acc)}</td><td>${pct(t.craft_step_acc)}</td><td>${pct(t.craft_step_within_1)}</td>
      <td>${pct(t.huyk_acc)}</td><td>${pct(t.watermark_logo_acc)}</td><td>${r.planning_avg_score}%</td><td><b>${blind[m]?.avg_overall ?? "—"}</b>/10</td>
      <td>${money(t.api_cost_per_1000_clips_usd)}</td><td>${money(r.api_cost_per_1000_scripts_usd)}</td>
      <td>${Math.round((rs.tagging?.duration_ms || 0) / 1000)}s / ${Math.round((rs.planning?.duration_ms || 0) / 1000)}s</td></tr>`;
  }).join("");
  return `<div class="panel"><h3>Kết quả test thực tế (${esc(b.date || "")}) — Claude Haiku / Sonnet / Opus 5.5</h3>
    <p class="hint">T1 gắn nhãn 12 clip có đáp án, chỉ nhìn contact sheet (không gợi ý tên file). T2 lập kế hoạch 3 kịch bản thật: 6 kiểm tra quy tắc + giám khảo mù (Opus, xáo nhãn). Chi phí API tính theo bảng giá công bố với cùng giả định token.</p>
    <table class="opt-table"><tr><th>Model</th><th>Vai trò</th><th>Công đoạn</th><th>±1 bước</th><th>HuyK</th><th>Logo/WM</th><th>Quy tắc KH</th><th>Giám khảo</th><th>$/1k clip</th><th>$/1k KB</th><th>Thời gian T1/T2</th></tr>${rows}</table>
    <p class="hint" style="margin-top:8px">Gemini, GPT, ElevenLabs, HeyGen, Veo, Seedance: chưa test thực tế vì chưa có API key — bảng dưới dùng giá công bố (đã kiểm tra trên trang nhà cung cấp, có link nguồn).</p></div>`;
}

function activityCard(key, act) {
  const opts = data.options.filter((o) => o.activity === key);
  const max = Math.max(...opts.map((o) => o.cost_per_unit_usd || 0), 1e-9);
  const rows = opts.map((o) => `<tr class="${picks[key] === o.id ? "chosen" : ""}">
    <td><input type="radio" name="${key}" value="${esc(o.id)}" ${picks[key] === o.id ? "checked" : ""}></td>
    <td><b>${esc(o.model.split(" (")[0])}</b>${o.recommended ? " ★" : ""}<br><span class="hint">${esc(o.provider)}</span></td>
    <td><span class="tier">${esc(o.tier)}</span></td>
    <td style="font-family:var(--mono)">${money(o.cost_per_unit_usd)}</td>
    <td style="width:22%"><div class="bar" title="${money(o.cost_per_unit_usd)} / ${esc(act.per)}"><i style="width:${(100 * (o.cost_per_unit_usd || 0)) / max}%"></i></div></td>
    <td>${o.tested_in_benchmark ? '<span class="chip ok">đã test</span>' : ""} ${o.verified_price ? "" : '<span class="chip warn">giá chưa xác minh</span>'}</td>
    <td>${o.source_url ? `<a href="${esc(o.source_url)}" target="_blank" rel="noopener">nguồn</a>` : ""}</td></tr>`).join("");
  return `<div class="panel"><h3>${esc(act.label)}</h3><span class="hint">Chi phí trên 1 ${esc(act.per)} · giả định lượng dùng: ${esc(JSON.stringify(act.usage))}</span>
    <table class="opt-table"><tr><th></th><th>Model</th><th>Hạng</th><th>$/${esc(act.per)}</th><th>So sánh</th><th></th><th></th></tr>${rows}</table></div>`;
}

function costBreakdown() {
  const L = inputs.langs, V = Math.max(inputs.videos, 1);
  const items = Object.entries(data.activities).map(([key, act]) => {
    const o = data.options.find((x) => x.id === picks[key]) || {};
    let perVideo = o.cost_per_unit_usd || 0;
    if (key === "vision_tagging") perVideo = (perVideo * inputs.clips) / V;   // amortised over the month's videos
    else if (PER_LANG[key]) perVideo *= L;
    else if (key === "script_llm") perVideo *= 1 + 0.5 * (L - 1);          // master plan + adaptation per language
    return { key, label: act.label, model: o.model || "", perVideo };
  }).sort((a, b) => b.perVideo - a.perVideo);
  return { items, total: items.reduce((s, i) => s + i.perVideo, 0) };
}

function summaryCard() {
  const { items, total } = costBreakdown();
  const max = Math.max(...items.map((i) => i.perVideo), 1e-9);
  const monthly = total * inputs.videos;
  const vnd = (usd) => `${Math.round(usd * inputs.fx).toLocaleString("vi-VN")}đ`;
  return `<div class="panel sticky"><h3>Chi phí AI ước tính</h3>
    <label>Số video / tháng <input id="in-videos" type="number" min="100" step="500" value="${inputs.videos}"></label>
    <label>Số ngôn ngữ / video (VN, TH, JP, EN) <input id="in-langs" type="number" min="1" max="4" value="${inputs.langs}"></label>
    <label>Clip footage mới / tháng (gắn nhãn) <input id="in-clips" type="number" min="0" step="500" value="${inputs.clips}"></label>
    <label>Tỷ giá giả định (đ/USD) <input id="in-fx" type="number" min="1000" step="100" value="${inputs.fx}"></label>
    <div class="sec-title">Mỗi video</div><div class="big">${money(total)}</div><div class="hint">≈ ${vnd(total)} / video</div>
    <div class="sec-title">Mỗi tháng</div><div class="big">${money(monthly)}</div><div class="hint">≈ ${vnd(monthly)} cho ${inputs.videos.toLocaleString("vi-VN")} video × ${inputs.langs} ngôn ngữ</div>
    <div class="sec-title">Phân bổ theo hoạt động (mỗi video)</div>
    ${items.map((i) => `<div style="margin:6px 0" title="${esc(i.model)}"><div class="stat" style="border:0;padding:0"><span>${esc(i.label)}</span><b>${money(i.perVideo)}</b></div>
      <div class="bar"><i style="width:${(100 * i.perVideo) / max}%"></i></div></div>`).join("")}
    <div class="row" style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
      <button class="small-btn" data-preset="rẻ">Chọn rẻ nhất</button><button class="small-btn" data-preset="rec">Chọn đề xuất ★</button>
      <button class="small-btn" data-preset="cao cấp">Chọn cao cấp</button></div>
    <p class="hint" style="margin-top:10px">Chưa gồm hạ tầng render, lưu trữ, nhân sự. Giá kiểm tra ${esc(data.checked_date)}; một số giá có khuyến mãi/tăng theo ngày (xem nguồn).</p></div>`;
}

function preset(kind) {
  for (const key of Object.keys(data.activities)) {
    const opts = data.options.filter((o) => o.activity === key);
    const pick = kind === "rec" ? opts.find((o) => o.recommended)
      : kind === "rẻ" ? [...opts].sort((a, b) => (a.cost_per_unit_usd || 0) - (b.cost_per_unit_usd || 0))[0]
        : opts.filter((o) => o.tier === "cao cấp").sort((a, b) => (b.cost_per_unit_usd || 0) - (a.cost_per_unit_usd || 0))[0] || opts[0];
    if (pick) picks[key] = pick.id;
  }
}

function render(el, bench) {
  el.innerHTML = `<div>${benchmarkCard(bench)}${Object.entries(data.activities).map(([k, a]) => activityCard(k, a)).join("")}</div>${summaryCard()}`;
  el.querySelectorAll("input[type=radio]").forEach((r) => r.addEventListener("change", () => { picks[r.name] = r.value; render(el, bench); }));
  [["in-videos", "videos"], ["in-langs", "langs"], ["in-clips", "clips"], ["in-fx", "fx"]].forEach(([id, k]) =>
    el.querySelector(`#${id}`).addEventListener("change", (e) => { inputs[k] = Math.max(Number(e.target.value) || 0, k === "langs" ? 1 : 0); render(el, bench); }));
  el.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => { preset(b.dataset.preset); render(el, bench); }));
}

export function renderModelsTab(el, payload) {
  data = payload.pricing;
  preset("rec");
  render(el, payload.benchmark || {});
}
