const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    resumeText: String,
    extractedSkills: [String],
    matchedJobs: [
      {
        title: String,
        matchPercentage: Number,
        matchedSkills: [String],
        missingSkills: [String],
      },
    ],
  },
  { timestamps: true }
);

const JobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    skills: [String],
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.model("User", UserSchema),
  Job: mongoose.model("Job", JobSchema),
};
