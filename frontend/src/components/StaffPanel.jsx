import React, { useState } from "react";
import { patchHospitalStatus } from "../api";

export default function StaffPanel({ hospitals, onUpdated }) {
  const [openId, setOpenId] = useState(hospitals?.[0]?.id || null);
  const [busy, setBusy] = useState(false);

  async function toggleCap(hospitalId, capKey, current) {
    setBusy(true);
    try {
      const updated = await patchHospitalStatus(hospitalId, { capabilities: { [capKey]: !current } });
      onUpdated(updated);
    } finally {
      setBusy(false);
    }
  }

  if (!hospitals) return null;

  return (
    <div className="card">
      <h2>Hospital staff panel — manual status-ping fallback</h2>
      <p className="muted">
        Represents the fallback tier for hospitals without EHR/IoT integration: staff
        push a status update directly instead of relying on an automated feed.
      </p>
      <select
        value={openId || ""}
        onChange={(e) => setOpenId(e.target.value)}
        style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #dce7ea", marginBottom: 10 }}
      >
        {hospitals.map((h) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>

      {hospitals
        .filter((h) => h.id === openId)
        .map((h) => (
          <div key={h.id}>
            {Object.entries(h.capabilities).map(([capKey, val]) => (
              <div className="staff-panel-row" key={capKey}>
                <span>{capKey}</span>
                <button
                  className={`toggle-btn ${val ? "on" : "off"}`}
                  disabled={busy}
                  onClick={() => toggleCap(h.id, capKey, val)}
                >
                  {val ? "Active — mark down" : "Down — mark active"}
                </button>
              </div>
            ))}
            <p className="muted" style={{ marginTop: 8 }}>
              ER wait: <b>{h.erWaitMinutes} min</b> · last updated by <i>{h.updatedBy}</i>
            </p>
          </div>
        ))}
    </div>
  );
}
