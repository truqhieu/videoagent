// "Xuất" dropdown: MP4, hand-off package (MP4 + SRT + timeline.json + VO), CapCut project (planned).
import { api } from "./api-client.js";
import { media } from "./format-helpers.js";

const $ = (id) => document.getElementById(id);

export function initExportMenu() {
  $("export-btn").addEventListener("click", (e) => { e.stopPropagation(); $("export-menu").classList.toggle("hidden"); });
  document.addEventListener("click", () => $("export-menu").classList.add("hidden"));
}

export function renderExportMenu(s) {
  const r = s.job?.render;
  const ready = r?.status === "done";
  $("export-btn").disabled = !ready;
  if (!ready) return;
  $("export-menu").innerHTML = `
    <a href="${media(r.url)}" download>⤓ Video MP4 (bản ${r.revision})<small>720×1280 preview · −14 LUFS · dùng ngay khi PASS</small></a>
    <a href="${api.packageUrl(s.job.id)}">🗂 Gói dữ liệu cho dev<small>MP4 + phụ đề SRT + timeline.json + VO từng phần</small></a>
    <div class="item disabled">🎬 Project CapCut (.draft)<small>Sắp có — adapter CapCut 9.3 Windows (docs 05), đội dev hoàn thiện</small></div>`;
}
