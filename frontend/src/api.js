const BASE = "/api";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function getHospitals() {
  return fetch(`${BASE}/hospitals`).then(handle);
}

export function postRoute({ text, lat, lng }) {
  return fetch(`${BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lat, lng }),
  }).then(handle);
}

export function patchHospitalStatus(id, patch) {
  return fetch(`${BASE}/hospitals/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).then(handle);
}
