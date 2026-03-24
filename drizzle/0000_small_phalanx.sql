CREATE TYPE "public"."assessment_status" AS ENUM('draft', 'live', 'closed');--> statement-breakpoint
CREATE TYPE "public"."cognitive_level" AS ENUM('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('selected_response', 'short_answer');--> statement-breakpoint
CREATE TYPE "public"."submission_type" AS ENUM('check', 'performance_task');--> statement-breakpoint
CREATE TYPE "public"."unit_status" AS ENUM('stage1', 'stage2', 'stage3', 'complete');--> statement-breakpoint
CREATE TABLE "check_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"check_id" uuid NOT NULL,
	"type" "question_type" NOT NULL,
	"order_index" integer NOT NULL,
	"question_text" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checks_for_understanding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"placement_note" text,
	"share_code" varchar(8),
	"status" "assessment_status" DEFAULT 'draft' NOT NULL,
	"total_points" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "checks_for_understanding_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "learning_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"sequence_order" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"duration_minutes" integer,
	"materials" text,
	"builds_toward" text,
	"associated_check_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performance_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"scenario" text NOT NULL,
	"rubric" jsonb NOT NULL,
	"standard_codes" jsonb,
	"cognitive_level" "cognitive_level",
	"estimated_time_minutes" integer,
	"share_code" varchar(8),
	"status" "assessment_status" DEFAULT 'draft' NOT NULL,
	"is_selected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "performance_tasks_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "student_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean,
	"score" integer,
	"feedback" text
);
--> statement-breakpoint
CREATE TABLE "student_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"assessment_type" "submission_type" NOT NULL,
	"assessment_id" uuid NOT NULL,
	"student_name" varchar(100) NOT NULL,
	"class_period" varchar(20) NOT NULL,
	"total_score" integer,
	"max_score" integer,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(64) NOT NULL,
	"email" varchar(255),
	"display_name" varchar(100),
	"grade_level" varchar(20),
	"subject" varchar(100),
	"state" varchar(50),
	"standards_framework" varchar(100),
	"is_demo" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teachers_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"enduring_understanding" text NOT NULL,
	"essential_questions" jsonb,
	"standard_codes" jsonb,
	"standard_descriptions" jsonb,
	"cognitive_level" "cognitive_level",
	"cognitive_level_explanation" text,
	"status" "unit_status" DEFAULT 'stage1' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "check_questions" ADD CONSTRAINT "check_questions_check_id_checks_for_understanding_id_fk" FOREIGN KEY ("check_id") REFERENCES "public"."checks_for_understanding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checks_for_understanding" ADD CONSTRAINT "checks_for_understanding_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_activities" ADD CONSTRAINT "learning_activities_associated_check_id_checks_for_understanding_id_fk" FOREIGN KEY ("associated_check_id") REFERENCES "public"."checks_for_understanding"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_tasks" ADD CONSTRAINT "performance_tasks_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_submission_id_student_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."student_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_submissions" ADD CONSTRAINT "student_submissions_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;