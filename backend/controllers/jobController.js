// backend/controllers/jobController.js
const { Job } = require("../models/users");
const { extractSkills } = require("../utils/skills");

const matchJobs = async (req, res) => {
  const { skills, threshold = 40 } = req.body;
  if (!skills || !Array.isArray(skills))
    return res.status(400).json({ message: "Skills array is required" });
  if (typeof threshold !== "number" || threshold < 0 || threshold > 100) {
    return res
      .status(400)
      .json({ message: "Threshold must be a number between 0 and 100" });
  }
  try {
    const jobs = await Job.find();
    console.log("Jobs fetched from DB:", jobs);
    const matchedJobs = jobs
      .map((job) => {
        const matchedSkills = job.skills.filter((skill) =>
          skills.includes(skill)
        );
        const matchPercentage =
          job.skills.length > 0
            ? (matchedSkills.length / job.skills.length) * 100
            : 0;
        return {
          title: job.title,
          matchPercentage: matchPercentage.toFixed(2),
          matchedSkills,
          missingSkills: job.skills.filter((skill) => !skills.includes(skill)),
        };
      })
      .filter((job) => parseFloat(job.matchPercentage) >= threshold)
      .sort((a, b) => parseFloat(b.matchPercentage) - parseFloat(a.matchPercentage));
    console.log("Matched Jobs:", matchedJobs);
    res.json(matchedJobs);
  } catch (err) {
    console.error("Error in matchJobs:", err);
    res.status(500).json({ message: "Error matching jobs", error: err.message });
  }
};

const uploadJob = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({ message: "Title and description are required" });
  try {
    const extractedSkills = extractSkills(description);
    const newJob = new Job({ title, description, skills: extractedSkills });
    await newJob.save();
    console.log("Job saved successfully:", newJob);
    res.json(newJob);
  } catch (err) {
    console.error("Error in uploadJob:", err);
    res.status(500).json({ message: "Error saving job data", error: err.message });
  }
};

module.exports = { matchJobs, uploadJob };