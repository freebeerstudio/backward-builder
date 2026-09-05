-- Free Beer Studio is the login (2026-09-04): cache of the studio's access answer.
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "fbs_access" boolean DEFAULT false NOT NULL;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "fbs_via" varchar(64);
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "fbs_bond" integer;
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "fbs_checked_at" timestamp;
