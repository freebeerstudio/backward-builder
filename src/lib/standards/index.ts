/**
 * Standards Database — the single source of truth for education standards.
 *
 * INTEGRITY GUARANTEE: Every standard shown to teachers comes from a verified
 * source. Claude AI is NEVER allowed to generate standard codes or descriptions.
 *
 * Source priority:
 *  1. Common Standards Project API (all 50 states, live data)
 *  2. Local hand-curated database (NGSS, CCSS — fast fallback)
 *  3. Explicit "unsupported" — never hallucinate
 *
 * Attribution: Standards data from Common Standards Project (CC BY 3.0 US)
 * https://commonstandardsproject.com
 */

import type { VerifiedStandard, StandardsFramework } from "./types";
import { fetchStandardsFromCSP } from "./csp-client";
import { NGSS_MS_STANDARDS } from "./data/ngss-ms";
import { CCSS_ELA_STANDARDS } from "./data/ccss-ela";
import { CCSS_MATH_STANDARDS } from "./data/ccss-math";

// ---------------------------------------------------------------------------
//  Local fallback frameworks
// ---------------------------------------------------------------------------

const FRAMEWORKS: Record<string, StandardsFramework> = {
  "NGSS-MS": NGSS_MS_STANDARDS,
  "CCSS-ELA": CCSS_ELA_STANDARDS,
  "CCSS-Math": CCSS_MATH_STANDARDS,
};

/** Map subject names to local framework IDs for fallback */
function getLocalFallbackFrameworkId(subject: string): string | null {
  const lower = subject.toLowerCase();
  // Science family → NGSS
  if (["science", "biology", "chemistry", "physics", "earth science", "environmental science"].includes(lower))
    return "NGSS-MS";
  // ELA → CCSS-ELA
  if (["english language arts", "ela", "language arts", "english"].includes(lower))
    return "CCSS-ELA";
  // Math → CCSS-Math
  if (["mathematics", "math"].includes(lower))
    return "CCSS-Math";
  // Social Studies family → CCSS-ELA (RH strand for reading history)
  if (["history / social studies", "u.s. history", "world history", "civics / government", "economics", "geography"].includes(lower))
    return "CCSS-ELA";
  return null;
}

// ---------------------------------------------------------------------------
//  Cache for CSP results (avoid re-fetching in the same request lifecycle)
// ---------------------------------------------------------------------------

const cspCache = new Map<string, VerifiedStandard[] | null>();

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * Get verified standards for a state + subject + grade.
 *
 * Tries Common Standards Project API first (all 50 states).
 * Falls back to local hand-curated data (NGSS, CCSS).
 * Returns null if NO verified source is available — NEVER hallucinate.
 */
export async function getStandardsForContext(
  state: string,
  subject: string,
  grade: string
): Promise<VerifiedStandard[] | null> {
  const cacheKey = `${state}|${subject}|${grade}`;

  // Check CSP cache first
  if (cspCache.has(cacheKey)) {
    return cspCache.get(cacheKey) || null;
  }

  // Try CSP API (all 50 states)
  const cspStandards = await fetchStandardsFromCSP(state, subject, grade);
  if (cspStandards && cspStandards.length > 0) {
    cspCache.set(cacheKey, cspStandards);
    return cspStandards;
  }

  // Fallback to local hand-curated database
  const frameworkId = getLocalFallbackFrameworkId(subject);
  if (frameworkId && FRAMEWORKS[frameworkId]) {
    const localStandards = Object.values(FRAMEWORKS[frameworkId].standards);
    if (localStandards.length > 0) {
      cspCache.set(cacheKey, localStandards);
      return localStandards;
    }
  }

  // No verified source available — return null, NEVER fabricate
  cspCache.set(cacheKey, null);
  return null;
}

/**
 * Format standards for injection into a Claude prompt.
 *
 * Returns a string listing all available standards for Claude to choose from,
 * or instructions telling Claude that standards aren't available.
 */
export async function formatStandardsForPrompt(
  state: string,
  subject: string,
  grade: string
): Promise<string> {
  const standards = await getStandardsForContext(state, subject, grade);

  if (!standards || standards.length === 0) {
    return `IMPORTANT: We do not have verified ${subject} standards for ${state} in our database. Do NOT generate or hallucinate any standard codes. Instead, set standardCodes to an empty array [] and standardDescriptions to an empty array []. In the reflectionForTeacher, mention that standards alignment is not yet available for ${state} ${subject} but the unit plan is still pedagogically sound.`;
  }

  // For very large standard sets (100+), include only the first ~80 to stay
  // within Claude's context budget while still providing good coverage
  const displayStandards = standards.length > 80 ? standards.slice(0, 80) : standards;

  const list = displayStandards
    .map((s) => `  - ${s.code}: ${s.description}`)
    .join("\n");

  const truncationNote = standards.length > 80
    ? `\n(Showing ${displayStandards.length} of ${standards.length} standards — select from these.)\n`
    : "";

  return `Here are the verified ${state} ${subject} standards for grade ${grade}. You MUST only select from this list — never invent a standard code:

${list}${truncationNote}
Select the 2-4 standards from the list above that best align with the enduring understanding. Use the exact codes and descriptions provided. If none align well, select the closest matches and explain in the reflection.`;
}

/**
 * Validate that a set of standard codes all exist in our verified database.
 *
 * Returns only the codes that are verified. Any code not in our database
 * is silently dropped — better to show fewer standards than wrong ones.
 */
export async function validateStandardCodes(
  codes: string[],
  state: string,
  subject: string,
  grade: string
): Promise<VerifiedStandard[]> {
  const standards = await getStandardsForContext(state, subject, grade);
  if (!standards) return [];

  const lookup = new Map(standards.map((s) => [s.code, s]));

  return codes
    .map((code) => lookup.get(code))
    .filter((s): s is VerifiedStandard => s !== undefined);
}

/**
 * Check whether we support standards alignment for a given context.
 * Tries CSP first, then local fallback.
 */
export async function isStandardsSupported(
  state: string,
  subject: string,
  grade: string = "07"
): Promise<boolean> {
  const standards = await getStandardsForContext(state, subject, grade);
  return standards !== null && standards.length > 0;
}

// Re-export types
export type { VerifiedStandard, StandardsFramework } from "./types";
