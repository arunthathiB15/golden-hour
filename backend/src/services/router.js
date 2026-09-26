// Route optimisation: Total Time = Transit Time + Live ER Intake Wait Time.
//
// Transit time currently uses a haversine straight-line distance and an
// average urban ambulance speed constant. Swapping in a real maps/traffic
// ETA API only requires replacing `estimateTransitMinutes()` below — every
// caller here just awaits a minutes number.

const AVG_AMBULANCE_SPEED_KMH = 28; // conservative urban average incl. traffic

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function estimateTransitMinutes(distanceKm) {
  return (distanceKm / AVG_AMBULANCE_SPEED_KMH) * 60;
}

function meetsRequirements(hospital, requirements, wantsCentre) {
  const capabilityOk = Object.entries(requirements).every(
    ([key, needed]) => !needed || hospital.capabilities[key] === true
  );
  const centreOk = !wantsCentre || hospital[wantsCentre] === true;
  return capabilityOk && centreOk;
}

/**
 * @param {{lat:number, lng:number}} patientLocation
 * @param {object} requirements  e.g. { ct: true, neurologist: true }
 * @param {string|null} wantsCentre  "isStrokeCentre" | "isTraumaCentre" | null
 * @param {Array} hospitals  from hospitalStore.getHospitals()
 */
export function rankHospitals(patientLocation, requirements, wantsCentre, hospitals) {
  const scored = hospitals.map((h) => {
    const distanceKm = haversineKm(patientLocation, { lat: h.lat, lng: h.lng });
    const transitMinutes = estimateTransitMinutes(distanceKm);
    const erWaitMinutes = h.erWaitMinutes;
    const totalMinutes = transitMinutes + erWaitMinutes;
    const eligible = meetsRequirements(h, requirements, wantsCentre);
    const missing = Object.entries(requirements)
      .filter(([key, needed]) => needed && h.capabilities[key] !== true)
      .map(([key]) => key);
    if (wantsCentre && h[wantsCentre] !== true) missing.push(wantsCentre.replace("is", "").toLowerCase());

    return {
      hospital: {
        id: h.id,
        name: h.name,
        lat: h.lat,
        lng: h.lng,
        capabilities: h.capabilities,
        isStrokeCentre: h.isStrokeCentre,
        isTraumaCentre: h.isTraumaCentre,
        lastUpdated: h.lastUpdated,
        updatedBy: h.updatedBy,
      },
      distanceKm: Number(distanceKm.toFixed(2)),
      transitMinutes: Math.round(transitMinutes),
      erWaitMinutes,
      totalMinutes: Math.round(totalMinutes),
      eligible,
      missing,
    };
  });

  const eligible = scored.filter((s) => s.eligible).sort((a, b) => a.totalMinutes - b.totalMinutes);
  const excluded = scored.filter((s) => !s.eligible).sort((a, b) => a.distanceKm - b.distanceKm);

  return { eligible, excluded };
}
