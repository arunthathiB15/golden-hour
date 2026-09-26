# CarePath frontend (prototype)

React + Vite single-page app — the demo UI for CarePath. See the root
[`README.md`](../README.md) for the full picture and demo script.

## Setup

```bash
npm install
npm run dev     # http://localhost:5173, proxies /api to http://localhost:4000
```

The backend must be running (`cd ../backend && npm start`) for the app to work —
`vite.config.js` proxies `/api/*` requests to `http://localhost:4000`.

## Structure

```
src/
├── api.js                    fetch helpers for the backend API
├── App.jsx                   page layout + state orchestration
├── components/
│   ├── SymptomForm.jsx       symptom text input + patient location
│   ├── MappingResult.jsx     shows the non-diagnostic requirement mapping
│   ├── HospitalList.jsx      ranked eligible + excluded hospitals
│   ├── NetworkMap.jsx        lightweight SVG scatter map (no API key needed)
│   └── StaffPanel.jsx        manual status-ping fallback UI
└── styles.css
```

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```
