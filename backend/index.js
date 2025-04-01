require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pdfparser = require("pdf-parse");
const multer = require("multer");
const mongoose = require("mongoose");
const natural = require("natural");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const skillAliases = {
    "React": ["React.js", "ReactJS", "React JS"],
    "Node.js": ["Node", "NodeJS", "Node JS"],
    "JavaScript": ["JS"],
    "Python": ["Py"],
    "Machine Learning": ["ML"],
    "Artificial Intelligence": ["AI"],
    "Data Science": ["DS"],
    "MongoDB": ["Mongo", "Mongodb"],
    "PostgreSQL": ["Postgres", "Postgre"],
    "Angular JS": ["Angular", "AngularJS", "Angular.js"],
    "Express JS": ["Express.js", "Express", "ExpressJS"]
};

const skillset = new Set([
    "C", "C++", "Java", "JavaScript", "Python", "React",
    "Node.js", "MongoDB", "SQL", "PostgreSQL",
    "Machine Learning", "Artificial Intelligence", "Data Science",
    "Docker", "Kubernetes", "Angular JS", "Express JS"
]); 

const extractSkills = (text) => {
    console.log("Raw text:", text);
    const segments = text.split(",").map(segment => segment.trim());
    const extracted = new Set();

    segments.forEach(segment => {
        const normalizedSegment = segment.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[-_\s]/g, "");
        const words = normalizedSegment.split(/[^a-zA-Z0-9+#.]+/);
        const normalizedSkillset = new Map([...skillset].map(skill => [skill.toLowerCase().replace(/[-_\s]/g, ""), skill]));

        words.forEach(word => {
            const normalizedWord = word.replace(/[-_\s]/g, "");
            if (normalizedSkillset.has(normalizedWord)) {
                extracted.add(normalizedSkillset.get(normalizedWord));
            } else {
                for (const [skill, aliases] of Object.entries(skillAliases)) {
                    const normalizedSkill = skill.toLowerCase().replace(/[-_\s]/g, "");
                    const normalizedAliases = aliases.map(a => a.toLowerCase().replace(/[-_\s]/g, ""));
                    if (normalizedSkill === normalizedWord || normalizedAliases.includes(normalizedWord)) {
                        extracted.add(skill);
                    }
                }
            }
        });

        const fullSegmentLower = segment.toLowerCase().trim();
        for (const [skill, aliases] of Object.entries(skillAliases)) {
            if (aliases.map(a => a.toLowerCase()).includes(fullSegmentLower) || skill.toLowerCase() === fullSegmentLower) {
                extracted.add(skill);
            }
        }
    });

    const extractedSkills = Array.from(extracted);
    console.log("Extracted skills:", extractedSkills);
    return extractedSkills;
};

app.get("/", (req, res) => res.send("AI Resume Analyser is working fine..."));

app.post("/extracted-skills", async (req, res) => {
    const { extractedText } = req.body;
    if (!extractedText) return res.status(400).json({ message: "Extracted text is required" });
    try {
        const skills = extractSkills(extractedText);
        res.json({ skills });
    } catch (err) {
        console.error("Error in /extracted-skills:", err);
        res.status(500).json({ message: "Error extracting skills", error: err.message });
    }
});

app.post("/match-jobs", async (req, res) => {
    const { skills, threshold = 40 } = req.body;
    if (!skills || !Array.isArray(skills)) return res.status(400).json({ message: "Skills array is required" });
    if (typeof threshold !== "number" || threshold < 0 || threshold > 100) {
        return res.status(400).json({ message: "Threshold must be a number between 0 and 100" });
    }
    try {
        const jobs = await Job.find();
        console.log("Jobs fetched from DB:", jobs);
        const matchedJobs = jobs.map(job => {
            const matchedSkills = job.skills.filter(skill => skills.includes(skill));
            const matchPercentage = job.skills.length > 0 ? (matchedSkills.length / job.skills.length) * 100 : 0;
            return {
                title: job.title,
                matchPercentage: matchPercentage.toFixed(2),
                matchedSkills,
                missingSkills: job.skills.filter(skill => !skills.includes(skill))
            };
        }).filter(job => parseFloat(job.matchPercentage) >= threshold);
        matchedJobs.sort((a, b) => parseFloat(b.matchPercentage) - parseFloat(a.matchPercentage));
        console.log("Matched Jobs:", matchedJobs);
        res.json(matchedJobs);
    } catch (err) {
        console.error("Error in /match-jobs:", err);
        res.status(500).json({ message: "Error matching jobs", error: err.message });
    }
});

app.post("/upload", upload.single("resume"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "File not found" });
    try {
        const text = await pdfparser(req.file.buffer);
        res.json({ extractedText: text.text.trim() });
    } catch (err) {
        console.error("Error in /upload:", err);
        res.status(500).json({ message: "Error extracting text", error: err.message });
    }
});

const { User, Job } = require("./models/users");

app.post("/save-user", async (req, res) => {
    const { name, email, resumeText, extractedSkills, matchedJobs } = req.body;
    if (!name || !email || !resumeText || extractedSkills.length === 0) {
        return res.status(400).json({ message: "Necessary fields are missing" });
    }
    try {
        const newUser = new User({ name, email, resumeText, extractedSkills, matchedJobs });
        await newUser.save();
        console.log("User saved successfully:", newUser);
        res.json(newUser);
    } catch (err) {
        console.error("Error in /save-user:", err);
        res.status(500).json({ message: "Error saving user data", error: err.message });
    }
});

app.post("/upload-jd", async (req, res) => {
    const { title, description } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description are required" });
    try {
        const extractedSkills = extractSkills(description);
        const newJob = new Job({ title, description, skills: extractedSkills });
        await newJob.save();
        console.log("Job saved successfully:", newJob);
        res.json(newJob);
    } catch (err) {
        console.error("Error in /upload-jd:", err);
        res.status(500).json({ message: "Error saving job data", error: err.message });
    }
});

app.post("/refresh-db", async (req, res) => {
    const { target } = req.body;
    try {
        if (!target || !["jobs", "users", "both"].includes(target)) {
            return res.status(400).json({ message: "Invalid target, use 'users', 'jobs', or 'both'" });
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
        console.error("Error in refreshing the requested Database:", err);
        res.status(500).json({ message: "Error in refreshing the requested Database", error: err.message });
    }
});

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB")).catch(err => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));