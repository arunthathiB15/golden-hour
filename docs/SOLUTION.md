# CarePath — Solution Overview

*(Condensed from the full submission document. See the SIH2026 idea presentation and
detailed solution document delivered alongside this repo for the complete version.)*

## Problem statement

In acute stroke and trauma, "Time is Brain": an untreated stroke costs roughly
1.9 million neurons per minute. Patients are almost always routed to the *nearest*
hospital, not the one best equipped to treat them. On arrival they often find the
CT scanner down, the cath lab occupied, or no on-call neurosurgeon — triggering a
45–90 minute secondary transfer that can mean permanent disability or death.

Existing navigation tools (Google/Apple Maps) show proximity only, not live
internal hospital capability. Nothing fuses symptom urgency with live, per-hospital
operational status across a whole city or district.

## Existing solutions and their limits

| Existing solution | Limitation |
|---|---|
| Apollo 1066 / 5G ambulance network | Works within one hospital's own network only |
| Telangana Project Sanjeevani (NH-44) | One highway corridor, not a live city-wide router |
| Indian Stroke Association green-corridor proposal | Routes to "nearest certified centre", not live per-facility status |
| Google/Apple Maps | Pure geographic proximity, zero capability visibility |
| Hospital ERPs (Epic/SAP/Oracle Health) | Closed single-institution systems, cost-prohibitive for rural facilities |

## The gap CarePath fills

1. Non-diagnostic symptom → facility-requirement mapping, in plain language.
2. Live, cross-hospital capability data fused directly into the route.
3. Works everywhere via a manual status-ping fallback, not just EHR-integrated networks.
4. Optimises for **time-to-treatment** (`transit time + live ER wait`), not distance.

## Tech stack (production target)

| Layer | Technology |
|---|---|
| Client apps | React Native caregiver app, ambulance crew tablet UI |
| Backend | Python FastAPI (this prototype uses Node/Express for demo speed) |
| NLP layer | Lightweight symptom → requirement classifier |
| Hospital integration | HL7 FHIR connectors + IoT equipment sensors |
| Fallback data layer | Manual staff status-ping app |
| Data storage | PostgreSQL + Redis |
| Routing | Maps/traffic ETA API fused with live ER-wait signal |
| Infra | Cloud hosting (AWS/GCP), containerised services |

## What's simulated vs. real in this prototype

| Piece | Prototype | Production |
|---|---|---|
| Symptom mapping | Rule-based keyword classifier | Trained lightweight NLP model, same non-diagnostic scope |
| Hospital status | In-memory mock data, auto-changing | Live HL7 FHIR / IoT feed |
| Fallback status updates | Manual panel in the demo UI | Dedicated hospital-staff mobile app |
| Transit time | Haversine distance × avg speed constant | Live traffic/maps ETA API |
