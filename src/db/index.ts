import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Database client using Neon's serverless HTTP driver.
 * This is optimized for Vercel's serverless environment —
 * each request gets a fresh connection via HTTP, no pool needed.
 */
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
