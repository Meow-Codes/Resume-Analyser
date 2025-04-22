// backend/routes/api.js
const express = require("express");
const router = express.Router();
const upload = require("../utils/multerConfig");
const {
  uploadResume,
  extractSkillsFromText,
} = require("../controllers/resumeController");
const { matchJobs, uploadJob } = require("../controllers/jobController");
const { saveUser, refreshDatabase } = require("../controllers/userController");

router.get("/", (req, res) =>
  res.send("AI Resume Analyser is working fine...")
);
router.post("/upload", upload.single("resume"), uploadResume);
router.post("/extracted-skills", extractSkillsFromText);
router.post("/match-jobs", matchJobs);
router.post("/save-user", saveUser);
router.post("/upload-jd", uploadJob);
router.post("/refresh-db", refreshDatabase);

module.exports = router;