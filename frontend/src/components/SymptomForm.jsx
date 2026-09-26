import React, { useState } from "react";

const EXAMPLES = [
  {
    label: "Stroke",
    text: "sudden facial drooping, cannot lift right arm, slurred speech",
  },
  {
    label: "Trauma",
    text: "car accident, heavy bleeding, unconscious after head injury",
  },
  {
    label: "Cardiac",
    text: "crushing chest pain and shortness of breath",
  },
];

export default function SymptomForm({ onSubmit, loading, lat, lng, onLocationChange }) {
  const [text, setText] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
  }

  return (
    <div className="card">
      <h2>1. Describe the emergency</h2>
      <form onSubmit={submit}>
        <textarea
          placeholder="e.g. sudden facial drooping, can't lift right arm, slurred speech"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="quick-fills">
          {EXAMPLES.map((ex) => (
            <button type="button" key={ex.label} onClick={() => setText(ex.text)}>
              {ex.label} example
            </button>
          ))}
        </div>

        <div className="field-row">
          <div>
            <label>Patient latitude</label>
            <input
              type="number"
              step="0.0001"
              value={lat}
              onChange={(e) => onLocationChange(Number(e.target.value), lng)}
            />
          </div>
          <div>
            <label>Patient longitude</label>
            <input
              type="number"
              step="0.0001"
              value={lng}
              onChange={(e) => onLocationChange(lat, Number(e.target.value))}
            />
          </div>
        </div>
        <p className="muted" style={{ marginTop: 6 }}>
          Defaults to a sample Chennai location. In production this comes from
          the caller's GPS or the ambulance's live position.
        </p>

        <button className="primary-btn" type="submit" disabled={loading || !text.trim()}>
          {loading ? "Routing…" : "Find fastest-to-treat hospital"}
        </button>
      </form>
    </div>
  );
}
