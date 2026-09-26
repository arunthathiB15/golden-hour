import React from "react";

const W = 340;
const H = 300;
const PAD = 30;

export default function NetworkMap({ hospitals, patient, recommendedId }) {
  if (!hospitals || hospitals.length === 0) return null;

  const lats = hospitals.map((h) => h.lat).concat(patient ? [patient.lat] : []);
  const lngs = hospitals.map((h) => h.lng).concat(patient ? [patient.lng] : []);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  function project(lat, lng) {
    const x = PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (W - 2 * PAD);
    // invert y since latitude increases upward but SVG y increases downward
    const y = H - PAD - ((lat - minLat) / (maxLat - minLat || 1)) * (H - 2 * PAD);
    return [x, y];
  }

  return (
    <div className="card">
      <h2>Live network map</h2>
      <svg className="network-map" viewBox={`0 0 ${W} ${H}`}>
        {hospitals.map((h) => {
          const [x, y] = project(h.lat, h.lng);
          const anyDown = Object.values(h.capabilities).some((v) => v === false);
          const isRecommended = h.id === recommendedId;
          return (
            <g key={h.id} className="hosp-dot">
              <circle
                cx={x}
                cy={y}
                r={isRecommended ? 8 : 6}
                fill={isRecommended ? "#2a9d63" : anyDown ? "#e63946" : "#1c7293"}
                stroke="white"
                strokeWidth="1.5"
              />
              <text x={x + 9} y={y + 3}>{h.name.split(" ").slice(0, 2).join(" ")}</text>
            </g>
          );
        })}
        {patient && (() => {
          const [x, y] = project(patient.lat, patient.lng);
          return (
            <g>
              <circle cx={x} cy={y} r="7" fill="#0b3d53" stroke="white" strokeWidth="2" />
              <text x={x + 9} y={y + 3} fontWeight="700">Patient</text>
            </g>
          );
        })()}
      </svg>
      <p className="muted">
        <span style={{ color: "#2a9d63" }}>●</span> recommended &nbsp;
        <span style={{ color: "#e63946" }}>●</span> a capability is currently down &nbsp;
        <span style={{ color: "#1c7293" }}>●</span> fully operational
      </p>
    </div>
  );
}
