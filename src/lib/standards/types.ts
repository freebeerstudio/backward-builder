/**
 * Type definitions for the verified standards database.
 *
 * DESIGN PRINCIPLE: Every standard code, description, and URL in this app
 * comes from an official source — never from AI generation. Claude selects
 * from our verified set; it never invents standard codes.
 */

/** A single verified education standard */
export interface VerifiedStandard {
  /** The official code (e.g., "MS-LS2-2", "CCSS.ELA-LITERACY.RL.6.1") */
  code: string;
  /** Full official text of the standard */
  description: string;
  /** URL to the authoritative source (or null if no web-accessible source) */
  url: string | null;
  /** Title of the standard set (e.g., "Missouri Science Standards") — from CSP */
  setTitle?: string;
  /** Subject area (e.g., "Science", "Mathematics") — from CSP */
  setSubject?: string;
  /** Education levels covered (e.g., ["06", "07", "08"]) — from CSP */
  setEducationLevels?: string[];
}

/** A standards framework with its metadata and standards */
export interface StandardsFramework {
  /** Short identifier (e.g., "NGSS", "CCSS-ELA", "CCSS-Math", "MO") */
  id: string;
  /** Display name (e.g., "Next Generation Science Standards") */
  name: string;
  /** Which subjects this framework covers */
  subjects: string[];
  /** Which grade levels are included (e.g., ["5", "6", "7", "8"]) */
  grades: string[];
  /** The verified standards, keyed by code for O(1) lookup */
  standards: Record<string, VerifiedStandard>;
}

/** Grade-subject key for looking up which framework to use */
export type FrameworkKey = string; // e.g., "Science", "ELA", "Math", "Social Studies"

/** Map of state → subject → framework ID */
export interface StateFrameworkMap {
  [state: string]: {
    [subject: string]: string; // framework ID
  };
}
