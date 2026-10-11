// Thin fetch wrapper for the MVP FastAPI backend.

async function call(path, options = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...options });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* non-JSON error body */ }
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return res.json();
}

const job = (id) => `/api/jobs/${encodeURIComponent(id)}`;

export const api = {
  bootstrap: () => call("/api/bootstrap"),
  createJob: (body) => call("/api/jobs", { method: "POST", body: JSON.stringify(body) }),
  getJob: (id) => call(job(id)),
  select: (id, body) => call(`${job(id)}/select`, { method: "POST", body: JSON.stringify(body) }),
  emotion: (id, partId, emotion) => call(`${job(id)}/parts/${encodeURIComponent(partId)}/emotion`, { method: "POST", body: JSON.stringify({ emotion }) }),
  settings: (id, partial) => call(`${job(id)}/settings`, { method: "PATCH", body: JSON.stringify(partial) }),
  undo: (id) => call(`${job(id)}/undo`, { method: "POST" }),
  packageUrl: (id) => `${job(id)}/package`,
  aiModels: () => call("/api/ai-models"),
};
