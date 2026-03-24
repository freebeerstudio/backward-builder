/**
 * Common Core State Standards for Mathematics -- Grades 5-8
 *
 * Source: https://www.thecorestandards.org/Math/
 * Cross-referenced with state education department documents:
 *   - Washington OSPI: https://ospi.k12.wa.us/
 *   - Oregon DOE: https://www.oregon.gov/ode/
 *   - CCSSO: https://learning.ccsso.org/
 *
 * Fetched & verified: March 2026
 * Coverage: All standards for grades 5-8 across all domains
 *   Grade 5: OA, NBT, NF, MD, G
 *   Grade 6: RP, NS, EE, G, SP
 *   Grade 7: RP, NS, EE, G, SP
 *   Grade 8: NS, EE, F, G, SP
 *
 * These are the EXACT codes and descriptions from the official CCSS documents.
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

  // ==========================================================================
  //  GRADE 5
  // ==========================================================================

  // ===== 5.OA: Operations & Algebraic Thinking =====

  s(
    "CCSS.MATH.CONTENT.5.OA.A.1",
    "Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols."
  ),
  s(
    "CCSS.MATH.CONTENT.5.OA.A.2",
    "Write simple expressions that record calculations with numbers, and interpret numerical expressions without evaluating them. For example, express the calculation \"add 8 and 7, then multiply by 2\" as 2 x (8 + 7). Recognize that 3 x (18932 + 921) is three times as large as 18932 + 921, without having to calculate the indicated sum or product."
  ),
  s(
    "CCSS.MATH.CONTENT.5.OA.B.3",
    "Generate two numerical patterns using two given rules. Identify apparent relationships between corresponding terms. Form ordered pairs consisting of corresponding terms from the two patterns, and graph the ordered pairs on a coordinate plane."
  ),

  // ===== 5.NBT: Number & Operations in Base Ten =====

  s(
    "CCSS.MATH.CONTENT.5.NBT.A.1",
    "Recognize that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.A.2",
    "Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. Use whole-number exponents to denote powers of 10."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.A.3",
    "Read, write, and compare decimals to thousandths."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.A.3.A",
    "Read and write decimals to thousandths using base-ten numerals, number names, and expanded form, e.g., 347.392 = 3 x 100 + 4 x 10 + 7 x 1 + 3 x (1/10) + 9 x (1/100) + 2 x (1/1000)."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.A.3.B",
    "Compare two decimals to thousandths based on meanings of the digits in each place, using >, =, and < symbols to record the results of comparisons."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.A.4",
    "Use place value understanding to round decimals to any place."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.B.5",
    "Fluently multiply multi-digit whole numbers using the standard algorithm."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.B.6",
    "Find whole-number quotients of whole numbers with up to four-digit dividends and two-digit divisors, using strategies based on place value, the properties of operations, and/or the relationship between multiplication and division. Illustrate and explain the calculation by using equations, rectangular arrays, and/or area models."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NBT.B.7",
    "Add, subtract, multiply, and divide decimals to hundredths, using concrete models or drawings and strategies based on place value, properties of operations, and/or the relationship between addition and subtraction; relate the strategy to a written method and explain the reasoning used."
  ),

  // ===== 5.NF: Number & Operations - Fractions =====

  s(
    "CCSS.MATH.CONTENT.5.NF.A.1",
    "Add and subtract fractions with unlike denominators (including mixed numbers) by replacing given fractions with equivalent fractions in such a way as to produce an equivalent sum or difference of fractions with like denominators."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.A.2",
    "Solve word problems involving addition and subtraction of fractions referring to the same whole, including cases of unlike denominators, e.g., by using visual fraction models or equations to represent the problem. Use benchmark fractions and number sense of fractions to estimate mentally and assess the reasonableness of answers."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.3",
    "Interpret a fraction as division of the numerator by the denominator (a/b = a / b). Solve word problems involving division of whole numbers leading to answers in the form of fractions or mixed numbers, e.g., by using visual fraction models or equations to represent the problem."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.4",
    "Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.4.A",
    "Interpret the product (a/b) x q as a parts of a partition of q into b equal parts; equivalently, as the result of a sequence of operations a x q / b."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.4.B",
    "Find the area of a rectangle with fractional side lengths by tiling it with unit squares of the appropriate unit fraction side lengths, and show that the area is the same as would be found by multiplying the side lengths. Multiply fractional side lengths to find areas of rectangles, and represent fraction products as rectangular areas."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.5",
    "Interpret multiplication as scaling (resizing)."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.5.A",
    "Comparing the size of a product to the size of one factor on the basis of the size of the other factor, without performing the indicated multiplication."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.5.B",
    "Explaining why multiplying a given number by a fraction greater than 1 results in a product greater than the given number (recognizing multiplication by whole numbers greater than 1 as a familiar case); explaining why multiplying a given number by a fraction less than 1 results in a product smaller than the given number; and relating the principle of fraction equivalence a/b = (n x a)/(n x b) to the effect of multiplying a/b by 1."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.6",
    "Solve real world problems involving multiplication of fractions and mixed numbers, e.g., by using visual fraction models or equations to represent the problem."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.7",
    "Apply and extend previous understandings of division to divide unit fractions by whole numbers and whole numbers by unit fractions."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.7.A",
    "Interpret division of a unit fraction by a non-zero whole number, and compute such quotients."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.7.B",
    "Interpret division of a whole number by a unit fraction, and compute such quotients."
  ),
  s(
    "CCSS.MATH.CONTENT.5.NF.B.7.C",
    "Solve real world problems involving division of unit fractions by non-zero whole numbers and division of whole numbers by unit fractions, e.g., by using visual fraction models and equations to represent the problem."
  ),

  // ===== 5.MD: Measurement & Data =====

  s(
    "CCSS.MATH.CONTENT.5.MD.A.1",
    "Convert among different-sized standard measurement units within a given measurement system (e.g., convert 5 cm to 0.05 m), and use these conversions in solving multi-step, real world problems."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.B.2",
    "Make a line plot to display a data set of measurements in fractions of a unit (1/2, 1/4, 1/8). Use operations on fractions for this grade to solve problems involving information presented in line plots."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.3",
    "Recognize volume as an attribute of solid figures and understand concepts of volume measurement."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.3.A",
    "A cube with side length 1 unit, called a \"unit cube,\" is said to have \"one cubic unit\" of volume, and can be used to measure volume."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.3.B",
    "A solid figure which can be packed without gaps or overlaps using n unit cubes is said to have a volume of n cubic units."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.4",
    "Measure volumes by counting unit cubes, using cubic cm, cubic in, cubic ft, and improvised units."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.5",
    "Relate volume to the operations of multiplication and addition and solve real world and mathematical problems involving volume."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.5.A",
    "Find the volume of a right rectangular prism with whole-number side lengths by packing it with unit cubes, and show that the volume is the same as would be found by multiplying the edge lengths, equivalently by multiplying the height by the area of the base. Represent threefold whole-number products as volumes, e.g., to represent the associative property of multiplication."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.5.B",
    "Apply the formulas V = l x w x h and V = b x h for rectangular prisms to find volumes of right rectangular prisms with whole-number edge lengths in the context of solving real world and mathematical problems."
  ),
  s(
    "CCSS.MATH.CONTENT.5.MD.C.5.C",
    "Recognize volume as additive. Find volumes of solid figures composed of two non-overlapping right rectangular prisms by adding the volumes of the non-overlapping parts, applying this technique to solve real world problems."
  ),

  // ===== 5.G: Geometry =====

  s(
    "CCSS.MATH.CONTENT.5.G.A.1",
    "Use a pair of perpendicular number lines, called axes, to define a coordinate system, with the intersection of the lines (the origin) arranged to coincide with the 0 on each line and a given point in the plane located by using an ordered pair of numbers, called its coordinates. Understand that the first number indicates how far to travel from the origin in the direction of one axis, and the second number indicates how far to travel in the direction of the second axis, with the convention that the names of the two axes and the coordinates correspond (e.g., x-axis and x-coordinate, y-axis and y-coordinate)."
  ),
  s(
    "CCSS.MATH.CONTENT.5.G.A.2",
    "Represent real world and mathematical problems by graphing points in the first quadrant of the coordinate plane, and interpret coordinate values of points in the context of the situation."
  ),
  s(
    "CCSS.MATH.CONTENT.5.G.B.3",
    "Understand that attributes belonging to a category of two-dimensional figures also belong to all subcategories of that category."
  ),
  s(
    "CCSS.MATH.CONTENT.5.G.B.4",
    "Classify two-dimensional figures in a hierarchy based on properties."
  ),

  // ==========================================================================
  //  GRADE 6
  // ==========================================================================

  // ===== 6.RP: Ratios & Proportional Relationships =====

  s(
    "CCSS.MATH.CONTENT.6.RP.A.1",
    "Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities. For example, \"The ratio of wings to beaks in the bird house at the zoo was 2:1, because for every 2 wings there was 1 beak.\" \"For every vote candidate A received, candidate C received nearly three votes.\""
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.2",
    "Understand the concept of a unit rate a/b associated with a ratio a:b with b not equal to 0, and use rate language in the context of a ratio relationship. For example, \"This recipe has a ratio of 3 cups of flour to 4 cups of sugar, so there is 3/4 cup of flour for each cup of sugar.\" \"We paid $75 for 15 hamburgers, which is a rate of $5 per hamburger.\""
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.3",
    "Use ratio and rate reasoning to solve real-world and mathematical problems, e.g., by reasoning about tables of equivalent ratios, tape diagrams, double number line diagrams, or equations."
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.3.A",
    "Make tables of equivalent ratios relating quantities with whole-number measurements, find missing values in the tables, and plot the pairs of values on the coordinate plane. Use tables to compare ratios."
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.3.B",
    "Solve unit rate problems including those involving unit pricing and constant speed. For example, if it took 7 hours to mow 4 lawns, then at that rate, how many lawns could be mowed in 35 hours? At what rate were lawns being mowed?"
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.3.C",
    "Find a percent of a quantity as a rate per 100 (e.g., 30% of a quantity means 30/100 times the quantity); solve problems involving finding the whole, given a part and the percent."
  ),
  s(
    "CCSS.MATH.CONTENT.6.RP.A.3.D",
    "Use ratio reasoning to convert measurement units; manipulate and transform units appropriately when multiplying or dividing quantities."
  ),

  // ===== 6.NS: The Number System =====

  s(
    "CCSS.MATH.CONTENT.6.NS.A.1",
    "Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions, e.g., by using visual fraction models and equations to represent the problem. For example, create a story context for (2/3) / (3/4) and use a visual fraction model to show the quotient; use the relationship between multiplication and division to explain that (2/3) / (3/4) = 8/9 because 3/4 of 8/9 is 2/3. (In general, (a/b) / (c/d) = ad/bc.)"
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.B.2",
    "Fluently divide multi-digit numbers using the standard algorithm."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.B.3",
    "Fluently add, subtract, multiply, and divide multi-digit decimals using the standard algorithm for each operation."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.B.4",
    "Find the greatest common factor of two whole numbers less than or equal to 100 and the least common multiple of two whole numbers less than or equal to 12. Use the distributive property to express a sum of two whole numbers 1-100 with a common factor as a multiple of a sum of two whole numbers with no common factor."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.5",
    "Understand that positive and negative numbers are used together to describe quantities having opposite directions or values (e.g., temperature above/below zero, elevation above/below sea level, credits/debits, positive/negative electric charge); use positive and negative numbers to represent quantities in real-world contexts, explaining the meaning of 0 in each situation."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.6",
    "Understand a rational number as a point on the number line. Extend number line diagrams and coordinate axes familiar from previous grades to represent points on the line and in the plane with negative number coordinates."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.6.A",
    "Recognize opposite signs of numbers as indicating locations on opposite sides of 0 on the number line; recognize that the opposite of the opposite of a number is the number itself, e.g., -(-3) = 3, and that 0 is its own opposite."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.6.B",
    "Understand signs of numbers in ordered pairs as indicating locations in quadrants of the coordinate plane; recognize that when two ordered pairs differ only by signs, the locations of the points are related by reflections across one or both axes."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.6.C",
    "Find and position integers and other rational numbers on a horizontal or vertical number line diagram; find and position pairs of integers and other rational numbers on a coordinate plane."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.7",
    "Understand ordering and absolute value of rational numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.7.A",
    "Interpret statements of inequality as statements about the relative position of two numbers on a number line diagram."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.7.B",
    "Write, interpret, and explain statements of order for rational numbers in real-world contexts."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.7.C",
    "Understand the absolute value of a rational number as its distance from 0 on the number line; interpret absolute value as magnitude for a positive or negative quantity in a real-world situation."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.7.D",
    "Distinguish comparisons of absolute value from statements about order."
  ),
  s(
    "CCSS.MATH.CONTENT.6.NS.C.8",
    "Solve real-world and mathematical problems by graphing points in all four quadrants of the coordinate plane. Include use of coordinates and absolute value to find distances between points with the same first coordinate or the same second coordinate."
  ),

  // ===== 6.EE: Expressions & Equations =====

  s(
    "CCSS.MATH.CONTENT.6.EE.A.1",
    "Write and evaluate numerical expressions involving whole-number exponents."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.2",
    "Write, read, and evaluate expressions in which letters stand for numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.2.A",
    "Write expressions that record operations with numbers and with letters standing for numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.2.B",
    "Identify parts of an expression using mathematical terms (sum, term, product, factor, quotient, coefficient); view one or more parts of an expression as a single entity."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.2.C",
    "Evaluate expressions at specific values of their variables. Include expressions that arise from formulas used in real-world problems. Perform arithmetic operations, including those involving whole-number exponents, in the conventional order when there are no parentheses to specify a particular order (Order of Operations)."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.3",
    "Apply the properties of operations to generate equivalent expressions."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.A.4",
    "Identify when two expressions are equivalent (i.e., when the two expressions name the same number regardless of which value is substituted into them)."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.B.5",
    "Understand solving an equation or inequality as a process of answering a question: which values from a specified set, if any, make the equation or inequality true? Use substitution to determine whether a given number in a specified set makes an equation or inequality true."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.B.6",
    "Use variables to represent numbers and write expressions when solving a real-world or mathematical problem; understand that a variable can represent an unknown number, or, depending on the purpose at hand, any number in a specified set."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.B.7",
    "Solve real-world and mathematical problems by writing and solving equations of the form x + p = q and px = q for cases in which p, q and x are all nonnegative rational numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.B.8",
    "Write an inequality of the form x > c or x < c to represent a constraint or condition in a real-world or mathematical problem. Recognize that inequalities of the form x > c or x < c have infinitely many solutions; represent solutions of such inequalities on number line diagrams."
  ),
  s(
    "CCSS.MATH.CONTENT.6.EE.C.9",
    "Use variables to represent two quantities in a real-world problem that change in relationship to one another; write an equation to express one quantity, thought of as the dependent variable, in terms of the other quantity, thought of as the independent variable. Analyze the relationship between the dependent and independent variables using graphs and tables, and relate these to the equation."
  ),

  // ===== 6.G: Geometry =====

  s(
    "CCSS.MATH.CONTENT.6.G.A.1",
    "Find the area of right triangles, other triangles, special quadrilaterals, and polygons by composing into rectangles or decomposing into triangles and other shapes; apply these techniques in the context of solving real-world and mathematical problems."
  ),
  s(
    "CCSS.MATH.CONTENT.6.G.A.2",
    "Find the volume of a right rectangular prism with fractional edge lengths by packing it with unit cubes of the appropriate unit fraction edge lengths, and show that the volume is the same as would be found by multiplying the edge lengths of the prism. Apply the formulas V = l w h and V = b h to find volumes of right rectangular prisms with fractional edge lengths in the context of solving real-world and mathematical problems."
  ),
  s(
    "CCSS.MATH.CONTENT.6.G.A.3",
    "Draw polygons in the coordinate plane given coordinates for the vertices; use coordinates to find the length of a side joining points with the same first coordinate or the same second coordinate. Apply these techniques in the context of solving real-world and mathematical problems."
  ),
  s(
    "CCSS.MATH.CONTENT.6.G.A.4",
    "Represent three-dimensional figures using nets made up of rectangles and triangles, and use the nets to find the surface area of these figures. Apply these techniques in the context of solving real-world and mathematical problems."
  ),

  // ===== 6.SP: Statistics & Probability =====

  s(
    "CCSS.MATH.CONTENT.6.SP.A.1",
    "Recognize a statistical question as one that anticipates variability in the data related to the question and accounts for it in the answers. For example, \"How old am I?\" is not a statistical question, but \"How old are the students in my school?\" is a statistical question because one anticipates variability in students' ages."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.A.2",
    "Understand that a set of data collected to answer a statistical question has a distribution which can be described by its center, spread, and overall shape."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.A.3",
    "Recognize that a measure of center for a numerical data set summarizes all of its values with a single number, while a measure of variation describes how its values vary with a single number."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.4",
    "Display numerical data in plots on a number line, including dot plots, histograms, and box plots."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.5",
    "Summarize numerical data sets in relation to their context."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.5.A",
    "Reporting the number of observations."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.5.B",
    "Describing the nature of the attribute under investigation, including how it was measured and its units of measurement."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.5.C",
    "Giving quantitative measures of center (median and/or mean) and variability (interquartile range and/or mean absolute deviation), as well as describing any overall pattern and any striking deviations from the overall pattern with reference to the context in which the data were gathered."
  ),
  s(
    "CCSS.MATH.CONTENT.6.SP.B.5.D",
    "Relating the choice of measures of center and variability to the shape of the data distribution and the context in which the data were gathered."
  ),

  // ==========================================================================
  //  GRADE 7
  // ==========================================================================

  // ===== 7.RP: Ratios & Proportional Relationships =====

  s(
    "CCSS.MATH.CONTENT.7.RP.A.1",
    "Compute unit rates associated with ratios of fractions, including ratios of lengths, areas and other quantities measured in like or different units."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.2",
    "Recognize and represent proportional relationships between quantities."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.2.A",
    "Decide whether two quantities are in a proportional relationship, e.g., by testing for equivalent ratios in a table or graphing on a coordinate plane and observing whether the graph is a straight line through the origin."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.2.B",
    "Identify the constant of proportionality (unit rate) in tables, graphs, equations, diagrams, and verbal descriptions of proportional relationships."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.2.C",
    "Represent proportional relationships by equations. For example, if total cost t is proportional to the number n of items purchased at a constant price p, the relationship between the total cost and the number of items can be expressed as t = pn."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.2.D",
    "Explain what a point (x, y) on the graph of a proportional relationship means in terms of the situation, with special attention to the points (0, 0) and (1, r) where r is the unit rate."
  ),
  s(
    "CCSS.MATH.CONTENT.7.RP.A.3",
    "Use proportional relationships to solve multistep ratio and percent problems. Examples: simple interest, tax, markups and markdowns, gratuities and commissions, fees, percent increase and decrease, percent error."
  ),

  // ===== 7.NS: The Number System =====

  s(
    "CCSS.MATH.CONTENT.7.NS.A.1",
    "Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers; represent addition and subtraction on a horizontal or vertical number line diagram."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.1.A",
    "Describe situations in which opposite quantities combine to make 0. For example, a hydrogen atom has 0 charge because its two constituents are oppositely charged."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.1.B",
    "Understand p + q as the number located a distance |q| from p, in the positive or negative direction depending on whether q is positive or negative. Show that a number and its opposite have a sum of 0 (are additive inverses). Interpret sums of rational numbers by describing real-world contexts."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.1.C",
    "Understand subtraction of rational numbers as adding the additive inverse, p - q = p + (-q). Show that the distance between two rational numbers on the number line is the absolute value of their difference, and apply this principle in real-world contexts."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.1.D",
    "Apply properties of operations as strategies to add and subtract rational numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.2",
    "Apply and extend previous understandings of multiplication and division and of fractions to multiply and divide rational numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.2.A",
    "Understand that multiplication is extended from fractions to rational numbers by requiring that operations continue to satisfy the properties of operations, particularly the distributive property, leading to products such as (-1)(-1) = 1 and the rules for multiplying signed numbers. Interpret products of rational numbers by describing real-world contexts."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.2.B",
    "Understand that integers can be divided, provided that the divisor is not zero, and every quotient of integers (with non-zero divisor) is a rational number. If p and q are integers, then -(p/q) = (-p)/q = p/(-q). Interpret quotients of rational numbers by describing real-world contexts."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.2.C",
    "Apply properties of operations as strategies to multiply and divide rational numbers."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.2.D",
    "Convert a rational number to a decimal using long division; know that the decimal form of a rational number terminates in 0s or eventually repeats."
  ),
  s(
    "CCSS.MATH.CONTENT.7.NS.A.3",
    "Solve real-world and mathematical problems involving the four operations with rational numbers."
  ),

  // ===== 7.EE: Expressions & Equations =====

  s(
    "CCSS.MATH.CONTENT.7.EE.A.1",
    "Apply properties of operations as strategies to add, subtract, factor, and expand linear expressions with rational coefficients."
  ),
  s(
    "CCSS.MATH.CONTENT.7.EE.A.2",
    "Understand that rewriting an expression in different forms in a problem context can shed light on the problem and how the quantities in it are related. For example, a + 0.05a = 1.05a means that \"increase by 5%\" is the same as \"multiply by 1.05.\""
  ),
  s(
    "CCSS.MATH.CONTENT.7.EE.B.3",
    "Solve multi-step real-life and mathematical problems posed with positive and negative rational numbers in any form (whole numbers, fractions, and decimals), using tools strategically. Apply properties of operations to calculate with numbers in any form; convert between forms as appropriate; and assess the reasonableness of answers using mental computation and estimation strategies."
  ),
  s(
    "CCSS.MATH.CONTENT.7.EE.B.4",
    "Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems by reasoning about the quantities."
  ),
  s(
    "CCSS.MATH.CONTENT.7.EE.B.4.A",
    "Solve word problems leading to equations of the form px + q = r and p(x + q) = r, where p, q, and r are specific rational numbers. Solve equations of these forms fluently. Compare an algebraic solution to an arithmetic solution, identifying the sequence of the operations used in each approach."
  ),
  s(
    "CCSS.MATH.CONTENT.7.EE.B.4.B",
    "Solve word problems leading to inequalities of the form px + q > r or px + q < r, where p, q, and r are specific rational numbers. Graph the solution set of the inequality and interpret it in the context of the problem."
  ),

  // ===== 7.G: Geometry =====

  s(
    "CCSS.MATH.CONTENT.7.G.A.1",
    "Solve problems involving scale drawings of geometric figures, including computing actual lengths and areas from a scale drawing and reproducing a scale drawing at a different scale."
  ),
  s(
    "CCSS.MATH.CONTENT.7.G.A.2",
    "Draw (freehand, with ruler and protractor, and with technology) geometric shapes with given conditions. Focus on constructing triangles from three measures of angles or sides, noticing when the conditions determine a unique triangle, more than one triangle, or no triangle."
  ),
  s(
    "CCSS.MATH.CONTENT.7.G.A.3",
    "Describe the two-dimensional figures that result from slicing three-dimensional figures, as in plane sections of right rectangular prisms and right rectangular pyramids."
  ),
  s(
    "CCSS.MATH.CONTENT.7.G.B.4",
    "Know the formulas for the area and circumference of a circle and use them to solve problems; give an informal derivation of the relationship between the circumference and area of a circle."
  ),
  s(
    "CCSS.MATH.CONTENT.7.G.B.5",
    "Use facts about supplementary, complementary, vertical, and adjacent angles in a multi-step problem to write and solve simple equations for an unknown angle in a figure."
  ),
  s(
    "CCSS.MATH.CONTENT.7.G.B.6",
    "Solve real-world and mathematical problems involving area, volume and surface area of two- and three-dimensional objects composed of triangles, quadrilaterals, polygons, cubes, and right prisms."
  ),

  // ===== 7.SP: Statistics & Probability =====

  s(
    "CCSS.MATH.CONTENT.7.SP.A.1",
    "Understand that statistics can be used to gain information about a population by examining a sample of the population; generalizations about a population from a sample are valid only if the sample is representative of that population. Understand that random sampling tends to produce representative samples and support valid inferences."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.A.2",
    "Use data from a random sample to draw inferences about a population with an unknown characteristic of interest. Generate multiple samples (or simulated samples) of the same size to gauge the variation in estimates or predictions."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.B.3",
    "Informally assess the degree of visual overlap of two numerical data distributions with similar variabilities, measuring the difference between the centers by expressing it as a multiple of a measure of variability."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.B.4",
    "Use measures of center and measures of variability for numerical data from random samples to draw informal comparative inferences about two populations."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.5",
    "Understand that the probability of a chance event is a number between 0 and 1 that expresses the likelihood of the event occurring. Larger numbers indicate greater likelihood. A probability near 0 indicates an unlikely event, a probability around 1/2 indicates an event that is neither unlikely nor likely, and a probability near 1 indicates a likely event."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.6",
    "Approximate the probability of a chance event by collecting data on the chance process that produces it and observing its long-run relative frequency, and predict the approximate relative frequency given the probability."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.7",
    "Develop a probability model and use it to find probabilities of events. Compare probabilities from a model to observed frequencies; if the agreement is not good, explain possible sources of the discrepancy."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.7.A",
    "Develop a uniform probability model by assigning equal probability to all outcomes, and use the model to determine probabilities of events."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.7.B",
    "Develop a probability model (which may not be uniform) by observing frequencies in data generated from a chance process."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.8",
    "Find probabilities of compound events using organized lists, tables, tree diagrams, and simulation."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.8.A",
    "Understand that, just as with simple events, the probability of a compound event is the fraction of outcomes in the sample space for which the compound event occurs."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.8.B",
    "Represent sample spaces for compound events using methods such as organized lists, tables and tree diagrams. For an event described in everyday language (e.g., \"rolling double sixes\"), identify the outcomes in the sample space which compose the event."
  ),
  s(
    "CCSS.MATH.CONTENT.7.SP.C.8.C",
    "Design and use a simulation to generate frequencies for compound events."
  ),

  // ==========================================================================
  //  GRADE 8
  // ==========================================================================

  // ===== 8.NS: The Number System =====

  s(
    "CCSS.MATH.CONTENT.8.NS.A.1",
    "Know that numbers that are not rational are called irrational. Understand informally that every number has a decimal expansion; for rational numbers show that the decimal expansion repeats eventually, and convert a decimal expansion which repeats eventually into a rational number."
  ),
  s(
    "CCSS.MATH.CONTENT.8.NS.A.2",
    "Use rational approximations of irrational numbers to compare the size of irrational numbers, locate them approximately on a number line diagram, and estimate the value of expressions (e.g., pi squared)."
  ),

  // ===== 8.EE: Expressions & Equations =====

  s(
    "CCSS.MATH.CONTENT.8.EE.A.1",
    "Know and apply the properties of integer exponents to generate equivalent numerical expressions."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.A.2",
    "Use square root and cube root symbols to represent solutions to equations of the form x^2 = p and x^3 = p, where p is a positive rational number. Evaluate square roots of small perfect squares and cube roots of small perfect cubes. Know that the square root of 2 is irrational."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.A.3",
    "Use numbers expressed in the form of a single digit times an integer power of 10 to estimate very large or very small quantities, and to express how many times as much one is than the other."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.A.4",
    "Perform operations with numbers expressed in scientific notation, including problems where both decimal and scientific notation are used. Use scientific notation and choose units of appropriate size for measurements of very large or very small quantities. Interpret scientific notation that has been generated by technology."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.B.5",
    "Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.B.6",
    "Use similar triangles to explain why the slope m is the same between any two distinct points on a non-vertical line in the coordinate plane; derive the equation y = mx for a line through the origin and the equation y = mx + b for a line intercepting the vertical axis at b."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.7",
    "Solve linear equations in one variable."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.7.A",
    "Give examples of linear equations in one variable with one solution, infinitely many solutions, or no solutions. Show which of these possibilities is the case by successively transforming the given equation into simpler forms, until an equivalent equation of the form x = a, a = a, or a = b results (where a and b are different numbers)."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.7.B",
    "Solve linear equations with rational number coefficients, including equations whose solutions require expanding expressions using the distributive property and collecting like terms."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.8",
    "Analyze and solve pairs of simultaneous linear equations."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.8.A",
    "Understand that solutions to a system of two linear equations in two variables correspond to points of intersection of their graphs, because points of intersection satisfy both equations simultaneously."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.8.B",
    "Solve systems of two linear equations in two variables algebraically, and estimate solutions by graphing the equations. Solve simple cases by inspection."
  ),
  s(
    "CCSS.MATH.CONTENT.8.EE.C.8.C",
    "Solve real-world and mathematical problems leading to two linear equations in two variables."
  ),

  // ===== 8.F: Functions =====

  s(
    "CCSS.MATH.CONTENT.8.F.A.1",
    "Understand that a function is a rule that assigns to each input exactly one output. The graph of a function is the set of ordered pairs consisting of an input and the corresponding output."
  ),
  s(
    "CCSS.MATH.CONTENT.8.F.A.2",
    "Compare properties of two functions each represented in a different way (algebraically, graphically, numerically in tables, or by verbal descriptions). For example, given a linear function represented by a table of values and a linear function represented by an algebraic expression, determine which function has the greater rate of change."
  ),
  s(
    "CCSS.MATH.CONTENT.8.F.A.3",
    "Interpret the equation y = mx + b as defining a linear function, whose graph is a straight line; give examples of functions that are not linear."
  ),
  s(
    "CCSS.MATH.CONTENT.8.F.B.4",
    "Construct a function to model a linear relationship between two quantities. Determine the rate of change and initial value of the function from a description of a relationship or from two (x, y) values, including reading these from a table or from a graph. Interpret the rate of change and initial value of a linear function in terms of the situation it models, and in terms of its graph or a table of values."
  ),
  s(
    "CCSS.MATH.CONTENT.8.F.B.5",
    "Describe qualitatively the functional relationship between two quantities by analyzing a graph (e.g., where the function is increasing or decreasing, linear or nonlinear). Sketch a graph that exhibits the qualitative features of a function that has been described verbally."
  ),

  // ===== 8.G: Geometry =====

  s(
    "CCSS.MATH.CONTENT.8.G.A.1",
    "Verify experimentally the properties of rotations, reflections, and translations."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.1.A",
    "Lines are taken to lines, and line segments to line segments of the same length."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.1.B",
    "Angles are taken to angles of the same measure."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.1.C",
    "Parallel lines are taken to parallel lines."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.2",
    "Understand that a two-dimensional figure is congruent to another if the second can be obtained from the first by a sequence of rotations, reflections, and translations; given two congruent figures, describe a sequence that exhibits the congruence between them."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.3",
    "Describe the effect of dilations, translations, rotations, and reflections on two-dimensional figures using coordinates."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.4",
    "Understand that a two-dimensional figure is similar to another if the second can be obtained from the first by a sequence of rotations, reflections, translations, and dilations; given two similar two-dimensional figures, describe a sequence that exhibits the similarity between them."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.A.5",
    "Use informal arguments to establish facts about the angle sum and exterior angle of triangles, about the angles created when parallel lines are cut by a transversal, and the angle-angle criterion for similarity of triangles."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.B.6",
    "Explain a proof of the Pythagorean Theorem and its converse."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.B.7",
    "Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems in two and three dimensions."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.B.8",
    "Apply the Pythagorean Theorem to find the distance between two points in a coordinate system."
  ),
  s(
    "CCSS.MATH.CONTENT.8.G.C.9",
    "Know the formulas for the volumes of cones, cylinders, and spheres and use them to solve real-world and mathematical problems."
  ),

  // ===== 8.SP: Statistics & Probability =====

  s(
    "CCSS.MATH.CONTENT.8.SP.A.1",
    "Construct and interpret scatter plots for bivariate measurement data to investigate patterns of association between two quantities. Describe patterns such as clustering, outliers, positive or negative association, linear association, and nonlinear association."
  ),
  s(
    "CCSS.MATH.CONTENT.8.SP.A.2",
    "Know that straight lines are widely used to model relationships between two quantitative variables. For scatter plots that suggest a linear association, informally fit a straight line, and informally assess the model fit by judging the closeness of the data points to the line."
  ),
  s(
    "CCSS.MATH.CONTENT.8.SP.A.3",
    "Use the equation of a linear model to solve problems in the context of bivariate measurement data, interpreting the slope and intercept."
  ),
  s(
    "CCSS.MATH.CONTENT.8.SP.A.4",
    "Understand that patterns of association can also be seen in bivariate categorical data by displaying frequencies and relative frequencies in a two-way table. Construct and interpret a two-way table summarizing data on two categorical variables collected from the same subjects. Use relative frequencies calculated for rows or columns to describe possible association between the two variables."
  ),
];

// ---------------------------------------------------------------------------
//  Build the lookup map and export
// ---------------------------------------------------------------------------

export const CCSS_MATH_STANDARDS: StandardsFramework = {
  id: "CCSS-Math",
  name: "Common Core State Standards -- Mathematics",
  subjects: ["Math", "Mathematics"],
  grades: ["5", "6", "7", "8"],
  standards: Object.fromEntries(standards.map((std) => [std.code, std])),
};
