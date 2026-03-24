/**
 * Seed script for Backward Builder — UbD Curriculum Design Tool
 *
 * Creates a demo teacher "Mrs. Crabapple" with two complete units,
 * including student submissions with realistic score distributions.
 *
 * Run with: npx tsx src/db/seed.ts
 *           (or: npm run db:seed)
 *
 * Idempotent — safe to run multiple times. Deletes existing demo data first.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { neon } from "@neondatabase/serverless";

// Load .env.local (Next.js convention), fall back to .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found. Make sure .env.local exists.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

// ---------------------------------------------------------------------------
// Fixed IDs
// ---------------------------------------------------------------------------

const TEACHER_ID = "00000000-0000-0000-0000-000000000001";
const UNIT_1_ID = "00000000-0000-0000-0000-000000000010";
const UNIT_2_ID = "00000000-0000-0000-0000-000000000020";

// Performance task
const PT_1_ID = "00000000-0000-0000-0000-000000000101";
const PT_2_ID = "00000000-0000-0000-0000-000000000201";

// Checks for understanding
const CHECK_1_ID = "00000000-0000-0000-0000-000000000111";
const CHECK_2_ID = "00000000-0000-0000-0000-000000000112";

// Questions — Check 1 (5 questions)
const C1_Q1_ID = "00000000-0000-0000-0000-000000001001";
const C1_Q2_ID = "00000000-0000-0000-0000-000000001002";
const C1_Q3_ID = "00000000-0000-0000-0000-000000001003";
const C1_Q4_ID = "00000000-0000-0000-0000-000000001004";
const C1_Q5_ID = "00000000-0000-0000-0000-000000001005";

// Questions — Check 2 (4 questions)
const C2_Q1_ID = "00000000-0000-0000-0000-000000002001";
const C2_Q2_ID = "00000000-0000-0000-0000-000000002002";
const C2_Q3_ID = "00000000-0000-0000-0000-000000002003";
const C2_Q4_ID = "00000000-0000-0000-0000-000000002004";

// Learning activities
const LA_1_ID = "00000000-0000-0000-0000-000000003001";
const LA_2_ID = "00000000-0000-0000-0000-000000003002";
const LA_3_ID = "00000000-0000-0000-0000-000000003003";
const LA_4_ID = "00000000-0000-0000-0000-000000003004";
const LA_5_ID = "00000000-0000-0000-0000-000000003005";
const LA_6_ID = "00000000-0000-0000-0000-000000003006";
const LA_7_ID = "00000000-0000-0000-0000-000000003007";

// ---------------------------------------------------------------------------
// Helper: generate a deterministic UUID from a seed number
// ---------------------------------------------------------------------------
function subId(base: number): string {
  const hex = base.toString(16).padStart(12, "0");
  return `00000000-0000-0000-0000-${hex}`;
}

// ---------------------------------------------------------------------------
// Rubric for Yellowstone Performance Task
// ---------------------------------------------------------------------------

const yellowstoneRubric = [
  {
    criterionName: "Causal Reasoning",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Identifies tertiary+ effects with evidence from multiple trophic levels; traces at least three distinct cascading pathways with clear mechanistic explanations.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Identifies secondary effects with evidence; traces at least two cascading pathways with reasonable explanations.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "Identifies direct (primary) effects only; describes one pathway without fully explaining the mechanism.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "Lists organisms without establishing causal links between trophic levels.",
      },
    ],
  },
  {
    criterionName: "Evidence Use",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Cites specific data points from both the 1920s wolf removal and 1995 reintroduction, including quantitative comparisons.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Cites data from one time period with specific numbers or measurements.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "References data vaguely (e.g., 'the elk population changed') without specific numbers or time frames.",
      },
      {
        score: 0,
        label: "Beginning",
        description: "No evidence cited from either data set.",
      },
    ],
  },
  {
    criterionName: "Prediction Quality",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Predictions are specific, testable, and supported by multiple evidence sources; includes both short-term and long-term projections.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Predictions are reasonable and partially supported by evidence; addresses at least one time frame.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Predictions are vague or unsupported (e.g., 'things would get worse').",
      },
      {
        score: 0,
        label: "Beginning",
        description: "No predictions offered or predictions contradict the evidence.",
      },
    ],
  },
  {
    criterionName: "Scientific Communication",
    weight: 4,
    levels: [
      {
        score: 4,
        label: "Exemplary",
        description:
          "Domain vocabulary (trophic cascade, keystone species, carrying capacity, etc.) used accurately and consistently; writing is clear, well-organized, and follows the requested format.",
      },
      {
        score: 3,
        label: "Proficient",
        description:
          "Domain vocabulary used mostly correctly with minor errors; writing is generally clear with adequate organization.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Some domain vocabulary present but with inaccuracies; organization is unclear in places.",
      },
      {
        score: 1,
        label: "Beginning",
        description:
          "No domain-specific language used; writing is disorganized or difficult to follow.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Rubric for American Revolution Performance Task
// ---------------------------------------------------------------------------

const revolutionRubric = [
  {
    criterionName: "Historical Argumentation",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Develops a nuanced thesis that weighs economic, political, and ideological causes; acknowledges complexity and multiple perspectives.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Develops a clear thesis addressing at least two categories of causes with some analysis of their interplay.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "States a thesis but only addresses one category of causes or treats causes as isolated events.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "No clear thesis; retells events chronologically without analysis.",
      },
    ],
  },
  {
    criterionName: "Evidence & Sourcing",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Cites at least four primary or secondary sources with proper context; evaluates source reliability and perspective.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Cites at least two sources with some context; references specific dates and events.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "References events vaguely without specific sources or dates.",
      },
      {
        score: 0,
        label: "Beginning",
        description: "No sources or evidence cited.",
      },
    ],
  },
  {
    criterionName: "Cause & Effect Analysis",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Clearly connects causes to effects across multiple levels (immediate, short-term, long-term); identifies feedback loops between economic and political factors.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Connects at least three causes to their effects with reasonable explanations.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Identifies causes and effects but does not clearly connect them.",
      },
      {
        score: 0,
        label: "Beginning",
        description: "Lists events without distinguishing causes from effects.",
      },
    ],
  },
  {
    criterionName: "Written Communication",
    weight: 4,
    levels: [
      {
        score: 4,
        label: "Exemplary",
        description:
          "Writing is clear, persuasive, and well-organized with appropriate historical vocabulary; follows editorial format convincingly.",
      },
      {
        score: 3,
        label: "Proficient",
        description:
          "Writing is clear and organized with adequate historical vocabulary.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Writing is understandable but lacks organization or appropriate vocabulary.",
      },
      {
        score: 1,
        label: "Beginning",
        description: "Writing is unclear, disorganized, or off-topic.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Check 1 questions (Unit 1 — Food Web Analysis Check)
// ---------------------------------------------------------------------------

const check1Questions = [
  {
    id: C1_Q1_ID,
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "In the Yellowstone ecosystem, what is the MOST LIKELY secondary effect of removing wolves?",
    points: 1,
    options: JSON.stringify([
      { text: "Elk populations would immediately decrease", isCorrect: false },
      {
        text: "Willow and aspen trees would decline due to increased elk browsing",
        isCorrect: true,
      },
      {
        text: "Bear populations would increase to fill the predator niche",
        isCorrect: false,
      },
      {
        text: "River channels would become wider and shallower",
        isCorrect: false,
      },
    ]),
    correctAnswer: "Willow and aspen trees would decline due to increased elk browsing",
  },
  {
    id: C1_Q2_ID,
    type: "selected_response" as const,
    orderIndex: 1,
    questionText: "A trophic cascade occurs when...",
    points: 1,
    options: JSON.stringify([
      { text: "An organism moves to a new habitat", isCorrect: false },
      {
        text: "Changes at one trophic level cause effects that ripple through other levels",
        isCorrect: true,
      },
      {
        text: "Two species compete for the same food source",
        isCorrect: false,
      },
      {
        text: "A population reaches its carrying capacity",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "Changes at one trophic level cause effects that ripple through other levels",
  },
  {
    id: C1_Q3_ID,
    type: "selected_response" as const,
    orderIndex: 2,
    questionText:
      "Which evidence would BEST support the claim that wolves affect river ecosystems?",
    points: 1,
    options: JSON.stringify([
      { text: "Wolf population data from 1995-2020", isCorrect: false },
      {
        text: "Elk population counts before and after wolf reintroduction",
        isCorrect: false,
      },
      {
        text: "Measurements of riverbank erosion rates before and after wolf reintroduction",
        isCorrect: true,
      },
      {
        text: "A food web diagram showing all Yellowstone species",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "Measurements of riverbank erosion rates before and after wolf reintroduction",
  },
  {
    id: C1_Q4_ID,
    type: "short_answer" as const,
    orderIndex: 3,
    questionText:
      "Explain why removing a top predator often affects more species than removing a species at a lower trophic level.",
    points: 2,
    options: null,
    correctAnswer:
      "Top predators regulate the populations below them through a trophic cascade. When removed, herbivore populations can explode, overconsuming producers, which then affects all species that depend on those producers for food and habitat.",
  },
  {
    id: C1_Q5_ID,
    type: "selected_response" as const,
    orderIndex: 4,
    questionText:
      "Scientists reintroduced wolves to Yellowstone in 1995. By 2005, which change was MOST likely observed?",
    points: 1,
    options: JSON.stringify([
      {
        text: "Elk learned to avoid open meadows near rivers",
        isCorrect: true,
      },
      { text: "All elk were eliminated from the park", isCorrect: false },
      { text: "Wolf populations grew without limit", isCorrect: false },
      {
        text: "Beaver populations decreased significantly",
        isCorrect: false,
      },
    ]),
    correctAnswer: "Elk learned to avoid open meadows near rivers",
  },
];

// ---------------------------------------------------------------------------
// Check 2 questions (Unit 1 — Data Interpretation Check)
// ---------------------------------------------------------------------------

const check2Questions = [
  {
    id: C2_Q1_ID,
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "A graph shows elk population rising from 1926 to 1988, then declining after 1995. What is the MOST reasonable explanation for the decline after 1995?",
    points: 1,
    options: JSON.stringify([
      { text: "A harsh winter killed many elk in 1995", isCorrect: false },
      {
        text: "Wolf reintroduction increased predation pressure on elk",
        isCorrect: true,
      },
      {
        text: "Park rangers began culling the elk herd",
        isCorrect: false,
      },
      {
        text: "Elk migrated out of Yellowstone to find new habitat",
        isCorrect: false,
      },
    ]),
    correctAnswer: "Wolf reintroduction increased predation pressure on elk",
  },
  {
    id: C2_Q2_ID,
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "A researcher claims: 'Wolves directly caused the recovery of riverside vegetation in Yellowstone.' What additional data would MOST strengthen this claim?",
    points: 1,
    options: JSON.stringify([
      {
        text: "Photographs showing more trees near rivers today",
        isCorrect: false,
      },
      {
        text: "Data showing elk spend less time browsing near rivers where wolves are present",
        isCorrect: true,
      },
      {
        text: "A count of the total wolf population over time",
        isCorrect: false,
      },
      {
        text: "Interviews with park rangers about vegetation changes",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "Data showing elk spend less time browsing near rivers where wolves are present",
  },
  {
    id: C2_Q3_ID,
    type: "short_answer" as const,
    orderIndex: 2,
    questionText:
      "A dataset shows beaver populations increased 900% between 1996 and 2009 in Yellowstone. Explain how wolf reintroduction could have caused this increase, using at least two steps in the causal chain.",
    points: 2,
    options: null,
    correctAnswer:
      "Wolves reduced elk numbers (or changed elk behavior), which allowed willow and aspen to regrow along riverbanks. Beavers depend on willow for food and dam-building material, so more willow supported a larger beaver population.",
  },
  {
    id: C2_Q4_ID,
    type: "selected_response" as const,
    orderIndex: 3,
    questionText:
      "Which pattern in the data would BEST indicate a trophic cascade rather than a coincidence?",
    points: 1,
    options: JSON.stringify([
      {
        text: "Two populations change at the same time",
        isCorrect: false,
      },
      {
        text: "A sequential pattern where predator change precedes herbivore change, which precedes producer change",
        isCorrect: true,
      },
      {
        text: "All populations increase together",
        isCorrect: false,
      },
      {
        text: "One population changes while all others stay the same",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "A sequential pattern where predator change precedes herbivore change, which precedes producer change",
  },
];

// ---------------------------------------------------------------------------
// Student submission data — 15 students for Check 1
// ---------------------------------------------------------------------------

interface StudentScore {
  name: string;
  totalScore: number;
  // Per-question answers: [q1, q2, q3, q4, q5]
  // q1-q3, q5 are MC (0 or 1), q4 is short answer (0, 1, or 2)
  answers: { answer: string; isCorrect: boolean; score: number }[];
}

// Score distribution: 3x6, 4x5, 3x4, 3x3, 2x2
// Q3 (evidence) and Q4 (explain top predator) should have the LOWEST correct rates

const students: StudentScore[] = [
  // --- 6/6 (3 students) ---
  {
    name: "Emma T.",
    totalScore: 6,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Measurements of riverbank erosion rates before and after wolf reintroduction", isCorrect: true, score: 1 },
      { answer: "Top predators control the populations below them. Without wolves, elk populations grow rapidly and eat too many plants like willows and aspens. This hurts all the species that depend on those plants for food and shelter, like beavers and songbirds.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Sophia L.",
    totalScore: 6,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Measurements of riverbank erosion rates before and after wolf reintroduction", isCorrect: true, score: 1 },
      { answer: "When a top predator is removed, the herbivores they controlled increase in number. These herbivores then overconsume plants (producers), and since producers are the base of the food web, this affects every organism that depends on those plants — including insects, birds, and decomposers.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Olivia H.",
    totalScore: 6,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Measurements of riverbank erosion rates before and after wolf reintroduction", isCorrect: true, score: 1 },
      { answer: "A top predator sits at the top of the food chain so removing it creates a trophic cascade. The herbivore population explodes because nothing is eating them, then they eat all the producers, and then everything that needs those producers — other herbivores, insects, even fish that need shade from trees — is affected too.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  // --- 5/6 (4 students) ---
  {
    name: "Marcus R.",
    totalScore: 5,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Elk population counts before and after wolf reintroduction", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Top predators keep herbivore populations in check. Without them, herbivores eat too many plants, which affects all the animals that need those plants. A lower-level species doesn't have as much control over the whole system.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Liam W.",
    totalScore: 5,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Wolf population data from 1995-2020", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Removing a top predator causes a cascade effect through the whole food web. The herbivores increase, eat too many producers, and then everything relying on those producers is hurt. A lower species only affects one or two other species directly.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Isabella M.",
    totalScore: 5,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Measurements of riverbank erosion rates before and after wolf reintroduction", isCorrect: true, score: 1 },
      { answer: "Because top predators affect the whole food web when they're gone. Herbivores grow too large and eat everything.", isCorrect: true, score: 1 }, // partial credit Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Charlotte F.",
    totalScore: 5,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "A food web diagram showing all Yellowstone species", isCorrect: false, score: 0 }, // missed Q3
      { answer: "A top predator controls the whole food web from above. When you remove it, the herbivores have no natural check so they multiply and overeat the plants. All the other animals that use those plants for food or habitat are then affected too. A lower-level species has less influence because it's not controlling as many levels.", isCorrect: true, score: 2 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  // --- 4/6 (3 students) ---
  {
    name: "Ava S.",
    totalScore: 4,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Elk population counts before and after wolf reintroduction", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Top predators are important because they keep the ecosystem balanced.", isCorrect: true, score: 1 }, // partial Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Noah C.",
    totalScore: 4,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Wolf population data from 1995-2020", isCorrect: false, score: 0 }, // missed Q3
      { answer: "When you remove a predator at the top, the prey animals don't have anything hunting them so there are too many of them. Then they eat all the plants which is bad for other animals.", isCorrect: true, score: 1 }, // partial Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Lucas G.",
    totalScore: 4,
    answers: [
      { answer: "River channels would become wider and shallower", isCorrect: false, score: 0 }, // missed Q1
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Measurements of riverbank erosion rates before and after wolf reintroduction", isCorrect: true, score: 1 },
      { answer: "Top predators affect more species because they are at the top of the food chain and control all the animals below them.", isCorrect: true, score: 1 }, // partial Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  // --- 3/6 (3 students) ---
  {
    name: "Jayden K.",
    totalScore: 3,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "A food web diagram showing all Yellowstone species", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Because top predators are more important.", isCorrect: false, score: 0 }, // missed Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Ethan B.",
    totalScore: 3,
    answers: [
      { answer: "Bear populations would increase to fill the predator niche", isCorrect: false, score: 0 }, // missed Q1
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "Elk population counts before and after wolf reintroduction", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Removing the top predator matters more because they eat the most other animals. If you remove a smaller animal, nothing big changes.", isCorrect: true, score: 1 }, // partial Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Aiden J.",
    totalScore: 3,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "A population reaches its carrying capacity", isCorrect: false, score: 0 }, // missed Q2
      { answer: "Wolf population data from 1995-2020", isCorrect: false, score: 0 }, // missed Q3
      { answer: "Because wolves are at the top and they control everything underneath them in the food web.", isCorrect: true, score: 1 }, // partial Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  // --- 2/6 (2 students) ---
  {
    name: "Mia D.",
    totalScore: 2,
    answers: [
      { answer: "Elk populations would immediately decrease", isCorrect: false, score: 0 }, // missed Q1
      { answer: "Changes at one trophic level cause effects that ripple through other levels", isCorrect: true, score: 1 },
      { answer: "A food web diagram showing all Yellowstone species", isCorrect: false, score: 0 }, // missed Q3
      { answer: "I'm not sure but I think its because top predators are bigger.", isCorrect: false, score: 0 }, // missed Q4
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Harper P.",
    totalScore: 2,
    answers: [
      { answer: "Willow and aspen trees would decline due to increased elk browsing", isCorrect: true, score: 1 },
      { answer: "Two species compete for the same food source", isCorrect: false, score: 0 },
      { answer: "Elk population counts before and after wolf reintroduction", isCorrect: false, score: 0 },
      { answer: "They just have a bigger effect on the ecosystem.", isCorrect: false, score: 0 },
      { answer: "Elk learned to avoid open meadows near rivers", isCorrect: true, score: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("=== Backward Builder Seed Script ===\n");

  // -----------------------------------------------------------------------
  // Step 0: Clean up existing demo data
  // -----------------------------------------------------------------------
  console.log("1. Cleaning existing demo data...");

  // Delete in reverse dependency order
  // student_answers -> student_submissions -> (check_questions, learning_activities, checks_for_understanding, performance_tasks) -> units -> teachers
  await sql`
    DELETE FROM student_answers
    WHERE submission_id IN (
      SELECT ss.id FROM student_submissions ss
      JOIN units u ON ss.unit_id = u.id
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM student_submissions
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM check_questions
    WHERE check_id IN (
      SELECT c.id FROM checks_for_understanding c
      JOIN units u ON c.unit_id = u.id
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM learning_activities
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM checks_for_understanding
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM performance_tasks
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true OR t.session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM units
    WHERE teacher_id IN (
      SELECT id FROM teachers
      WHERE is_demo = true OR session_id = 'demo-mrs-crabapple'
    )
  `;

  await sql`
    DELETE FROM teachers
    WHERE is_demo = true OR session_id = 'demo-mrs-crabapple'
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 1: Create demo teacher
  // -----------------------------------------------------------------------
  console.log("2. Creating Mrs. Crabapple (demo teacher)...");

  await sql`
    INSERT INTO teachers (id, session_id, email, display_name, grade_level, subject, state, standards_framework, is_demo)
    VALUES (
      ${TEACHER_ID},
      'demo-mrs-crabapple',
      'crabapple@demo.backwardbuilder.com',
      'Mrs. Crabapple',
      '7th Grade',
      'Science',
      'Missouri',
      'NGSS',
      true
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 2: Create Unit 1 — Ecosystem Interdependence
  // -----------------------------------------------------------------------
  console.log("3. Creating Unit 1: Ecosystem Interdependence...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_1_ID},
      ${TEACHER_ID},
      'Ecosystem Interdependence',
      'Organisms in an ecosystem are interdependent, and changes to one population affect the entire system through cascading effects.',
      ${JSON.stringify([
        "How do changes in one part of an ecosystem ripple through the entire food web?",
        "Why can removing a single species cause an ecosystem to collapse?",
        "How do scientists predict the consequences of changes to populations?",
      ])}::jsonb,
      ${JSON.stringify(["MS-LS2-2", "MS-LS2-4"])}::jsonb,
      ${JSON.stringify([
        "Construct an explanation that predicts patterns of interactions among organisms across multiple ecosystems.",
        "Construct an argument supported by empirical evidence that changes to physical or biological components of an ecosystem affect populations.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://www.nextgenscience.org/search-standards?keys=MS-LS2-2",
        "https://www.nextgenscience.org/search-standards?keys=MS-LS2-4",
      ])}::jsonb,
      'analyze',
      'Students must analyze cause-and-effect relationships across multiple trophic levels — not just identify organisms, but predict system-level consequences.',
      'complete',
      true
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 3: Performance Task 1 — The Yellowstone Scenario
  // -----------------------------------------------------------------------
  console.log("4. Creating Performance Task: The Yellowstone Scenario...");

  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, share_code, status, is_selected)
    VALUES (
      ${PT_1_ID},
      ${UNIT_1_ID},
      'The Yellowstone Scenario',
      'Students analyze real data from the Yellowstone wolf reintroduction and predict ecosystem consequences.',
      'You are a wildlife biologist at Yellowstone National Park. The park service has received reports that a new disease is threatening to eliminate 80% of the wolf population within the next two years. The superintendent has asked you to prepare a scientific brief predicting the cascading effects on the Yellowstone ecosystem. Using data from the 1920s wolf removal and 1995 reintroduction, write a 2-page analysis that: (1) traces at least three trophic cascades that would result from the wolf population decline, (2) cites specific evidence from both historical data sets, and (3) recommends two science-based management strategies.',
      ${JSON.stringify(yellowstoneRubric)}::jsonb,
      ${JSON.stringify(["MS-LS2-2", "MS-LS2-4"])}::jsonb,
      'analyze',
      45,
      'ystone',
      'live',
      true
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 4: Checks for Understanding
  // -----------------------------------------------------------------------
  console.log("5. Creating Check 1: Food Web Analysis Check...");

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_1_ID},
      ${UNIT_1_ID},
      'Food Web Analysis Check',
      'Use after students complete the Yellowstone food web mapping activity, before they begin the data analysis.',
      'fwchk1',
      'live',
      6
    )
  `;

  // Insert Check 1 questions
  for (const q of check1Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (
        ${q.id},
        ${CHECK_1_ID},
        ${q.type},
        ${q.orderIndex},
        ${q.questionText},
        ${q.points},
        ${q.options}::jsonb,
        ${q.correctAnswer}
      )
    `;
  }

  console.log("   Done.\n");

  console.log("6. Creating Check 2: Data Interpretation Check...");

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_2_ID},
      ${UNIT_1_ID},
      'Data Interpretation Check',
      'Use after the data analysis activity, before students begin drafting their performance task response.',
      'dtchk2',
      'live',
      5
    )
  `;

  // Insert Check 2 questions
  for (const q of check2Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (
        ${q.id},
        ${CHECK_2_ID},
        ${q.type},
        ${q.orderIndex},
        ${q.questionText},
        ${q.points},
        ${q.options ? q.options : null}::jsonb,
        ${q.correctAnswer}
      )
    `;
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 5: Learning Activities (Stage 3)
  // -----------------------------------------------------------------------
  console.log("7. Creating learning activities for Unit 1...");

  const activities = [
    {
      id: LA_1_ID,
      sequenceOrder: 1,
      title: "What Is a System?",
      description:
        "Hook activity: Students examine everyday systems (school cafeteria, city traffic, a Rube Goldberg machine) to identify how parts are connected and how changing one part affects others. Students create a 'system map' of a familiar system, then discuss: what happens when one piece breaks? This primes the concept of interdependence before introducing ecosystems.",
      durationMinutes: 30,
      materials:
        "System map handout, markers, projector for Rube Goldberg video clip",
      buildsToward: "Causal Reasoning — builds foundational understanding of interconnected systems",
      associatedCheckId: null,
    },
    {
      id: LA_2_ID,
      sequenceOrder: 2,
      title: "The Yellowstone Wolf Story",
      description:
        "Core content delivery: Students watch a short documentary segment about the Yellowstone wolf removal (1926) and reintroduction (1995). Working in pairs, they build a food web map of the Yellowstone ecosystem, identifying at least 8 organisms across 4 trophic levels. Students trace arrows showing energy flow AND add 'impact arrows' predicting what happens when wolves are removed.",
      durationMinutes: 45,
      materials:
        "Documentary clip (How Wolves Change Rivers, 4:30), Yellowstone food web template, organism cards, colored arrows for energy flow vs. impact",
      buildsToward: "Causal Reasoning — maps multi-level trophic relationships",
      associatedCheckId: null,
    },
    {
      id: LA_3_ID,
      sequenceOrder: 3,
      title: "Food Web Analysis Check",
      description:
        "Formative check: 5 questions assessing students' understanding of food web relationships and trophic cascades. Results inform whether to proceed to data analysis or reteach food web concepts.",
      durationMinutes: 10,
      materials: "Student devices or printed check",
      buildsToward: "Formative assessment checkpoint",
      associatedCheckId: CHECK_1_ID,
    },
    {
      id: LA_4_ID,
      sequenceOrder: 4,
      title: "Data Detectives",
      description:
        "Data analysis activity: Students receive real (simplified) population data sets from Yellowstone covering 1920-2010 — wolf counts, elk counts, willow height measurements, beaver dam counts, and songbird species diversity. In lab groups, students create graphs of at least two data sets and write a 'data story' connecting the patterns they observe. Teacher facilitates a gallery walk where groups compare their data stories.",
      durationMinutes: 40,
      materials:
        "Yellowstone population data sets (simplified), graph paper or graphing software, gallery walk response sheets",
      buildsToward: "Evidence Use — practice identifying and citing specific data patterns",
      associatedCheckId: null,
    },
    {
      id: LA_5_ID,
      sequenceOrder: 5,
      title: "Cascade Predictions",
      description:
        "Practice activity: Students are given three new scenarios (sea otter removal from kelp forests, bee decline in agricultural systems, shark overfishing in coral reefs). For each scenario, students must: (1) predict at least two cascading effects, (2) identify what data they would need to test their predictions, and (3) compare their predictions with a partner. Whole-class discussion focuses on the pattern: removing a keystone species creates predictable cascade patterns across different ecosystems.",
      durationMinutes: 30,
      materials:
        "Scenario cards (3 ecosystems), prediction worksheet, class discussion guide",
      buildsToward: "Prediction Quality — practice making specific, testable predictions",
      associatedCheckId: null,
    },
    {
      id: LA_6_ID,
      sequenceOrder: 6,
      title: "Data Interpretation Check",
      description:
        "Formative check: 4 questions assessing students' ability to interpret population data and connect it to trophic cascade concepts. Results inform readiness for the performance task.",
      durationMinutes: 10,
      materials: "Student devices or printed check",
      buildsToward: "Formative assessment checkpoint",
      associatedCheckId: CHECK_2_ID,
    },
    {
      id: LA_7_ID,
      sequenceOrder: 7,
      title: "Building the Brief",
      description:
        "Scaffolded writing activity: Students begin drafting their scientific brief (the performance task) with structured support. The teacher models the first paragraph using a think-aloud, demonstrating how to integrate data citations. Students use a planning template with sections mapped to rubric criteria: (1) Trophic cascade analysis, (2) Evidence from historical data, (3) Predictions with testable hypotheses, (4) Management recommendations. Peer review focuses on one criterion — causal reasoning — before students revise.",
      durationMinutes: 45,
      materials:
        "Performance task prompt, planning template aligned to rubric, peer review checklist, model first paragraph (teacher example)",
      buildsToward: "Scientific Communication — structured writing with domain vocabulary",
      associatedCheckId: null,
    },
  ];

  for (const a of activities) {
    await sql`
      INSERT INTO learning_activities (id, unit_id, sequence_order, title, description, duration_minutes, materials, builds_toward, associated_check_id)
      VALUES (
        ${a.id},
        ${UNIT_1_ID},
        ${a.sequenceOrder},
        ${a.title},
        ${a.description},
        ${a.durationMinutes},
        ${a.materials},
        ${a.buildsToward},
        ${a.associatedCheckId}
      )
    `;
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 6: Student Submissions for Check 1
  // -----------------------------------------------------------------------
  console.log("8. Creating 15 student submissions for Check 1...");

  const questionIds = [C1_Q1_ID, C1_Q2_ID, C1_Q3_ID, C1_Q4_ID, C1_Q5_ID];

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const submissionId = subId(5000 + i);

    // Create the submission
    await sql`
      INSERT INTO student_submissions (id, unit_id, assessment_type, assessment_id, student_name, class_period, total_score, max_score)
      VALUES (
        ${submissionId},
        ${UNIT_1_ID},
        'check',
        ${CHECK_1_ID},
        ${student.name},
        'Period 3',
        ${student.totalScore},
        6
      )
    `;

    // Create individual answers
    for (let j = 0; j < student.answers.length; j++) {
      const ans = student.answers[j];
      const answerId = subId(6000 + i * 10 + j);

      await sql`
        INSERT INTO student_answers (id, submission_id, question_id, answer, is_correct, score)
        VALUES (
          ${answerId},
          ${submissionId},
          ${questionIds[j]},
          ${ans.answer},
          ${ans.isCorrect},
          ${ans.score}
        )
      `;
    }
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 7: Unit 2 — Causes of the American Revolution (partial)
  // -----------------------------------------------------------------------
  console.log("9. Creating Unit 2: Causes of the American Revolution...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_2_ID},
      ${TEACHER_ID},
      'Causes of the American Revolution',
      'The American Revolution was caused by escalating economic, political, and ideological tensions between the colonies and Britain, not a single event.',
      ${JSON.stringify([
        "Why do people decide that revolution is the only option?",
        "How did economic policies create political resistance?",
        "Was the American Revolution inevitable, or could it have been prevented?",
      ])}::jsonb,
      ${JSON.stringify(["CCSS.ELA-LITERACY.RH.6-8.1", "CCSS.ELA-LITERACY.RH.6-8.2", "CCSS.ELA-LITERACY.RH.6-8.9"])}::jsonb,
      ${JSON.stringify([
        "Cite specific textual evidence to support analysis of primary and secondary sources.",
        "Determine the central ideas or information of a primary or secondary source; provide an accurate summary of the source distinct from prior knowledge or opinions.",
        "Analyze the relationship between a primary and secondary source on the same topic.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://www.thecorestandards.org/ELA-Literacy/RH/6-8/1/",
        "https://www.thecorestandards.org/ELA-Literacy/RH/6-8/2/",
        "https://www.thecorestandards.org/ELA-Literacy/RH/6-8/9/",
      ])}::jsonb,
      'analyze',
      'Students must analyze the interplay between multiple categories of causes (economic, political, ideological) and evaluate their relative significance — not just memorize a timeline of events.',
      'stage2',
      true
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 8: Performance Task for Unit 2 (draft, not selected)
  // -----------------------------------------------------------------------
  console.log("10. Creating Performance Task for Unit 2 (draft)...");

  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, status, is_selected)
    VALUES (
      ${PT_2_ID},
      ${UNIT_2_ID},
      'The Colonial Editor',
      'Students write a persuasive editorial from the perspective of a colonial newspaper editor in 1774, arguing whether the colonies should pursue independence.',
      'It is October 1774, one month after the First Continental Congress. You are the editor of the Pennsylvania Gazette, one of the most widely read newspapers in the colonies. Tensions are high: the Intolerable Acts have shut down Boston''s port, British troops occupy the city, and delegates from 12 colonies have just met in Philadelphia to discuss a unified response. Your readers are divided — some want reconciliation with Britain, others demand independence. Write a 1-page editorial that: (1) identifies at least three specific grievances (economic, political, and ideological) that have brought the colonies to this point, (2) analyzes how these grievances are connected to each other (not isolated events), and (3) takes a clear position on what the colonies should do next, supported by historical evidence.',
      ${JSON.stringify(revolutionRubric)}::jsonb,
      ${JSON.stringify(["CCSS.ELA-LITERACY.RH.6-8.1", "CCSS.ELA-LITERACY.RH.6-8.2"])}::jsonb,
      'analyze',
      50,
      'draft',
      false
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("=== Seed Complete ===\n");
  console.log("Created:");
  console.log("  - 1 demo teacher (Mrs. Crabapple)");
  console.log("  - 2 units (Ecosystem Interdependence + Causes of the American Revolution)");
  console.log("  - 2 performance tasks (1 live + selected, 1 draft)");
  console.log("  - 2 checks for understanding (both live, 9 questions total)");
  console.log("  - 7 learning activities");
  console.log("  - 15 student submissions with 75 individual answers");
  console.log("\nDemo login: session_id = 'demo-mrs-crabapple'");
  console.log("Share codes: ystone, fwchk1, dtchk2");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
