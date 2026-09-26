import React from "react";

const CAP_LABELS = {
  ct: "CT/MRI",
  cathlab: "Cath Lab",
  neurologist: "Neurologist",
  surgeon: "Surgeon",
  bloodbank: "Blood Bank",
  cardiologist: "Cardiologist",
};

function HospitalCard({ entry, recommended, requirements }) {
  const { hospital, distanceKm, transitMinutes, erWaitMinutes, totalMinutes, eligible, missing } = entry;
  const relevantCaps = Object.keys(requirements || {}).filter((k) => requirements[k]);
  const capsToShow = relevantCaps.length ? relevantCaps : Object.keys(hospital.capabilities);

  return (
    <div className={`hospital-card ${recommended ? "recommended" : ""} ${!eligible ? "excluded" : ""}`}>
      {recommended && <span className="tag">Best match</span>}
      <div className="top-row">
        <h3>{hospital.name}</h3>
        {!eligible && <span className="badge critical">Skipped</span>}
      </div>

      <div className="metrics">
        <div><b>{distanceKm} km</b>distance</div>
        <div><b>{transitMinutes} min</b>transit</div>
        <div><b>{erWaitMinutes} min</b>ER wait</div>
        <div><b>{totalMinutes} min</b>total time</div>
      </div>

      <div className="caps">
        {capsToShow.map((k) => (
          <span key={k} className={`cap-pill ${hospital.capabilities[k] ? "up" : "down"}`}>
            {CAP_LABELS[k] || k}: {hospital.capabilities[k] ? "Active" : "Down"}
          </span>
        ))}
      </div>

      {!eligible && missing.length > 0 && (
        <div className="missing-note">
          Excluded — missing: {missing.map((m) => CAP_LABELS[m] || m).join(", ")}
        </div>
      )}
    </div>
  );
}

export default function HospitalList({ results, requirements }) {
  if (!results) return null;
  const { eligible, excluded } = results;

  return (
    <div className="card">
      <h2>3. Ranked routing decision</h2>
      {eligible.length === 0 && (
        <p className="muted">No hospital in the network currently meets every requirement — CarePath would escalate to the nearest option with a live warning to the crew.</p>
      )}
      {eligible.map((entry, i) => (
        <HospitalCard key={entry.hospital.id} entry={entry} recommended={i === 0} requirements={requirements} />
      ))}

      {excluded.length > 0 && (
        <>
          <div className="section-title">Skipped despite proximity ({excluded.length})</div>
          {excluded.map((entry) => (
            <HospitalCard key={entry.hospital.id} entry={entry} recommended={false} requirements={requirements} />
          ))}
        </>
      )}
    </div>
  );
}
