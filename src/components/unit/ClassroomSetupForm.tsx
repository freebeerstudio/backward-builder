"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const GRADE_LEVELS = [
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

const SUBJECTS = [
  "Science",
  "History/Social Studies",
  "ELA",
  "Math",
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California",
  "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
  "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
];

interface SetupResponse {
  standardsFramework: string;
  gradeLevel: string;
  subject: string;
}

function ClassroomSetupForm() {
  const router = useRouter();
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<SetupResponse | null>(null);

  const isValid = gradeLevel && subject && state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeLevel, subject, state }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save setup.");
      }

      const data: SetupResponse = await res.json();
      setResponse(data);

      // Brief pause so the teacher sees the confirmation, then redirect
      setTimeout(() => {
        router.push("/unit/new");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-[500px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-forest">
              Backward Builder
            </h1>
            <p className="mt-2 text-text-light font-body">
              Before we build anything — tell me about your classroom.
            </p>
          </div>

          {/* Grade Level */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="grade-level"
              className="text-sm font-medium text-text font-body"
            >
              Grade Level
            </label>
            <select
              id="grade-level"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base text-text font-body focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || !!response}
            >
              <option value="">Select grade level</option>
              {GRADE_LEVELS.map((g) => (
                <option key={g} value={g}>
                  {g} Grade
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="subject"
              className="text-sm font-medium text-text font-body"
            >
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base text-text font-body focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || !!response}
            >
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="state"
              className="text-sm font-medium text-text font-body"
            >
              State
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-4 py-2.5 text-base text-text font-body focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={loading || !!response}
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-error text-center font-body">
              {error}
            </p>
          )}

          {/* AI Response */}
          {response && (
            <div className="rounded-lg border border-forest/20 bg-forest/5 px-4 py-3 text-center">
              <p className="text-sm font-body text-forest">
                Got it — I&apos;ll work from the{" "}
                <span className="font-semibold">
                  {response.standardsFramework}
                </span>{" "}
                for {response.gradeLevel} {response.subject}. Ready to plan a
                unit?
              </p>
            </div>
          )}

          {/* Submit */}
          {!response && (
            <Button
              type="submit"
              variant="accent"
              size="lg"
              fullWidth
              loading={loading}
              disabled={!isValid}
            >
              Get Started
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}

export { ClassroomSetupForm };
