import Anthropic from "@anthropic-ai/sdk";
import type { AssessmentInput, GeneratedAssessment, GeneratedQuestion, RubricLevel } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-sonnet-4-20250514";

/**
 * System prompt establishes Claude as an expert UbD assessment designer.
 * This is the core of what makes Backward Builder's AI impressive —
 * the prompt ensures questions align with what the teacher actually taught,
 * not generic topic knowledge.
 */
const ASSESSMENT_SYSTEM_PROMPT = `You are an expert middle school history/social studies assessment designer who follows Understanding by Design (UbD) principles. You create assessments that are:

- Directly aligned to the enduring understanding and specific content the teacher covered
- Rigorous but age-appropriate for the specified grade level
- Designed with strong distractors that reflect real student misconceptions (not obviously wrong answers)
- Inclusive of document-based questions when primary sources were used in instruction
- Accompanied by clear, specific scoring rubrics for constructed response questions

You MUST only assess content the teacher explicitly mentioned covering. Never add topics or events the teacher didn't list.

Return your assessment as valid JSON matching this exact schema:
{
  "title": "string — a clear, descriptive assessment title",
  "description": "string — brief description of what this assessment covers",
  "questions": [
    {
      "type": "multiple_choice",
      "questionText": "string — the full question",
      "points": 2,
      "options": [
        { "text": "string — option text", "isCorrect": false },
        { "text": "string — option text", "isCorrect": true },
        { "text": "string — option text", "isCorrect": false },
        { "text": "string — option text", "isCorrect": false }
      ]
    },
    {
      "type": "document_based",
      "questionText": "string — the analytical question about the source",
      "points": 5,
      "sourceDocument": "string — the primary source text or excerpt",
      "sourceAttribution": "string — author, title, date",
      "scaffoldingQuestions": ["string — guiding question 1", "string — guiding question 2"],
      "rubric": [
        { "score": 5, "description": "Exemplary — ..." },
        { "score": 4, "description": "Proficient — ..." },
        { "score": 3, "description": "Developing — ..." },
        { "score": 2, "description": "Beginning — ..." },
        { "score": 1, "description": "Incomplete — ..." }
      ],
      "sampleAnswer": "string — a model response demonstrating proficient understanding"
    },
    {
      "type": "constructed_response",
      "questionText": "string — open-ended analytical question",
      "points": 10,
      "rubric": [
        { "score": 10, "description": "Exemplary — ..." },
        { "score": 8, "description": "Proficient — ..." },
        { "score": 6, "description": "Developing — ..." },
        { "score": 4, "description": "Beginning — ..." },
        { "score": 2, "description": "Incomplete — ..." }
      ],
      "sampleAnswer": "string — a model response"
    }
  ]
}

IMPORTANT: Return ONLY valid JSON. No markdown code fences, no explanation text before or after.`;

/**
 * Generates a complete assessment from teacher input.
 * Uses temperature 0.7 for creative but grounded output.
 * Includes retry logic for malformed JSON responses.
 */
export async function generateAssessment(input: AssessmentInput): Promise<GeneratedAssessment> {
  const userPrompt = buildGenerationPrompt(input);

  let lastError: Error | null = null;

  // Retry up to 3 times with exponential backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 4096,
        temperature: 0.7,
        system: ASSESSMENT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      const parsed = parseAssessmentJSON(textContent.text);
      validateAssessment(parsed);
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Assessment generation attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw new Error(`Failed to generate assessment after 3 attempts: ${lastError?.message}`);
}

/**
 * Regenerates a single question based on teacher feedback.
 * Uses lower temperature (0.3) for more predictable output.
 */
export async function regenerateQuestion(
  currentQuestion: GeneratedQuestion,
  feedback: string,
  assessmentContext: AssessmentInput
): Promise<GeneratedQuestion> {
  const prompt = `You are editing a single assessment question based on teacher feedback.

Teacher's feedback: "${feedback}"

Current question:
${JSON.stringify(currentQuestion, null, 2)}

Assessment context:
- Topic: ${assessmentContext.topic}
- Grade Level: ${assessmentContext.gradeLevel}
- Objectives: ${assessmentContext.objectives}
- Topics Covered: ${assessmentContext.topicsCovered}

Regenerate ONLY this question, maintaining alignment with the enduring understanding and topics covered.
Return the updated question as valid JSON matching the same schema. Return ONLY the JSON, no other text.`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }

      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 2048,
        temperature: 0.3,
        system: "You are an expert assessment designer. Return only valid JSON.",
        messages: [{ role: "user", content: prompt }],
      });

      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in Claude response");
      }

      const parsed = JSON.parse(cleanJSON(textContent.text)) as GeneratedQuestion;
      if (!parsed.type || !parsed.questionText || typeof parsed.points !== "number") {
        throw new Error("Invalid question structure");
      }
      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Question regeneration attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  throw new Error(`Failed to regenerate question after 3 attempts: ${lastError?.message}`);
}

/**
 * Grades a constructed response or DBQ answer using Claude.
 * Returns a score and brief feedback.
 */
export async function gradeResponse(
  questionText: string,
  rubric: RubricLevel[],
  sampleAnswer: string | null,
  studentAnswer: string,
  gradeLevel: string
): Promise<{ score: number; feedback: string }> {
  const prompt = `You are grading a ${gradeLevel} student's response to a history assessment question.

Question: ${questionText}

Rubric:
${rubric.map((r) => `${r.score} points: ${r.description}`).join("\n")}

${sampleAnswer ? `Sample Answer: ${sampleAnswer}` : ""}

Student Response: ${studentAnswer}

Score the response according to the rubric. Be fair but rigorous — this is a middle school assessment.
Return ONLY valid JSON: { "score": <number matching a rubric level>, "feedback": "<1-2 sentences of specific, encouraging feedback>" }`;

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
    // Graceful fallback — don't block submission if grading fails
    return { score: 0, feedback: "Auto-grading unavailable. Please score manually." };
  }
}

/**
 * Analyzes wrong-answer patterns to suggest what to reteach.
 * Called from the results dashboard to provide actionable insights.
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

  const prompt = `You are a helpful instructional coach for a middle school history teacher.

Topic: ${topic}

Students struggled most with these questions (sorted by difficulty):
${struggledQuestions.map((q) => `- "${q.questionText}" (${q.percentCorrect}% correct, ${q.type})`).join("\n")}

Based on these results, provide 2-3 specific, actionable reteaching suggestions. Focus on:
1. What concepts students likely misunderstand
2. A specific activity or approach to address each gap
3. Keep suggestions practical and classroom-ready

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

// --- Helper functions ---

/** Builds the user prompt from teacher input */
function buildGenerationPrompt(input: AssessmentInput): string {
  const hasSources = input.sourcesUsed && input.sourcesUsed.trim().length > 0;

  return `Create a comprehensive history assessment for ${input.gradeLevel} students.

Topic: ${input.topic}
Unit Length: ${input.unitLength}

Enduring Understanding / Learning Objectives:
${input.objectives}

Specific Topics and Events Covered:
${input.topicsCovered}

${hasSources ? `Primary Sources and Texts Used in Instruction:\n${input.sourcesUsed}` : "No specific primary sources mentioned."}

Generate a balanced assessment including:
- 5-6 multiple choice questions (2 points each) with 4 options and strong distractors
${hasSources ? "- 1 document-based question using one of the primary sources mentioned above (5 points)" : "- 1 document-based question with a relevant primary source excerpt (5 points)"}
- 1 constructed response question requiring analytical thinking (10 points)

Total should be approximately 25 points. Ensure all questions are directly tied to the topics the teacher listed.`;
}

/** Strips markdown code fences and whitespace from JSON response */
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

/** Parses and validates the assessment JSON from Claude's response */
function parseAssessmentJSON(text: string): GeneratedAssessment {
  const cleaned = cleanJSON(text);
  const parsed = JSON.parse(cleaned);

  if (!parsed.title || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid assessment structure: missing title or questions array");
  }

  return parsed as GeneratedAssessment;
}

/** Validates the generated assessment has the expected structure */
function validateAssessment(assessment: GeneratedAssessment): void {
  if (assessment.questions.length === 0) {
    throw new Error("Assessment has no questions");
  }

  for (const q of assessment.questions) {
    if (!q.type || !q.questionText || typeof q.points !== "number") {
      throw new Error(`Invalid question: missing required fields`);
    }

    if (q.type === "multiple_choice") {
      if (!Array.isArray(q.options) || q.options.length < 3) {
        throw new Error("MC question must have at least 3 options");
      }
      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        throw new Error("MC question must have exactly 1 correct answer");
      }
    }

    if (q.type === "document_based" && !q.sourceDocument) {
      throw new Error("DBQ must include source document");
    }

    if ((q.type === "constructed_response" || q.type === "document_based") && !q.rubric) {
      throw new Error(`${q.type} question must include a rubric`);
    }
  }
}
