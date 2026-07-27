export const CARE_RELATIONSHIPS = [
  "self",
  "child",
  "sibling_parent",
  "other_dependent",
  "professional_carer",
] as const

export const CARE_RELATIONSHIP_LABELS: Record<typeof CARE_RELATIONSHIPS[number], string> = {
  self: "Myself — I have an IDD",
  child: "My child",
  sibling_parent: "My sibling or parent",
  other_dependent: "Another person I care for",
  professional_carer: "A client (I am a paid carer / support worker)",
}

export const PATIENT_AGE_GROUPS = ["under_5", "5_12", "13_17", "18_35", "over_35"] as const

export const PATIENT_AGE_GROUP_LABELS: Record<typeof PATIENT_AGE_GROUPS[number], string> = {
  under_5: "Under 5",
  "5_12": "5 – 12",
  "13_17": "13 – 17",
  "18_35": "18 – 35",
  over_35: "Over 35",
}

export const DIAGNOSIS_STATUSES = ["diagnosed", "awaiting", "not_assessed", "prefer_not"] as const

export const DIAGNOSIS_STATUS_LABELS: Record<typeof DIAGNOSIS_STATUSES[number], string> = {
  diagnosed: "Already diagnosed",
  awaiting: "Awaiting diagnosis",
  not_assessed: "Not yet assessed",
  prefer_not: "Prefer not to say",
}
