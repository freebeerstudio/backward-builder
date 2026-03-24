/**
 * standards-urls.ts — Deterministic URL resolver for education standards.
 *
 * Instead of trusting Claude to generate correct URLs (it hallucinates them),
 * this module maps known standard code patterns to verified, authoritative
 * source pages. If a code doesn't match any known pattern, we return the
 * best available search page for the state/framework.
 *
 * Verified sources (March 2026):
 *  - NGSS: nextgenscience.org (search by code)
 *  - Common Core ELA: thecorestandards.org (path derivable from code)
 *  - Common Core Math: thecorestandards.org (path derivable from code)
 *  - Texas TEKS: teksguide.org (path derivable from code)
 *  - Missouri: dese.mo.gov (PDF-only, link to subject hub)
 *  - California: cde.ca.gov search tool
 *  - New York: nysed.gov (PDF-only, link to subject hub)
 *  - Florida: cpalms.org search
 */

// ---------------------------------------------------------------------------
//  NGSS — Next Generation Science Standards
// ---------------------------------------------------------------------------

function resolveNGSS(code: string): string {
  // Best approach: link to the NGSS search with the code as query
  // e.g., "NGSS MS-LS2-2" → search for "MS-LS2-2"
  const searchCode = code.replace(/^NGSS\s*/i, "").trim();
  return `https://www.nextgenscience.org/search-standards?keys=${encodeURIComponent(searchCode)}`;
}

// ---------------------------------------------------------------------------
//  Common Core ELA — thecorestandards.org
// ---------------------------------------------------------------------------

function resolveCCSSELA(code: string): string {
  // "CCSS.ELA-LITERACY.RH.6-8.2" → path: /ELA-Literacy/RH/6-8/2/
  const stripped = code
    .replace(/^CCSS\.ELA-LITERACY\./i, "")
    .replace(/\./g, "/");
  return `https://www.thecorestandards.org/ELA-Literacy/${stripped}/`;
}

// ---------------------------------------------------------------------------
//  Common Core Math — thecorestandards.org
// ---------------------------------------------------------------------------

function resolveCCSSMath(code: string): string {
  // "CCSS.MATH.CONTENT.6.RP.A.1" → path: /Math/Content/6/RP/A/1/
  const stripped = code
    .replace(/^CCSS\.MATH\.CONTENT\./i, "")
    .replace(/\./g, "/");
  return `https://www.thecorestandards.org/Math/Content/${stripped}/`;
}

// ---------------------------------------------------------------------------
//  Texas TEKS — teksguide.org
// ---------------------------------------------------------------------------

function resolveTEKS(code: string): string {
  // "TEKS S.2.13" → teksguide.org/teks/s213/overview
  // Strip "TEKS " prefix, lowercase, remove dots
  const compressed = code
    .replace(/^TEKS\s*/i, "")
    .toLowerCase()
    .replace(/\./g, "");
  return `https://teksguide.org/teks/${compressed}/overview`;
}

// ---------------------------------------------------------------------------
//  State-specific fallback URLs (subject search/hub pages)
// ---------------------------------------------------------------------------

/** Best available URL for states that only offer PDF downloads or search pages */
const STATE_STANDARDS_URLS: Record<string, Record<string, string> | string> = {
  Missouri: {
    "Social Studies": "https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards",
    Science: "https://dese.mo.gov/college-career-readiness/curriculum/science",
    ELA: "https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards",
    Math: "https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards",
    default: "https://dese.mo.gov/college-career-readiness/curriculum/missouri-learning-standards",
  },
  California: "https://www2.cde.ca.gov/cacs/",
  "New York": {
    ELA: "https://www.nysed.gov/standards-instruction/english-language-arts",
    Math: "https://www.nysed.gov/standards-instruction/mathematics",
    Science: "https://www.nysed.gov/standards-instruction/science",
    "Social Studies": "https://www.nysed.gov/standards-instruction/social-studies",
    default: "https://www.nysed.gov/standards-instruction",
  },
  Florida: "https://www.cpalms.org/public/search/standard",
  Georgia: "https://www.georgiastandards.org/Georgia-Standards/Pages/default.aspx",
  Virginia: "https://www.doe.virginia.gov/teaching-learning-assessment/k-12-standards-of-learning",
  Illinois: "https://www.isbe.net/Pages/Learning-Standards.aspx",
  Ohio: "https://education.ohio.gov/Topics/Learning-in-Ohio/OLS-Graphic-Sections/Learning-Standards",
  Pennsylvania: "https://www.pdesas.org/Standard/View",
};

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * Resolve a standard code to its best available URL.
 *
 * Priority:
 * 1. Exact pattern match (NGSS, CCSS ELA, CCSS Math, TEKS) → direct link
 * 2. State + subject fallback → standards hub/search page
 * 3. Generic fallback → Google search for the code
 */
export function resolveStandardUrl(
  code: string,
  state?: string,
  subject?: string
): string {
  const trimmed = code.trim();

  // --- NGSS ---
  if (/^(NGSS\s+)?[A-Z]{1,2}S?-[A-Z]{2,4}\d?-\d/i.test(trimmed) || /^NGSS/i.test(trimmed)) {
    return resolveNGSS(trimmed);
  }

  // --- Common Core ELA ---
  if (/^CCSS\.ELA/i.test(trimmed)) {
    return resolveCCSSELA(trimmed);
  }

  // --- Common Core Math ---
  if (/^CCSS\.MATH/i.test(trimmed)) {
    return resolveCCSSMath(trimmed);
  }

  // --- Texas TEKS ---
  if (/^TEKS/i.test(trimmed) || (state && /Texas/i.test(state) && /^\w+\.\d/i.test(trimmed))) {
    return resolveTEKS(trimmed);
  }

  // --- State-specific fallback ---
  if (state) {
    const stateEntry = STATE_STANDARDS_URLS[state];
    if (stateEntry) {
      if (typeof stateEntry === "string") return stateEntry;
      if (subject && stateEntry[subject]) return stateEntry[subject];
      return stateEntry.default || Object.values(stateEntry)[0];
    }
  }

  // --- Generic fallback: Google search for the standard code ---
  return `https://www.google.com/search?q=${encodeURIComponent(`${trimmed} education standard`)}`;
}

/**
 * Resolve an array of standard codes to URLs.
 * Use this instead of relying on Claude-generated URLs.
 */
export function resolveStandardUrls(
  codes: string[],
  state?: string,
  subject?: string
): string[] {
  return codes.map((code) => resolveStandardUrl(code, state, subject));
}
