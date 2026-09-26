import { Router } from "express";
import { getHospitals, getHospital, updateStatus, REQUIREMENT_KEYS } from "../data/hospitals.js";
import { mapSymptomsToRequirements } from "../services/symptomMapper.js";
import { rankHospitals } from "../services/router.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", service: "carepath-backend" });
});

router.get("/hospitals", (req, res) => {
  res.json({ hospitals: getHospitals(), requirementKeys: REQUIREMENT_KEYS });
});

router.post("/symptom-map", (req, res) => {
  const { text } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Provide a non-empty 'text' field describing the symptoms." });
  }
  res.json(mapSymptomsToRequirements(text));
});

// Manual status-ping fallback endpoint — represents the hospital-staff app.
router.patch("/hospitals/:id/status", (req, res) => {
  const { id } = req.params;
  const { capabilities, erWaitMinutes } = req.body || {};
  const updated = updateStatus(id, { capabilities, erWaitMinutes }, "hospital-staff");
  if (!updated) return res.status(404).json({ error: "Hospital not found" });
  res.json(updated);
});

// Core routing endpoint: symptom text + patient location -> ranked hospitals.
router.post("/route", (req, res) => {
  const { text, lat, lng } = req.body || {};
  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Provide a non-empty 'text' field describing the symptoms." });
  }
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "Provide numeric 'lat' and 'lng' for the patient location." });
  }

  const mapped = mapSymptomsToRequirements(text);
  const hospitals = getHospitals();
  const { eligible, excluded } = rankHospitals(
    { lat, lng },
    mapped.requirements,
    mapped.wantsCentre,
    hospitals
  );

  res.json({
    query: { text, lat, lng },
    mapped,
    results: {
      recommended: eligible[0] || null,
      eligible,
      excluded,
    },
  });
});

export default router;
