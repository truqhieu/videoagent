// Left pane (CapCut "media library"): tab bar + Script tab (built once) + Footage library tab.
import { actions, currentPart, currentShot, setUi, store } from "./editor-store.js";
import { ICONS } from "./editor-icons.js";
import { esc, media, money } from "./format-helpers.js";
import { renderAiTab, renderAudioTab, renderEffectsTab, renderTextTab } from "./library-option-tabs.js";

const TABS = [["script", "Kịch bản"], ["footage", "Footage"], ["audio", "Âm thanh"], ["text", "Văn bản"], ["effects", "Hiệu ứng"], ["ai", "AI"]];
const SCOPES = [["sku", "Đúng SKU"], ["shared", "Chung VCB"], ["collected", "Sưu tầm"], ["all", "Tất cả"]];
const STEP_VI = { thiet_ke: "Thiết kế", chuan_bi_nguyen_lieu: "Nguyên liệu", nung_nau: "Nung chảy", do_khuon: "Đổ khuôn", dap_can: "Đập/cán",
  cua_cat: "Cưa cắt", han: "Hàn", dua_mai: "Giũa mài", khoan: "Khoan", gan_da_chu: "Gắn đá chủ", dinh_da: "Đính đá", danh_bong: "Đánh bóng", hoan_thien: "Hoàn thiện" };
let footageFilter = { scope: "sku", step: "" };
const $ = (id) => document.getElementById(id);

function scriptForm(boot) {
  return `<div class="sec"><div class="sec-title">Kịch bản</div>
    <label class="field">Kịch bản mẫu <select id="sample-select">${boot.samples.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join("")}</select></label>
    <textarea id="script-input" rows="10" placeholder="Dán kịch bản…"></textarea>
    <label class="field">Bộ footage sản phẩm <select id="product-select"><option value="">— Không gắn sản phẩm (video kiến thức) —</option>
      ${boot.products.map((p) => `<option value="${p.sku}">${esc(p.sku)} · ${esc(p.name.replace(/-/g, " "))} (${p.clips} clip)</option>`).join("")}</select></label>
    <div id="product-steps" class="hint"></div>
    <label class="field">Template <select id="template-select"><option value="auto">Tự động</option>
      ${boot.templates.map((t) => `<option value="${t.id}">${esc(t.label)}</option>`).join("")}</select></label>
    <label class="field">Planner <select id="planner-select"><option value="rules">Quy tắc offline</option>
      <option value="claude" ${boot.claude_available ? "" : "disabled"}>Claude Opus 5.5 ${boot.claude_available ? "" : "(cần API key)"}</option></select></label>
    <button id="build-btn" class="primary">▶ Dựng video</button></div>
    <div class="sec"><div class="sec-title">Tổng quan dự án</div><div id="job-summary" class="hint">Chưa có dự án.</div></div>`;
}

function applySample(s) {
  $("script-input").value = s.script;
  $("product-select").value = s.sku || "";
  $("template-select").value = s.template_id || "auto";
  showSteps();
}

function showSteps() {
  const p = store.boot.products.find((x) => x.sku === $("product-select").value);
  $("product-steps").textContent = p ? `Công đoạn có footage: ${p.step_labels.join(" → ")}${p.has_final ? "" : " · chưa có cảnh hoàn thiện"}` : "";
}

export function initLibrary() {
  $("lib-tabs").innerHTML = TABS.map(([id, label]) => `<button class="lib-tab" data-lib="${id}">${ICONS[id]}${label}</button>`).join("");
  $("lib-tabs").querySelectorAll("[data-lib]").forEach((b) => b.addEventListener("click", () => setUi({ libTab: b.dataset.lib })));
  $("lib-body").innerHTML = TABS.map(([id]) => `<div id="lib-${id}" class="lib-page"></div>`).join("");
  $("lib-script").innerHTML = scriptForm(store.boot);
  $("sample-select").addEventListener("change", (e) => applySample(store.boot.samples.find((s) => s.id === e.target.value)));
  $("product-select").addEventListener("change", showSteps);
  $("build-btn").addEventListener("click", () => actions.build({ script: $("script-input").value, sku: $("product-select").value,
    template_id: $("template-select").value, planner: $("planner-select").value }));
  applySample(store.boot.samples[0]);
}

function summary(job) {
  const t = job.totals, c = job.costs || {};
  const per = (t.gen_cost_usd || 0) + (c.vo?.est_cost_usd || 0) + (c.script_llm || 0);
  return [["Thời lượng", `${t.duration.toFixed(1)}s · ${job.parts.length} phần`], ["Shot footage thật / AI", `${t.real_shots} / ${t.gen_shots}`],
    ["Template · planner", `${job.template_id} · ${job.planner}`], ["AI generate (đề xuất)", money(t.gen_cost_usd)],
    ["Lồng tiếng (ElevenLabs)", money(c.vo?.est_cost_usd)], ["Lập kế hoạch (LLM)", money(c.script_llm)], ["Chi phí AI / video", money(per)]]
    .map(([k, v]) => `<div class="stat"><span>${k}</span><b>${esc(v)}</b></div>`).join("");
}

function footageTab(s) {
  const sku = s.job?.sku;
  const clips = s.boot.library.filter((c) => {
    const scope = c.rights === "collected" ? "collected" : c.product_set ? "sku" : "shared";
    if (footageFilter.scope === "sku" && !(scope === "sku" && c.product_set === sku)) return false;
    if (!["all", "sku"].includes(footageFilter.scope) && scope !== footageFilter.scope) return false;
    return !footageFilter.step || c.craft_step === footageFilter.step;
  });
  const shot = currentShot(), part = currentPart();
  return `<div class="chips">${SCOPES.map(([id, l]) => `<button class="small-btn ${footageFilter.scope === id ? "on" : ""}" data-scope="${id}">${l}</button>`).join("")}</div>
    <select id="step-filter"><option value="">Mọi công đoạn</option>${Object.entries(STEP_VI).map(([k, v]) => `<option value="${k}" ${footageFilter.step === k ? "selected" : ""}>${v}</option>`).join("")}</select>
    <p class="hint" style="margin:8px 0">${shot ? `Bấm một clip để thay vào <b>${esc(part.role_label)} · shot ${shot.index + 1}</b>.` : "Dựng video trước, rồi chọn shot trên timeline."} ${sku ? "" : "Chọn bộ footage sản phẩm để lọc đúng SKU."}</p>
    <div class="cards">${clips.map((c) => `<div class="card" data-lib-clip="${c.id}" title="${esc(c.description_vi)}">
      <span class="badge">${c.rights === "collected" ? "SƯU TẦM" : esc(c.product_set || "CHUNG")}</span>
      <img class="thumb" src="${media(c.thumb)}" alt="" loading="lazy"><div class="meta"><b>${esc(c.name)}</b>${esc(STEP_VI[c.craft_step] || c.roles[0] || "")}</div></div>`).join("") || '<p class="hint">Không có clip phù hợp bộ lọc.</p>'}</div>`;
}

function wireFootage(root) {
  root.querySelectorAll("[data-scope]").forEach((b) => b.addEventListener("click", () => { footageFilter.scope = b.dataset.scope; renderLibrary(store); }));
  root.querySelector("#step-filter")?.addEventListener("change", (e) => { footageFilter.step = e.target.value; renderLibrary(store); });
  root.querySelectorAll("[data-lib-clip]").forEach((card) => card.addEventListener("click", () => {
    const shot = currentShot();
    if (!shot) return;
    actions.choose(shot.part_id, shot.index, { kind: "clip", clip_id: card.dataset.libClip, manual: true });
  }));
}

export function renderLibrary(s) {
  document.querySelectorAll(".lib-tab").forEach((b) => b.classList.toggle("active", b.dataset.lib === s.libTab));
  document.querySelectorAll(".lib-page").forEach((p) => p.classList.toggle("hidden", p.id !== `lib-${s.libTab}`));
  if (s.job) $("job-summary").innerHTML = summary(s.job);
  $("build-btn").disabled = !!s.busy;
  const pages = { footage: footageTab, audio: renderAudioTab, text: renderTextTab, effects: renderEffectsTab, ai: renderAiTab };
  if (pages[s.libTab]) {
    const root = $(`lib-${s.libTab}`);
    root.innerHTML = pages[s.libTab](s);
    if (s.libTab === "footage") wireFootage(root);
    root.querySelectorAll("[data-set]").forEach((el) => el.addEventListener(el.type === "range" ? "change" : "click", () => {
      const value = el.type === "range" ? Number(el.value) : JSON.parse(el.dataset.value);
      actions.settings({ [el.dataset.set]: value });
    }));
    root.querySelectorAll("[data-ai-gen]").forEach((b) => b.addEventListener("click", () =>
      actions.choose(b.dataset.part, 0, { kind: "gen", gen_id: b.dataset.aiGen })));
  }
}
