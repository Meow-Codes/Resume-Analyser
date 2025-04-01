// backend/controllers/userController.js
const { User } = require("../models/users");

const saveUser = async (req, res) => {
  const { name, email, resumeText, extractedSkills, matchedJobs } = req.body;
  if (!name || !email || !resumeText || extractedSkills.length === 0) {
    return res.status(400).json({ message: "Necessary fields are missing" });
  }
  try {
    const newUser = new User({
      name,
      email,
      resumeText,
      extractedSkills,
      matchedJobs,
    });
    await newUser.save();
    console.log("User saved successfully:", newUser);
    res.json(newUser);
  } catch (err) {
    console.error("Error in saveUser:", err);
    res.status(500).json({ message: "Error saving user data", error: err.message });
  }
};

const refreshDatabase = async (req, res) => {
  const { target } = req.body;
  try {
    if (!target || !["jobs", "users", "both"].includes(target)) {
      return res
        .status(400)
        .json({ message: "Invalid target, use 'users', 'jobs', or 'both'" });
    }
    if (target === "jobs" || target === "both") {
      await Job.deleteMany({});
      console.log("Jobs database has been cleared");
    }
    if (target === "users" || target === "both") {
      await User.deleteMany({});
      console.log("Users database has been cleared");
    }
    console.log(`Database has been refreshed for ${target}`);
    res.status(200).json({ message: `Database has been refreshed for ${target}` });
  } catch (err) {
    console.error("Error in refreshDatabase:", err);
    res
      .status(500)
      .json({ message: "Error in refreshing the database", error: err.message });
  }
};

module.exports = { saveUser, refreshDatabase };