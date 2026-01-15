import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InterviewSetup() {
  const [mode, setMode] = useState("role");
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedLanguage, setSelectedLanguage] = useState("C");
  const [resumeFile, setResumeFile] = useState(null);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 border border-purple-100">

        <h2 className="text-2xl font-semibold text-center text-purple-700 mb-1">
          Mock Interview Setup
        </h2>

        <p className="text-center text-gray-600 mb-8 text-sm">
          Practice interviews based on role, language, or resume
        </p>

        {/* Interview Mode */}
        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={mode === "role"}
              onChange={() => setMode("role")}
              className="accent-purple-600"
            />
            <span className="text-sm font-medium text-purple-700">
              Role-Based Interview
            </span>
          </label>

          <label className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={mode === "language"}
              onChange={() => setMode("language")}
              className="accent-purple-600"
            />
            <span className="text-sm font-medium text-purple-700">
              Language-Based Interview
            </span>
          </label>

          <label className="flex items-center gap-3 bg-purple-50 p-4 rounded-lg border border-purple-100 cursor-pointer">
            <input
              type="radio"
              name="mode"
              checked={mode === "resume"}
              onChange={() => setMode("resume")}
              className="accent-purple-600"
            />
            <span className="text-sm font-medium text-purple-700">
              Resume-Based Interview
            </span>
          </label>
        </div>

        {/* Conditional Inputs */}
        {mode === "role" && (
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full mb-6 p-3 rounded-md bg-gray-50 border border-gray-300"
          >
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Data Analyst</option>
            <option>HR / Fresher</option>
          </select>
        )}

        {mode === "language" && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full mb-6 p-3 rounded-md bg-gray-50 border border-gray-300"
          >
            <option>C</option>
            <option>C++</option>
            <option>Java</option>
            <option>Python</option>
            <option>JavaScript</option>
            <option>Ruby</option>
          </select>
        )}

        {/* ✅ Resume Upload with Button */}
        {mode === "resume" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Upload Resume
            </label>

            <div className="flex items-center gap-4">
              {/* Hidden input */}
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="hidden"
              />

              {/* Custom button */}
              <label
                htmlFor="resumeUpload"
                className="
                  cursor-pointer px-5 py-2.5 rounded-lg
                  bg-gray-100 text-gray-700 text-sm font-medium
                  hover:bg-gray-200 transition
                  border border-gray-300
                "
              >
                Choose Resume
              </label>

              {/* File name */}
              <span className="text-sm text-gray-500 truncate max-w-[200px]">
                {resumeFile ? resumeFile.name : "No file chosen"}
              </span>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={() =>
            navigate("/mock-interview/session", {
              state: {
                mode,
                value:
                  mode === "role"
                    ? selectedRole
                    : mode === "language"
                    ? selectedLanguage
                    : resumeFile?.name || "Resume",
              },
            })
          }
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Start Interview
        </button>

      </div>
    </div>
  );
}
