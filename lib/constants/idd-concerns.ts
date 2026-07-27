export const IDD_CONCERNS = [
  "autism_spectrum",
  "down_syndrome",
  "cerebral_palsy",
  "adhd",
  "intellectual_disability",
  "global_developmental_delay",
  "speech_language",
  "sensory_processing",
  "learning_disability",
  "behavioural_disorder",
  "rare_genetic",
  "not_diagnosed",
] as const

export type IDDConcern = typeof IDD_CONCERNS[number]

export const IDD_CONCERN_LABELS: Record<IDDConcern, string> = {
  autism_spectrum: "Autism Spectrum Disorder (ASD)",
  down_syndrome: "Down Syndrome",
  cerebral_palsy: "Cerebral Palsy",
  adhd: "ADHD / Attention Disorder",
  intellectual_disability: "Intellectual Disability (unspecified)",
  global_developmental_delay: "Global Developmental Delay",
  speech_language: "Speech & Language Disorder",
  sensory_processing: "Sensory Processing Disorder",
  learning_disability: "Learning Disability",
  behavioural_disorder: "Behavioural Disorder",
  rare_genetic: "Rare Genetic / Chromosomal Condition",
  not_diagnosed: "Not Yet Diagnosed / Suspected",
}
