// In-memory hospital store standing in for a real HL7 FHIR / IoT feed.
// Coordinates are a fictional network spread across Chennai for demo purposes.
// This module is the seam where a real hospital-integration client would plug in:
// replace `getHospitals()` / `updateStatus()` with calls to a FHIR client and
// this remains a drop-in swap for the rest of the app.

const BASE_HOSPITALS = [
  {
    id: "h1",
    name: "City General Hospital",
    lat: 13.0827,
    lng: 80.2707,
    isStrokeCentre: true,
    isTraumaCentre: true,
    capabilities: { ct: true, cathlab: true, neurologist: true, surgeon: true, bloodbank: true, cardiologist: true },
  },
  {
    id: "h2",
    name: "Lighthouse Stroke Institute",
    lat: 13.0333,
    lng: 80.2667,
    isStrokeCentre: true,
    isTraumaCentre: false,
    capabilities: { ct: true, cathlab: false, neurologist: true, surgeon: false, bloodbank: true, cardiologist: false },
  },
  {
    id: "h3",
    name: "Riverside Trauma Centre",
    lat: 13.1015,
    lng: 80.2905,
    isStrokeCentre: false,
    isTraumaCentre: true,
    capabilities: { ct: true, cathlab: false, neurologist: false, surgeon: true, bloodbank: true, cardiologist: false },
  },
  {
    id: "h4",
    name: "St. Anne's Community Hospital",
    lat: 13.0569,
    lng: 80.2425,
    isStrokeCentre: false,
    isTraumaCentre: false,
    capabilities: { ct: true, cathlab: false, neurologist: false, surgeon: false, bloodbank: false, cardiologist: false },
  },
  {
    id: "h5",
    name: "Marina Heart & Vascular Institute",
    lat: 13.0475,
    lng: 80.2824,
    isStrokeCentre: true,
    isTraumaCentre: false,
    capabilities: { ct: true, cathlab: true, neurologist: true, surgeon: true, bloodbank: true, cardiologist: true },
  },
  {
    id: "h6",
    name: "Anna Nagar District Hospital",
    lat: 13.0850,
    lng: 80.2101,
    isStrokeCentre: false,
    isTraumaCentre: true,
    capabilities: { ct: true, cathlab: false, neurologist: false, surgeon: true, bloodbank: true, cardiologist: false },
  },
  {
    id: "h7",
    name: "Velachery Rural Health Post",
    lat: 12.9791,
    lng: 80.2183,
    isStrokeCentre: false,
    isTraumaCentre: false,
    capabilities: { ct: false, cathlab: false, neurologist: false, surgeon: false, bloodbank: false, cardiologist: false },
  },
  {
    id: "h8",
    name: "Tambaram Multispecialty Hospital",
    lat: 12.9249,
    lng: 80.1000,
    isStrokeCentre: true,
    isTraumaCentre: true,
    capabilities: { ct: true, cathlab: true, neurologist: true, surgeon: true, bloodbank: true, cardiologist: true },
  },
];

function randomWaitMinutes() {
  return Math.round(5 + Math.random() * 55);
}

// Mutable live state: capability up/down flags + ER wait time.
// Seeded so the very first render already shows a mix of available/unavailable
// equipment, which is what makes the demo's "closest hospital gets skipped"
// moment work without waiting for the simulator to kick in.
const state = new Map();
BASE_HOSPITALS.forEach((h, i) => {
  const seededDown = i % 3 === 1; // deterministically knock out one capability on ~1/3 of hospitals
  const capabilities = { ...h.capabilities };
  if (seededDown && capabilities.ct) capabilities.ct = false;
  state.set(h.id, {
    capabilities,
    erWaitMinutes: randomWaitMinutes(),
    lastUpdated: new Date().toISOString(),
    updatedBy: "system-seed",
  });
});

export function getHospitals() {
  return BASE_HOSPITALS.map((h) => ({
    ...h,
    ...state.get(h.id),
    capabilities: { ...state.get(h.id).capabilities },
  }));
}

export function getHospital(id) {
  const h = BASE_HOSPITALS.find((x) => x.id === id);
  if (!h) return null;
  const live = state.get(id);
  return { ...h, ...live, capabilities: { ...live.capabilities } };
}

// Manual status-ping fallback: a hospital staff member pushes an update.
export function updateStatus(id, patch, updatedBy = "hospital-staff") {
  const current = state.get(id);
  if (!current) return null;
  const next = {
    capabilities: { ...current.capabilities, ...(patch.capabilities || {}) },
    erWaitMinutes:
      typeof patch.erWaitMinutes === "number" ? patch.erWaitMinutes : current.erWaitMinutes,
    lastUpdated: new Date().toISOString(),
    updatedBy,
  };
  state.set(id, next);
  return getHospital(id);
}

// Simulates a live HL7 FHIR/IoT feed: every tick, one random hospital's
// ER wait time drifts and there's a small chance a capability flips.
export function startLiveFeedSimulator(intervalMs = 8000) {
  const timer = setInterval(() => {
    const ids = [...state.keys()];
    const id = ids[Math.floor(Math.random() * ids.length)];
    const current = state.get(id);
    const waitDrift = Math.round((Math.random() - 0.5) * 16);
    const erWaitMinutes = Math.min(90, Math.max(3, current.erWaitMinutes + waitDrift));

    const capabilities = { ...current.capabilities };
    if (Math.random() < 0.15) {
      const keys = Object.keys(capabilities);
      const key = keys[Math.floor(Math.random() * keys.length)];
      capabilities[key] = !capabilities[key];
    }

    state.set(id, {
      capabilities,
      erWaitMinutes,
      lastUpdated: new Date().toISOString(),
      updatedBy: "live-feed-sim",
    });
  }, intervalMs);
  timer.unref?.();
  return timer;
}

export const REQUIREMENT_KEYS = ["ct", "cathlab", "neurologist", "surgeon", "bloodbank", "cardiologist"];
