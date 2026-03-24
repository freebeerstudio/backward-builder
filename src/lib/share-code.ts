import { customAlphabet } from "nanoid";

/**
 * Generates a 6-character share code for student quiz URLs.
 * Excludes ambiguous characters (0, 1, i, l, o) so students
 * can easily type the code from a whiteboard or verbal instruction.
 */
const generateCode = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);

export function generateShareCode(): string {
  return generateCode();
}
