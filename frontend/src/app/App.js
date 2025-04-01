import { useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Slider } from "../components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { cn } from "../lib/utils";

export default function App() {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [skills, setSkills] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [threshold, setThreshold] = useState(40);
  const [refreshTarget, setRefreshTarget] = useState("");

  const handleUpload = async () => {
    if (!files.length) return alert("Please select at least one file");
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("resume", file));
      const { data } = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setText(data.extractedText);
      console.log("Files uploaded successfully:", data.extractedText);
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        `Error uploading files: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExtractedSkills = async () => {
    if (!text) return alert("No text to process");
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/extracted-skills",
        { extractedText: text }
      );
      setSkills(data.skills);
      console.log("Extracted Skills:", data.skills);
      alert("Extracted Skills: " + data.skills.join(", "));
    } catch (err) {
      console.error("Extract skills error:", err);
      alert(
        `Error extracting skills: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJobMatching = async () => {
    if (!skills.length) return alert("No skills to match jobs with");
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/match-jobs", {
        skills,
        threshold,
      });
      setMatchedJobs(data);
      console.log("Matched Jobs:", data);
      if (!data.length) alert(`No jobs matched (threshold: ${threshold}%)`);
    } catch (err) {
      console.error("Match jobs error:", err);
      alert(
        `Error matching jobs: ${err.response?.data?.message || err.message}`
      );
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
        matchedJobs,
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
    if (!jobTitle || !jobDescription)
      return alert("Job title and description are required!");
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/upload-jd", {
        title: jobTitle,
        description: jobDescription,
      });
      console.log("Job added successfully:", data);
      alert(
        `Job "${
          data.title
        }" added successfully! Skills extracted: ${data.skills.join(", ")}`
      );
      setJobTitle("");
      setJobDescription("");
      if (skills.length) await handleJobMatching();
    } catch (err) {
      console.error("Add job error:", err);
      alert(`Error adding job: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!refreshTarget) return alert("Please select a database to refresh");
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/refresh-db", {
        target: refreshTarget,
      });
      console.log("Database Refresh Response:", data);
      alert(data.message);
      if (refreshTarget === "jobs" || refreshTarget === "both") {
        setMatchedJobs([]);
      }
      if (refreshTarget === "users" || refreshTarget === "both") {
        setText("");
        setSkills([]);
      }
    } catch (err) {
      console.error("Database Refresh error:", err);
      alert(
        `Error in refreshing the database: ${
          err.response?.data?.message || err.message
        }`
      );
    } finally {
      setLoading(false);
      setRefreshTarget("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800">
            Resume Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="resume-upload">Upload Resume(s)</Label>
            <Input
              id="resume-upload"
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              disabled={loading}
              className="w-full"
            />
            <Button
              onClick={handleUpload}
              disabled={loading || !files.length}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Uploading..." : "Upload Resume(s)"}
            </Button>
          </div>

          {/* Extract Skills */}
          <Button
            onClick={handleExtractedSkills}
            disabled={loading || !text}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Processing..." : "Extract Skills"}
          </Button>

          {/* Threshold and Match Jobs */}
          <div className="space-y-2">
            <Label>Match Threshold: {threshold}%</Label>
            <Slider
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0])}
              min={0}
              max={100}
              step={1}
              disabled={loading}
              className="w-full"
            />
            <Button
              onClick={handleJobMatching}
              disabled={loading || !skills.length}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Matching..." : "Match Jobs"}
            </Button>
          </div>

          {/* Save User */}
          <Button
            onClick={handleSaveUser}
            disabled={loading || !text || !skills.length}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Save User"}
          </Button>

          {/* Refresh Database */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh DB"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Refresh Database</AlertDialogTitle>
                <AlertDialogDescription>
                  Select the database to refresh and confirm your action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <Label>Select Target</Label>
                <select
                  value={refreshTarget}
                  onChange={(e) => setRefreshTarget(e.target.value)}
                  className="w-full p-2 border rounded"
                  disabled={loading}
                >
                  <option value="">Select an option</option>
                  <option value="jobs">Jobs</option>
                  <option value="users">Users</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRefresh}
                  disabled={!refreshTarget || loading}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Job Section */}
          <div className="space-y-2">
            <h3 className="text-xl text-gray-800">Add a Job</h3>
            <Label htmlFor="job-title">Job Title</Label>
            <Input
              id="job-title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Job Title"
              disabled={loading}
              className="w-full"
            />
            <Label htmlFor="job-description">Job Description</Label>
            <Textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g., MongoDB, Node.js, React"
              disabled={loading}
              className="w-full h-24"
            />
            <Button
              onClick={handleAddJob}
              disabled={loading || !jobTitle || !jobDescription}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Adding..." : "Add Job"}
            </Button>
          </div>

          {/* Extracted Text */}
          {text && (
            <div className="space-y-2">
              <h3 className="text-xl text-gray-800">Extracted Text</h3>
              <pre className="bg-gray-100 p-4 rounded w-full max-h-60 overflow-auto">
                {text}
              </pre>
            </div>
          )}

          {/* Matched Jobs */}
          {matchedJobs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xl text-gray-800">Matched Jobs</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Match %</TableHead>
                    <TableHead>Matched Skills</TableHead>
                    <TableHead>Missing Skills</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchedJobs.map((job, index) => (
                    <TableRow key={index}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>{job.matchPercentage}%</TableCell>
                      <TableCell>
                        {job.matchedSkills.join(", ") || "None"}
                      </TableCell>
                      <TableCell>
                        {job.missingSkills.join(", ") || "None"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
