const { skillset, normalizedSkillMap } = require("./skillData");

const extractSkills = (text) => {
  console.log("Raw text:", text);
  // Split by multiple delimiters: comma, semicolon, newline, or multiple spaces
  const segments = text
    .replace(/[\t•◦\-–—]/g, " ") // Replace tabs, bullets, dashes with spaces (escaped hyphen)
    .split(/[,;\n]|\s{2,}/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 2); // Ignore short segments
  console.log("Segments:", segments);
  const extracted = new Set();

  segments.forEach((segment) => {
    const normalizedSegment = segment
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[-_\s]/g, "");
    const words = normalizedSegment.split(/[^a-zA-Z0-9+#.]+/);
    console.log(`Words from segment "${segment}":`, words);

    words.forEach((word) => {
      const normalizedWord = word.replace(/[-_\s]/g, "");
      if (normalizedSkillMap.has(normalizedWord)) {
        extracted.add(normalizedSkillMap.get(normalizedWord));
      }
    });

    // Check full segment against normalized map
    if (normalizedSkillMap.has(normalizedSegment)) {
      extracted.add(normalizedSkillMap.get(normalizedSegment));
    }
  });

  const extractedSkills = Array.from(extracted);
  console.log("Extracted skills:", extractedSkills);
  return extractedSkills;
};

module.exports = { extractSkills, skillset };