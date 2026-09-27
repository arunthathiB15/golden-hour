# CarePath — The "Golden Hour" Trauma & Stroke Router

CarePath is a non-diagnostic, live-resource routing platform for stroke and trauma
emergencies. Instead of sending a patient to the *nearest* hospital, it routes them
to the hospital that can *actually treat them fastest* — factoring in live equipment
status (CT/MRI, cath lab), specialist on-call status, and real-time ER wait times.

> Full problem statement, competitive analysis, and architecture rationale are in
> [`docs/SOLUTION.md`](docs/SOLUTION.md).

## What this prototype demonstrates

This is a working functional demo of the core CarePath decision loop — built to be
run and shown live at a hackathon, not a production medical system.

1. **Symptom → requirement mapping** — a caregiver types a plain-language symptom
   description; a non-diagnostic classifier maps it to facility requirements
   (e.g. Stroke Centre + Active CT + On-call Neurologist) and an urgency level.
   It never outputs a diagnosis.
2. **Live hospital status feed (simulated)** — a mock network of hospitals with
   equipment/specialist status that changes automatically every few seconds,
   standing in for a real HL7 FHIR / IoT feed.
3. **Manual status-ping fallback** — a "Hospital Staff" panel lets you manually
   push a status update for any hospital, demonstrating the fallback tier for
   facilities without EHR/IoT integration.
4. **Route optimisation** — `Total Time = Transit Time + Live ER Wait Time`.
   Hospitals that don't currently meet the requirement are shown but ranked out,
   so you can see *why* a closer hospital was skipped.

## Architecture

```
carepath/
├── backend/     Node.js + Express API — symptom mapping, hospital status, routing
├── frontend/    React + Vite single-page app — the demo UI
└── docs/        Solution write-up (problem, existing solutions, gap, tech stack)
```

Data flows: `Frontend → POST /api/route → symptomMapper → hospital store → router → ranked list`

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md)
for how each piece works and its API.

## Running it locally

Requires Node.js 18+.

```bash
# 1. Start the backend (port 4000)
cd backend
npm install
npm start

# 2. In a second terminal, start the frontend (port 5173)
cd frontend
npm install
npm run dev
```

Then open **http://localhost:5173**.

## Demo script (matches the pitch deck's "Live Demo Focus" slide)

1. Type a symptom string, e.g. *"sudden facial drooping, can't lift right arm, slurred speech"*
   → watch it map to `Stroke Centre · Active CT · Neurologist On-Call`, urgency **Critical**.
2. Show the ranked hospital list — note the closest hospital is *excluded* because
   its CT scanner is down, and CarePath instead routes to a slightly farther
   hospital with a much shorter total time-to-treatment.
3. Open the **Hospital Staff** panel and manually flip a hospital's CT status —
   re-run the same symptom query and show the ranking change live.
4. Wait ~10 seconds and re-run the query again — show the simulated live feed
   changing ER wait times and re-ranking hospitals automatically, with no
   manual input, to represent the real HL7 FHIR/IoT integration.

## Status & known limitations (say this to judges — it builds trust)

- Hospital data and live status are **simulated in-memory**, not connected to
  real hospital systems. The `hospitalStore` module is the seam where a real
  HL7 FHIR client would plug in.
- The symptom mapper is a **rule-based keyword classifier** for demo speed and
  explainability; the pitch deck's production version proposes a lightweight
  trained NLP model in the same non-diagnostic role.
- Transit time uses straight-line distance and an average speed constant, not
  a live traffic/maps API — swapping in Google Maps/OSRM's ETA endpoint is a
  drop-in replacement in `backend/src/services/router.js`.

## License

MIT — see [`LICENSE`](LICENSE).
