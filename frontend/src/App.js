import { useState } from "react";
import axios from "axios";

export default function App() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState("");
    const [skills, setSkills] = useState([]);
    const [matchedJobs, setMatchedJobs] = useState([]);
    const [jobTitle, setJobTitle] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Please select a file");
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("resume", file);
            const { data } = await axios.post("http://localhost:5000/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setText(data.extractedText);
            console.log("File uploaded successfully:", data.extractedText);
        } catch (err) {
            console.error("Upload error:", err);
            alert(`Error uploading file: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleExtractedSkills = async () => {
        if (!text) return alert("No text to process");
        setLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/extracted-skills", { extractedText: text });
            setSkills(data.skills);
            console.log("Extracted Skills:", data.skills);
            alert("Extracted Skills: " + data.skills.join(", "));
        } catch (err) {
            console.error("Extract skills error:", err);
            alert(`Error extracting skills: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleJobMatching = async () => {
        if (!skills.length) return alert("No skills to match jobs with");
        setLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/match-jobs", { skills });
            setMatchedJobs(data);
            console.log("Matched Jobs:", data);
            const jobDisplay = data.map(job =>
                `${job.title}: ${job.matchPercentage}% match\n` +
                `Matched: ${job.matchedSkills.join(", ") || "None"}\n` +
                `Missing: ${job.missingSkills.join(", ") || "None"}`
            ).join("\n\n");
            alert(jobDisplay || "No jobs matched (threshold: 40%)");
        } catch (err) {
            console.error("Match jobs error:", err);
            alert(`Error matching jobs: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async () => {
        const name = prompt("Enter Your Name: ");
        const email = prompt("Enter Your Email: ");
        if (!name || !email) return alert("Name and email are required!");
        if (!email.includes("@")) return alert("Invalid email!");
        setLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/save-user", {
                name,
                email,
                resumeText: text,
                extractedSkills: skills,
                matchedJobs
            });
            console.log("Saved user data:", data);
            alert("User saved successfully!");
        } catch (err) {
            console.error("Save user error:", err);
            alert(`Error saving user: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJob = async () => {
        if (!jobTitle || !jobDescription) return alert("Job title and description are required!");
        setLoading(true);
        try {
            const { data } = await axios.post("http://localhost:5000/upload-jd", {
                title: jobTitle,
                description: jobDescription
            });
            console.log("Job added successfully:", data);
            alert(`Job "${data.title}" added successfully! Skills extracted: ${data.skills.join(", ")}`);
            setJobTitle("");
            setJobDescription("");
            // Auto-refresh matches if skills exist
            if (skills.length) await handleJobMatching();
        } catch (err) {
            console.error("Add job error:", err);
            alert(`Error adding job: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center p-10">
            <h2 className="text-2xl mb-4">Resume Analyzer</h2>

            <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" disabled={loading} />
            <button className={`bg-blue-500 text-white px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleUpload} disabled={loading}>
                {loading ? "Uploading..." : "Upload Resume"}
            </button>
            <button className={`bg-blue-500 text-white px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleExtractedSkills} disabled={loading}>
                {loading ? "Processing..." : "Extract Skills"}
            </button>
            <button className={`bg-blue-500 text-white px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleJobMatching} disabled={loading}>
                {loading ? "Matching..." : "Match Jobs"}
            </button>
            <button className={`bg-blue-500 text-white px-4 py-2 mt-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleSaveUser} disabled={loading}>
                {loading ? "Saving..." : "Save User"}
            </button>

            <div className="mt-8 w-full max-w-md">
                <h3 className="text-xl mb-2">Add a Job</h3>
                <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Job Title"
                    className="w-full p-2 mb-2 border rounded"
                    disabled={loading}
                />
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Job Description (e.g., MongoDB, Node.js, React)"
                    className="w-full p-2 mb-2 border rounded h-24"
                    disabled={loading}
                />
                <button className={`bg-green-500 text-white px-4 py-2 w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} onClick={handleAddJob} disabled={loading}>
                    {loading ? "Adding..." : "Add Job"}
                </button>
            </div>

            <pre className="mt-4 bg-gray-100 p-4 w-full max-w-2xl">{text}</pre>

            {matchedJobs.length > 0 && (
                <div className="mt-4 w-full max-w-2xl">
                    <h3 className="text-xl mb-2">Matched Jobs:</h3>
                    {matchedJobs.map((job, index) => (
                        <div key={index} className="bg-gray-100 p-2 mt-2 rounded">
                            <p><strong>{job.title}</strong>: {job.matchPercentage}% match</p>
                            <p>Matched: {job.matchedSkills.join(", ") || "None"}</p>
                            <p>Missing: {job.missingSkills.join(", ") || "None"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}