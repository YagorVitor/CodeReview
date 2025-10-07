export async function apiFetch(path, options = {}, { onUnauthorized } = {}) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const cfg = { ...options, headers };

  const res = await fetch(`${API_URL}${path}`, cfg);

  if (res.status === 401) {
    if (typeof onUnauthorized === "function") onUnauthorized();
    const text = await res.text().catch(() => "");
    const err = new Error("Unauthorized");
    err.status = 401;
    err.body = text;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.error || json.message || "Erro na requisição");
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  }

  const text = await res.text();
  if (!res.ok) {
    const err = new Error(text || "Erro na requisição");
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return text;
}