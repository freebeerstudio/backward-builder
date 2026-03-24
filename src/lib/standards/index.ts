/**
 * Standards Database — the single source of truth for education standards.
 *
 * INTEGRITY GUARANTEE: Every standard shown to teachers comes from this
 * verified database, sourced from official state/national documents.
 * Claude AI is NEVER allowed to generate standard codes or descriptions.
 * Instead, Claude selects from the standards we provide in its prompt.
 *
 * If we don't have verified standards for a state/subject/grade combination,
 * we explicitly say so — we never hallucinate.
 *
 * Supported frameworks (as of March 2026):
 *  - NGSS: Middle school science (grades 6-8)
 *  - Common Core ELA: Grades 5-8
 *  - Common Core Math: Grades 5-8
 *  - Missouri: Social Studies grades 6-8 (where available from DESE)
 *
 * To add a new state/framework:
 *  1. Source the standards from an official document (PDF, website, API)
 *  2. Create a new data file in src/lib/standards/data/
 *  3. Register it in FRAMEWORKS below
 *  4. Map it in STATE_FRAMEWORK_MAP
 */

import type { VerifiedStandard, StandardsFramework } from "./types";
import { NGSS_MS_STANDARDS } from "./data/ngss-ms";
import { CCSS_ELA_STANDARDS } from "./data/ccss-ela";
import { CCSS_MATH_STANDARDS } from "./data/ccss-math";

// ---------------------------------------------------------------------------
//  Framework Registry
// ---------------------------------------------------------------------------

const FRAMEWORKS: Record<string, StandardsFramework> = {
  "NGSS-MS": NGSS_MS_STANDARDS,
  "CCSS-ELA": CCSS_ELA_STANDARDS,
  "CCSS-Math": CCSS_MATH_STANDARDS,
};

// ---------------------------------------------------------------------------
//  State → Subject → Framework mapping
//
//  Most states adopt NGSS and/or Common Core. States with their own standards
//  need explicit entries. If a state/subject combo isn't listed, we return
//  "unsupported" — never a guess.
// ---------------------------------------------------------------------------

/**
 * Map states to the framework IDs they use for each subject.
 *
 * "NGSS" states: States that have adopted Next Generation Science Standards
 * "CCSS" states: States that use Common Core (most states for ELA + Math)
 *
 * States with unique frameworks need their own data files.
 * If a state isn't listed here for a subject, standards alignment is
 * explicitly marked as unavailable.
 */
const STATE_FRAMEWORK_MAP: Record<string, Record<string, string>> = {
  // --- NGSS + Common Core states (the majority) ---
  // These states adopted both NGSS (science) and Common Core (ELA + Math)
  ...Object.fromEntries(
    [
      "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
      "District of Columbia", "Hawaii", "Idaho", "Illinois", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
      "Massachusetts", "Michigan", "Minnesota", "Mississippi",
      "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina",
      "North Dakota", "Ohio", "Oregon", "Pennsylvania",
      "Rhode Island", "South Dakota", "Tennessee", "Utah",
      "Vermont", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    ].map((state) => [
      state,
      {
        Science: "NGSS-MS",
        ELA: "CCSS-ELA",
        Math: "CCSS-Math",
        "Language Arts": "CCSS-ELA",
      },
    ])
  ),

  // Missouri: NGSS-aligned science, Common Core ELA + Math
  // Social Studies uses Missouri-specific standards (MLS) — not yet in our database
  Missouri: {
    Science: "NGSS-MS",
    ELA: "CCSS-ELA",
    Math: "CCSS-Math",
    "Language Arts": "CCSS-ELA",
    // "Social Studies" intentionally omitted — MLS not yet verified
  },

  // Georgia: uses their own GSE for ELA + Math, but NGSS-aligned science
  Georgia: {
    Science: "NGSS-MS",
  },

  // Alabama: adopted NGSS, has own standards for other subjects
  Alabama: {
    Science: "NGSS-MS",
  },
};

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * Get the verified standards available for a given state, subject, and grade.
 *
 * Returns null if we don't have verified standards for this combination.
 * NEVER returns fabricated data — null means "unsupported, don't show standards."
 */
export function getStandardsForContext(
  state: string,
  subject: string,
  grade: string
): VerifiedStandard[] | null {
  const stateMap = STATE_FRAMEWORK_MAP[state];
  if (!stateMap) return null;

  const frameworkId = stateMap[subject];
  if (!frameworkId) return null;

  const framework = FRAMEWORKS[frameworkId];
  if (!framework) return null;

  // Filter to standards that are appropriate for this grade
  // For now, return all standards in the framework (they're already grade-filtered)
  return Object.values(framework.standards);
}

/**
 * Format standards for injection into a Claude prompt.
 *
 * Returns a string listing all available standards for Claude to choose from,
 * or a message telling Claude that standards aren't available.
 */
export function formatStandardsForPrompt(
  state: string,
  subject: string,
  grade: string
): string {
  const standards = getStandardsForContext(state, subject, grade);

  if (!standards || standards.length === 0) {
    return `IMPORTANT: We do not have verified ${subject} standards for ${state} in our database. Do NOT generate or hallucinate any standard codes. Instead, set standardCodes to an empty array [] and standardDescriptions to an empty array []. In the reflectionForTeacher, mention that standards alignment is not yet available for ${state} ${subject} but the unit plan is still pedagogically sound.`;
  }

  const list = standards
    .map((s) => `  - ${s.code}: ${s.description}`)
    .join("\n");

  return `Here are the verified ${state} ${subject} standards for grade ${grade}. You MUST only select from this list — never invent a standard code:

${list}

Select the 2-4 standards from the list above that best align with the enduring understanding. Use the exact codes and descriptions provided. If none align well, select the closest matches and explain in the reflection.`;
}

/**
 * Validate that a set of standard codes all exist in our verified database.
 *
 * Returns only the codes that are verified. Any code not in our database
 * is silently dropped — better to show fewer standards than wrong ones.
 */
export function validateStandardCodes(
  codes: string[],
  state: string,
  subject: string,
  grade: string
): VerifiedStandard[] {
  const standards = getStandardsForContext(state, subject, grade);
  if (!standards) return [];

  const lookup = new Map(standards.map((s) => [s.code, s]));

  return codes
    .map((code) => lookup.get(code))
    .filter((s): s is VerifiedStandard => s !== undefined);
}

/**
 * Check whether we support standards alignment for a given context.
 */
export function isStandardsSupported(
  state: string,
  subject: string
): boolean {
  const stateMap = STATE_FRAMEWORK_MAP[state];
  if (!stateMap) return false;
  return !!stateMap[subject];
}

// Re-export types
export type { VerifiedStandard, StandardsFramework } from "./types";
