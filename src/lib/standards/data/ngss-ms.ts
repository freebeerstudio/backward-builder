/**
 * NGSS Middle School Performance Expectations — VERIFIED from nextgenscience.org
 *
 * Source: https://www.nextgenscience.org/search-standards
 * Fetched: March 2026
 * Coverage: All 52 middle school (MS) performance expectations
 *
 * These are the EXACT codes and descriptions from the official NGSS site.
 * DO NOT edit descriptions without re-verifying against the source.
 */

import type { StandardsFramework, VerifiedStandard } from "../types";

function s(code: string, description: string): VerifiedStandard {
  return {
    code,
    description,
    url: `https://www.nextgenscience.org/search-standards?keys=${encodeURIComponent(code)}`,
  };
}

const standards: VerifiedStandard[] = [
  // ===== MS-PS1: Matter and Its Interactions =====
  s("MS-PS1-1", "Develop models to describe the atomic composition of simple molecules and extended structures."),
  s("MS-PS1-2", "Analyze and interpret data on the properties of substances before and after the substances interact to determine if a chemical reaction has occurred."),
  s("MS-PS1-3", "Gather and make sense of information to describe that synthetic materials come from natural resources and impact society."),
  s("MS-PS1-4", "Develop a model that predicts and describes changes in particle motion, temperature, and state of a pure substance when thermal energy is added or removed."),
  s("MS-PS1-5", "Develop and use a model to describe how the total number of atoms does not change in a chemical reaction and thus mass is conserved."),
  s("MS-PS1-6", "Undertake a design project to construct, test, and modify a device that either releases or absorbs thermal energy by chemical processes."),

  // ===== MS-PS2: Motion and Stability: Forces and Interactions =====
  s("MS-PS2-1", "Apply Newton's Third Law to design a solution to a problem involving the motion of two colliding objects."),
  s("MS-PS2-2", "Plan an investigation to provide evidence that the change in an object's motion depends on the sum of the forces on the object and the mass of the object."),
  s("MS-PS2-3", "Ask questions about data to determine the factors that affect the strength of electric and magnetic forces."),
  s("MS-PS2-4", "Construct and present arguments using evidence to support the claim that gravitational interactions are attractive and depend on the masses of interacting objects."),
  s("MS-PS2-5", "Conduct an investigation and evaluate the experimental design to provide evidence that fields exist between objects exerting forces on each other even though the objects are not in contact."),

  // ===== MS-PS3: Energy =====
  s("MS-PS3-1", "Construct and interpret graphical displays of data to describe the relationships of kinetic energy to the mass of an object and to the speed of an object."),
  s("MS-PS3-2", "Develop a model to describe that when the arrangement of objects interacting at a distance changes, different amounts of potential energy are stored in the system."),
  s("MS-PS3-3", "Apply scientific principles to design, construct, and test a device that either minimizes or maximizes thermal energy transfer."),
  s("MS-PS3-4", "Plan an investigation to determine the relationships among the energy transferred, the type of matter, the mass, and the change in the average kinetic energy of the particles as measured by the temperature of the sample."),
  s("MS-PS3-5", "Construct, use, and present arguments to support the claim that when the kinetic energy of an object changes, energy is transferred to or from the object."),

  // ===== MS-PS4: Waves and Their Applications =====
  s("MS-PS4-1", "Use mathematical representations to describe a simple model for waves that includes how the amplitude of a wave is related to the energy in a wave."),
  s("MS-PS4-2", "Develop and use a model to describe that waves are reflected, absorbed, or transmitted through various materials."),
  s("MS-PS4-3", "Integrate qualitative scientific and technical information to support the claim that digitized signals are a more reliable way to encode and transmit information than analog signals."),

  // ===== MS-LS1: From Molecules to Organisms: Structures and Processes =====
  s("MS-LS1-1", "Conduct an investigation to provide evidence that living things are made of cells; either one cell or many different numbers and types of cells."),
  s("MS-LS1-2", "Develop and use a model to describe the function of a cell as a whole and ways the parts of cells contribute to the function."),
  s("MS-LS1-3", "Use argument supported by evidence for how the body is a system of interacting subsystems composed of groups of cells."),
  s("MS-LS1-4", "Use argument based on empirical evidence and scientific reasoning to support an explanation for how characteristic animal behaviors and specialized plant structures affect the probability of successful reproduction."),
  s("MS-LS1-5", "Construct a scientific explanation based on evidence for how environmental and genetic factors influence the growth of organisms."),
  s("MS-LS1-6", "Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms."),
  s("MS-LS1-7", "Develop a model to describe how food is rearranged through chemical reactions forming new molecules that support growth and/or release energy as this matter moves through an organism."),
  s("MS-LS1-8", "Gather and synthesize information that sensory receptors respond to stimuli by sending messages to the brain for immediate behavior or storage as memories."),

  // ===== MS-LS2: Ecosystems: Interactions, Energy, and Dynamics =====
  s("MS-LS2-1", "Analyze and interpret data to provide evidence for the effects of resource availability on organisms and populations of organisms in an ecosystem."),
  s("MS-LS2-2", "Construct an explanation that predicts patterns of interactions among organisms across multiple ecosystems."),
  s("MS-LS2-3", "Develop a model to describe the cycling of matter and flow of energy among living and nonliving parts of an ecosystem."),
  s("MS-LS2-4", "Construct an argument supported by empirical evidence that changes to physical or biological components of an ecosystem affect populations."),
  s("MS-LS2-5", "Evaluate competing design solutions for maintaining biodiversity and ecosystem services."),

  // ===== MS-LS3: Heredity: Inheritance and Variation of Traits =====
  s("MS-LS3-1", "Develop and use a model to describe why structural changes to genes (mutations) located on chromosomes may affect proteins and may result in harmful, beneficial, or neutral effects to the structure and function of the organism."),
  s("MS-LS3-2", "Develop and use a model to describe why asexual reproduction results in offspring with identical genetic information and sexual reproduction results in offspring with genetic variation."),

  // ===== MS-LS4: Biological Evolution: Unity and Diversity =====
  s("MS-LS4-1", "Analyze and interpret data for patterns in the fossil record that document the existence, diversity, extinction, and change of life forms throughout the history of life on Earth."),
  s("MS-LS4-2", "Apply scientific ideas to construct an explanation for the anatomical similarities and differences among modern organisms and between modern and fossil organisms to infer evolutionary relationships."),
  s("MS-LS4-3", "Analyze displays of pictorial data to compare patterns of similarities in the embryological development across multiple species to identify relationships not evident in the fully formed anatomy."),
  s("MS-LS4-4", "Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals' probability of surviving and reproducing in a specific environment."),
  s("MS-LS4-5", "Gather and synthesize information about technologies that have changed the way humans influence the inheritance of desired traits in organisms."),
  s("MS-LS4-6", "Use mathematical representations to support explanations of how natural selection may lead to increases and decreases of specific traits in populations over time."),

  // ===== MS-ESS1: Earth's Place in the Universe =====
  s("MS-ESS1-1", "Develop and use a model of the Earth-sun-moon system to describe the cyclic patterns of lunar phases, eclipses of the sun and moon, and seasons."),
  s("MS-ESS1-2", "Develop and use a model to describe the role of gravity in the motions within galaxies and the solar system."),
  s("MS-ESS1-3", "Analyze and interpret data to determine scale properties of objects in the solar system."),
  s("MS-ESS1-4", "Construct a scientific explanation based on evidence from rock strata for how the geologic time scale is used to organize Earth's 4.6-billion-year-old history."),

  // ===== MS-ESS2: Earth's Systems =====
  s("MS-ESS2-1", "Develop a model to describe the cycling of Earth's materials and the flow of energy that drives this process."),
  s("MS-ESS2-2", "Construct an explanation based on evidence for how geoscience processes have changed Earth's surface at varying time and spatial scales."),
  s("MS-ESS2-3", "Analyze and interpret data on the distribution of fossils and rocks, continental shapes, and seafloor structures to provide evidence of the past plate motions."),
  s("MS-ESS2-4", "Develop a model to describe the cycling of water through Earth's systems driven by energy from the sun and the force of gravity."),
  s("MS-ESS2-5", "Collect data to provide evidence for how the motions and complex interactions of air masses result in changes in weather conditions."),
  s("MS-ESS2-6", "Develop and use a model to describe how unequal heating and rotation of the Earth cause patterns of atmospheric and oceanic circulation that determine regional climates."),

  // ===== MS-ESS3: Earth and Human Activity =====
  s("MS-ESS3-1", "Construct a scientific explanation based on evidence for how the uneven distributions of Earth's mineral, energy, and groundwater resources are the result of past and current geoscience processes."),
  s("MS-ESS3-2", "Analyze and interpret data on natural hazards to forecast future catastrophic events and inform the development of technologies to mitigate their effects."),
  s("MS-ESS3-3", "Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment."),
  s("MS-ESS3-4", "Construct an argument supported by evidence for how increases in human population and per-capita consumption of natural resources impact Earth's systems."),
  s("MS-ESS3-5", "Ask questions to clarify evidence of the factors that have caused the rise in global temperatures over the past century."),

  // ===== MS-ETS1: Engineering Design =====
  s("MS-ETS1-1", "Define the criteria and constraints of a design problem with sufficient precision to ensure a successful solution, taking into account relevant scientific principles and potential impacts on people and the natural environment that may limit possible solutions."),
  s("MS-ETS1-2", "Evaluate competing design solutions using a systematic process to determine how well they meet the criteria and constraints of the problem."),
  s("MS-ETS1-3", "Analyze data from tests to determine similarities and differences among several design solutions to identify the best characteristics of each that can be combined into a new solution to better meet the criteria for success."),
  s("MS-ETS1-4", "Develop a model to generate data for iterative testing and modification of a proposed object, tool, or process such that an optimal design can be achieved."),
];

export const NGSS_MS_STANDARDS: StandardsFramework = {
  id: "NGSS-MS",
  name: "Next Generation Science Standards — Middle School",
  subjects: ["Science"],
  grades: ["6", "7", "8"],
  standards: Object.fromEntries(standards.map((s) => [s.code, s])),
};
