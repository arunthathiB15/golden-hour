// Non-diagnostic intent mapper.
//
// IMPORTANT: this module never produces a diagnosis. It only maps lay
// symptom language to *facility requirements* — the same non-diagnostic
// scope described in the solution document, which keeps CarePath outside
// clinical decision-making and SaMD (Software as a Medical Device) territory.
//
// This is a rule-based keyword classifier for demo transparency and speed.
// A production system would swap this for a small trained NLP model behind
// the same `mapSymptomsToRequirements(text)` function signature.

const RULES = [
  {
    tag: "stroke",
    keywords: [
      "facial droop", "face droop", "drooping", "slurred speech", "can't lift",
      "cannot lift", "arm weakness", "leg weakness", "one side", "numbness",
      "sudden confusion", "vision loss", "sudden dizziness", "stroke", "balance",
    ],
    requirements: { ct: true, neurologist: true },
    label: "Stroke Centre · Active CT · Neurologist On-Call",
    urgency: "Critical",
    wantsCentre: "isStrokeCentre",
  },
  {
    tag: "cardiac",
    keywords: [
      "chest pain", "chest pressure", "heart attack", "shortness of breath",
      "can't breathe", "cannot breathe", "palpitations", "crushing pain",
    ],
    requirements: { cathlab: true, cardiologist: true },
    label: "Cath Lab Active · Cardiologist On-Call",
    urgency: "Critical",
    wantsCentre: null,
  },
  {
    tag: "trauma",
    keywords: [
      "accident", "bleeding", "fracture", "broken bone", "unconscious",
      "head injury", "car crash", "fell from", "severe injury", "wound",
      "hit by", "collision",
    ],
    requirements: { ct: true, surgeon: true, bloodbank: true },
    label: "Trauma Centre · Active CT · Surgeon On-Call · Blood Bank Stocked",
    urgency: "Critical",
    wantsCentre: "isTraumaCentre",
  },
];

const FALLBACK = {
  tag: "general",
  requirements: {},
  label: "General Emergency Department",
  urgency: "Moderate",
  wantsCentre: null,
};

export function mapSymptomsToRequirements(rawText) {
  const text = (rawText || "").toLowerCase();
  const matched = RULES.filter((rule) => rule.keywords.some((k) => text.includes(k)));

  if (matched.length === 0) {
    return {
      ...FALLBACK,
      matchedKeywords: [],
      note: "No specific critical-care keywords detected — routed as a general emergency. This is not a diagnosis.",
    };
  }

  // Combine requirements/urgency if more than one category matched (e.g. trauma + head injury).
  const requirements = {};
  const labels = [];
  const matchedKeywords = [];
  let wantsCentre = null;
  matched.forEach((rule) => {
    Object.assign(requirements, rule.requirements);
    labels.push(rule.label);
    if (rule.wantsCentre) wantsCentre = rule.wantsCentre;
    rule.keywords.forEach((k) => {
      if (text.includes(k)) matchedKeywords.push(k);
    });
  });

  return {
    tag: matched.map((r) => r.tag).join("+"),
    requirements,
    label: labels.join(" | "),
    urgency: "Critical",
    wantsCentre,
    matchedKeywords,
    note: "Non-diagnostic: this describes infrastructure requirements only, not a medical diagnosis.",
  };
}
