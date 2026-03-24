/**
 * Common Core State Standards — ELA (English Language Arts) Grades 5-8
 *
 * Source: https://www.thecorestandards.org/ELA-Literacy/
 * Fetched: March 2026
 * Coverage: Key strands for grades 5-8 (RL, RI, W, RH, RST)
 *
 * URL pattern: https://www.thecorestandards.org/ELA-Literacy/{strand}/{grade}/{number}/
 *
 * These are the EXACT codes and descriptions from the official CCSS site.
 * DO NOT edit descriptions without re-verifying against the source.
 */

import type { StandardsFramework, VerifiedStandard } from "../types";

function s(code: string, description: string): VerifiedStandard {
  // Derive URL from code: CCSS.ELA-LITERACY.RH.6-8.2 → /ELA-Literacy/RH/6-8/2/
  const path = code.replace(/^CCSS\.ELA-LITERACY\./i, "").replace(/\./g, "/");
  return {
    code,
    description,
    url: `https://www.thecorestandards.org/ELA-Literacy/${path}/`,
  };
}

const standards: VerifiedStandard[] = [
  // ===== Reading: Literature (RL) — Grade 6 =====
  s("CCSS.ELA-LITERACY.RL.6.1", "Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RL.6.2", "Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments."),
  s("CCSS.ELA-LITERACY.RL.6.3", "Describe how a particular story's or drama's plot unfolds in a series of episodes as well as how the characters respond or change as the plot moves toward a resolution."),
  s("CCSS.ELA-LITERACY.RL.6.4", "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of a specific word choice on meaning and tone."),
  s("CCSS.ELA-LITERACY.RL.6.5", "Analyze how a particular sentence, chapter, scene, or stanza fits into the overall structure of a text and contributes to the development of the theme, setting, or plot."),
  s("CCSS.ELA-LITERACY.RL.6.6", "Explain how an author develops the point of view of the narrator or speaker in a text."),

  // ===== Reading: Literature (RL) — Grade 7 =====
  s("CCSS.ELA-LITERACY.RL.7.1", "Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RL.7.2", "Determine a theme or central idea of a text and analyze its development over the course of the text; provide an objective summary of the text."),
  s("CCSS.ELA-LITERACY.RL.7.3", "Analyze how particular elements of a story or drama interact (e.g., how setting shapes the characters or plot)."),
  s("CCSS.ELA-LITERACY.RL.7.4", "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of rhymes and other repetitions of sounds on a specific verse or stanza of a poem or section of a story or drama."),
  s("CCSS.ELA-LITERACY.RL.7.6", "Analyze how an author develops and contrasts the points of view of different characters or narrators in a text."),

  // ===== Reading: Literature (RL) — Grade 8 =====
  s("CCSS.ELA-LITERACY.RL.8.1", "Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RL.8.2", "Determine a theme or central idea of a text and analyze its development over the course of the text, including its relationship to the characters, setting, and plot; provide an objective summary of the text."),
  s("CCSS.ELA-LITERACY.RL.8.3", "Analyze how particular lines of dialogue or incidents in a story or drama propel the action, reveal aspects of a character, or provoke a decision."),
  s("CCSS.ELA-LITERACY.RL.8.4", "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of specific word choices on meaning and tone, including analogies or allusions to other texts."),
  s("CCSS.ELA-LITERACY.RL.8.6", "Analyze how differences in the points of view of the characters and the audience or reader create such effects as suspense or humor."),

  // ===== Reading: Informational Text (RI) — Grade 6 =====
  s("CCSS.ELA-LITERACY.RI.6.1", "Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RI.6.2", "Determine a central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments."),
  s("CCSS.ELA-LITERACY.RI.6.4", "Determine the meaning of words and phrases as they are used in a text, including figurative, connotative, and technical meanings."),
  s("CCSS.ELA-LITERACY.RI.6.7", "Integrate information presented in different media or formats (e.g., visually, quantitatively) as well as in words to develop a coherent understanding of a topic or issue."),
  s("CCSS.ELA-LITERACY.RI.6.8", "Trace and evaluate the argument and specific claims in a text, distinguishing claims that are supported by reasons and evidence from claims that are not."),

  // ===== Reading: Informational Text (RI) — Grade 7 =====
  s("CCSS.ELA-LITERACY.RI.7.1", "Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RI.7.2", "Determine two or more central ideas in a text and analyze their development over the course of the text; provide an objective summary of the text."),
  s("CCSS.ELA-LITERACY.RI.7.8", "Trace and evaluate the argument and specific claims in a text, assessing whether the reasoning is sound and the evidence is relevant and sufficient to support the claims."),

  // ===== Reading: Informational Text (RI) — Grade 8 =====
  s("CCSS.ELA-LITERACY.RI.8.1", "Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text."),
  s("CCSS.ELA-LITERACY.RI.8.2", "Determine a central idea of a text and analyze its development over the course of the text, including its relationship to supporting ideas; provide an objective summary of the text."),
  s("CCSS.ELA-LITERACY.RI.8.6", "Determine an author's point of view or purpose in a text and analyze how the author acknowledges and responds to conflicting evidence or viewpoints."),
  s("CCSS.ELA-LITERACY.RI.8.8", "Delineate and evaluate the argument and specific claims in a text, assessing whether the reasoning is sound and the evidence is relevant and sufficient; recognize when irrelevant evidence is introduced."),

  // ===== Writing (W) — Grade 6 =====
  s("CCSS.ELA-LITERACY.W.6.1", "Write arguments to support claims with clear reasons and relevant evidence."),
  s("CCSS.ELA-LITERACY.W.6.2", "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content."),
  s("CCSS.ELA-LITERACY.W.6.3", "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences."),

  // ===== Writing (W) — Grade 7 =====
  s("CCSS.ELA-LITERACY.W.7.1", "Write arguments to support claims with clear reasons and relevant evidence."),
  s("CCSS.ELA-LITERACY.W.7.2", "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content."),
  s("CCSS.ELA-LITERACY.W.7.3", "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences."),

  // ===== Writing (W) — Grade 8 =====
  s("CCSS.ELA-LITERACY.W.8.1", "Write arguments to support claims with clear reasons and relevant evidence."),
  s("CCSS.ELA-LITERACY.W.8.2", "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content."),
  s("CCSS.ELA-LITERACY.W.8.3", "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences."),

  // ===== Reading: History/Social Studies (RH) — Grades 6-8 =====
  s("CCSS.ELA-LITERACY.RH.6-8.1", "Cite specific textual evidence to support analysis of primary and secondary sources."),
  s("CCSS.ELA-LITERACY.RH.6-8.2", "Determine the central ideas or information of a primary or secondary source; provide an accurate summary of the source distinct from prior knowledge or opinions."),
  s("CCSS.ELA-LITERACY.RH.6-8.3", "Identify key steps in a text's description of a process related to history/social studies (e.g., how a bill becomes law, how interest rates are raised or lowered)."),
  s("CCSS.ELA-LITERACY.RH.6-8.4", "Determine the meaning of words and phrases as they are used in a text, including vocabulary specific to domains related to history/social studies."),
  s("CCSS.ELA-LITERACY.RH.6-8.5", "Describe how a text presents information (e.g., sequentially, comparatively, causally)."),
  s("CCSS.ELA-LITERACY.RH.6-8.6", "Identify aspects of a text that reveal an author's point of view or purpose (e.g., loaded language, inclusion or avoidance of particular facts)."),
  s("CCSS.ELA-LITERACY.RH.6-8.7", "Integrate visual information (e.g., in charts, graphs, photographs, videos, or maps) with other information in print and digital texts."),
  s("CCSS.ELA-LITERACY.RH.6-8.8", "Distinguish among fact, opinion, and reasoned judgment in a text."),
  s("CCSS.ELA-LITERACY.RH.6-8.9", "Analyze the relationship between a primary and secondary source on the same topic."),

  // ===== Reading: Science/Technical (RST) — Grades 6-8 =====
  s("CCSS.ELA-LITERACY.RST.6-8.1", "Cite specific textual evidence to support analysis of science and technical texts."),
  s("CCSS.ELA-LITERACY.RST.6-8.2", "Determine the central ideas or conclusions of a text; provide an accurate summary of the text distinct from prior knowledge or opinions."),
  s("CCSS.ELA-LITERACY.RST.6-8.3", "Follow precisely a multistep procedure when carrying out experiments, taking measurements, or performing technical tasks."),
  s("CCSS.ELA-LITERACY.RST.6-8.7", "Integrate quantitative or technical information expressed in words in a text with a version of that information expressed visually (e.g., in a flowchart, diagram, model, graph, or table)."),
  s("CCSS.ELA-LITERACY.RST.6-8.9", "Compare and contrast the information gained from experiments, simulations, video, or multimedia sources with that gained from reading a text on the same topic."),
];

export const CCSS_ELA_STANDARDS: StandardsFramework = {
  id: "CCSS-ELA",
  name: "Common Core State Standards — English Language Arts",
  subjects: ["ELA", "Language Arts", "English", "Social Studies", "History"],
  grades: ["5", "6", "7", "8"],
  standards: Object.fromEntries(standards.map((s) => [s.code, s])),
};
