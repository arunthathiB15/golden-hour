import React, { useEffect, useState, useCallback } from "react";
import SymptomForm from "./components/SymptomForm.jsx";
import MappingResult from "./components/MappingResult.jsx";
import HospitalList from "./components/HospitalList.jsx";
import NetworkMap from "./components/NetworkMap.jsx";
import StaffPanel from "./components/StaffPanel.jsx";
import { getHospitals, postRoute } from "./api";

const DEFAULT_LAT = 13.06;
const DEFAULT_LNG = 80.25;

export default function App() {
  const [hospitals, setHospitals] = useState(null);
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshHospitals = useCallback(() => {
    getHospitals().then((data) => setHospitals(data.hospitals)).catch(() => {});
  }, []);

  useEffect(() => {
    refreshHospitals();
    const id = setInterval(refreshHospitals, 6000); // reflect the simulated live feed
    return () => clearInterval(id);
  }, [refreshHospitals]);

  async function handleSubmit(text) {
    setLoading(true);
    setError(null);
    try {
      const data = await postRoute({ text, lat, lng });
      setRouteResult(data);
    } catch (e) {
      setError(e.message);
      setRouteResult(null);
    } finally {
      setLoading(false);
    }
  }

  function handleHospitalUpdated() {
    refreshHospitals();
  }

  const recommendedId = routeResult?.results?.recommended?.hospital?.id || null;

  return (
    <div>
      <header className="app-header">
        <h1>CarePath — The "Golden Hour" Trauma & Stroke Router</h1>
        <p><span className="live-dot" /> Live hospital status feed simulator running</p>
      </header>

      <div className="layout">
        <div>
          <SymptomForm
            onSubmit={handleSubmit}
            loading={loading}
            lat={lat}
            lng={lng}
            onLocationChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
          />
          {error && <div className="error-box">{error}</div>}
          <StaffPanel hospitals={hospitals} onUpdated={handleHospitalUpdated} />
        </div>

        <div>
          <NetworkMap
            hospitals={hospitals}
            patient={{ lat, lng }}
            recommendedId={recommendedId}
          />
          {routeResult && <MappingResult mapped={routeResult.mapped} />}
          {routeResult && (
            <HospitalList results={routeResult.results} requirements={routeResult.mapped.requirements} />
          )}
          {!routeResult && (
            <div className="card">
              <h2>3. Ranked routing decision</h2>
              <p className="muted">Describe an emergency on the left to see CarePath route it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
