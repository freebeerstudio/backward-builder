/**
 * Verified Common Core State Standards (CCSS) for ELA - Grades 5-8
 *
 * Sources:
 * - https://www.thecorestandards.org/ELA-Literacy/
 * - https://learning.ccsso.org/wp-content/uploads/2022/11/ELA_Standards1.pdf
 *
 * Strands included:
 * - RL (Reading: Literature) — Grades 5, 6, 7, 8
 * - RI (Reading: Informational Text) — Grades 5, 6, 7, 8
 * - W  (Writing) — Grades 5, 6, 7, 8
 * - RH (Reading: History/Social Studies) — Grades 6-8
 * - RST (Reading: Science & Technical Subjects) — Grades 6-8
 */

export interface Standard {
  code: string;
  description: string;
  strand: string;
  grade: string;
}

export const CCSS_ELA_STANDARDS: Standard[] = [
  // =========================================================================
  // RL — Reading: Literature
  // =========================================================================

  // --- Grade 5 ---
  { code: "CCSS.ELA-LITERACY.RL.5.1", description: "Quote accurately from a text and correctly refer to the text when explaining what the text says explicitly and when drawing inferences from the text.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.2", description: "Determine a theme of a story, drama, or poem from details in the text, including how characters in a story or drama respond to challenges or how the speaker in a poem reflects upon a topic; summarize the text.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.3", description: "Compare and contrast two or more characters, settings, or events in a story or drama, drawing on specific details in the text (e.g., how characters interact).", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative language such as metaphors and similes.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.5", description: "Explain how a series of chapters, scenes, or stanzas fits together to provide the overall structure of a particular story, drama, or poem.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.6", description: "Describe how a narrator's or speaker's point of view influences how events are described.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.7", description: "Analyze how visual and multimedia elements contribute to the meaning, tone, or beauty of a text (e.g., graphic novel, multimedia presentation of fiction, folktale, myth, poem).", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.9", description: "Compare and contrast stories in the same genre (e.g., mysteries and adventure stories) on their approaches to similar themes and topics.", strand: "Reading: Literature", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RL.5.10", description: "By the end of the year, read and comprehend literature, including stories, dramas, and poetry, at the high end of the grades 4-5 text complexity band independently and proficiently.", strand: "Reading: Literature", grade: "5" },

  // --- Grade 6 ---
  { code: "CCSS.ELA-LITERACY.RL.6.1", description: "Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.2", description: "Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.3", description: "Describe how a particular story's or drama's plot unfolds in a series of episodes as well as how the characters respond or change as the plot moves toward a resolution.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of a specific word choice on meaning and tone.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.5", description: "Analyze how a particular sentence, chapter, scene, or stanza fits into the overall structure of a text and contributes to the development of the theme, setting, or plot.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.6", description: "Explain how an author develops the point of view of the narrator or speaker in a text.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.7", description: "Compare and contrast the experience of reading a story, drama, or poem to listening to or viewing an audio, video, or live version of the text, including contrasting what they \"see\" and \"hear\" when reading the text to what they perceive when they listen or watch.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.9", description: "Compare and contrast texts in different forms or genres (e.g., stories and poems; historical novels and fantasy stories) in terms of their approaches to similar themes and topics.", strand: "Reading: Literature", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RL.6.10", description: "By the end of the year, read and comprehend literature, including stories, dramas, and poems, in the grades 6-8 text complexity band proficiently, with scaffolding as needed at the high end of the range.", strand: "Reading: Literature", grade: "6" },

  // --- Grade 7 ---
  { code: "CCSS.ELA-LITERACY.RL.7.1", description: "Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.2", description: "Determine a theme or central idea of a text and analyze its development over the course of the text; provide an objective summary of the text.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.3", description: "Analyze how particular elements of a story or drama interact (e.g., how setting shapes the characters or plot).", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of rhymes and other repetitions of sounds (e.g., alliteration) on a specific verse or stanza of a poem or section of a story or drama.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.5", description: "Analyze how a drama's or poem's form or structure (e.g., soliloquy, sonnet) contributes to its meaning.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.6", description: "Analyze how an author develops and contrasts the points of view of different characters or narrators in a text.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.7", description: "Compare and contrast a written story, drama, or poem to its audio, filmed, staged, or multimedia version, analyzing the effects of techniques unique to each medium (e.g., lighting, sound, color, or camera focus and angles in a film).", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.9", description: "Compare and contrast a fictional portrayal of a time, place, or character and a historical account of the same period as a means of understanding how authors of fiction use or alter history.", strand: "Reading: Literature", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RL.7.10", description: "By the end of the year, read and comprehend literature, including stories, dramas, and poems, in the grades 6-8 text complexity band proficiently, with scaffolding as needed at the high end of the range.", strand: "Reading: Literature", grade: "7" },

  // --- Grade 8 ---
  { code: "CCSS.ELA-LITERACY.RL.8.1", description: "Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.2", description: "Determine a theme or central idea of a text and analyze its development over the course of the text, including its relationship to the characters, setting, and plot; provide an objective summary of the text.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.3", description: "Analyze how particular lines of dialogue or incidents in a story or drama propel the action, reveal aspects of a character, or provoke a decision.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of specific word choices on meaning and tone, including analogies or allusions to other texts.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.5", description: "Compare and contrast the structure of two or more texts and analyze how the differing structure of each text contributes to its meaning and style.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.6", description: "Analyze how differences in the points of view of the characters and the audience or reader (e.g., created through the use of dramatic irony) create such effects as suspense or humor.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.7", description: "Analyze the extent to which a filmed or live production of a story or drama stays faithful to or departs from the text or script, evaluating the choices made by the director or actors.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.9", description: "Analyze how a modern work of fiction draws on themes, patterns of events, or character types from myths, traditional stories, or religious works such as the Bible, including describing how the material is rendered new.", strand: "Reading: Literature", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RL.8.10", description: "By the end of the year, read and comprehend literature, including stories, dramas, and poems, at the high end of grades 6-8 text complexity band independently and proficiently.", strand: "Reading: Literature", grade: "8" },

  // =========================================================================
  // RI — Reading: Informational Text
  // =========================================================================

  // --- Grade 5 ---
  { code: "CCSS.ELA-LITERACY.RI.5.1", description: "Quote accurately from a text and correctly refer to the text when explaining what the text says explicitly and when drawing inferences from the text.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.2", description: "Determine two or more main ideas of a text and explain how they are supported by key details; summarize the text.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.3", description: "Explain the relationships or interactions between two or more individuals, events, ideas, or concepts in a historical, scientific, or technical text based on specific information in the text.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.4", description: "Determine the meaning of general academic and domain-specific words and phrases in a text relevant to a grade 5 topic or subject area.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.5", description: "Compare and contrast the overall structure (e.g., chronology, comparison, cause/effect, problem/solution) of events, ideas, concepts, or information in two or more texts.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.6", description: "Analyze multiple accounts of the same event or topic, noting important similarities and differences in the point of view they represent.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.7", description: "Draw on information from multiple print or digital sources, demonstrating the ability to locate an answer to a question quickly or to solve a problem efficiently.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.8", description: "Explain how an author uses reasons and evidence to support particular points in a text, identifying which reasons and evidence support which point(s).", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.9", description: "Integrate information from several texts on the same topic in order to write or speak about the subject knowledgeably.", strand: "Reading: Informational Text", grade: "5" },
  { code: "CCSS.ELA-LITERACY.RI.5.10", description: "By the end of the year, read and comprehend informational texts, including history/social studies, science, and technical texts, at the high end of the grades 4-5 text complexity band independently and proficiently.", strand: "Reading: Informational Text", grade: "5" },

  // --- Grade 6 ---
  { code: "CCSS.ELA-LITERACY.RI.6.1", description: "Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.2", description: "Determine a central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.3", description: "Analyze in detail how a key individual, event, or idea is introduced, illustrated, and elaborated in a text (e.g., through examples or anecdotes).", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative, connotative, and technical meanings.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.5", description: "Analyze how a particular sentence, paragraph, chapter, or section fits into the overall structure of a text and contributes to the development of the ideas.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.6", description: "Determine an author's point of view or purpose in a text and explain how it is conveyed in the text.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.7", description: "Integrate information presented in different media or formats (e.g., visually, quantitatively) as well as in words to develop a coherent understanding of a topic or issue.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.8", description: "Trace and evaluate the argument and specific claims in a text, distinguishing claims that are supported by reasons and evidence from claims that are not.", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.9", description: "Compare and contrast one author's presentation of events with that of another (e.g., a memoir written by and a biography on the same person).", strand: "Reading: Informational Text", grade: "6" },
  { code: "CCSS.ELA-LITERACY.RI.6.10", description: "By the end of the year, read and comprehend literary nonfiction in the grades 6-8 text complexity band proficiently, with scaffolding as needed at the high end of the range.", strand: "Reading: Informational Text", grade: "6" },

  // --- Grade 7 ---
  { code: "CCSS.ELA-LITERACY.RI.7.1", description: "Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.2", description: "Determine two or more central ideas in a text and analyze their development over the course of the text; provide an objective summary of the text.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.3", description: "Analyze the interactions between individuals, events, and ideas in a text (e.g., how ideas influence individuals or events, or how individuals influence ideas or events).", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative, connotative, and technical meanings; analyze the impact of a specific word choice on meaning and tone.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.5", description: "Analyze the structure an author uses to organize a text, including how the major sections contribute to the whole and to the development of the ideas.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.6", description: "Determine an author's point of view or purpose in a text and analyze how the author distinguishes his or her position from that of others.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.7", description: "Compare and contrast a text to an audio, video, or multimedia version of the text, analyzing each medium's portrayal of the subject (e.g., how the delivery of a speech affects the impact of the words).", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.8", description: "Trace and evaluate the argument and specific claims in a text, assessing whether the reasoning is sound and the evidence is relevant and sufficient to support the claims.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.9", description: "Analyze how two or more authors writing about the same topic shape their presentations of key information by emphasizing different evidence or advancing different interpretations of facts.", strand: "Reading: Informational Text", grade: "7" },
  { code: "CCSS.ELA-LITERACY.RI.7.10", description: "By the end of the year, read and comprehend literary nonfiction in the grades 6-8 text complexity band proficiently, with scaffolding as needed at the high end of the range.", strand: "Reading: Informational Text", grade: "7" },

  // --- Grade 8 ---
  { code: "CCSS.ELA-LITERACY.RI.8.1", description: "Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.2", description: "Determine a central idea of a text and analyze its development over the course of the text, including its relationship to supporting ideas; provide an objective summary of the text.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.3", description: "Analyze how a text makes connections among and distinctions between individuals, ideas, or events (e.g., through comparisons, analogies, or categories).", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.4", description: "Determine the meaning of words and phrases as they are used in a text, including figurative, connotative, and technical meanings; analyze the impact of specific word choices on meaning and tone, including analogies or allusions to other texts.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.5", description: "Analyze in detail the structure of a specific paragraph in a text, including the role of particular sentences in developing and refining a key concept.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.6", description: "Determine an author's point of view or purpose in a text and analyze how the author acknowledges and responds to conflicting evidence or viewpoints.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.7", description: "Evaluate the advantages and disadvantages of using different mediums (e.g., print or digital text, video, multimedia) to present a particular topic or idea.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.8", description: "Delineate and evaluate the argument and specific claims in a text, assessing whether the reasoning is sound and the evidence is relevant and sufficient; recognize when irrelevant evidence is introduced.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.9", description: "Analyze a case in which two or more texts provide conflicting information on the same topic and identify where the texts disagree on matters of fact or interpretation.", strand: "Reading: Informational Text", grade: "8" },
  { code: "CCSS.ELA-LITERACY.RI.8.10", description: "By the end of the year, read and comprehend literary nonfiction at the high end of the grades 6-8 text complexity band independently and proficiently.", strand: "Reading: Informational Text", grade: "8" },

  // =========================================================================
  // W — Writing
  // =========================================================================

  // --- Grade 5 ---
  { code: "CCSS.ELA-LITERACY.W.5.1", description: "Write opinion pieces on topics or texts, supporting a point of view with reasons and information.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.2", description: "Write informative/explanatory texts to examine a topic and convey ideas and information clearly.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.3", description: "Write narratives to develop real or imagined experiences or events using effective technique, descriptive details, and clear event sequences.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.4", description: "Produce clear and coherent writing in which the development and organization are appropriate to task, purpose, and audience.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.5", description: "With guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.6", description: "With some guidance and support from adults, use technology, including the Internet, to produce and publish writing as well as to interact and collaborate with others; demonstrate sufficient command of keyboarding skills to type a minimum of two pages in a single sitting.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.7", description: "Conduct short research projects that use several sources to build knowledge through investigation of different aspects of a topic.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.8", description: "Recall relevant information from experiences or gather relevant information from print and digital sources; summarize or paraphrase information in notes and finished work, and provide a list of sources.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.9", description: "Draw evidence from literary or informational texts to support analysis, reflection, and research.", strand: "Writing", grade: "5" },
  { code: "CCSS.ELA-LITERACY.W.5.10", description: "Write routinely over extended time frames (time for research, reflection, and revision) and shorter time frames (a single sitting or a day or two) for a range of discipline-specific tasks, purposes, and audiences.", strand: "Writing", grade: "5" },

  // --- Grade 6 ---
  { code: "CCSS.ELA-LITERACY.W.6.1", description: "Write arguments to support claims with clear reasons and relevant evidence.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.2", description: "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.3", description: "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.4", description: "Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.5", description: "With some guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.6", description: "Use technology, including the Internet, to produce and publish writing as well as to interact and collaborate with others; demonstrate sufficient command of keyboarding skills to type a minimum of three pages in a single sitting.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.7", description: "Conduct short research projects to answer a question, drawing on several sources and refocusing the inquiry when appropriate.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.8", description: "Gather relevant information from multiple print and digital sources; assess the credibility of each source; and quote or paraphrase the data and conclusions of others while avoiding plagiarism and providing basic bibliographic information for sources.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.9", description: "Draw evidence from literary or informational texts to support analysis, reflection, and research.", strand: "Writing", grade: "6" },
  { code: "CCSS.ELA-LITERACY.W.6.10", description: "Write routinely over extended time frames (time for research, reflection, and revision) and shorter time frames (a single sitting or a day or two) for a range of discipline-specific tasks, purposes, and audiences.", strand: "Writing", grade: "6" },

  // --- Grade 7 ---
  { code: "CCSS.ELA-LITERACY.W.7.1", description: "Write arguments to support claims with clear reasons and relevant evidence.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.2", description: "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.3", description: "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.4", description: "Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.5", description: "With some guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach, focusing on how well purpose and audience have been addressed.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.6", description: "Use technology, including the Internet, to produce and publish writing and link to and cite sources as well as to interact and collaborate with others, including linking to and citing sources.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.7", description: "Conduct short research projects to answer a question, drawing on several sources and generating additional related, focused questions for further research and investigation.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.8", description: "Gather relevant information from multiple print and digital sources, using search terms effectively; assess the credibility and accuracy of each source; and quote or paraphrase the data and conclusions of others while avoiding plagiarism and following a standard format for citation.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.9", description: "Draw evidence from literary or informational texts to support analysis, reflection, and research.", strand: "Writing", grade: "7" },
  { code: "CCSS.ELA-LITERACY.W.7.10", description: "Write routinely over extended time frames (time for research, reflection, and revision) and shorter time frames (a single sitting or a day or two) for a range of discipline-specific tasks, purposes, and audiences.", strand: "Writing", grade: "7" },

  // --- Grade 8 ---
  { code: "CCSS.ELA-LITERACY.W.8.1", description: "Write arguments to support claims with clear reasons and relevant evidence.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.2", description: "Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through the selection, organization, and analysis of relevant content.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.3", description: "Write narratives to develop real or imagined experiences or events using effective technique, relevant descriptive details, and well-structured event sequences.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.4", description: "Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.5", description: "With some guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach, focusing on how well purpose and audience have been addressed.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.6", description: "Use technology, including the Internet, to produce and publish writing and present the relationships between information and ideas efficiently as well as to interact and collaborate with others.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.7", description: "Conduct short research projects to answer a question (including a self-generated question), drawing on several sources and generating additional related, focused questions that allow for multiple avenues of exploration.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.8", description: "Gather relevant information from multiple print and digital sources, using search terms effectively; assess the credibility and accuracy of each source; and quote or paraphrase the data and conclusions of others while avoiding plagiarism and following a standard format for citation.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.9", description: "Draw evidence from literary or informational texts to support analysis, reflection, and research.", strand: "Writing", grade: "8" },
  { code: "CCSS.ELA-LITERACY.W.8.10", description: "Write routinely over extended time frames (time for research, reflection, and revision) and shorter time frames (a single sitting or a day or two) for a range of discipline-specific tasks, purposes, and audiences.", strand: "Writing", grade: "8" },

  // =========================================================================
  // RH — Reading: History/Social Studies (Grades 6-8)
  // =========================================================================
  { code: "CCSS.ELA-LITERACY.RH.6-8.1", description: "Cite specific textual evidence to support analysis of primary and secondary sources.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.2", description: "Determine the central ideas or information of a primary or secondary source; provide an accurate summary of the source distinct from prior knowledge or opinions.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.3", description: "Identify key steps in a text's description of a process related to history/social studies (e.g., how a bill becomes law, how interest rates are raised or lowered).", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.4", description: "Determine the meaning of words and phrases as they are used in a text, including vocabulary specific to domains related to history/social studies.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.5", description: "Describe how a text presents information (e.g., sequentially, comparatively, causally).", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.6", description: "Identify aspects of a text that reveal an author's point of view or purpose (e.g., loaded language, inclusion or avoidance of particular facts).", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.7", description: "Integrate visual information (e.g., in charts, graphs, photographs, videos, or maps) with other information in print and digital texts.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.8", description: "Distinguish among fact, opinion, and reasoned judgment in a text.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.9", description: "Analyze the relationship between a primary and secondary source on the same topic.", strand: "Reading: History/Social Studies", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RH.6-8.10", description: "By the end of grade 8, read and comprehend history/social studies texts in the grades 6-8 text complexity band independently and proficiently.", strand: "Reading: History/Social Studies", grade: "6-8" },

  // =========================================================================
  // RST — Reading: Science & Technical Subjects (Grades 6-8)
  // =========================================================================
  { code: "CCSS.ELA-LITERACY.RST.6-8.1", description: "Cite specific textual evidence to support analysis of science and technical texts.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.2", description: "Determine the central ideas or conclusions of a text; provide an accurate summary of the text distinct from prior knowledge or opinions.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.3", description: "Follow precisely a multistep procedure when carrying out experiments, taking measurements, or performing technical tasks.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.4", description: "Determine the meaning of symbols, key terms, and other domain-specific words and phrases as they are used in a specific scientific or technical context relevant to grades 6-8 texts and topics.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.5", description: "Analyze the structure an author uses to organize a text, including how the major sections contribute to the whole and to an understanding of the topic.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.6", description: "Analyze the author's purpose in providing an explanation, describing a procedure, or discussing an experiment in a text.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.7", description: "Integrate quantitative or technical information expressed in words in a text with a version of that information expressed visually (e.g., in a flowchart, diagram, model, graph, or table).", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.8", description: "Distinguish among facts, reasoned judgment based on research findings, and speculation in a text.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.9", description: "Compare and contrast the information gained from experiments, simulations, video, or multimedia sources with that gained from reading a text on the same topic.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
  { code: "CCSS.ELA-LITERACY.RST.6-8.10", description: "By the end of grade 8, read and comprehend science/technical texts in the grades 6-8 text complexity band independently and proficiently.", strand: "Reading: Science & Technical Subjects", grade: "6-8" },
];

// Helper functions for filtering standards
export function getStandardsByGrade(grade: string): Standard[] {
  return CCSS_ELA_STANDARDS.filter(s => s.grade === grade);
}

export function getStandardsByStrand(strand: string): Standard[] {
  return CCSS_ELA_STANDARDS.filter(s => s.strand === strand);
}

export function getStandardsByCode(code: string): Standard | undefined {
  return CCSS_ELA_STANDARDS.find(s => s.code === code);
}

export function getStandardsByGradeAndStrand(grade: string, strand: string): Standard[] {
  return CCSS_ELA_STANDARDS.filter(s => s.grade === grade && s.strand === strand);
}

export function searchStandards(query: string): Standard[] {
  const lower = query.toLowerCase();
  return CCSS_ELA_STANDARDS.filter(
    s => s.code.toLowerCase().includes(lower) || s.description.toLowerCase().includes(lower)
  );
}
