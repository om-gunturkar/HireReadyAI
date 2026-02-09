import { useState, lazy, Suspense } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { saveResume } from "../api/resume";
import { useLocation } from "react-router-dom";

/* LAZY LOAD TEMPLATES */
const ResumePDFClassic = lazy(() => import("../resume/ResumePDFClassic"));
const ResumePDFModern = lazy(() => import("../resume/ResumePDFModern"));
const ResumePDFStudent = lazy(() => import("../resume/ResumePDFStudent"));
const ResumePDFTech = lazy(() => import("../resume/ResumePDFTech"));
const ResumePDFCreative = lazy(() => import("../resume/ResumePDFCreative"));
const ResumePDFExecutive = lazy(() => import("../resume/ResumePDFExecutive"));

const getTemplate = (id) => {
  switch (id) {
    case "modern": return ResumePDFModern;
    case "student": return ResumePDFStudent;
    case "tech": return ResumePDFTech;
    case "creative": return ResumePDFCreative;
    case "executive": return ResumePDFExecutive;
    default: return ResumePDFClassic;
  }
};

export default function Resume() {
  const location = useLocation();
  const templateId = location.state?.templateId || "classic";
  const SelectedTemplate = getTemplate(templateId);

  /* FORM STATE */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [summary, setSummary] = useState("");

  const [education, setEducation] = useState([
    { degree: "", institute: "", score: "", year: "" }
  ]);
  const [skills, setSkills] = useState([""]);
  const [experience, setExperience] = useState([
    { role: "", company: "", duration: "", points: "" }
  ]);
  const [projects, setProjects] = useState([
    { title: "", tech: "", points: "" }
  ]);

  /* ADDERS */
  const addEducation = () =>
    setEducation([...education, { degree: "", institute: "", score: "", year: "" }]);
  const addSkill = () => setSkills([...skills, ""]);
  const addExperience = () =>
    setExperience([...experience, { role: "", company: "", duration: "", points: "" }]);
  const addProject = () =>
    setProjects([...projects, { title: "", tech: "", points: "" }]);

  const resumeData = {
    name, email, phone, linkedin, github, portfolio,
    summary, education, skills, experience, projects
  };

  const handleSaveToDB = async () => {
    await saveResume(resumeData);
    alert("Resume saved");
  };

  const handleGeneratePDF = async () => {
    const blob = await pdf(
      <SelectedTemplate data={resumeData} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "Resume"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* LEFT FORM */}
      <div className="w-1/2 h-full overflow-y-auto px-10 py-10">
        <h1 className="text-3xl font-bold text-purple-700 mb-6">
          Create Resume
        </h1>

        {/* PERSONAL */}
        <div className="section-box bg-white">
          <h2 className="font-semibold mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
            <input className="input" placeholder="LinkedIn" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
            <input className="input" placeholder="GitHub" value={github} onChange={e => setGithub(e.target.value)} />
            <input className="input" placeholder="Portfolio" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
          </div>
        </div>

        {/* SUMMARY */}
        <div className="section-box bg-white mt-6">
          <h2 className="font-semibold mb-2">Summary</h2>
          <textarea rows="4" className="input" value={summary} onChange={e => setSummary(e.target.value)} />
        </div>

        {/* EDUCATION */}
        <div className="section-box bg-white mt-6">
          <h2 className="font-semibold mb-4">Education</h2>
          {education.map((edu, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input className="input" placeholder="Degree" value={edu.degree}
                onChange={e => {
                  const c = [...education]; c[i].degree = e.target.value; setEducation(c);
                }} />
              <input className="input" placeholder="Institute" value={edu.institute}
                onChange={e => {
                  const c = [...education]; c[i].institute = e.target.value; setEducation(c);
                }} />
              <input className="input" placeholder="Score" value={edu.score}
                onChange={e => {
                  const c = [...education]; c[i].score = e.target.value; setEducation(c);
                }} />
              <input className="input" placeholder="Year" value={edu.year}
                onChange={e => {
                  const c = [...education]; c[i].year = e.target.value; setEducation(c);
                }} />
            </div>
          ))}
          <span className="add-btn" onClick={addEducation}>+ Add another education</span>
        </div>

        {/* SKILLS */}
        <div className="section-box bg-white mt-6">
          <h2 className="font-semibold mb-4">Skills</h2>
          {skills.map((s, i) => (
            <input key={i} className="input mb-3" value={s}
              onChange={e => {
                const c = [...skills]; c[i] = e.target.value; setSkills(c);
              }} />
          ))}
          <span className="add-btn" onClick={addSkill}>+ Add another skill</span>
        </div>

        {/* EXPERIENCE */}
        <div className="section-box bg-white mt-6">
          <h2 className="font-semibold mb-4">Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="space-y-3 mb-4">
              <input className="input" placeholder="Role" value={exp.role}
                onChange={e => {
                  const c = [...experience]; c[i].role = e.target.value; setExperience(c);
                }} />
              <input className="input" placeholder="Company" value={exp.company}
                onChange={e => {
                  const c = [...experience]; c[i].company = e.target.value; setExperience(c);
                }} />
              <input className="input" placeholder="Duration" value={exp.duration}
                onChange={e => {
                  const c = [...experience]; c[i].duration = e.target.value; setExperience(c);
                }} />
              <textarea rows="3" className="input" value={exp.points}
                onChange={e => {
                  const c = [...experience]; c[i].points = e.target.value; setExperience(c);
                }} />
            </div>
          ))}
          <span className="add-btn" onClick={addExperience}>+ Add another experience</span>
        </div>

        {/* PROJECTS */}
        <div className="section-box bg-white mt-6">
          <h2 className="font-semibold mb-4">Projects</h2>
          {projects.map((proj, i) => (
            <div key={i} className="space-y-3 mb-4">
              <input className="input" placeholder="Title" value={proj.title}
                onChange={e => {
                  const c = [...projects]; c[i].title = e.target.value; setProjects(c);
                }} />
              <input className="input" placeholder="Tech" value={proj.tech}
                onChange={e => {
                  const c = [...projects]; c[i].tech = e.target.value; setProjects(c);
                }} />
              <textarea rows="3" className="input" value={proj.points}
                onChange={e => {
                  const c = [...projects]; c[i].points = e.target.value; setProjects(c);
                }} />
            </div>
          ))}
          <span className="add-btn" onClick={addProject}>+ Add another project</span>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-4 pt-6">
          <button onClick={handleSaveToDB} className="w-1/2 py-3 bg-green-600 text-white rounded-lg">
            Save
          </button>
          <button onClick={handleGeneratePDF} className="w-1/2 py-3 bg-purple-600 text-white rounded-lg">
            Download PDF
          </button>
        </div>
      </div>

      {/* RIGHT PDF */}
      <div className="w-1/2 h-full bg-gray-200 flex justify-center items-start p-8 overflow-hidden">
        <div className="bg-white" style={{ width: "794px", height: "1123px" }}>
          <Suspense fallback={<div className="p-10 text-gray-400">Loading PDF…</div>}>
            <PDFViewer width="100%" height="1123px" showToolbar={false}>
              <SelectedTemplate data={resumeData} />
            </PDFViewer>
          </Suspense>
        </div>
      </div>

    </div>
  );
}
