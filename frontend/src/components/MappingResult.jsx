import React from "react";

export default function MappingResult({ mapped }) {
  if (!mapped) return null;
  const reqKeys = Object.keys(mapped.requirements || {}).filter((k) => mapped.requirements[k]);

  return (
    <div className="card">
      <h2>2. Non-diagnostic requirement mapping</h2>
      <span className={`badge ${mapped.urgency === "Critical" ? "critical" : "moderate"}`}>
        {mapped.urgency} urgency
      </span>
      <div className="mapping-box">
        <strong>{mapped.label}</strong>
        <div className="chips">
          {reqKeys.length === 0 && <span className="chip">No specific equipment required</span>}
          {reqKeys.map((k) => (
            <span className="chip" key={k}>{k}</span>
          ))}
          {mapped.wantsCentre && (
            <span className="chip">{mapped.wantsCentre.replace("is", "")}</span>
          )}
        </div>
        <div className="note">{mapped.note}</div>
      </div>
    </div>
  );
}
