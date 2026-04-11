import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, Code, FileText, UploadCloud, ArrowLeft } from "lucide-react";

const modes = [
  { id: "role", label: "Role-Based", icon: Briefcase, text: "Frontend, backend, full stack, analyst, and fresher tracks." },
  { id: "language", label: "Language-Based", icon: Code, text: "Practice focused coding interviews across core languages." },
  { id: "resume", label: "Resume-Based", icon: FileText, text: "Upload resume content and get personalized interview flow." },
];

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

  const selectedValue =
    mode === "role"
      ? selectedRole
      : mode === "language"
        ? selectedLanguage
        : resumeFile?.name;

  return (
    <div className="app-shell">
      <div className="page-frame flex min-h-[100dvh] flex-col justify-center py-8 sm:py-10">
        <Link
          to="/home"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 transition hover:text-teal-950"
        >
          <ArrowLeft size={18} aria-hidden />
          Back to dashboard
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card w-full rounded-[2.2rem] px-6 py-8 sm:px-10 sm:py-10"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div>
              <p className="eyebrow">Interview Setup</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">Choose the right interview mode and start with confidence.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                Same live pipeline as production-style screeners: mode selection, validated inputs, then a gated session with camera and speech. Your choice is passed into the next screen unchanged.
              </p>

              <div className="mt-8 grid gap-4">
                {modes.map((item) => {
                  const Icon = item.icon;
                  const active = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`text-left transition ${active ? "scale-[1.01]" : ""}`}
                    >
                      <div className={`rounded-[1.6rem] border p-5 ${active ? "border-teal-300 bg-gradient-to-r from-teal-600 to-blue-600 text-white shadow-[0_18px_34px_rgba(15,118,110,0.22)]" : "panel-card"}`}>
                        <div className="flex items-start gap-4">
                          <div className={`rounded-2xl p-3 ${active ? "bg-white/20" : "bg-slate-100"}`}>
                            <Icon size={22} className={active ? "text-white" : "text-slate-700"} />
                          </div>
                          <div>
                            <p className={`text-lg font-semibold ${active ? "text-white" : "text-slate-900"}`}>{item.label}</p>
                            <p className={`mt-2 text-sm leading-7 ${active ? "text-white/85" : "text-slate-600"}`}>{item.text}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="panel-card rounded-[1.9rem] p-6 sm:p-7">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Selected Mode</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{modes.find((item) => item.id === mode)?.label}</h2>

              <div className="mt-6 space-y-5">
                {mode === "role" && (
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="field">
                    <option>Frontend Developer</option>
                    <option>Backend Developer</option>
                    <option>Full Stack Developer</option>
                    <option>Data Analyst</option>
                    <option>HR / Fresher</option>
                  </select>
                )}

                {mode === "language" && (
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="field">
                    <option>C/C++</option>
                    <option>Java</option>
                    <option>Python</option>
                    <option>JavaScript</option>
                  </select>
                )}

                {mode === "resume" && (
                  <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-4">
                    <p className="text-sm font-medium text-slate-700">Upload Resume</p>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="secondary-btn inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm">
                        <UploadCloud size={18} />
                        Upload
                        <input type="file" hidden onChange={(e) => setResumeFile(e.target.files[0])} />
                      </label>
                      <button type="button" onClick={handleParseResume} className="primary-btn px-5 py-2 text-sm">
                        Parse Resume
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-500">{resumeFile?.name || "No file selected"}</p>
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/75 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Interview Summary</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{selectedValue || "Choose your interview input"}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  The selected domain and your existing analysis data will continue into the live interview and score report.
                </p>
              </div>

              <button
                onClick={() => {
                  if (mode === "resume" && !resumeData) return alert("Parse resume first");

                  navigate("/rules", {
                    state: {
                      mode,
                      value: selectedValue,
                      resumeText: resumeData,
                    },
                  });
                }}
                className="primary-btn mt-8 w-full px-6 py-3.5 text-base"
              >
                Start Interview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
