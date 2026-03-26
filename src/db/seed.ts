/**
 * Seed script for Backward Builder — UbD Curriculum Design Tool
 *
 * Creates demo teachers and four units showcasing different subjects,
 * grade levels, statuses, and sharing scenarios.
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
// Fixed IDs — Teachers
// ---------------------------------------------------------------------------

const TEACHER_JONES_ID = "00000000-0000-0000-0000-000000000001";
const TEACHER_RODRIGUEZ_ID = "00000000-0000-0000-0000-000000000002";

// ---------------------------------------------------------------------------
// Fixed IDs — Units
// ---------------------------------------------------------------------------

const UNIT_REVOLUTION_ID = "00000000-0000-0000-0000-000000000010"; // Unit 1: Am. Revolution
const UNIT_FRACTIONS_ID = "00000000-0000-0000-0000-000000000020"; // Unit 2: Fractions
const UNIT_LITERARY_ID = "00000000-0000-0000-0000-000000000030"; // Unit 3: Literary Elements
const UNIT_WATER_ID = "00000000-0000-0000-0000-000000000040"; // Unit 4: Water Cycle

// ---------------------------------------------------------------------------
// Fixed IDs — Performance Tasks
// ---------------------------------------------------------------------------

const PT_REVOLUTION_ID = "00000000-0000-0000-0000-000000000101";
const PT_FRACTIONS_ID = "00000000-0000-0000-0000-000000000201";
const PT_LITERARY_ID = "00000000-0000-0000-0000-000000000301";
const PT_WATER_ID = "00000000-0000-0000-0000-000000000401";

// ---------------------------------------------------------------------------
// Fixed IDs — Checks for Understanding
// ---------------------------------------------------------------------------

// Unit 1 (Revolution) checks
const CHECK_REV_1_ID = "00000000-0000-0000-0000-000000000111";
const CHECK_REV_2_ID = "00000000-0000-0000-0000-000000000112";

// Unit 2 (Fractions) checks
const CHECK_FRAC_1_ID = "00000000-0000-0000-0000-000000000211";
const CHECK_FRAC_2_ID = "00000000-0000-0000-0000-000000000212";

// Unit 3 (Literary) checks
const CHECK_LIT_1_ID = "00000000-0000-0000-0000-000000000311";
const CHECK_LIT_2_ID = "00000000-0000-0000-0000-000000000312";

// Unit 4 (Water) checks
const CHECK_WATER_1_ID = "00000000-0000-0000-0000-000000000411";
const CHECK_WATER_2_ID = "00000000-0000-0000-0000-000000000412";

// ---------------------------------------------------------------------------
// Fixed IDs — Unit Share (Literary unit shared with Ms. Jones)
// ---------------------------------------------------------------------------

const UNIT_SHARE_LIT_ID = "00000000-0000-0000-0000-000000000500";

// ---------------------------------------------------------------------------
// Helper: generate a deterministic UUID from a seed number
// ---------------------------------------------------------------------------
function subId(base: number): string {
  const hex = base.toString(16).padStart(12, "0");
  return `00000000-0000-0000-0000-${hex}`;
}

// ---------------------------------------------------------------------------
// UNIT 1 — Causes of the American Revolution (8th History)
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

const checkRev1Questions = [
  {
    id: subId(1001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "Which British policy MOST directly led to the colonial rallying cry 'No taxation without representation'?",
    points: 1,
    options: JSON.stringify([
      { text: "The Quartering Act of 1765", isCorrect: false },
      { text: "The Stamp Act of 1765", isCorrect: true },
      { text: "The Proclamation of 1763", isCorrect: false },
      { text: "The Navigation Acts of 1651", isCorrect: false },
    ]),
    correctAnswer: "The Stamp Act of 1765",
  },
  {
    id: subId(1002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "How did the Boston Tea Party represent BOTH an economic and political protest?",
    points: 1,
    options: JSON.stringify([
      {
        text: "It destroyed British military supplies and challenged the king's authority",
        isCorrect: false,
      },
      {
        text: "It targeted a taxed commodity while defying Parliament's right to tax the colonies",
        isCorrect: true,
      },
      {
        text: "It blocked British ships from entering Boston Harbor and declared independence",
        isCorrect: false,
      },
      {
        text: "It raised money for the colonial militia while embarrassing British merchants",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "It targeted a taxed commodity while defying Parliament's right to tax the colonies",
  },
  {
    id: subId(1003),
    type: "selected_response" as const,
    orderIndex: 2,
    questionText:
      "Which sequence BEST shows the escalation of tensions between Britain and the colonies?",
    points: 1,
    options: JSON.stringify([
      {
        text: "Boston Massacre → Stamp Act → Tea Act → Declaration of Independence",
        isCorrect: false,
      },
      {
        text: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts",
        isCorrect: true,
      },
      {
        text: "Declaration of Independence → Boston Tea Party → Stamp Act → French and Indian War",
        isCorrect: false,
      },
      {
        text: "Navigation Acts → Boston Massacre → Proclamation of 1763 → Stamp Act",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts",
  },
  {
    id: subId(1004),
    type: "short_answer" as const,
    orderIndex: 3,
    questionText:
      "Explain how Britain's debt from the French and Indian War created a chain of events that led to revolution. Identify at least two specific policies and their effects on the colonies.",
    points: 2,
    options: null,
    correctAnswer:
      "Britain needed revenue after the costly French and Indian War, so Parliament passed the Stamp Act (1765) taxing colonial documents and the Townshend Acts (1767) taxing imported goods. Colonists objected not just to the cost but to the principle — they had no representatives in Parliament. This led to boycotts, protests like the Boston Tea Party, and eventually the Intolerable Acts, which united the colonies against British rule.",
  },
  {
    id: subId(1005),
    type: "selected_response" as const,
    orderIndex: 4,
    questionText:
      "Which Enlightenment idea MOST influenced the colonists' argument for independence?",
    points: 1,
    options: JSON.stringify([
      {
        text: "The divine right of kings to rule their subjects",
        isCorrect: false,
      },
      {
        text: "Natural rights — that governments derive their power from the consent of the governed",
        isCorrect: true,
      },
      {
        text: "Mercantilism — that colonies exist to enrich the mother country",
        isCorrect: false,
      },
      {
        text: "Social Darwinism — that the strongest societies should dominate",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "Natural rights — that governments derive their power from the consent of the governed",
  },
];

const checkRev2Questions = [
  {
    id: subId(2001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "A historian argues: 'The American Revolution was primarily about economics, not political ideals.' Which evidence would BEST support this claim?",
    points: 1,
    options: JSON.stringify([
      {
        text: "Thomas Paine's Common Sense sold 500,000 copies advocating for independence",
        isCorrect: false,
      },
      {
        text: "Colonial merchants organized boycotts specifically targeting taxed British goods",
        isCorrect: true,
      },
      {
        text: "The Declaration of Independence emphasizes natural rights and liberty",
        isCorrect: false,
      },
      {
        text: "Patriots tarred and feathered British tax collectors",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "Colonial merchants organized boycotts specifically targeting taxed British goods",
  },
  {
    id: subId(2002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "What was the MOST significant effect of the Intolerable Acts on colonial unity?",
    points: 1,
    options: JSON.stringify([
      {
        text: "They caused Massachusetts to declare independence immediately",
        isCorrect: false,
      },
      {
        text: "They prompted the First Continental Congress, where 12 colonies coordinated a response",
        isCorrect: true,
      },
      {
        text: "They led to the immediate formation of the Continental Army",
        isCorrect: false,
      },
      {
        text: "They convinced King George III to repeal all taxes",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "They prompted the First Continental Congress, where 12 colonies coordinated a response",
  },
  {
    id: subId(2003),
    type: "short_answer" as const,
    orderIndex: 2,
    questionText:
      "Compare the perspectives of a colonial merchant and a British Parliament member on the Stamp Act. How would each view the tax differently?",
    points: 2,
    options: null,
    correctAnswer:
      "A colonial merchant would see the Stamp Act as unfair because the colonies had no elected representatives in Parliament to vote on taxes affecting them. They would also see it as economically harmful, raising costs on everyday documents. A British Parliament member would argue the tax was reasonable — the colonies benefited from British military protection during the French and Indian War and should help pay the debt. Parliament believed it had the authority to tax all British subjects.",
  },
  {
    id: subId(2004),
    type: "selected_response" as const,
    orderIndex: 3,
    questionText:
      "Which statement BEST describes why the American Revolution is considered a turning point in world history?",
    points: 1,
    options: JSON.stringify([
      {
        text: "It was the first time a colony defeated a European power militarily",
        isCorrect: false,
      },
      {
        text: "It demonstrated that Enlightenment principles of self-governance could be put into practice",
        isCorrect: true,
      },
      {
        text: "It ended all forms of monarchy in the Western world",
        isCorrect: false,
      },
      {
        text: "It immediately led to the abolition of slavery in the new nation",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "It demonstrated that Enlightenment principles of self-governance could be put into practice",
  },
];

const revolutionActivities = [
  {
    id: subId(3001),
    sequenceOrder: 1,
    title: "The Breaking Point Simulation",
    description:
      "Hook activity: Students participate in a classroom simulation where the teacher progressively imposes unfair rules (extra homework 'taxes,' restricted recess, assigned seating without input). After each rule, students discuss: Is this fair? What would make you push back? At what point would you 'revolt'? Debrief connects student reactions to colonial experiences with escalating British policies.",
    durationMinutes: 30,
    materials:
      "Simulation instruction cards, debrief discussion guide, timeline handout",
    buildsToward:
      "Historical Argumentation — builds empathy for colonial perspective and understanding of escalation",
    associatedCheckId: null,
  },
  {
    id: subId(3002),
    sequenceOrder: 2,
    title: "Mapping the Causes: Economic, Political, Ideological",
    description:
      "Core content: Students receive a set of 12 primary source excerpts (letters, pamphlets, Parliamentary records) from 1763-1776. Working in groups of three, each student categorizes sources into economic, political, or ideological causes. Groups then create a cause-and-effect web showing how the three categories interconnect. Gallery walk with sticky-note feedback on other groups' webs.",
    durationMinutes: 45,
    materials:
      "Primary source packet (12 excerpts), cause-and-effect web template, sticky notes, markers",
    buildsToward:
      "Evidence & Sourcing — practice analyzing and categorizing primary sources",
    associatedCheckId: null,
  },
  {
    id: subId(3003),
    sequenceOrder: 3,
    title: "Taxation and Representation Check",
    description:
      "Formative check: 5 questions assessing understanding of key events, the escalation pattern, and Enlightenment influences on colonial thinking.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_REV_1_ID,
  },
  {
    id: subId(3004),
    sequenceOrder: 4,
    title: "The Debate: Was Revolution Inevitable?",
    description:
      "Students are assigned roles (Loyalist merchant, Patriot artisan, neutral farmer, British official) and participate in a structured academic debate. Each role must use at least two pieces of historical evidence. After the debate, students write a reflection analyzing which arguments were strongest and why.",
    durationMinutes: 40,
    materials:
      "Role cards with historical context, evidence packet, debate structure guide, reflection prompt",
    buildsToward:
      "Cause & Effect Analysis — evaluate the relative weight of different causes",
    associatedCheckId: null,
  },
  {
    id: subId(3005),
    sequenceOrder: 5,
    title: "Primary Source Analysis Check",
    description:
      "Formative check: 4 questions assessing ability to analyze primary sources, compare perspectives, and evaluate historical arguments.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_REV_2_ID,
  },
  {
    id: subId(3006),
    sequenceOrder: 6,
    title: "Writing the Colonial Editorial",
    description:
      "Scaffolded writing: Students draft their editorial (performance task) with structured support. Teacher models integrating evidence from primary sources into persuasive writing. Students use a planning template mapped to rubric criteria: (1) Thesis statement, (2) Economic grievances with evidence, (3) Political grievances with evidence, (4) Ideological connections, (5) Position and call to action. Peer review focuses on evidence sourcing before revision.",
    durationMinutes: 45,
    materials:
      "Performance task prompt, planning template aligned to rubric, peer review checklist, model editorial paragraph",
    buildsToward:
      "Written Communication — persuasive historical writing with evidence",
    associatedCheckId: null,
  },
];

// Student submissions for Revolution Check 1
interface StudentScore {
  name: string;
  period: string;
  totalScore: number;
  answers: { answer: string; isCorrect: boolean; score: number }[];
}

const revolutionStudents: StudentScore[] = [
  // 6/6 (3 students)
  {
    name: "Emma T.",
    period: "Period 2",
    totalScore: 6,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "Britain was deeply in debt after the French and Indian War and needed the colonies to help pay. They passed the Stamp Act in 1765, which taxed all printed documents like newspapers and legal papers. Colonists protested because they had no representatives in Parliament. Then Britain passed the Townshend Acts in 1767, taxing glass, lead, paint, and tea. Colonists boycotted British goods, leading to confrontations like the Boston Massacre. Each new tax and each colonial response escalated tensions further toward revolution.", isCorrect: true, score: 2 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Sophia L.",
    period: "Period 2",
    totalScore: 6,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "The French and Indian War left Britain with massive war debts. To recover costs, Parliament imposed the Stamp Act (1765) requiring colonists to buy special stamps for documents, and later the Townshend Acts (1767) adding import duties. Colonists argued these taxes violated their rights because they couldn't vote for members of Parliament. The protests and boycotts that followed provoked Britain into passing the Intolerable Acts, which punished Massachusetts and pushed all thirteen colonies toward united resistance.", isCorrect: true, score: 2 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Marcus R.",
    period: "Period 2",
    totalScore: 6,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "After the French and Indian War, Britain was broke. They created the Stamp Act to tax colonial documents and the Townshend Acts to tax imported goods. The colonists were angry not just about money but about the principle — they had no say in Parliament. Boycotts and protests like the Boston Tea Party followed, and Britain responded with harsh punishments (the Intolerable Acts), which actually united the colonies against Britain instead of scaring them into submission.", isCorrect: true, score: 2 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  // 5/6 (4 students)
  {
    name: "Liam W.",
    period: "Period 2",
    totalScore: 5,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "Boston Massacre → Stamp Act → Tea Act → Declaration of Independence", isCorrect: false, score: 0 },
      { answer: "Britain needed money after the French and Indian War, so they taxed the colonies with the Stamp Act. The colonists didn't have anyone representing them in Parliament so they thought it was unfair. Then came the Townshend Acts with more taxes. Each tax led to more protests and more conflict, eventually leading to calls for independence.", isCorrect: true, score: 2 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Isabella M.",
    period: "Period 2",
    totalScore: 5,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "The French and Indian War cost a lot and Britain taxed the colonies to pay for it. The Stamp Act made colonists mad because they had no representation. This started protests that got worse over time.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Charlotte F.",
    period: "Period 2",
    totalScore: 5,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It blocked British ships from entering Boston Harbor and declared independence", isCorrect: false, score: 0 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "After the war with France, Britain was in debt and passed the Stamp Act to get money from the colonies. The colonists protested because they said 'no taxation without representation.' Then the Townshend Acts added more taxes on everyday items. Each time Britain tried to control the colonies, the colonists pushed back harder, creating a cycle that led to revolution.", isCorrect: true, score: 2 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Olivia H.",
    period: "Period 2",
    totalScore: 5,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "Britain needed money after the French and Indian War. The Stamp Act taxed documents, and colonists protested because they had no representation in Parliament. Things escalated from there.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  // 4/6 (3 students)
  {
    name: "Noah C.",
    period: "Period 2",
    totalScore: 4,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "Navigation Acts → Boston Massacre → Proclamation of 1763 → Stamp Act", isCorrect: false, score: 0 },
      { answer: "Britain taxed the colonies after a war. The colonists protested and things got worse until they decided to fight for independence.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Ava S.",
    period: "Period 2",
    totalScore: 4,
    answers: [
      { answer: "The Quartering Act of 1765", isCorrect: false, score: 0 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "The Stamp Act and Townshend Acts were taxes that made colonists angry. They protested and eventually it led to the revolution.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Lucas G.",
    period: "Period 2",
    totalScore: 4,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It raised money for the colonial militia while embarrassing British merchants", isCorrect: false, score: 0 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "After a big war, Britain needed money and started taxing the colonies. The colonies didn't think it was fair.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  // 3/6 (3 students)
  {
    name: "Jayden K.",
    period: "Period 2",
    totalScore: 3,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "Declaration of Independence → Boston Tea Party → Stamp Act → French and Indian War", isCorrect: false, score: 0 },
      { answer: "Britain taxed the colonies and they didn't like it.", isCorrect: false, score: 0 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Ethan B.",
    period: "Period 2",
    totalScore: 3,
    answers: [
      { answer: "The Proclamation of 1763", isCorrect: false, score: 0 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "French and Indian War → Stamp Act → Townshend Acts → Intolerable Acts", isCorrect: true, score: 1 },
      { answer: "They fought because of taxes.", isCorrect: false, score: 0 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Aiden J.",
    period: "Period 2",
    totalScore: 3,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It destroyed British military supplies and challenged the king's authority", isCorrect: false, score: 0 },
      { answer: "Boston Massacre → Stamp Act → Tea Act → Declaration of Independence", isCorrect: false, score: 0 },
      { answer: "Britain was in debt after the French and Indian War so they passed the Stamp Act to tax things. People didn't like it because of no representation.", isCorrect: true, score: 1 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  // 2/6 (2 students)
  {
    name: "Mia D.",
    period: "Period 2",
    totalScore: 2,
    answers: [
      { answer: "The Navigation Acts of 1651", isCorrect: false, score: 0 },
      { answer: "It targeted a taxed commodity while defying Parliament's right to tax the colonies", isCorrect: true, score: 1 },
      { answer: "Declaration of Independence → Boston Tea Party → Stamp Act → French and Indian War", isCorrect: false, score: 0 },
      { answer: "I think it was because of taxes and unfair laws.", isCorrect: false, score: 0 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Harper P.",
    period: "Period 2",
    totalScore: 2,
    answers: [
      { answer: "The Stamp Act of 1765", isCorrect: true, score: 1 },
      { answer: "It destroyed British military supplies and challenged the king's authority", isCorrect: false, score: 0 },
      { answer: "Navigation Acts → Boston Massacre → Proclamation of 1763 → Stamp Act", isCorrect: false, score: 0 },
      { answer: "The colonists were angry at Britain.", isCorrect: false, score: 0 },
      { answer: "Natural rights — that governments derive their power from the consent of the governed", isCorrect: true, score: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// UNIT 2 — Fractions in Everyday Life (5th Math)
// ---------------------------------------------------------------------------

const fractionsRubric = [
  {
    criterionName: "Conceptual Understanding",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Demonstrates deep understanding that fractions represent parts of a whole; accurately models fractions in multiple real-world contexts; explains equivalent fractions and their relationships.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Demonstrates solid understanding of fractions as parts of a whole; models fractions in at least two real-world contexts.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "Shows basic understanding of fractions but struggles with equivalent fractions or applying concepts to real-world situations.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "Cannot consistently identify fractions or confuses numerator and denominator roles.",
      },
    ],
  },
  {
    criterionName: "Problem Solving & Application",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Correctly adds, subtracts, and multiplies fractions in context; converts between mixed numbers and improper fractions fluently; solves multi-step real-world problems.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Correctly performs most fraction operations; solves real-world problems with minor computational errors.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "Can perform basic fraction operations with support but struggles with unlike denominators or multi-step problems.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "Cannot reliably add or subtract fractions; does not find common denominators.",
      },
    ],
  },
  {
    criterionName: "Mathematical Communication",
    weight: 4,
    levels: [
      {
        score: 4,
        label: "Exemplary",
        description:
          "Uses precise mathematical language; clearly explains reasoning with visual models (number lines, area models, or diagrams); work is organized and easy to follow.",
      },
      {
        score: 3,
        label: "Proficient",
        description:
          "Uses adequate mathematical language; includes some visual support; work is generally organized.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Mathematical language is informal or imprecise; visual models are incomplete or missing.",
      },
      {
        score: 1,
        label: "Beginning",
        description:
          "No mathematical reasoning communicated; work is disorganized or illegible.",
      },
    ],
  },
];

const checkFrac1Questions = [
  {
    id: subId(4001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "A recipe calls for 3/4 cup of flour. You want to make half the recipe. How much flour do you need?",
    points: 1,
    options: JSON.stringify([
      { text: "3/8 cup", isCorrect: true },
      { text: "3/2 cup", isCorrect: false },
      { text: "1/4 cup", isCorrect: false },
      { text: "6/4 cup", isCorrect: false },
    ]),
    correctAnswer: "3/8 cup",
  },
  {
    id: subId(4002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "Which two fractions are equivalent?",
    points: 1,
    options: JSON.stringify([
      { text: "2/3 and 4/6", isCorrect: true },
      { text: "1/2 and 2/3", isCorrect: false },
      { text: "3/4 and 4/3", isCorrect: false },
      { text: "1/3 and 3/1", isCorrect: false },
    ]),
    correctAnswer: "2/3 and 4/6",
  },
  {
    id: subId(4003),
    type: "selected_response" as const,
    orderIndex: 2,
    questionText:
      "Maria ate 2/5 of a pizza. Her brother ate 1/5 of the same pizza. What fraction of the pizza did they eat together?",
    points: 1,
    options: JSON.stringify([
      { text: "3/10", isCorrect: false },
      { text: "3/5", isCorrect: true },
      { text: "2/10", isCorrect: false },
      { text: "1/5", isCorrect: false },
    ]),
    correctAnswer: "3/5",
  },
  {
    id: subId(4004),
    type: "short_answer" as const,
    orderIndex: 3,
    questionText:
      "You have 2/3 of a yard of ribbon and you need 5/6 of a yard. How much more ribbon do you need? Show your work and explain your reasoning.",
    points: 2,
    options: null,
    correctAnswer:
      "You need 1/6 of a yard more. To subtract 2/3 from 5/6, convert 2/3 to 4/6 (multiply numerator and denominator by 2). Then 5/6 - 4/6 = 1/6.",
  },
  {
    id: subId(4005),
    type: "selected_response" as const,
    orderIndex: 4,
    questionText:
      "Which number line correctly shows the location of 3/4?",
    points: 1,
    options: JSON.stringify([
      { text: "Halfway between 0 and 1", isCorrect: false },
      { text: "Three-fourths of the way from 0 to 1", isCorrect: true },
      { text: "At the point marked 3 on a line from 0 to 4", isCorrect: false },
      { text: "One-fourth of the way from 0 to 1", isCorrect: false },
    ]),
    correctAnswer: "Three-fourths of the way from 0 to 1",
  },
];

const checkFrac2Questions = [
  {
    id: subId(5001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "A carpenter needs to cut a board into pieces that are each 3/8 of a foot long. If the board is 3 feet long, how many pieces can he cut?",
    points: 1,
    options: JSON.stringify([
      { text: "6 pieces", isCorrect: false },
      { text: "8 pieces", isCorrect: true },
      { text: "9 pieces", isCorrect: false },
      { text: "3 pieces", isCorrect: false },
    ]),
    correctAnswer: "8 pieces",
  },
  {
    id: subId(5002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "Which operation would you use to find out how many 1/4-cup servings are in 3 cups of trail mix?",
    points: 1,
    options: JSON.stringify([
      { text: "3 × 1/4", isCorrect: false },
      { text: "3 ÷ 1/4", isCorrect: true },
      { text: "3 + 1/4", isCorrect: false },
      { text: "3 - 1/4", isCorrect: false },
    ]),
    correctAnswer: "3 ÷ 1/4",
  },
  {
    id: subId(5003),
    type: "short_answer" as const,
    orderIndex: 2,
    questionText:
      "Jake ran 2 1/2 miles on Monday and 1 3/4 miles on Tuesday. How far did he run in total? Show your work.",
    points: 2,
    options: null,
    correctAnswer:
      "Jake ran 4 1/4 miles total. Convert to improper fractions: 2 1/2 = 5/2 and 1 3/4 = 7/4. Find a common denominator: 5/2 = 10/4. Add: 10/4 + 7/4 = 17/4 = 4 1/4 miles.",
  },
  {
    id: subId(5004),
    type: "selected_response" as const,
    orderIndex: 3,
    questionText:
      "Sarah says 1/3 is larger than 1/2 because 3 is larger than 2. What is wrong with her reasoning?",
    points: 1,
    options: JSON.stringify([
      {
        text: "The denominator tells how many equal parts the whole is divided into — more parts means each part is smaller",
        isCorrect: true,
      },
      {
        text: "She should have compared the numerators instead",
        isCorrect: false,
      },
      {
        text: "Fractions can't be compared unless they have the same denominator",
        isCorrect: false,
      },
      {
        text: "She is actually correct — 1/3 is larger than 1/2",
        isCorrect: false,
      },
    ]),
    correctAnswer:
      "The denominator tells how many equal parts the whole is divided into — more parts means each part is smaller",
  },
];

const fractionsActivities = [
  {
    id: subId(6001),
    sequenceOrder: 1,
    title: "Fair Shares: The Pizza Problem",
    description:
      "Hook activity: The teacher presents a real scenario — 3 pizzas need to be shared equally among 4 students. Students work in pairs with paper 'pizzas' (circles) and scissors to figure out how to divide them fairly. Discussion reveals that each student gets 3/4 of a pizza, connecting physical manipulation to fraction notation. Students then try sharing 2 pizzas among 3 students and 5 cookies among 6 friends.",
    durationMinutes: 25,
    materials:
      "Paper circles (pizza templates), scissors, fraction notation guide",
    buildsToward:
      "Conceptual Understanding — connects physical models to fraction notation",
    associatedCheckId: null,
  },
  {
    id: subId(6002),
    sequenceOrder: 2,
    title: "Fraction Number Line Walk",
    description:
      "Kinesthetic activity: A number line from 0 to 2 is taped on the classroom floor. Students receive fraction cards and must physically stand at the correct position on the number line. Class discusses: Which fractions are at the same spot? (equivalent fractions) Which is larger — 2/3 or 3/4? How do you know? Teacher introduces benchmark fractions (1/4, 1/2, 3/4) as reference points.",
    durationMinutes: 30,
    materials:
      "Floor tape, number line markers, fraction cards (30 cards with various fractions), benchmark fraction posters",
    buildsToward:
      "Conceptual Understanding — builds number sense and fraction comparison skills",
    associatedCheckId: null,
  },
  {
    id: subId(6003),
    sequenceOrder: 3,
    title: "Fraction Foundations Check",
    description:
      "Formative check: 5 questions assessing understanding of fraction concepts, equivalence, and basic operations in real-world contexts.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_FRAC_1_ID,
  },
  {
    id: subId(6004),
    sequenceOrder: 4,
    title: "The Recipe Challenge",
    description:
      "Application activity: Student groups receive a recipe that serves 8 people and must adjust it to serve 4 (halving), 12 (1.5x), and 2 (quartering). Each group works with a different recipe (banana bread, trail mix, lemonade, smoothies). Students must show their fraction work for each ingredient. Groups present their adjusted recipes and the class identifies common strategies and errors.",
    durationMinutes: 35,
    materials:
      "Recipe cards (4 recipes), fraction operations workspace, measuring cups for verification",
    buildsToward:
      "Problem Solving & Application — fraction operations in authentic context",
    associatedCheckId: null,
  },
  {
    id: subId(6005),
    sequenceOrder: 5,
    title: "Fraction Operations Check",
    description:
      "Formative check: 4 questions assessing ability to add, subtract, and multiply fractions in applied contexts. Results inform readiness for the performance task.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_FRAC_2_ID,
  },
  {
    id: subId(6006),
    sequenceOrder: 6,
    title: "Design Your Own Fraction Problem Book",
    description:
      "Performance task preparation: Students begin creating their 'Fraction in My Life' book (the performance task). Each page features a real-world scenario from their daily life where fractions are needed. Teacher models the first page using a cooking example, showing how to include the scenario, visual model, computation, and explanation. Students draft at least three pages with peer feedback on mathematical accuracy.",
    durationMinutes: 40,
    materials:
      "Booklet template, colored pencils for visual models, rubric self-check sheet",
    buildsToward:
      "Mathematical Communication — explaining fraction reasoning with visual models",
    associatedCheckId: null,
  },
];

// Fractions student submissions (4 students with varied scores)
const fractionStudents: StudentScore[] = [
  {
    name: "Zoe M.",
    period: "Period 1",
    totalScore: 6,
    answers: [
      { answer: "3/8 cup", isCorrect: true, score: 1 },
      { answer: "2/3 and 4/6", isCorrect: true, score: 1 },
      { answer: "3/5", isCorrect: true, score: 1 },
      { answer: "Convert 2/3 to 4/6. Then 5/6 - 4/6 = 1/6. You need 1/6 yard more ribbon.", isCorrect: true, score: 2 },
      { answer: "Three-fourths of the way from 0 to 1", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Caleb R.",
    period: "Period 1",
    totalScore: 5,
    answers: [
      { answer: "3/8 cup", isCorrect: true, score: 1 },
      { answer: "2/3 and 4/6", isCorrect: true, score: 1 },
      { answer: "3/5", isCorrect: true, score: 1 },
      { answer: "I need to subtract 2/3 from 5/6. I think the answer is 1/6 but I'm not sure how to show it.", isCorrect: true, score: 1 },
      { answer: "Three-fourths of the way from 0 to 1", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Destiny W.",
    period: "Period 1",
    totalScore: 3,
    answers: [
      { answer: "3/8 cup", isCorrect: true, score: 1 },
      { answer: "1/2 and 2/3", isCorrect: false, score: 0 },
      { answer: "3/5", isCorrect: true, score: 1 },
      { answer: "5/6 minus 2/3 is 3/3 which is 1 whole.", isCorrect: false, score: 0 },
      { answer: "Three-fourths of the way from 0 to 1", isCorrect: true, score: 1 },
    ],
  },
  {
    name: "Tyler J.",
    period: "Period 1",
    totalScore: 2,
    answers: [
      { answer: "3/2 cup", isCorrect: false, score: 0 },
      { answer: "2/3 and 4/6", isCorrect: true, score: 1 },
      { answer: "3/10", isCorrect: false, score: 0 },
      { answer: "You need more ribbon but I'm not sure how much.", isCorrect: false, score: 0 },
      { answer: "Three-fourths of the way from 0 to 1", isCorrect: true, score: 1 },
    ],
  },
];

// ---------------------------------------------------------------------------
// UNIT 3 — How Authors Craft Meaning Through Literary Elements (7th ELA)
// ---------------------------------------------------------------------------

const literaryRubric = [
  {
    criterionName: "Identification of Literary Elements",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Accurately identifies and explains 4+ literary elements (point of view, symbolism, figurative language, imagery, tone) with precise textual evidence for each.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Accurately identifies and explains 2-3 literary elements with textual evidence.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Identifies literary elements but confuses definitions or provides vague examples.",
      },
      {
        score: 0,
        label: "Beginning",
        description:
          "Cannot identify literary elements or confuses them with plot summary.",
      },
    ],
  },
  {
    criterionName: "Analysis of Author's Craft",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Provides insightful analysis of WHY the author chose specific literary elements and HOW those choices shape the reader's understanding, emotional response, or interpretation of theme.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Analyzes how literary elements contribute to meaning; connects author's choices to reader experience with adequate reasoning.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "Attempts analysis but mostly describes what the literary element IS rather than explaining its effect on meaning.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "No analysis; simply lists literary elements found in the text.",
      },
    ],
  },
  {
    criterionName: "Use of Textual Evidence",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Integrates relevant, well-chosen quotes seamlessly into analysis; explains how each quote supports the analytical claim.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Includes relevant quotes that support claims; most quotes are adequately explained.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Quotes are present but not well-chosen or not clearly connected to the analysis.",
      },
      {
        score: 0,
        label: "Beginning",
        description:
          "No textual evidence cited, or quotes are irrelevant to the analysis.",
      },
    ],
  },
  {
    criterionName: "Written Expression",
    weight: 4,
    levels: [
      {
        score: 4,
        label: "Exemplary",
        description:
          "Writing is fluent, well-organized with clear topic sentences and transitions; uses literary analysis vocabulary (e.g., motif, connotation, juxtaposition) accurately.",
      },
      {
        score: 3,
        label: "Proficient",
        description:
          "Writing is clear and organized; uses some literary vocabulary correctly.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Writing is understandable but lacks organization or appropriate literary vocabulary.",
      },
      {
        score: 1,
        label: "Beginning",
        description:
          "Writing is unclear, disorganized, or reads as plot summary rather than analysis.",
      },
    ],
  },
];

const checkLit1Questions = [
  {
    id: subId(7001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "An author writes a story from the perspective of a dog. What literary element is the author primarily using to shape meaning?",
    points: 1,
    options: JSON.stringify([
      { text: "Symbolism", isCorrect: false },
      { text: "Point of view", isCorrect: true },
      { text: "Foreshadowing", isCorrect: false },
      { text: "Alliteration", isCorrect: false },
    ]),
    correctAnswer: "Point of view",
  },
  {
    id: subId(7002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "In a story, a character always carries a broken compass. The compass MOST likely symbolizes...",
    points: 1,
    options: JSON.stringify([
      { text: "The character's love of travel and adventure", isCorrect: false },
      { text: "The character's feeling of being lost or lacking direction in life", isCorrect: true },
      { text: "The character's interest in science and technology", isCorrect: false },
      { text: "The fact that the character is poor and can't afford a new compass", isCorrect: false },
    ]),
    correctAnswer:
      "The character's feeling of being lost or lacking direction in life",
  },
  {
    id: subId(7003),
    type: "selected_response" as const,
    orderIndex: 2,
    questionText:
      "'The wind howled angrily through the empty streets.' This sentence uses which type of figurative language?",
    points: 1,
    options: JSON.stringify([
      { text: "Simile", isCorrect: false },
      { text: "Hyperbole", isCorrect: false },
      { text: "Personification", isCorrect: true },
      { text: "Onomatopoeia", isCorrect: false },
    ]),
    correctAnswer: "Personification",
  },
  {
    id: subId(7004),
    type: "short_answer" as const,
    orderIndex: 3,
    questionText:
      "An author chooses to tell a story using first-person point of view instead of third-person omniscient. How does this choice affect what the reader knows and how the reader experiences the story? Give one advantage and one limitation of first-person narration.",
    points: 2,
    options: null,
    correctAnswer:
      "First-person narration limits the reader to knowing only what the narrator knows, thinks, and feels — the reader cannot see inside other characters' minds. An advantage is that it creates intimacy and makes the narrator feel real and relatable. A limitation is that the reader may get a biased or incomplete picture of events since they only see one perspective.",
  },
  {
    id: subId(7005),
    type: "selected_response" as const,
    orderIndex: 4,
    questionText:
      "Which statement BEST describes the difference between a symbol and a metaphor?",
    points: 1,
    options: JSON.stringify([
      { text: "A symbol uses 'like' or 'as' but a metaphor does not", isCorrect: false },
      { text: "A symbol is an object that represents a bigger idea throughout a text, while a metaphor is a direct comparison in a specific moment", isCorrect: true },
      { text: "A metaphor is always about nature, while a symbol can be about anything", isCorrect: false },
      { text: "There is no real difference — they mean the same thing", isCorrect: false },
    ]),
    correctAnswer:
      "A symbol is an object that represents a bigger idea throughout a text, while a metaphor is a direct comparison in a specific moment",
  },
];

const checkLit2Questions = [
  {
    id: subId(8001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "An author describes a sunset as 'the sky bleeding crimson and gold across the horizon.' What is the MOST likely purpose of this imagery?",
    points: 1,
    options: JSON.stringify([
      { text: "To give the reader scientific information about sunsets", isCorrect: false },
      { text: "To create a vivid, emotional visual that sets a dramatic or intense mood", isCorrect: true },
      { text: "To show that the main character is a painter", isCorrect: false },
      { text: "To indicate that the story takes place in the evening", isCorrect: false },
    ]),
    correctAnswer:
      "To create a vivid, emotional visual that sets a dramatic or intense mood",
  },
  {
    id: subId(8002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "A story is told from two alternating points of view — the hero and the villain. What effect does this structure MOST likely have on the reader?",
    points: 1,
    options: JSON.stringify([
      { text: "It confuses the reader and makes the story hard to follow", isCorrect: false },
      { text: "It allows the reader to understand both characters' motivations, creating empathy or tension", isCorrect: true },
      { text: "It proves that the hero is right and the villain is wrong", isCorrect: false },
      { text: "It makes the story shorter because each character tells half", isCorrect: false },
    ]),
    correctAnswer:
      "It allows the reader to understand both characters' motivations, creating empathy or tension",
  },
  {
    id: subId(8003),
    type: "short_answer" as const,
    orderIndex: 2,
    questionText:
      "Choose one literary element (symbolism, figurative language, or point of view) and explain how an author could use it to communicate the theme 'appearances can be deceiving.' Give a specific example.",
    points: 2,
    options: null,
    correctAnswer:
      "For symbolism: An author could use a beautiful but poisonous flower to symbolize something that looks attractive on the surface but is actually dangerous — representing the theme that appearances can be deceiving. For point of view: An author could use first-person narration from an unreliable narrator who describes themselves as honest and trustworthy, but whose actions reveal they are deceptive — the reader gradually realizes the narrator's self-description is misleading.",
  },
  {
    id: subId(8004),
    type: "selected_response" as const,
    orderIndex: 3,
    questionText:
      "The phrase 'She carried the weight of the world on her shoulders' is an example of...",
    points: 1,
    options: JSON.stringify([
      { text: "Personification", isCorrect: false },
      { text: "Simile", isCorrect: false },
      { text: "Hyperbole", isCorrect: true },
      { text: "Symbolism", isCorrect: false },
    ]),
    correctAnswer: "Hyperbole",
  },
];

const literaryActivities = [
  {
    id: subId(9001),
    sequenceOrder: 1,
    title: "Same Story, Different Eyes",
    description:
      "Hook activity: Students read two 1-paragraph retellings of the same fairy tale scene — one from the protagonist's point of view, one from the antagonist's. Without being told which is which, students discuss: How does each version make you feel? Whose side are you on? Why? Debrief reveals that the ONLY difference is point of view, establishing the concept that author choices shape reader experience.",
    durationMinutes: 25,
    materials:
      "Two POV paragraphs (printed), discussion guide, anchor chart for literary elements",
    buildsToward:
      "Analysis of Author's Craft — establishes that author choices directly shape meaning",
    associatedCheckId: null,
  },
  {
    id: subId(9002),
    sequenceOrder: 2,
    title: "The Literary Elements Toolkit",
    description:
      "Direct instruction and guided practice: Teacher introduces the five key literary elements (point of view, symbolism, figurative language, imagery, tone) with clear definitions and examples from familiar texts. Students create a 'toolkit' reference card with definitions and personal examples. Guided practice: identify elements in three short text excerpts, explaining not just WHAT the element is but WHY the author chose it.",
    durationMinutes: 40,
    materials:
      "Literary elements presentation, toolkit template cards, three text excerpts with annotations",
    buildsToward:
      "Identification of Literary Elements — builds vocabulary and recognition skills",
    associatedCheckId: null,
  },
  {
    id: subId(9003),
    sequenceOrder: 3,
    title: "Literary Elements Recognition Check",
    description:
      "Formative check: 5 questions assessing ability to identify literary elements and begin analyzing their effects on meaning.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_LIT_1_ID,
  },
  {
    id: subId(9004),
    sequenceOrder: 4,
    title: "Author's Craft Detective Work",
    description:
      "Close reading activity: Students work in groups of 3 on a shared short story. Each student 'owns' a different literary element lens (symbolism, figurative language, POV/tone). They annotate the text through their lens, then come together to discuss: How do all these elements work TOGETHER to create meaning? Groups create a visual 'craft map' showing how elements interconnect to develop theme.",
    durationMinutes: 40,
    materials:
      "Short story copies (annotatable), colored highlighters (one color per element), craft map poster paper, markers",
    buildsToward:
      "Analysis of Author's Craft — practice analyzing how elements work together",
    associatedCheckId: null,
  },
  {
    id: subId(9005),
    sequenceOrder: 5,
    title: "Author's Craft Analysis Check",
    description:
      "Formative check: 4 questions assessing ability to analyze author's purposeful use of literary elements and their effects on the reader.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_LIT_2_ID,
  },
  {
    id: subId(9006),
    sequenceOrder: 6,
    title: "Writing the Literary Analysis Essay",
    description:
      "Scaffolded writing: Students draft their literary analysis essay (performance task) with structured support. Teacher models analyzing one literary element with textual evidence in a think-aloud. Students use a planning template mapped to rubric criteria: (1) Thesis about author's craft, (2) Analysis of element 1 with textual evidence, (3) Analysis of element 2 with textual evidence, (4) How elements work together to shape meaning. Peer review focuses on strength of textual evidence.",
    durationMinutes: 45,
    materials:
      "Performance task prompt, planning template, peer review checklist, model analysis paragraph",
    buildsToward:
      "Written Expression — structured literary analysis with evidence",
    associatedCheckId: null,
  },
];

// ---------------------------------------------------------------------------
// UNIT 4 — The Water Cycle as a System (5th Science)
// ---------------------------------------------------------------------------

const waterCycleRubric = [
  {
    criterionName: "Systems Thinking",
    weight: 8,
    levels: [
      {
        score: 8,
        label: "Exemplary",
        description:
          "Explains the water cycle as a continuous, interconnected system; identifies solar energy as the driver; traces water through all major processes (evaporation, condensation, precipitation, collection) with accurate cause-and-effect reasoning.",
      },
      {
        score: 6,
        label: "Proficient",
        description:
          "Explains the water cycle as a system with most processes correctly identified; recognizes the role of energy in at least two state changes.",
      },
      {
        score: 4,
        label: "Developing",
        description:
          "Describes water cycle processes individually but does not clearly connect them as a system; may miss the role of energy.",
      },
      {
        score: 2,
        label: "Beginning",
        description:
          "Lists water cycle vocabulary but cannot explain how processes connect or what drives the cycle.",
      },
    ],
  },
  {
    criterionName: "State Changes & Energy",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Accurately explains all three state changes (solid ↔ liquid ↔ gas) in the context of the water cycle; correctly links energy gain/loss to each change with real-world examples.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Accurately explains at least two state changes with energy connections; provides some examples.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Can name state changes but does not clearly explain the role of energy in causing them.",
      },
      {
        score: 0,
        label: "Beginning",
        description:
          "Cannot explain how water changes state or confuses the direction of state changes.",
      },
    ],
  },
  {
    criterionName: "Real-World Connections",
    weight: 6,
    levels: [
      {
        score: 6,
        label: "Exemplary",
        description:
          "Makes multiple, specific connections between the water cycle and weather patterns, climate, and/or living organisms; explains how human activities can disrupt the water cycle.",
      },
      {
        score: 4,
        label: "Proficient",
        description:
          "Makes at least two connections between the water cycle and real-world phenomena (weather, climate, or organisms).",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Makes vague connections (e.g., 'rain comes from clouds') without explaining the water cycle processes involved.",
      },
      {
        score: 0,
        label: "Beginning",
        description:
          "No connections made between water cycle processes and real-world phenomena.",
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
          "Uses accurate scientific vocabulary (evaporation, condensation, precipitation, transpiration, groundwater, aquifer) throughout; diagrams are clear, labeled, and support written explanations.",
      },
      {
        score: 3,
        label: "Proficient",
        description:
          "Uses most scientific vocabulary correctly; diagrams are present and generally accurate.",
      },
      {
        score: 2,
        label: "Developing",
        description:
          "Some scientific vocabulary used but with errors; diagrams are incomplete or mislabeled.",
      },
      {
        score: 1,
        label: "Beginning",
        description:
          "No scientific vocabulary; no diagrams or diagrams do not relate to the water cycle.",
      },
    ],
  },
];

const checkWater1Questions = [
  {
    id: subId(10001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "What is the PRIMARY source of energy that drives the water cycle?",
    points: 1,
    options: JSON.stringify([
      { text: "Wind energy", isCorrect: false },
      { text: "The Moon's gravitational pull", isCorrect: false },
      { text: "Solar energy from the Sun", isCorrect: true },
      { text: "Heat from the Earth's core", isCorrect: false },
    ]),
    correctAnswer: "Solar energy from the Sun",
  },
  {
    id: subId(10002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "When water vapor in the atmosphere cools and turns into tiny water droplets that form clouds, this process is called...",
    points: 1,
    options: JSON.stringify([
      { text: "Evaporation", isCorrect: false },
      { text: "Precipitation", isCorrect: false },
      { text: "Condensation", isCorrect: true },
      { text: "Transpiration", isCorrect: false },
    ]),
    correctAnswer: "Condensation",
  },
  {
    id: subId(10003),
    type: "selected_response" as const,
    orderIndex: 2,
    questionText:
      "Which statement BEST explains why the water cycle is called a 'cycle'?",
    points: 1,
    options: JSON.stringify([
      { text: "Water is always being created and destroyed in the atmosphere", isCorrect: false },
      { text: "Water moves in only one direction — from the ocean to the sky", isCorrect: false },
      { text: "The same water continuously moves through different forms and locations in a repeating pattern", isCorrect: true },
      { text: "Rain always falls in the same places year after year", isCorrect: false },
    ]),
    correctAnswer:
      "The same water continuously moves through different forms and locations in a repeating pattern",
  },
  {
    id: subId(10004),
    type: "short_answer" as const,
    orderIndex: 3,
    questionText:
      "Explain what happens to a puddle of water on a hot, sunny day. Use at least two water cycle vocabulary words in your answer and describe the role of energy.",
    points: 2,
    options: null,
    correctAnswer:
      "On a hot, sunny day, solar energy heats the water in the puddle. This energy causes the liquid water to undergo evaporation — it changes from a liquid to water vapor (gas) and rises into the atmosphere. The puddle gets smaller and eventually disappears because all the water has evaporated. The water vapor may later undergo condensation when it reaches cooler air higher in the atmosphere, forming clouds.",
  },
  {
    id: subId(10005),
    type: "selected_response" as const,
    orderIndex: 4,
    questionText:
      "How do plants participate in the water cycle?",
    points: 1,
    options: JSON.stringify([
      { text: "Plants create new water through photosynthesis", isCorrect: false },
      { text: "Plants absorb water through their roots and release water vapor through their leaves (transpiration)", isCorrect: true },
      { text: "Plants trap rainwater and prevent it from entering the ground", isCorrect: false },
      { text: "Plants have no role in the water cycle", isCorrect: false },
    ]),
    correctAnswer:
      "Plants absorb water through their roots and release water vapor through their leaves (transpiration)",
  },
];

const checkWater2Questions = [
  {
    id: subId(11001),
    type: "selected_response" as const,
    orderIndex: 0,
    questionText:
      "A city paves over a large area of land with asphalt for a parking lot. How does this MOST likely affect the local water cycle?",
    points: 1,
    options: JSON.stringify([
      { text: "More water evaporates from the dark surface", isCorrect: false },
      { text: "Less water soaks into the ground, increasing surface runoff", isCorrect: true },
      { text: "More clouds form over the parking lot", isCorrect: false },
      { text: "The water cycle stops in that area completely", isCorrect: false },
    ]),
    correctAnswer:
      "Less water soaks into the ground, increasing surface runoff",
  },
  {
    id: subId(11002),
    type: "selected_response" as const,
    orderIndex: 1,
    questionText:
      "Which sequence correctly describes what happens to water that falls as rain on a mountain?",
    points: 1,
    options: JSON.stringify([
      { text: "Precipitation → condensation → evaporation → collection", isCorrect: false },
      { text: "Precipitation → runoff/infiltration → collection → evaporation", isCorrect: true },
      { text: "Evaporation → precipitation → condensation → collection", isCorrect: false },
      { text: "Collection → precipitation → runoff → condensation", isCorrect: false },
    ]),
    correctAnswer:
      "Precipitation → runoff/infiltration → collection → evaporation",
  },
  {
    id: subId(11003),
    type: "short_answer" as const,
    orderIndex: 2,
    questionText:
      "A farmer notices that a nearby lake is getting smaller during a drought. Using your understanding of the water cycle as a system, explain at least two reasons why the lake might be shrinking.",
    points: 2,
    options: null,
    correctAnswer:
      "During a drought, there is less precipitation falling into the lake and its tributaries, so less water enters the lake. At the same time, evaporation continues (and may increase with higher temperatures), removing water from the lake surface. Additionally, less groundwater may be flowing into the lake because the water table drops during drought. Farmers may also be pumping more water from the lake or nearby wells for irrigation, further reducing the water level.",
  },
  {
    id: subId(11004),
    type: "selected_response" as const,
    orderIndex: 3,
    questionText:
      "Why does water that evaporates from the ocean fall as fresh water (rain) rather than salt water?",
    points: 1,
    options: JSON.stringify([
      { text: "The Sun's rays break down the salt molecules into harmless gas", isCorrect: false },
      { text: "When water evaporates, only the water molecules become gas — the dissolved salt is left behind", isCorrect: true },
      { text: "Clouds filter out the salt as water passes through them", isCorrect: false },
      { text: "Wind blows the salt away from the water droplets before they form clouds", isCorrect: false },
    ]),
    correctAnswer:
      "When water evaporates, only the water molecules become gas — the dissolved salt is left behind",
  },
];

const waterCycleActivities = [
  {
    id: subId(12001),
    sequenceOrder: 1,
    title: "Where Does Your Water Come From?",
    description:
      "Hook activity: Students trace a glass of water backward — where did this specific water come from before the faucet? Before the treatment plant? Before the reservoir? Before the rain? Students quickly discover they can trace water back through an endless loop. Teacher introduces the concept: the water you drink today may have been drunk by a dinosaur. This establishes the 'cycle' and 'system' concepts.",
    durationMinutes: 20,
    materials:
      "Glass of water, water source tracing worksheet, local watershed map",
    buildsToward:
      "Systems Thinking — establishes the concept of a continuous cycle",
    associatedCheckId: null,
  },
  {
    id: subId(12002),
    sequenceOrder: 2,
    title: "Water Cycle in a Bag",
    description:
      "Hands-on experiment: Students create a miniature water cycle using a sealed plastic bag taped to a sunny window. Bags contain a small amount of blue-dyed water. Over 30 minutes, students observe and sketch evaporation (water level drops), condensation (droplets form at the top), and precipitation (droplets run back down). Students label their observations with vocabulary and identify where energy enters the system.",
    durationMinutes: 40,
    materials:
      "Gallon ziplock bags, blue food coloring, tape, water, observation sketch sheet, vocabulary word bank",
    buildsToward:
      "State Changes & Energy — observe state changes and connect to energy",
    associatedCheckId: null,
  },
  {
    id: subId(12003),
    sequenceOrder: 3,
    title: "Water Cycle Foundations Check",
    description:
      "Formative check: 5 questions assessing understanding of water cycle processes, vocabulary, energy's role, and the cycle concept.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_WATER_1_ID,
  },
  {
    id: subId(12004),
    sequenceOrder: 4,
    title: "Water Cycle Relay Stations",
    description:
      "Kinesthetic learning stations: Students rotate through 4 stations (10 min each). Station 1: Evaporation & Transpiration (heat lamp + wet sponge + plant). Station 2: Condensation (cold can + humid air observation). Station 3: Precipitation types (simulate rain, snow, sleet with different materials). Station 4: Collection & Groundwater (sand/gravel model showing infiltration vs. runoff). At each station, students record observations and answer a guiding question.",
    durationMinutes: 45,
    materials:
      "Station materials (heat lamp, sponge, plant, cold metal can, spray bottles, sand/gravel model, water), station instruction cards, recording sheets",
    buildsToward:
      "State Changes & Energy — hands-on experience with each process",
    associatedCheckId: null,
  },
  {
    id: subId(12005),
    sequenceOrder: 5,
    title: "Water Cycle Connections Check",
    description:
      "Formative check: 4 questions assessing ability to connect water cycle processes to real-world phenomena and human impacts.",
    durationMinutes: 10,
    materials: "Student devices or printed check",
    buildsToward: "Formative assessment checkpoint",
    associatedCheckId: CHECK_WATER_2_ID,
  },
  {
    id: subId(12006),
    sequenceOrder: 6,
    title: "My Community's Water Story",
    description:
      "Performance task preparation: Students begin creating their water cycle poster and presentation (performance task). Each poster must include: a labeled diagram of the water cycle showing all major processes, an explanation of how solar energy drives the system, and a 'My Community Connection' section showing how the water cycle affects their local area (weather, water supply, floods, droughts). Teacher models the diagram portion and students draft with peer feedback.",
    durationMinutes: 40,
    materials:
      "Large poster paper, colored pencils/markers, local weather data, rubric self-check sheet, diagram example",
    buildsToward:
      "Scientific Communication — accurate diagrams and real-world connections",
    associatedCheckId: null,
  },
];

// ============================================================================
// Main seed function
// ============================================================================

async function seed() {
  console.log("=== Backward Builder Seed Script ===\n");

  // -----------------------------------------------------------------------
  // Step 0: Clean up existing demo data
  // -----------------------------------------------------------------------
  console.log("1. Cleaning existing demo data...");

  // Delete unit_shares first (references both units and teachers)
  await sql`
    DELETE FROM unit_shares
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
    OR teacher_id IN (
      SELECT id FROM teachers WHERE is_demo = true
    )
  `;

  // Delete in reverse dependency order
  await sql`
    DELETE FROM student_answers
    WHERE submission_id IN (
      SELECT ss.id FROM student_submissions ss
      JOIN units u ON ss.unit_id = u.id
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM student_submissions
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM check_questions
    WHERE check_id IN (
      SELECT c.id FROM checks_for_understanding c
      JOIN units u ON c.unit_id = u.id
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM learning_activities
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM checks_for_understanding
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM performance_tasks
    WHERE unit_id IN (
      SELECT u.id FROM units u
      JOIN teachers t ON u.teacher_id = t.id
      WHERE t.is_demo = true
    )
  `;

  await sql`
    DELETE FROM units
    WHERE teacher_id IN (
      SELECT id FROM teachers WHERE is_demo = true
    )
  `;

  await sql`DELETE FROM teachers WHERE is_demo = true`;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 1: Create demo teachers
  // -----------------------------------------------------------------------
  console.log("2. Creating demo teachers...");

  await sql`
    INSERT INTO teachers (id, session_id, email, display_name, grade_level, subject, state, standards_framework, is_demo)
    VALUES (
      ${TEACHER_JONES_ID},
      'demo-ms-jones',
      'jones@demo.backwardbuilder.com',
      'Ms. Jones',
      '7th',
      'Science',
      'Missouri',
      'NGSS',
      true
    )
  `;

  await sql`
    INSERT INTO teachers (id, session_id, email, display_name, grade_level, subject, state, standards_framework, is_demo)
    VALUES (
      ${TEACHER_RODRIGUEZ_ID},
      'demo-mr-rodriguez',
      'rodriguez@demo.backwardbuilder.com',
      'Mr. Rodriguez',
      '7th',
      'ELA',
      'Missouri',
      'Missouri Learning Standards',
      true
    )
  `;

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 2: UNIT 1 — Causes of the American Revolution (8th History)
  // -----------------------------------------------------------------------
  console.log("3. Creating Unit 1: Causes of the American Revolution...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_REVOLUTION_ID},
      ${TEACHER_JONES_ID},
      'Causes of the American Revolution',
      'The American Revolution was caused by escalating economic, political, and ideological tensions between the colonies and Britain, not a single event.',
      ${JSON.stringify([
        "Why do people decide that revolution is the only option?",
        "How did economic policies create political resistance?",
        "Was the American Revolution inevitable, or could it have been prevented?",
      ])}::jsonb,
      ${JSON.stringify(["6-8.GS.AH.E.6", "6-8.GS.AH.E.7"])}::jsonb,
      ${JSON.stringify([
        "Explain the political, economic, and philosophical foundations of the American government, including the ideas expressed in the founding documents.",
        "Analyze the causes, major events, and outcomes of the American Revolution.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://dese.mo.gov/media/pdf/curr-mls-socialstudies-sboe-2024",
        "https://dese.mo.gov/media/pdf/curr-mls-socialstudies-sboe-2024",
      ])}::jsonb,
      'analyze',
      'Students must analyze the interplay between multiple categories of causes (economic, political, ideological) and evaluate their relative significance — not just memorize a timeline of events.',
      'complete',
      true
    )
  `;

  // Performance Task
  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, share_code, status, is_selected)
    VALUES (
      ${PT_REVOLUTION_ID},
      ${UNIT_REVOLUTION_ID},
      'The Colonial Editor',
      'Students write a persuasive editorial from the perspective of a colonial newspaper editor in 1774, arguing whether the colonies should pursue independence.',
      'It is October 1774, one month after the First Continental Congress. You are the editor of the Pennsylvania Gazette, one of the most widely read newspapers in the colonies. Tensions are high: the Intolerable Acts have shut down Boston''s port, British troops occupy the city, and delegates from 12 colonies have just met in Philadelphia to discuss a unified response. Your readers are divided — some want reconciliation with Britain, others demand independence. Write a 1-page editorial that: (1) identifies at least three specific grievances (economic, political, and ideological) that have brought the colonies to this point, (2) analyzes how these grievances are connected to each other (not isolated events), and (3) takes a clear position on what the colonies should do next, supported by historical evidence.',
      ${JSON.stringify(revolutionRubric)}::jsonb,
      ${JSON.stringify(["6-8.GS.AH.E.6", "6-8.GS.AH.E.7"])}::jsonb,
      'analyze',
      50,
      'revolut',
      'live',
      true
    )
  `;

  // Checks
  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_REV_1_ID},
      ${UNIT_REVOLUTION_ID},
      'Taxation and Representation Check',
      'Use after the cause-mapping activity to assess understanding of key events and their connections before the debate.',
      'revck1',
      'live',
      6
    )
  `;

  for (const q of checkRev1Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_REV_1_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options}::jsonb, ${q.correctAnswer})
    `;
  }

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_REV_2_ID},
      ${UNIT_REVOLUTION_ID},
      'Primary Source Analysis Check',
      'Use after the debate activity to assess source analysis skills before students begin their editorial.',
      'revck2',
      'live',
      5
    )
  `;

  for (const q of checkRev2Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_REV_2_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options ? q.options : null}::jsonb, ${q.correctAnswer})
    `;
  }

  // Learning Activities
  for (const a of revolutionActivities) {
    await sql`
      INSERT INTO learning_activities (id, unit_id, sequence_order, title, description, duration_minutes, materials, builds_toward, associated_check_id)
      VALUES (${a.id}, ${UNIT_REVOLUTION_ID}, ${a.sequenceOrder}, ${a.title}, ${a.description}, ${a.durationMinutes}, ${a.materials}, ${a.buildsToward}, ${a.associatedCheckId})
    `;
  }

  // Student submissions for Revolution Check 1
  const revQuestionIds = checkRev1Questions.map((q) => q.id);
  for (let i = 0; i < revolutionStudents.length; i++) {
    const student = revolutionStudents[i];
    const submissionId = subId(50000 + i);

    await sql`
      INSERT INTO student_submissions (id, unit_id, assessment_type, assessment_id, student_name, class_period, total_score, max_score)
      VALUES (${submissionId}, ${UNIT_REVOLUTION_ID}, 'check', ${CHECK_REV_1_ID}, ${student.name}, ${student.period}, ${student.totalScore}, 6)
    `;

    for (let j = 0; j < student.answers.length; j++) {
      const ans = student.answers[j];
      const answerId = subId(60000 + i * 10 + j);
      await sql`
        INSERT INTO student_answers (id, submission_id, question_id, answer, is_correct, score)
        VALUES (${answerId}, ${submissionId}, ${revQuestionIds[j]}, ${ans.answer}, ${ans.isCorrect}, ${ans.score})
      `;
    }
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 3: UNIT 2 — Fractions in Everyday Life (5th Math)
  // -----------------------------------------------------------------------
  console.log("4. Creating Unit 2: Fractions in Everyday Life...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_FRACTIONS_ID},
      ${TEACHER_JONES_ID},
      'Fractions in Everyday Life',
      'Students will understand that fractions represent parts of a whole and can be applied to real-world situations like cooking, measurement, and sharing equally.',
      ${JSON.stringify([
        "How do fractions help us solve everyday problems?",
        "Why do we need fractions when we already have whole numbers?",
        "How can we tell if two fractions represent the same amount?",
      ])}::jsonb,
      ${JSON.stringify(["5.NSF.A.1", "5.NSF.A.2"])}::jsonb,
      ${JSON.stringify([
        "Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions.",
        "Solve word problems involving addition and subtraction of fractions referring to the same whole.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://dese.mo.gov/media/pdf/curr-mls-math-sboe-2023",
        "https://dese.mo.gov/media/pdf/curr-mls-math-sboe-2023",
      ])}::jsonb,
      'apply',
      'Students must apply fraction operations to real-world contexts — not just compute in isolation, but reason about when and why fraction operations are needed in daily life.',
      'complete',
      true
    )
  `;

  // Performance Task
  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, share_code, status, is_selected)
    VALUES (
      ${PT_FRACTIONS_ID},
      ${UNIT_FRACTIONS_ID},
      'Fractions in My Life Book',
      'Students create an illustrated book showing at least five real-world situations where fractions are used, with computations and visual models.',
      'You are creating a book called "Fractions in My Life" to teach younger students about fractions. Your book must have at least 5 pages, and each page must include: (1) a real-world scenario from YOUR life where fractions are used (cooking, sports, music, sharing, measuring, etc.), (2) a clear visual model (number line, area model, or diagram) showing the fractions involved, (3) the correct mathematical computation, and (4) an explanation in your own words of why fractions are needed in this situation. Your book should include at least one page with adding fractions, one with subtracting fractions, and one with multiplying a fraction by a whole number.',
      ${JSON.stringify(fractionsRubric)}::jsonb,
      ${JSON.stringify(["5.NSF.A.1", "5.NSF.A.2"])}::jsonb,
      'apply',
      40,
      'fracbk',
      'live',
      true
    )
  `;

  // Checks
  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_FRAC_1_ID},
      ${UNIT_FRACTIONS_ID},
      'Fraction Foundations Check',
      'Use after the number line walk to assess understanding of fraction concepts, equivalence, and basic operations before the recipe challenge.',
      'frck1',
      'live',
      6
    )
  `;

  for (const q of checkFrac1Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_FRAC_1_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options}::jsonb, ${q.correctAnswer})
    `;
  }

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_FRAC_2_ID},
      ${UNIT_FRACTIONS_ID},
      'Fraction Operations Check',
      'Use after the recipe challenge to assess readiness for the performance task.',
      'frck2',
      'live',
      5
    )
  `;

  for (const q of checkFrac2Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_FRAC_2_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options ? q.options : null}::jsonb, ${q.correctAnswer})
    `;
  }

  // Learning Activities
  for (const a of fractionsActivities) {
    await sql`
      INSERT INTO learning_activities (id, unit_id, sequence_order, title, description, duration_minutes, materials, builds_toward, associated_check_id)
      VALUES (${a.id}, ${UNIT_FRACTIONS_ID}, ${a.sequenceOrder}, ${a.title}, ${a.description}, ${a.durationMinutes}, ${a.materials}, ${a.buildsToward}, ${a.associatedCheckId})
    `;
  }

  // Student submissions for Fractions Check 1
  const fracQuestionIds = checkFrac1Questions.map((q) => q.id);
  for (let i = 0; i < fractionStudents.length; i++) {
    const student = fractionStudents[i];
    const submissionId = subId(51000 + i);

    await sql`
      INSERT INTO student_submissions (id, unit_id, assessment_type, assessment_id, student_name, class_period, total_score, max_score)
      VALUES (${submissionId}, ${UNIT_FRACTIONS_ID}, 'check', ${CHECK_FRAC_1_ID}, ${student.name}, ${student.period}, ${student.totalScore}, 6)
    `;

    for (let j = 0; j < student.answers.length; j++) {
      const ans = student.answers[j];
      const answerId = subId(61000 + i * 10 + j);
      await sql`
        INSERT INTO student_answers (id, submission_id, question_id, answer, is_correct, score)
        VALUES (${answerId}, ${submissionId}, ${fracQuestionIds[j]}, ${ans.answer}, ${ans.isCorrect}, ${ans.score})
      `;
    }
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 4: UNIT 3 — Literary Elements (7th ELA) — owned by Mr. Rodriguez, shared with Ms. Jones
  // -----------------------------------------------------------------------
  console.log("5. Creating Unit 3: How Authors Craft Meaning Through Literary Elements...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_LITERARY_ID},
      ${TEACHER_RODRIGUEZ_ID},
      'How Authors Craft Meaning Through Literary Elements',
      'Students will understand that authors deliberately choose literary elements — including point of view, symbolism, and figurative language — to shape meaning and influence how readers experience a text.',
      ${JSON.stringify([
        "How do authors use literary elements to control what readers think and feel?",
        "Why does it matter HOW a story is told, not just WHAT happens?",
        "How do literary elements work together to create a text's overall meaning?",
      ])}::jsonb,
      ${JSON.stringify(["7.R.1.A.f", "7.R.1.A.g"])}::jsonb,
      ${JSON.stringify([
        "Analyze how an author develops and contrasts the points of view of different characters or narrators in a text.",
        "Analyze how an author uses figurative language, word relationships, and nuances in word meanings.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://dese.mo.gov/media/pdf/curr-mls-ela-sboe-2023",
        "https://dese.mo.gov/media/pdf/curr-mls-ela-sboe-2023",
      ])}::jsonb,
      'analyze',
      'Students must analyze the PURPOSE behind an author''s literary choices — not just identify elements, but explain how and why they shape meaning and reader experience.',
      'complete',
      false
    )
  `;

  // Create the unit share — Mr. Rodriguez shares with Ms. Jones
  await sql`
    INSERT INTO unit_shares (id, unit_id, teacher_id, share_code)
    VALUES (
      ${UNIT_SHARE_LIT_ID},
      ${UNIT_LITERARY_ID},
      ${TEACHER_JONES_ID},
      'litshare'
    )
  `;

  // Performance Task
  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, share_code, status, is_selected)
    VALUES (
      ${PT_LITERARY_ID},
      ${UNIT_LITERARY_ID},
      'The Author''s Craft Analysis',
      'Students write a literary analysis essay examining how an author uses at least two literary elements to develop theme in a chosen short story.',
      'You are a literary critic writing for your school''s book review magazine. Your editor has asked you to write a 2-3 paragraph analysis of a short story your class has read, focusing on the CRAFT of the writing — not just what happens in the story, but HOW the author tells it. Your analysis must: (1) identify at least two literary elements the author uses (choose from: point of view, symbolism, figurative language, imagery, tone), (2) explain with specific quotes from the text how each element shapes the reader''s experience or understanding, and (3) analyze how these elements work together to develop the story''s theme or central message.',
      ${JSON.stringify(literaryRubric)}::jsonb,
      ${JSON.stringify(["7.R.1.A.f", "7.R.1.A.g"])}::jsonb,
      'analyze',
      45,
      'litcraf',
      'live',
      true
    )
  `;

  // Checks
  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_LIT_1_ID},
      ${UNIT_LITERARY_ID},
      'Literary Elements Recognition Check',
      'Use after the literary elements toolkit activity to assess identification and basic analysis skills.',
      'litck1',
      'live',
      6
    )
  `;

  for (const q of checkLit1Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_LIT_1_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options}::jsonb, ${q.correctAnswer})
    `;
  }

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_LIT_2_ID},
      ${UNIT_LITERARY_ID},
      'Author''s Craft Analysis Check',
      'Use after the detective work activity to assess readiness for the analysis essay.',
      'litck2',
      'live',
      5
    )
  `;

  for (const q of checkLit2Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_LIT_2_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options ? q.options : null}::jsonb, ${q.correctAnswer})
    `;
  }

  // Learning Activities
  for (const a of literaryActivities) {
    await sql`
      INSERT INTO learning_activities (id, unit_id, sequence_order, title, description, duration_minutes, materials, builds_toward, associated_check_id)
      VALUES (${a.id}, ${UNIT_LITERARY_ID}, ${a.sequenceOrder}, ${a.title}, ${a.description}, ${a.durationMinutes}, ${a.materials}, ${a.buildsToward}, ${a.associatedCheckId})
    `;
  }

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Step 5: UNIT 4 — The Water Cycle as a System (5th Science) — stage3 status
  // -----------------------------------------------------------------------
  console.log("6. Creating Unit 4: The Water Cycle as a System (stage3 — ready to deploy)...");

  await sql`
    INSERT INTO units (id, teacher_id, title, enduring_understanding, essential_questions, standard_codes, standard_descriptions, standard_urls, cognitive_level, cognitive_level_explanation, status, is_public)
    VALUES (
      ${UNIT_WATER_ID},
      ${TEACHER_JONES_ID},
      'The Water Cycle as a System',
      'Students will understand that the water cycle is a continuous system driven by solar energy, where water changes state and moves between Earth''s surface and atmosphere, impacting weather, climate, and living organisms.',
      ${JSON.stringify([
        "What keeps the water cycle going, and what would happen if it stopped?",
        "How does the same water end up in so many different places?",
        "How does the water cycle connect to weather, climate, and life on Earth?",
      ])}::jsonb,
      ${JSON.stringify(["5.PS1.A.1", "5.ESS2.A.1"])}::jsonb,
      ${JSON.stringify([
        "Develop a model to describe that matter is made of particles too small to be seen, and can change state (solid, liquid, gas).",
        "Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact.",
      ])}::jsonb,
      ${JSON.stringify([
        "https://dese.mo.gov/media/pdf/curr-mls-science-sboe-2023",
        "https://dese.mo.gov/media/pdf/curr-mls-science-sboe-2023",
      ])}::jsonb,
      'understand',
      'Students must understand the water cycle as an interconnected system — not just memorize vocabulary, but explain how processes connect, how energy drives state changes, and how the cycle impacts the real world.',
      'stage3',
      false
    )
  `;

  // Performance Task (draft — not live since unit is stage3)
  await sql`
    INSERT INTO performance_tasks (id, unit_id, title, description, scenario, rubric, standard_codes, cognitive_level, estimated_time_minutes, status, is_selected)
    VALUES (
      ${PT_WATER_ID},
      ${UNIT_WATER_ID},
      'My Community''s Water Story',
      'Students create an illustrated poster and short presentation explaining how the water cycle works as a system and connecting it to their local community.',
      'You are a water scientist who has been invited to speak at your school''s Science Night. Your job is to create a poster and short presentation (2-3 minutes) that explains the water cycle to families in your community. Your poster must include: (1) a detailed, labeled diagram of the water cycle showing all major processes (evaporation, condensation, precipitation, collection, transpiration, infiltration), (2) arrows showing how solar energy drives the system, (3) an explanation of at least two state changes and the role of energy in each, and (4) a "My Community Connection" section that explains at least two ways the water cycle directly affects your local area (weather patterns, water supply, flooding, drought, etc.).',
      ${JSON.stringify(waterCycleRubric)}::jsonb,
      ${JSON.stringify(["5.PS1.A.1", "5.ESS2.A.1"])}::jsonb,
      'understand',
      40,
      'draft',
      true
    )
  `;

  // Checks (draft — not live since unit is stage3)
  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_WATER_1_ID},
      ${UNIT_WATER_ID},
      'Water Cycle Foundations Check',
      'Use after the water cycle in a bag experiment to assess understanding of basic processes and vocabulary.',
      'wtrck1',
      'draft',
      6
    )
  `;

  for (const q of checkWater1Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_WATER_1_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options}::jsonb, ${q.correctAnswer})
    `;
  }

  await sql`
    INSERT INTO checks_for_understanding (id, unit_id, title, placement_note, share_code, status, total_points)
    VALUES (
      ${CHECK_WATER_2_ID},
      ${UNIT_WATER_ID},
      'Water Cycle Connections Check',
      'Use after the relay stations to assess ability to connect water cycle processes to real-world phenomena.',
      'wtrck2',
      'draft',
      5
    )
  `;

  for (const q of checkWater2Questions) {
    await sql`
      INSERT INTO check_questions (id, check_id, type, order_index, question_text, points, options, correct_answer)
      VALUES (${q.id}, ${CHECK_WATER_2_ID}, ${q.type}, ${q.orderIndex}, ${q.questionText}, ${q.points}, ${q.options ? q.options : null}::jsonb, ${q.correctAnswer})
    `;
  }

  // Learning Activities
  for (const a of waterCycleActivities) {
    await sql`
      INSERT INTO learning_activities (id, unit_id, sequence_order, title, description, duration_minutes, materials, builds_toward, associated_check_id)
      VALUES (${a.id}, ${UNIT_WATER_ID}, ${a.sequenceOrder}, ${a.title}, ${a.description}, ${a.durationMinutes}, ${a.materials}, ${a.buildsToward}, ${a.associatedCheckId})
    `;
  }

  // No student submissions for Unit 4 (not live yet)

  console.log("   Done.\n");

  // -----------------------------------------------------------------------
  // Summary
  // -----------------------------------------------------------------------
  console.log("=== Seed Complete ===\n");
  console.log("Created:");
  console.log("  - 2 demo teachers (Ms. Jones + Mr. Rodriguez)");
  console.log("  - 4 units:");
  console.log("    1. Causes of the American Revolution (8th History, complete, public)");
  console.log("    2. Fractions in Everyday Life (5th Math, complete, public)");
  console.log("    3. How Authors Craft Meaning Through Literary Elements (7th ELA, complete, shared)");
  console.log("    4. The Water Cycle as a System (5th Science, stage3, private)");
  console.log("  - 4 performance tasks (3 live + 1 draft)");
  console.log("  - 8 checks for understanding (6 live + 2 draft, 36 questions total)");
  console.log("  - 24 learning activities");
  console.log("  - 19 student submissions (15 revolution + 4 fractions)");
  console.log("  - 1 unit share (Literary unit → Ms. Jones)");
  console.log("\nDemo logins:");
  console.log("  Ms. Jones:      session_id = 'demo-ms-jones'");
  console.log("  Mr. Rodriguez:  session_id = 'demo-mr-rodriguez'");
  console.log("\nShare codes: revolut, revck1, revck2, fracbk, frck1, frck2, litcraf, litck1, litck2, wtrck1, wtrck2, litshare");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
