import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Code, FileText, UploadCloud } from "lucide-react";

export default function InterviewSetup() {
  const [mode, setMode] = useState("role");
  const [selectedRole, setSelectedRole] = useState("Frontend Developer");
  const [selectedLanguage, setSelectedLanguage] = useState("C/C++");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeData, setResumeData] = useState("");

  const navigate = useNavigate();

  const handleParseResume = async () => {
    if (!resumeFile) return alert("Select resume first");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    const res = await fetch("http://localhost:5000/api/resume/parse", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResumeData(data.text || "");
    alert("Resume parsed successfully");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-100 px-6">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full  max-w-4xl p-10 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/40"
      >

        {/* HEADER */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Mock Interview Setup
          </h2>
          <p className="text-gray-500 mt-2">
            Practice smarter. Prepare better.
          </p>
        </div>

        {/* MODE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          {[
            { id: "role", label: "Role-Based", icon: Briefcase },
            { id: "language", label: "Language-Based", icon: Code },
            { id: "resume", label: "Resume-Based", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setMode(item.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all
                ${active
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-white hover:shadow-md"
                  }`}
              >
                <Icon className="mb-2" />
                <p className="font-medium">{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* ROLE */}
        {mode === "role" && (
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl border focus:ring-2 focus:ring-purple-400"
          >
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>Full Stack Developer</option>
            <option>Data Analyst</option>
            <option>HR / Fresher</option>
          </select>
        )}

        {/* LANGUAGE */}
        {mode === "language" && (
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full mb-6 p-3 rounded-xl border focus:ring-2 focus:ring-purple-400"
          >
            <option>C/C++</option>
            <option>Java</option>
            <option>Python</option>
            <option>JavaScript</option>
          </select>
        )}

        {/* RESUME */}
        {mode === "resume" && (
          <div className="mb-6">

            <label className="block text-sm text-gray-600 mb-2">
              Upload Resume
            </label>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition">
                <UploadCloud size={18} />
                Upload
                <input
                  type="file"
                  hidden
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </label>

              <button
                onClick={handleParseResume}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:scale-105 transition"
              >
                Parse
              </button>

              <span className="text-sm text-gray-500 truncate">
                {resumeFile?.name || "No file selected"}
              </span>
            </div>
          </div>
        )}

        {/* CTA BUTTON */}
        <button
          onClick={() => {
            if (mode === "resume" && !resumeData) {
              return alert("Parse resume first");
            }

            navigate("/mock-interview/session", {
              state: {
                mode,
                value:
                  mode === "role"
                    ? selectedRole
                    : mode === "language"
                      ? selectedLanguage
                      : resumeFile?.name,
                resumeText: resumeData,
              },
            });
          }}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold hover:scale-105 transition shadow-lg"
        >
          🚀 Start Interview
        </button>

      </motion.div>
    </div>
  );
}