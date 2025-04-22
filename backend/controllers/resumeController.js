// backend/controllers/resumeController.js
const pdfparser = require("pdf-parse");
const { extractSkills } = require("../utils/skills");

const uploadResume = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "File not found" });
  try {
    const text = await pdfparser(req.file.buffer);
    const extractedText = text.text.trim();
    console.log("Extracted text from PDF:", extractedText); // Log raw text
    res.json({ extractedText });
  } catch (err) {
    console.error("Error in uploadResume:", err);
    res.status(500).json({ message: "Error extracting text", error: err.message });
  }
};

const extractSkillsFromText = async (req, res) => {
  const { extractedText } = req.body;
  if (!extractedText)
    return res.status(400).json({ message: "Extracted text is required" });
  try {
    const skills = extractSkills(extractedText);
    res.json({ skills });
  } catch (err) {
    console.error("Error in extractSkillsFromText:", err);
    res.status(500).json({ message: "Error extracting skills", error: err.message });
  }
};

module.exports = { uploadResume, extractSkillsFromText };