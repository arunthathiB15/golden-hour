import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";
import { startLiveFeedSimulator } from "./data/hospitals.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.json({ service: "carepath-backend", docs: "/api/health, /api/hospitals, /api/symptom-map, /api/route" });
});

startLiveFeedSimulator(); // simulates a live HL7 FHIR / IoT feed drifting in the background

app.listen(PORT, () => {
  console.log(`CarePath backend listening on http://localhost:${PORT}`);
});
