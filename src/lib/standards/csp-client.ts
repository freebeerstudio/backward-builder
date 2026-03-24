/**
 * Common Standards Project (CSP) API Client
 *
 * Fetches verified education standards from all 50 US states via the
 * open-source Common Standards Project API. No API key required.
 *
 * Source: https://commonstandardsproject.com
 * License: CC BY 3.0 US (data), Apache 2.0 (code)
 * API: https://api.commonstandardsproject.com/api/v1/
 *
 * Architecture:
 *  1. Fetch jurisdiction (state) → get standard set IDs
 *  2. Filter sets by subject + grade + published status
 *  3. Fetch individual standard set → get all standards with codes
 *  4. Cache aggressively — standards change infrequently
 *
 * This replaces our hand-curated standards database with comprehensive
 * coverage of every state's standards. The hand-curated NGSS/CCSS data
 * remains as a fast fallback if the API is unreachable.
 */

import type { VerifiedStandard } from "./types";

const API_BASE = "https://api.commonstandardsproject.com/api/v1";

// ---------------------------------------------------------------------------
//  In-memory caches — standards rarely change, cache aggressively
// ---------------------------------------------------------------------------

/** Cache: state name → jurisdiction data */
const jurisdictionCache = new Map<string, CSPJurisdiction>();

/** Cache: standard set ID → parsed standards */
const standardSetCache = new Map<string, VerifiedStandard[]>();

/** Cache: jurisdiction list (fetched once) */
let allJurisdictions: CSPJurisdictionSummary[] | null = null;

// ---------------------------------------------------------------------------
//  CSP API types
// ---------------------------------------------------------------------------

interface CSPJurisdictionSummary {
  id: string;
  title: string;
  type: string;
}

interface CSPStandardSet {
  id: string;
  title: string;
  subject: string;
  normalizedSubject?: string;
  educationLevels: string[];
  document?: {
    publicationStatus?: string;
  };
}

interface CSPJurisdiction {
  id: string;
  title: string;
  standardSets: Record<string, CSPStandardSet>;
}

interface CSPStandard {
  id: string;
  statementNotation?: string;
  description: string;
  depth?: number;
}

interface CSPStandardSetFull {
  id: string;
  title: string;
  subject: string;
  educationLevels: string[];
  standards: Record<string, CSPStandard>;
}

// ---------------------------------------------------------------------------
//  Grade normalization
// ---------------------------------------------------------------------------

/** Convert grade display string to CSP's 2-digit format */
function normalizeGrade(grade: string): string {
  const num = grade.replace(/\D/g, "");
  if (!num) return grade;
  return num.padStart(2, "0");
}

// ---------------------------------------------------------------------------
//  Subject normalization
// ---------------------------------------------------------------------------

/** Map our subject names to CSP's normalizedSubject values */
function matchesSubject(setSubject: string, normalizedSubject: string | undefined, targetSubject: string): boolean {
  const target = targetSubject.toLowerCase();
  const setLower = (setSubject || "").toLowerCase();
  const normLower = (normalizedSubject || "").toLowerCase();

  // Direct matches
  if (normLower === target) return true;
  if (setLower === target) return true;

  // Common mappings
  if (target === "science" && (normLower === "science" || setLower.includes("science"))) return true;
  if (target === "math" && (normLower === "math" || setLower.includes("math"))) return true;
  if ((target === "ela" || target === "language arts" || target === "english") &&
      (normLower === "ela" || setLower.includes("english") || setLower.includes("language arts") || setLower.includes("ela"))) return true;
  if ((target === "social studies" || target === "history") &&
      (setLower.includes("social studies") || setLower.includes("history"))) return true;

  return false;
}

// ---------------------------------------------------------------------------
//  API fetching with timeout and error handling
// ---------------------------------------------------------------------------

async function fetchCSP<T>(path: string): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`CSP API error: ${response.status} for ${path}`);
      return null;
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`CSP API unreachable: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all jurisdictions (cached after first call).
 * Returns state/org list or null if API unreachable.
 */
async function getJurisdictions(): Promise<CSPJurisdictionSummary[] | null> {
  if (allJurisdictions) return allJurisdictions;

  const data = await fetchCSP<{ data: CSPJurisdictionSummary[] }>("/jurisdictions");
  if (data?.data) {
    allJurisdictions = data.data;
    return allJurisdictions;
  }
  return null;
}

/**
 * Find the CSP jurisdiction ID for a given state name.
 */
async function findJurisdictionId(stateName: string): Promise<string | null> {
  const jurisdictions = await getJurisdictions();
  if (!jurisdictions) return null;

  const match = jurisdictions.find(
    (j) => j.type === "state" && j.title.toLowerCase() === stateName.toLowerCase()
  );
  return match?.id || null;
}

/**
 * Fetch a jurisdiction's standard sets and find the one matching
 * the given subject and grade.
 */
async function findStandardSetId(
  jurisdictionId: string,
  subject: string,
  grade: string
): Promise<string | null> {
  if (jurisdictionCache.has(jurisdictionId)) {
    const cached = jurisdictionCache.get(jurisdictionId)!;
    return pickBestSet(cached.standardSets, subject, grade);
  }

  const data = await fetchCSP<{ data: CSPJurisdiction }>(`/jurisdictions/${jurisdictionId}`);
  if (!data?.data) return null;

  jurisdictionCache.set(jurisdictionId, data.data);
  return pickBestSet(data.data.standardSets, subject, grade);
}

/** Pick the best matching standard set from a jurisdiction's sets */
function pickBestSet(
  sets: Record<string, CSPStandardSet>,
  subject: string,
  grade: string
): string | null {
  const normalizedGrade = normalizeGrade(grade);

  const candidates = Object.values(sets).filter((set) => {
    // Must be published
    if (set.document?.publicationStatus && set.document.publicationStatus !== "Published") return false;
    // Must match subject
    if (!matchesSubject(set.subject, set.normalizedSubject, subject)) return false;
    // Must include this grade level
    if (!set.educationLevels.includes(normalizedGrade)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  // Prefer the set with the fewest grade levels (most specific)
  candidates.sort((a, b) => a.educationLevels.length - b.educationLevels.length);
  return candidates[0].id;
}

/**
 * Fetch all standards from a standard set and convert to VerifiedStandard[].
 */
async function fetchStandardSet(setId: string): Promise<VerifiedStandard[]> {
  if (standardSetCache.has(setId)) {
    return standardSetCache.get(setId)!;
  }

  const data = await fetchCSP<{ data: CSPStandardSetFull }>(`/standard_sets/${setId}`);
  if (!data?.data?.standards) return [];

  const standards: VerifiedStandard[] = Object.values(data.data.standards)
    .filter((s) => s.statementNotation && s.description) // Must have a code
    .map((s) => ({
      code: s.statementNotation!,
      description: s.description.replace(/<[^>]*>/g, "").trim(), // Strip HTML tags
      url: null, // CSP doesn't provide source URLs — we resolve separately
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  standardSetCache.set(setId, standards);
  return standards;
}

/**
 * Main entry point: Get verified standards for a state + subject + grade.
 *
 * Returns VerifiedStandard[] from the Common Standards Project API,
 * or null if the API is unreachable or no matching standards found.
 *
 * The caller should fall back to the local hand-curated database
 * when this returns null.
 */
export async function fetchStandardsFromCSP(
  state: string,
  subject: string,
  grade: string
): Promise<VerifiedStandard[] | null> {
  try {
    // Step 1: Find the jurisdiction
    const jurisdictionId = await findJurisdictionId(state);
    if (!jurisdictionId) {
      console.log(`CSP: No jurisdiction found for "${state}"`);
      return null;
    }

    // Step 2: Find the matching standard set
    const setId = await findStandardSetId(jurisdictionId, subject, grade);
    if (!setId) {
      console.log(`CSP: No standard set found for ${state} / ${subject} / grade ${grade}`);
      return null;
    }

    // Step 3: Fetch the standards
    const standards = await fetchStandardSet(setId);
    if (standards.length === 0) {
      console.log(`CSP: Standard set ${setId} returned no standards`);
      return null;
    }

    console.log(`CSP: Found ${standards.length} ${subject} standards for ${state} grade ${grade}`);
    return standards;
  } catch (error) {
    console.error("CSP: Unexpected error:", error);
    return null;
  }
}
