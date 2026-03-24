import Anthropic from "@anthropic-ai/sdk";
import type {
  UnderstandingAnalysis,
  GeneratedPerformanceTask,
  GeneratedCheck,
  GeneratedActivity,
  RubricCriterion,
  CognitiveLevel,
  CriterionScore,
  AdjustedActivity,
  PlanAdjustmentResponse,
} from "@/types";

// ---------------------------------------------------------------------------
// Client & Model
// ---------------------------------------------------------------------------

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

// ---------------------------------------------------------------------------
// Generic retry wrapper — the backbone of every AI call in the pipeline
// ---------------------------------------------------------------------------

/**
 * callClaude<T> — sends a structured prompt to Claude and returns parsed,
 * validated JSON. Retries up to 3 times with exponential backoff so a single
 * malformed response never tanks the pipeline.
 */
async function callClaude<T>(options: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature: number;
  validate?: (parsed: unknown) => T;
}): Promise<T> {
  const { systemPrompt, userPrompt, maxTokens, temperature, validate } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // Exponential backoff on retries (0ms, 2s, 4s)
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      const parsed = JSON.parse(cleanJSON(textBlock.text));

      // Run the caller's validator if provided; otherwise cast directly
      return validate ? validate(parsed) : (parsed as T);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`callClaude attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw new Error(`callClaude failed after 3 attempts: ${lastError?.message}`);
}

// ---------------------------------------------------------------------------
// Shared system prompt prefix — every function in the pipeline inherits this
// identity so Claude maintains consistent UbD voice across stages.
// ---------------------------------------------------------------------------

const UBD_EXPERT = `You are an expert Understanding by Design (UbD) curriculum designer with deep knowledge of Wiggins & McTighe's backward design framework. You specialize in creating rigorous, standards-aligned curriculum plans for K-12 teachers.

Your designs always:
- Start from enduring understandings and work backward to learning activities
- Align assessments directly to what students should understand and be able to do
- Use authentic, real-world performance tasks that require genuine transfer of knowledge
- Scaffold learning so every activity builds toward the final performance task
- Reference state standards by their actual codes (e.g., "NGSS MS-LS2-2", "CCSS.ELA-LITERACY.RH.6-8.7")`;

// ===========================================================================
//  Stage 1 — Analyze the Enduring Understanding
// ===========================================================================

/**
 * analyzeUnderstanding — Takes a teacher's enduring understanding and maps it
 * to state standards, classifies the Bloom's level, and generates essential
 * questions. This is Stage 1 of the backward design pipeline.
 */
export async function analyzeUnderstanding(
  understanding: string,
  grade: string,
  subject: string,
  state: string
): Promise<UnderstandingAnalysis> {
  const systemPrompt = `${UBD_EXPERT}

You are analyzing a teacher's enduring understanding to lay the foundation for a UbD unit. Your analysis must be precise, actionable, and grounded in real state standards.`;

  const userPrompt = `Analyze this enduring understanding for a ${grade} ${subject} class in ${state}:

"${understanding}"

Return a JSON object with this exact schema:
{
  "title": "string — a concise unit title derived from the enduring understanding",
  "essentialQuestions": ["string — 2-3 open-ended questions that drive inquiry toward this understanding"],
  "standardCodes": ["string — 2-4 specific ${state} state standard codes this aligns to (e.g., '7.LS2.A', 'CCSS.ELA-LITERACY.RH.6-8.2', 'NGSS MS-ESS2-1')"],
  "standardDescriptions": ["string — the full text of each standard listed above"],
  "cognitiveLevel": "string — one of: remember, understand, apply, analyze, evaluate, create",
  "cognitiveLevelExplanation": "string — 1 sentence explaining why this understanding sits at this Bloom's level",
  "reflectionForTeacher": "string — 1-2 sentences of warm, constructive feedback on the enduring understanding's clarity and scope"
}

Guidelines:
- Essential questions should be debatable and thought-provoking, not yes/no. For example, "How do changes in one part of an ecosystem ripple through the entire food web?" rather than "What is a food web?"
- Standard codes must be real codes from ${state}'s adopted standards framework for ${subject}.
- The cognitive level should reflect the deepest thinking the enduring understanding demands.

Return ONLY valid JSON.`;

  return callClaude<UnderstandingAnalysis>({
    systemPrompt,
    userPrompt,
    maxTokens: 1024,
    temperature: 0.5,
    validate: (parsed: unknown) => {
      const data = parsed as Record<string, unknown>;
      if (
        !data.title ||
        !Array.isArray(data.essentialQuestions) ||
        !Array.isArray(data.standardCodes) ||
        !data.cognitiveLevel
      ) {
        throw new Error("Invalid UnderstandingAnalysis: missing required fields");
      }
      return data as unknown as UnderstandingAnalysis;
    },
  });
}

// ===========================================================================
//  Stage 2A — Generate Performance Tasks (the capstone assessment)
// ===========================================================================

/** Input shape for pipeline functions that need the full unit context. */
interface UnitContext {
  title: string;
  enduringUnderstanding: string;
  essentialQuestions: string[];
  standardCodes: string[];
  standardDescriptions: string[];
  cognitiveLevel: CognitiveLevel;
  gradeLevel: string;
  subject: string;
}

/**
 * generatePerformanceTasks — Creates two GRASPS-based performance task
 * options with full rubrics. These are the "Stage 2" capstone assessments
 * in backward design — designed before any learning activities.
 */
export async function generatePerformanceTasks(
  unit: UnitContext
): Promise<{ tasks: GeneratedPerformanceTask[] }> {
  const systemPrompt = `${UBD_EXPERT}

You are designing GRASPS performance tasks — authentic assessments that require students to transfer their understanding to real-world scenarios. Each task must have a complete multi-criterion rubric with four proficiency levels.

GRASPS framework:
- Goal: What the student must accomplish
- Role: Who the student is in the scenario
- Audience: Who they are presenting to
- Situation: The real-world context
- Product/Performance: What they create
- Standards: How it will be evaluated (the rubric)`;

  const userPrompt = `Design 2 performance task options for this UbD unit:

Unit: "${unit.title}"
Enduring Understanding: "${unit.enduringUnderstanding}"
Essential Questions:
${unit.essentialQuestions.map((q) => `  - ${q}`).join("\n")}
Standards: ${unit.standardCodes.join(", ")}
${unit.standardDescriptions.map((d, i) => `  ${unit.standardCodes[i]}: ${d}`).join("\n")}
Cognitive Level: ${unit.cognitiveLevel}
Grade Level: ${unit.gradeLevel}
Subject: ${unit.subject}

Return a JSON object with this schema:
{
  "tasks": [
    {
      "title": "string — engaging task name",
      "description": "string — 2-3 sentence overview of what students will do",
      "scenario": "string — the full GRASPS scenario (Goal, Role, Audience, Situation, Product described in a compelling narrative paragraph). Use vivid, real-world contexts — e.g., a wildlife biologist analyzing the Yellowstone wolf reintroduction, a journalist covering the Boston Tea Party, a city planner designing for climate resilience.",
      "estimatedTimeMinutes": number,
      "cognitiveLevel": "string — Bloom's level this task targets",
      "rubric": [
        {
          "criterionName": "string — what is being evaluated (e.g., 'Use of Evidence', 'Scientific Reasoning', 'Communication Clarity')",
          "weight": number — points for this criterion,
          "levels": [
            { "score": 4, "label": "Exemplary", "description": "string — specific, observable indicators" },
            { "score": 3, "label": "Proficient", "description": "string — meets the standard" },
            { "score": 2, "label": "Developing", "description": "string — partial understanding" },
            { "score": 1, "label": "Beginning", "description": "string — significant gaps" }
          ]
        }
      ]
    }
  ]
}

Requirements:
- Each task must have 3-4 rubric criteria.
- Rubric descriptions must be specific and observable — not vague ("good work") but concrete ("cites at least 3 pieces of textual evidence with accurate page references").
- The two tasks should offer meaningfully different scenarios and products — not just minor variations.
- Scenarios must feel authentic to ${unit.gradeLevel} students and connect to real-world situations.

Return ONLY valid JSON.`;

  return callClaude<{ tasks: GeneratedPerformanceTask[] }>({
    systemPrompt,
    userPrompt,
    maxTokens: 4096,
    temperature: 0.7,
    validate: (parsed: unknown) => {
      const data = parsed as { tasks?: unknown[] };
      if (!Array.isArray(data.tasks) || data.tasks.length < 2) {
        throw new Error("Expected at least 2 performance tasks");
      }
      for (const task of data.tasks as GeneratedPerformanceTask[]) {
        if (!task.title || !task.scenario || !Array.isArray(task.rubric)) {
          throw new Error("Performance task missing required fields");
        }
        if (task.rubric.length < 3) {
          throw new Error("Each task must have at least 3 rubric criteria");
        }
      }
      return data as { tasks: GeneratedPerformanceTask[] };
    },
  });
}

// ===========================================================================
//  Stage 2B — Generate Checks for Understanding (formative assessments)
// ===========================================================================

/**
 * generateChecksForUnderstanding — Creates formative checks that give teachers
 * a mid-unit pulse on student progress. Questions map directly to rubric
 * criteria from the selected performance task so the checks serve as
 * early-warning signals before the capstone.
 */
export async function generateChecksForUnderstanding(
  unit: UnitContext,
  performanceTask: GeneratedPerformanceTask
): Promise<{ checks: GeneratedCheck[] }> {
  const rubricSummary = performanceTask.rubric
    .map((c: RubricCriterion) => `  - ${c.criterionName} (${c.weight} pts)`)
    .join("\n");

  const systemPrompt = `${UBD_EXPERT}

You are creating formative checks for understanding — short, focused assessments that teachers use during a unit to gauge whether students are building the knowledge and skills needed for the performance task. Each check should be quick to administer (5-10 minutes) and easy to score.`;

  const userPrompt = `Create 2 formative checks for understanding for this UbD unit:

Unit: "${unit.title}"
Enduring Understanding: "${unit.enduringUnderstanding}"
Grade Level: ${unit.gradeLevel}
Subject: ${unit.subject}

Performance Task: "${performanceTask.title}"
Scenario: ${performanceTask.scenario}

Rubric Criteria Being Assessed:
${rubricSummary}

Return a JSON object with this schema:
{
  "checks": [
    {
      "title": "string — descriptive check name (e.g., 'Evidence Analysis Quick Check')",
      "placementNote": "string — when in the learning sequence this should be used (e.g., 'Use after students have completed the primary source analysis activity, before they begin drafting their performance task response.')",
      "questions": [
        {
          "type": "selected_response",
          "questionText": "string — the question stem",
          "points": 1,
          "options": [
            { "text": "string", "isCorrect": false },
            { "text": "string", "isCorrect": true },
            { "text": "string", "isCorrect": false },
            { "text": "string", "isCorrect": false }
          ],
          "correctAnswer": "string — the text of the correct option"
        },
        {
          "type": "short_answer",
          "questionText": "string — question requiring a 1-3 sentence response",
          "points": 2,
          "correctAnswer": "string — model answer the teacher can use for quick scoring"
        }
      ]
    }
  ]
}

Requirements:
- Each check should have 4-6 questions.
- Mix of selected_response (multiple choice with 4 options, exactly 1 correct) and short_answer.
- Questions must map to specific rubric criteria from the performance task — they are diagnostic, not just trivia.
- Short answer questions should require students to explain thinking, not just recall facts.
- Placement notes should be specific and practical — tell the teacher exactly when to use each check.

Return ONLY valid JSON.`;

  return callClaude<{ checks: GeneratedCheck[] }>({
    systemPrompt,
    userPrompt,
    maxTokens: 3072,
    temperature: 0.5,
    validate: (parsed: unknown) => {
      const data = parsed as { checks?: unknown[] };
      if (!Array.isArray(data.checks) || data.checks.length < 2) {
        throw new Error("Expected at least 2 checks for understanding");
      }
      for (const check of data.checks as GeneratedCheck[]) {
        if (!check.title || !check.placementNote || !Array.isArray(check.questions)) {
          throw new Error("Check missing required fields");
        }
        if (check.questions.length < 4) {
          throw new Error("Each check must have at least 4 questions");
        }
        // Validate MC questions have exactly 1 correct answer
        for (const q of check.questions) {
          if (q.type === "selected_response" && Array.isArray(q.options)) {
            const correctCount = q.options.filter((o) => o.isCorrect).length;
            if (correctCount !== 1) {
              throw new Error(`MC question must have exactly 1 correct answer, found ${correctCount}`);
            }
          }
        }
      }
      return data as { checks: GeneratedCheck[] };
    },
  });
}

// ===========================================================================
//  Stage 3 — Generate Learning Plan (daily activities)
// ===========================================================================

/**
 * generateLearningPlan — Creates a sequenced set of learning activities that
 * scaffold from foundational knowledge up to transfer. This is Stage 3 of
 * backward design — planned last because every activity's purpose is defined
 * by the assessments that came before it.
 */
export async function generateLearningPlan(
  unit: UnitContext,
  performanceTask: GeneratedPerformanceTask,
  checks: GeneratedCheck[]
): Promise<{ activities: GeneratedActivity[] }> {
  const rubricCriteria = performanceTask.rubric
    .map((c: RubricCriterion) => `  - ${c.criterionName} (${c.weight} pts)`)
    .join("\n");

  const checkSummary = checks
    .map((c) => `  - "${c.title}" — ${c.placementNote}`)
    .join("\n");

  const systemPrompt = `${UBD_EXPERT}

You are designing the learning plan — the daily activities that build student capacity toward the performance task. In UbD, Stage 3 activities are planned LAST because they exist to serve the assessments, not the other way around.

Your learning plans follow the WHERE TO sequence:
- W: Where are we going? Why? What is expected?
- H: Hook students early and Hold their attention
- E: Equip students with knowledge and skills
- R: Rethink, reflect, and revise understanding
- E: Evaluate progress along the way
- T: Tailor to individual needs
- O: Organize for optimal learning`;

  const userPrompt = `Design a learning plan (6-8 sequenced activities) for this UbD unit:

Unit: "${unit.title}"
Enduring Understanding: "${unit.enduringUnderstanding}"
Essential Questions:
${unit.essentialQuestions.map((q) => `  - ${q}`).join("\n")}
Grade Level: ${unit.gradeLevel}
Subject: ${unit.subject}

Performance Task: "${performanceTask.title}"
Scenario: ${performanceTask.scenario}
Rubric Criteria:
${rubricCriteria}

Formative Checks:
${checkSummary}

Return a JSON object with this schema:
{
  "activities": [
    {
      "sequenceOrder": number — 1-based position in the sequence,
      "title": "string — clear, specific activity name (e.g., 'Ecosystem Web Mapping' not 'Activity 1')",
      "description": "string — 2-3 sentences describing what students do, how, and why this matters for the performance task",
      "durationMinutes": number — realistic class time estimate,
      "materials": "string — specific materials needed (e.g., 'Copies of the 1773 Tea Act excerpt, chart paper, markers')",
      "buildsToward": "string — which rubric criterion this activity directly supports",
      "associatedCheckTitle": "string or null — title of the formative check that should follow this activity, or null if none"
    }
  ]
}

Requirements:
- Activities must scaffold from foundational knowledge to transfer:
  1-2: Hook and activate prior knowledge (W, H)
  3-4: Build core knowledge and skills (E — Equip)
  5-6: Practice and apply (R — Rethink, E — Evaluate)
  7-8: Synthesize and prepare for performance task (T, O)
- Every rubric criterion must have at least one activity that builds toward it.
- Formative checks should be placed between activities at natural diagnostic points.
- Materials should be specific and realistic — not "various resources."
- Descriptions should tell a teacher exactly what students DO, not just what they learn.

Return ONLY valid JSON.`;

  return callClaude<{ activities: GeneratedActivity[] }>({
    systemPrompt,
    userPrompt,
    maxTokens: 3072,
    temperature: 0.6,
    validate: (parsed: unknown) => {
      const data = parsed as { activities?: unknown[] };
      if (!Array.isArray(data.activities) || data.activities.length < 6) {
        throw new Error("Expected at least 6 learning activities");
      }
      for (const activity of data.activities as GeneratedActivity[]) {
        if (!activity.title || !activity.description || !activity.buildsToward) {
          throw new Error("Activity missing required fields");
        }
      }
      return data as { activities: GeneratedActivity[] };
    },
  });
}

// ===========================================================================
//  Reteach Insights — post-assessment analysis
// ===========================================================================

/**
 * generateReteachInsights — Analyzes wrong-answer patterns from completed
 * checks to suggest targeted reteaching strategies. Called from the results
 * dashboard to give teachers actionable next steps.
 */
export async function generateReteachInsights(
  questions: Array<{ questionText: string; percentCorrect: number; type: string }>,
  topic: string
): Promise<string> {
  const struggledQuestions = questions
    .filter((q) => q.percentCorrect < 70)
    .sort((a, b) => a.percentCorrect - b.percentCorrect);

  if (struggledQuestions.length === 0) {
    return "Great news! Your students performed well across all questions. No major reteaching needed.";
  }

  const prompt = `You are a supportive instructional coach helping a teacher interpret check-for-understanding results.

Topic: ${topic}

Students struggled most with these questions (sorted by difficulty):
${struggledQuestions.map((q) => `- "${q.questionText}" (${q.percentCorrect}% correct, ${q.type})`).join("\n")}

Based on these results, provide 2-3 specific, actionable reteaching suggestions. Focus on:
1. What concepts students likely misunderstand
2. A specific activity or approach to address each gap
3. How this connects to their readiness for the performance task

Be warm, encouraging, and specific. Write 3-5 sentences total.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 512,
      temperature: 0.5,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === "text");
    return textContent?.type === "text" ? textContent.text : "Unable to generate reteaching suggestions.";
  } catch {
    return "Reteaching analysis unavailable. Review the per-question breakdown above to identify gaps.";
  }
}

// ===========================================================================
//  Grade Check Answer — quick scoring for short-answer questions
// ===========================================================================

/**
 * gradeCheckAnswer — Scores a single short-answer response against the
 * model answer. Returns a simple score and brief feedback. Uses low
 * temperature for consistent grading.
 */
export async function gradeCheckAnswer(
  questionText: string,
  correctAnswer: string,
  studentAnswer: string
): Promise<{ score: number; maxScore: number; feedback: string }> {
  const prompt = `You are scoring a student's short-answer response on a formative check for understanding.

Question: ${questionText}
Model Answer: ${correctAnswer}
Student Response: ${studentAnswer}

Score this response out of 2 points:
- 2 points: Demonstrates clear understanding; captures the key idea(s) from the model answer
- 1 point: Partially correct; shows some understanding but missing key elements
- 0 points: Incorrect, off-topic, or blank

Return ONLY valid JSON: { "score": <0|1|2>, "maxScore": 2, "feedback": "<1 sentence of specific, encouraging feedback>" }`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content");
    }

    return JSON.parse(cleanJSON(textContent.text));
  } catch (error) {
    console.error("Grading failed:", error);
    // Graceful fallback — don't block submission if auto-grading fails
    return { score: 0, maxScore: 2, feedback: "Auto-grading unavailable. Please score manually." };
  }
}

// ===========================================================================
//  Score Performance Task — AI criterion-level scoring (the WOW feature)
// ===========================================================================

/**
 * scorePerformanceTask — Scores a student's performance task submission
 * against each rubric criterion independently. Returns detailed reasoning
 * for every criterion — this is the signature feature that shows AI-powered
 * assessment with transparency and rigor.
 */
export async function scorePerformanceTask(
  taskDescription: string,
  scenario: string,
  rubric: RubricCriterion[],
  studentResponse: string,
  submissionType: "text" | "file" | "link"
): Promise<{ criterionScores: CriterionScore[] }> {
  const rubricDetail = rubric
    .map(
      (c) =>
        `Criterion: "${c.criterionName}" (${c.weight} points)\n` +
        c.levels
          .map((l) => `  - ${l.score} (${l.label}): ${l.description}`)
          .join("\n")
    )
    .join("\n\n");

  const submissionContext =
    submissionType === "link"
      ? "The student submitted a link to their work. Evaluate based on what they described or referenced."
      : submissionType === "file"
        ? "The student uploaded a file. The content has been extracted below."
        : "The student wrote their response directly.";

  const systemPrompt = `You are an expert assessment evaluator using criterion-referenced scoring. You evaluate student performance task submissions against specific rubric criteria with fairness, rigor, and transparency.

Your scoring approach:
- Score EACH criterion independently — a student can excel in one area and struggle in another
- Provide SPECIFIC evidence from the student's work to justify each score
- Be fair but rigorous — don't inflate scores, but acknowledge genuine effort and understanding
- Use the exact rubric descriptors to determine the appropriate score level
- If the response is off-topic, minimal, or doesn't address a criterion, score it as Beginning (1)

${submissionContext}`;

  const criterionNames = rubric.map((c) => `"${c.criterionName}"`).join(", ");

  const userPrompt = `Score this student's performance task submission against each rubric criterion.

TASK DESCRIPTION:
${taskDescription}

SCENARIO:
${scenario}

RUBRIC CRITERIA:
${rubricDetail}

STUDENT RESPONSE:
${studentResponse}

Score each criterion independently. Return a JSON object with this exact schema:
{
  "criterionScores": [
    {
      "criterionName": "string — must match one of: ${criterionNames}",
      "score": number — 1 to 4,
      "maxScore": 4,
      "label": "string — Exemplary | Proficient | Developing | Beginning",
      "reasoning": "string — 2-3 sentences explaining the score with specific evidence from the student's work"
    }
  ]
}

You must return exactly one score object for each criterion: ${criterionNames}.

Return ONLY valid JSON.`;

  return callClaude<{ criterionScores: CriterionScore[] }>({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.3,
    validate: (parsed: unknown) => {
      const data = parsed as { criterionScores?: unknown[] };
      if (!Array.isArray(data.criterionScores) || data.criterionScores.length === 0) {
        throw new Error("Expected criterionScores array");
      }
      for (const cs of data.criterionScores as CriterionScore[]) {
        if (!cs.criterionName || !cs.score || !cs.label || !cs.reasoning) {
          throw new Error("Criterion score missing required fields");
        }
        if (cs.score < 1 || cs.score > 4) {
          throw new Error(`Invalid score ${cs.score} — must be 1-4`);
        }
      }
      // Verify we got a score for each criterion
      const scoredCriteria = new Set(
        (data.criterionScores as CriterionScore[]).map((cs) => cs.criterionName)
      );
      for (const c of rubric) {
        if (!scoredCriteria.has(c.criterionName)) {
          throw new Error(`Missing score for criterion: ${c.criterionName}`);
        }
      }
      return data as { criterionScores: CriterionScore[] };
    },
  });
}

// ===========================================================================
//  Plan Adjustments — data-driven instructional coaching
// ===========================================================================

/**
 * suggestPlanAdjustments — Analyzes formative check results against the
 * performance task rubric and current learning activities to suggest
 * targeted adjustments. Returns both a narrative summary and specific
 * new/modified activities with rationale.
 */
export async function suggestPlanAdjustments(
  unit: { title: string; enduringUnderstanding: string; gradeLevel: string; subject: string },
  performanceTask: { title: string; rubric: RubricCriterion[] },
  activities: Array<{ title: string; description: string; buildsToward: string }>,
  checkResults: Array<{ questionText: string; percentCorrect: number; type: string }>
): Promise<PlanAdjustmentResponse> {
  const struggledQuestions = checkResults
    .filter((q) => q.percentCorrect < 70)
    .sort((a, b) => a.percentCorrect - b.percentCorrect);

  const strongQuestions = checkResults
    .filter((q) => q.percentCorrect >= 70)
    .sort((a, b) => b.percentCorrect - a.percentCorrect);

  const rubricSummary = performanceTask.rubric
    .map((c: RubricCriterion) => `  - ${c.criterionName} (${c.weight} pts)`)
    .join("\n");

  const activitySummary = activities
    .map((a, i) => `  ${i + 1}. "${a.title}" — ${a.description} [Builds toward: ${a.buildsToward}]`)
    .join("\n");

  const systemPrompt = `You are an expert instructional coach analyzing formative assessment data to adjust instruction. You use Understanding by Design (UbD) principles and data-driven decision-making to help teachers close learning gaps before the summative performance task.

Your adjustments always:
- Are grounded in specific student performance data
- Connect gaps directly to rubric criteria the students need for the performance task
- Suggest concrete, actionable changes — not vague advice
- Preserve what is working and only modify what the data says needs attention
- Include specific reteaching strategies (not just "review" or "practice more")`;

  const userPrompt = `Analyze the formative check results and suggest adjustments to the learning plan.

UNIT CONTEXT:
Title: "${unit.title}"
Enduring Understanding: "${unit.enduringUnderstanding}"
Grade Level: ${unit.gradeLevel}
Subject: ${unit.subject}

PERFORMANCE TASK: "${performanceTask.title}"
Rubric Criteria:
${rubricSummary}

CURRENT LEARNING ACTIVITIES:
${activitySummary}

CHECK RESULTS — QUESTIONS STUDENTS STRUGGLED WITH (<70% correct):
${struggledQuestions.length > 0
    ? struggledQuestions.map((q) => `- "${q.questionText}" (${q.percentCorrect}% correct, ${q.type})`).join("\n")
    : "None — students performed well on all questions!"}

CHECK RESULTS — QUESTIONS STUDENTS PERFORMED WELL ON (>=70% correct):
${strongQuestions.length > 0
    ? strongQuestions.map((q) => `- "${q.questionText}" (${q.percentCorrect}% correct, ${q.type})`).join("\n")
    : "None"}

Based on this data, return a JSON object with this schema:
{
  "suggestions": "string — a 3-5 sentence narrative summary for the teacher explaining what the data reveals about student readiness for the performance task, which rubric criteria are at risk, and the overall adjustment strategy. Be warm, specific, and encouraging.",
  "adjustedActivities": [
    {
      "title": "string — activity name",
      "description": "string — 2-3 sentences describing what students do",
      "durationMinutes": number,
      "buildsToward": "string — which rubric criterion this addresses",
      "isNew": boolean — true if this is a brand-new activity, false if it modifies an existing one,
      "reason": "string — 1 sentence explaining why this adjustment is needed based on the data"
    }
  ]
}

Guidelines:
- If students struggled with questions mapping to specific rubric criteria, suggest new remediation activities for those criteria.
- If an existing activity covers a weak area, suggest modifications (isNew: false) with enhanced approaches.
- Suggest 2-4 adjusted/new activities — enough to address gaps without overwhelming.
- Include at least one suggestion for re-administering a check or adding a quick formative assessment.
- Duration should be realistic for a ${unit.gradeLevel} classroom.
- If students performed well overall, acknowledge that and suggest enrichment or extension activities.

Return ONLY valid JSON.`;

  return callClaude<PlanAdjustmentResponse>({
    systemPrompt,
    userPrompt,
    maxTokens: 2048,
    temperature: 0.5,
    validate: (parsed: unknown) => {
      const data = parsed as Record<string, unknown>;
      if (!data.suggestions || typeof data.suggestions !== "string") {
        throw new Error("Missing suggestions narrative");
      }
      if (!Array.isArray(data.adjustedActivities)) {
        throw new Error("Missing adjustedActivities array");
      }
      for (const activity of data.adjustedActivities as AdjustedActivity[]) {
        if (!activity.title || !activity.description || !activity.buildsToward || !activity.reason) {
          throw new Error("Adjusted activity missing required fields");
        }
      }
      return data as unknown as PlanAdjustmentResponse;
    },
  });
}

// ===========================================================================
//  Helper — cleanJSON
// ===========================================================================

/** Strips markdown code fences and whitespace from Claude's JSON responses. */
function cleanJSON(text: string): string {
  let cleaned = text.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}
