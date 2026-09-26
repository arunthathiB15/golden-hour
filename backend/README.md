# CarePath backend (prototype)

Node.js + Express API implementing the CarePath decision loop against an
in-memory mock hospital network. See the root [`README.md`](../README.md) for
the full picture and demo script.

## Setup

```bash
npm install
npm start        # http://localhost:4000
# or: npm run dev   (auto-restarts on file changes)
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/hospitals` | Current (simulated live) status of every hospital |
| POST | `/api/symptom-map` | `{ text }` → non-diagnostic requirement mapping |
| POST | `/api/route` | `{ text, lat, lng }` → full pipeline: mapping + ranked hospitals |
| PATCH | `/api/hospitals/:id/status` | Manual status-ping fallback: `{ capabilities?, erWaitMinutes? }` |

### Example

```bash
curl -X POST http://localhost:4000/api/route \
  -H "Content-Type: application/json" \
  -d '{"text":"sudden facial drooping, cannot lift right arm, slurred speech","lat":13.06,"lng":80.25}'
```

## Where the real integrations plug in

- `src/data/hospitals.js` — replace the in-memory `state` map with a real HL7
  FHIR client / IoT feed. `getHospitals()`, `updateStatus()` and
  `startLiveFeedSimulator()` are the seam.
- `src/services/symptomMapper.js` — replace the keyword rules with a trained
  NLP model behind the same `mapSymptomsToRequirements(text)` signature.
- `src/services/router.js` — replace `estimateTransitMinutes()` with a call to
  a live maps/traffic ETA API.
