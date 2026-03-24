/**
 * Common Core State Standards — Mathematics Grades 5-8
 *
 * Source: https://www.thecorestandards.org/Math/
 * Fetched: March 2026
 * Coverage: Key domains for grades 5-8
 *
 * URL pattern: https://www.thecorestandards.org/Math/Content/{grade}/{domain}/{cluster}/{num}/
 *
 * These are the EXACT codes and descriptions from the official CCSS site.
 * DO NOT edit descriptions without re-verifying against the source.
 */

import type { StandardsFramework, VerifiedStandard } from "../types";

function s(code: string, description: string): VerifiedStandard {
  const path = code.replace(/^CCSS\.MATH\.CONTENT\./i, "").replace(/\./g, "/");
  return {
    code,
    description,
    url: `https://www.thecorestandards.org/Math/Content/${path}/`,
  };
}

const standards: VerifiedStandard[] = [
  // ===== Grade 5 — Number & Operations: Fractions =====
  s("CCSS.MATH.CONTENT.5.NF.A.1", "Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions in such a way as to produce an equivalent sum or difference of fractions with like denominators."),
  s("CCSS.MATH.CONTENT.5.NF.A.2", "Solve word problems involving addition and subtraction of fractions referring to the same whole, including cases of unlike denominators."),
  s("CCSS.MATH.CONTENT.5.NF.B.3", "Interpret a fraction as division of the numerator by the denominator. Solve word problems involving division of whole numbers leading to answers in the form of fractions or mixed numbers."),
  s("CCSS.MATH.CONTENT.5.NF.B.4", "Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction."),
  s("CCSS.MATH.CONTENT.5.NF.B.5", "Interpret multiplication as scaling (resizing)."),
  s("CCSS.MATH.CONTENT.5.NF.B.6", "Solve real world problems involving multiplication of fractions and mixed numbers."),
  s("CCSS.MATH.CONTENT.5.NF.B.7", "Apply and extend previous understandings of division to divide unit fractions by whole numbers and whole numbers by unit fractions."),

  // ===== Grade 5 — Geometry =====
  s("CCSS.MATH.CONTENT.5.G.A.1", "Use a pair of perpendicular number lines, called axes, to define a coordinate system."),
  s("CCSS.MATH.CONTENT.5.G.A.2", "Represent real world and mathematical problems by graphing points in the first quadrant of the coordinate plane."),
  s("CCSS.MATH.CONTENT.5.G.B.3", "Understand that attributes belonging to a category of two-dimensional figures also belong to all subcategories of that category."),
  s("CCSS.MATH.CONTENT.5.G.B.4", "Classify two-dimensional figures in a hierarchy based on properties."),

  // ===== Grade 6 — Ratios & Proportional Relationships =====
  s("CCSS.MATH.CONTENT.6.RP.A.1", "Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities."),
  s("CCSS.MATH.CONTENT.6.RP.A.2", "Understand the concept of a unit rate a/b associated with a ratio a:b with b ≠ 0, and use rate language in the context of a ratio relationship."),
  s("CCSS.MATH.CONTENT.6.RP.A.3", "Use ratio and rate reasoning to solve real-world and mathematical problems."),

  // ===== Grade 6 — The Number System =====
  s("CCSS.MATH.CONTENT.6.NS.A.1", "Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions."),
  s("CCSS.MATH.CONTENT.6.NS.B.2", "Fluently divide multi-digit numbers using the standard algorithm."),
  s("CCSS.MATH.CONTENT.6.NS.B.3", "Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm for each operation."),
  s("CCSS.MATH.CONTENT.6.NS.C.5", "Understand that positive and negative numbers are used together to describe quantities having opposite directions or values."),
  s("CCSS.MATH.CONTENT.6.NS.C.6", "Understand a rational number as a point on the number line."),
  s("CCSS.MATH.CONTENT.6.NS.C.7", "Understand ordering and absolute value of rational numbers."),
  s("CCSS.MATH.CONTENT.6.NS.C.8", "Solve real-world and mathematical problems by graphing points in all four quadrants of the coordinate plane."),

  // ===== Grade 6 — Expressions & Equations =====
  s("CCSS.MATH.CONTENT.6.EE.A.1", "Write and evaluate numerical expressions involving whole-number exponents."),
  s("CCSS.MATH.CONTENT.6.EE.A.2", "Write, read, and evaluate expressions in which letters stand for numbers."),
  s("CCSS.MATH.CONTENT.6.EE.A.3", "Apply the properties of operations to generate equivalent expressions."),
  s("CCSS.MATH.CONTENT.6.EE.B.5", "Understand solving an equation or inequality as a process of answering a question."),
  s("CCSS.MATH.CONTENT.6.EE.B.7", "Solve real-world and mathematical problems by writing and solving equations of the form x + p = q and px = q for cases in which p, q and x are all nonnegative rational numbers."),

  // ===== Grade 6 — Geometry =====
  s("CCSS.MATH.CONTENT.6.G.A.1", "Find the area of right triangles, other triangles, special quadrilaterals, and polygons by composing into rectangles or decomposing into triangles and other shapes."),
  s("CCSS.MATH.CONTENT.6.G.A.2", "Find the volume of a right rectangular prism with fractional edge lengths."),
  s("CCSS.MATH.CONTENT.6.G.A.4", "Represent three-dimensional figures using nets made up of rectangles and triangles, and use the nets to find the surface area of these figures."),

  // ===== Grade 6 — Statistics & Probability =====
  s("CCSS.MATH.CONTENT.6.SP.A.1", "Recognize a statistical question as one that anticipates variability in the data related to the question and accounts for it in the answers."),
  s("CCSS.MATH.CONTENT.6.SP.A.2", "Understand that a set of data collected to answer a statistical question has a distribution which can be described by its center, spread, and overall shape."),
  s("CCSS.MATH.CONTENT.6.SP.B.5", "Summarize numerical data sets in relation to their context."),

  // ===== Grade 7 — Ratios & Proportional Relationships =====
  s("CCSS.MATH.CONTENT.7.RP.A.1", "Compute unit rates associated with ratios of fractions, including ratios of lengths, areas and other quantities measured in like or different units."),
  s("CCSS.MATH.CONTENT.7.RP.A.2", "Recognize and represent proportional relationships between quantities."),
  s("CCSS.MATH.CONTENT.7.RP.A.3", "Use proportional relationships to solve multistep ratio and percent problems."),

  // ===== Grade 7 — The Number System =====
  s("CCSS.MATH.CONTENT.7.NS.A.1", "Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers."),
  s("CCSS.MATH.CONTENT.7.NS.A.2", "Apply and extend previous understandings of multiplication and division and of fractions to multiply and divide rational numbers."),
  s("CCSS.MATH.CONTENT.7.NS.A.3", "Solve real-world and mathematical problems involving the four operations with rational numbers."),

  // ===== Grade 7 — Expressions & Equations =====
  s("CCSS.MATH.CONTENT.7.EE.A.1", "Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients."),
  s("CCSS.MATH.CONTENT.7.EE.A.2", "Understand that rewriting an expression in different forms in a problem context can shed light on the problem and how the quantities in it are related."),
  s("CCSS.MATH.CONTENT.7.EE.B.3", "Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers in any form."),
  s("CCSS.MATH.CONTENT.7.EE.B.4", "Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems by reasoning about the quantities."),

  // ===== Grade 7 — Geometry =====
  s("CCSS.MATH.CONTENT.7.G.A.1", "Solve problems involving scale drawings of geometric figures, including computing actual lengths and areas from a scale drawing and reproducing a scale drawing at a different scale."),
  s("CCSS.MATH.CONTENT.7.G.A.2", "Draw (freehand, with ruler and protractor, and with technology) geometric shapes with given conditions."),
  s("CCSS.MATH.CONTENT.7.G.B.4", "Know the formulas for the area and circumference of a circle and use them to solve problems."),
  s("CCSS.MATH.CONTENT.7.G.B.6", "Solve real-world and mathematical problems involving area, volume and surface area of two- and three-dimensional objects."),

  // ===== Grade 7 — Statistics & Probability =====
  s("CCSS.MATH.CONTENT.7.SP.A.1", "Understand that statistics can be used to gain information about a population by examining a sample of the population."),
  s("CCSS.MATH.CONTENT.7.SP.A.2", "Use data from a random sample to draw inferences about a population with an unknown characteristic of interest."),
  s("CCSS.MATH.CONTENT.7.SP.C.5", "Understand that the probability of a chance event is a number between 0 and 1 that expresses the likelihood of the event occurring."),
  s("CCSS.MATH.CONTENT.7.SP.C.7", "Develop a probability model and use it to find probabilities of events."),

  // ===== Grade 8 — The Number System =====
  s("CCSS.MATH.CONTENT.8.NS.A.1", "Know that numbers that are not rational are called irrational. Understand informally that every number has a decimal expansion."),
  s("CCSS.MATH.CONTENT.8.NS.A.2", "Use rational approximations of irrational numbers to compare the size of irrational numbers."),

  // ===== Grade 8 — Expressions & Equations =====
  s("CCSS.MATH.CONTENT.8.EE.A.1", "Know and apply the properties of integer exponents to generate equivalent numerical expressions."),
  s("CCSS.MATH.CONTENT.8.EE.A.2", "Use square root and cube root symbols to represent solutions to equations of the form x² = p and x³ = p."),
  s("CCSS.MATH.CONTENT.8.EE.B.5", "Graph proportional relationships, interpreting the unit rate as the slope of the graph."),
  s("CCSS.MATH.CONTENT.8.EE.C.7", "Solve linear equations in one variable."),
  s("CCSS.MATH.CONTENT.8.EE.C.8", "Analyze and solve pairs of simultaneous linear equations."),

  // ===== Grade 8 — Functions =====
  s("CCSS.MATH.CONTENT.8.F.A.1", "Understand that a function is a rule that assigns to each input exactly one output."),
  s("CCSS.MATH.CONTENT.8.F.A.2", "Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions)."),
  s("CCSS.MATH.CONTENT.8.F.A.3", "Interpret the equation y = mx + b as defining a linear function, whose graph is a straight line."),
  s("CCSS.MATH.CONTENT.8.F.B.4", "Construct a function to model a linear relationship between two quantities."),
  s("CCSS.MATH.CONTENT.8.F.B.5", "Describe qualitatively the functional relationship between two quantities by analyzing a graph."),

  // ===== Grade 8 — Geometry =====
  s("CCSS.MATH.CONTENT.8.G.A.1", "Verify experimentally the properties of rotations, reflections, and translations."),
  s("CCSS.MATH.CONTENT.8.G.A.2", "Understand that a two-dimensional figure is congruent to another if the second can be obtained from the first by a sequence of rotations, reflections, and translations."),
  s("CCSS.MATH.CONTENT.8.G.A.3", "Describe the effect of dilations, translations, rotations, and reflections on two-dimensional figures using coordinates."),
  s("CCSS.MATH.CONTENT.8.G.A.4", "Understand that a two-dimensional figure is similar to another if the second can be obtained from the first by a sequence of rotations, reflections, translations, and dilations."),
  s("CCSS.MATH.CONTENT.8.G.B.6", "Explain a proof of the Pythagorean Theorem and its converse."),
  s("CCSS.MATH.CONTENT.8.G.B.7", "Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems."),
  s("CCSS.MATH.CONTENT.8.G.B.8", "Apply the Pythagorean Theorem to find the distance between two points in a coordinate system."),
  s("CCSS.MATH.CONTENT.8.G.C.9", "Know the formulas for the volumes of cones, cylinders, and spheres and use them to solve real-world and mathematical problems."),

  // ===== Grade 8 — Statistics & Probability =====
  s("CCSS.MATH.CONTENT.8.SP.A.1", "Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities."),
  s("CCSS.MATH.CONTENT.8.SP.A.2", "Know that straight lines are widely used to model relationships between two quantitative variables."),
  s("CCSS.MATH.CONTENT.8.SP.A.3", "Use the equation of a linear model to solve problems in the context of bivariate measurement data, interpreting the slope and intercept."),
  s("CCSS.MATH.CONTENT.8.SP.A.4", "Understand that patterns of association can also be seen in bivariate categorical data by displaying frequencies and relative frequencies in a two-way table."),
];

export const CCSS_MATH_STANDARDS: StandardsFramework = {
  id: "CCSS-Math",
  name: "Common Core State Standards — Mathematics",
  subjects: ["Math", "Mathematics"],
  grades: ["5", "6", "7", "8"],
  standards: Object.fromEntries(standards.map((s) => [s.code, s])),
};
