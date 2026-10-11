// Central editor state + actions. Views subscribe and re-render on every change.
import { api } from "./api-client.js";

export const store = {
  boot: null, job: null, sel: { part: "p1", shot: 0 }, libTab: "script", inspTab: "scene", zoom: 1, busy: "",
};
const listeners = [];
let poller = null;

export const subscribe = (fn) => listeners.push(fn);
export const emit = () => listeners.forEach((fn) => fn(store));

export function setUi(patch) {
  Object.assign(store, patch);
  emit();
}

export const currentPart = () => store.job?.parts.find((p) => p.part_id === store.sel.part) || store.job?.parts[0];
export const currentShot = () => {
  const part = currentPart();
  return part ? part.shots[Math.min(store.sel.shot, part.shots.length - 1)] : null;
};

function setJob(job) {
  if (store.job && job.id === store.job.id && job.render.revision < store.job.render.revision) return;  // stale
  store.job = job;
  if (!job.parts.some((p) => p.part_id === store.sel.part)) store.sel = { part: job.parts[0]?.part_id, shot: 0 };
  emit();
}

function poll() {
  clearInterval(poller);
  const id = store.job.id;
  poller = setInterval(async () => {
    let job;
    try { job = await api.getJob(id); } catch { return; }                // transient: retry next tick
    if (!store.job || job.id !== store.job.id) return clearInterval(poller);
    if (job.render.revision !== store.job.render.revision || job.render.status !== store.job.render.status) setJob(job);
    if (job.render.status !== "rendering") clearInterval(poller);
  }, 900);
}

/** Run an editor action: shows a busy label, applies the returned job, then follows the re-render. */
export async function run(label, action) {
  store.busy = label;
  emit();
  try {
    setJob(await action());
    poll();
  } catch (err) {
    alert(`${label}: ${err.message}`);
  } finally {
    store.busy = "";
    emit();
  }
}

export const actions = {
  build: (body) => run("Đang lập kế hoạch, lồng tiếng giọng HuyK, chọn footage", () => api.createJob(body)),
  load: (id) => run("Đang mở dự án", () => api.getJob(id)),
  choose: (partId, shotIndex, option) => run("Đang thay cảnh", () => api.select(store.job.id, { part_id: partId, shot_index: shotIndex, option })),
  emotion: (partId, emotion) => run("Đang đọc lại giọng HuyK với cảm xúc mới", () => api.emotion(store.job.id, partId, emotion)),
  settings: (partial) => run(partial.voice ? "Đang đổi giọng đọc" : "Đang áp dụng tùy chọn", () => api.settings(store.job.id, partial)),
  undo: () => run("Đang hoàn tác", () => api.undo(store.job.id)),
};
