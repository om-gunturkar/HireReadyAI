import { useState } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import ResumePDF from "../resume/ResumePDF";
import { saveResume } from "../api/resume";

export default function Resume() {
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

  const isFormValid = () => {
    if (
      !name || !email || !phone || !linkedin || !github || !portfolio || !summary
    ) return false;

    if (skills.some(s => !s)) return false;
    if (education.some(e => !e.degree || !e.institute || !e.score || !e.year)) return false;
    if (experience.some(e => !e.role || !e.company || !e.duration || !e.points)) return false;
    if (projects.some(p => !p.title || !p.tech || !p.points)) return false;

    return true;
  };

  const handleSaveToDB = async () => {
    if (!isFormValid()) return;
    await saveResume({
      name, email, phone, linkedin, github, portfolio,
      summary, education, skills, experience, projects
    });
    alert("Resume saved");
  };

  const handleGeneratePDF = async () => {
    if (!isFormValid()) {
      alert("Please fill all fields before downloading PDF");
      return;
    }

    const blob = await pdf(
      <ResumePDF data={{
        name, email, phone, linkedin, github, portfolio,
        summary, education, skills, experience, projects
      }} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}_Resume.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addEducation = () =>
    setEducation([...education, { degree: "", institute: "", score: "", year: "" }]);
  const addSkill = () => setSkills([...skills, ""]);
  const addExperience = () =>
    setExperience([...experience, { role: "", company: "", duration: "", points: "" }]);
  const addProject = () =>
    setProjects([...projects, { title: "", tech: "", points: "" }]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* LEFT FORM */}
      <div className="w-1/2 h-full overflow-y-auto px-10 py-10">
        <h1 className="text-3xl font-bold text-purple-700 mb-8">
          Create Resume
        </h1>

        <div className="max-w-4xl mx-auto space-y-8">

          {/* PERSONAL DETAILS */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-4">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input" required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
              <input className="input" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="input" required placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              <input className="input" required placeholder="LinkedIn URL" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              <input className="input" required placeholder="GitHub URL" value={github} onChange={e => setGithub(e.target.value)} />
              <input className="input" required placeholder="Portfolio URL" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
            </div>
          </div>

          {/* SUMMARY */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-2">Summary</h2>
            <textarea
              required
              rows="4"
              className="input"
              placeholder="Brief professional summary"
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>

          {/* EDUCATION */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-4">Education</h2>
            {education.map((edu, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input className="input" required placeholder="Degree" value={edu.degree}
                  onChange={e => {
                    const copy = [...education];
                    copy[i].degree = e.target.value;
                    setEducation(copy);
                  }} />
                <input className="input" required placeholder="Institute" value={edu.institute}
                  onChange={e => {
                    const copy = [...education];
                    copy[i].institute = e.target.value;
                    setEducation(copy);
                  }} />
                <input className="input" required placeholder="CGPA / %" value={edu.score}
                  onChange={e => {
                    const copy = [...education];
                    copy[i].score = e.target.value;
                    setEducation(copy);
                  }} />
                <input className="input" required placeholder="Year" value={edu.year}
                  onChange={e => {
                    const copy = [...education];
                    copy[i].year = e.target.value;
                    setEducation(copy);
                  }} />
              </div>
            ))}
            <span className="add-btn" onClick={addEducation}>+ Add another education</span>
          </div>

          {/* SKILLS */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-4">Skills</h2>
            {skills.map((skill, i) => (
              <input
                key={i}
                required
                className="input mb-3"
                placeholder="Eg: Languages: Core Java, Advanced Java, Python, JavaScript"
                value={skill}
                onChange={e => {
                  const copy = [...skills];
                  copy[i] = e.target.value;
                  setSkills(copy);
                }}
              />
            ))}
            <span className="add-btn" onClick={addSkill}>+ Add another skill</span>
          </div>

          {/* EXPERIENCE */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-4">Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4 space-y-3">
                <input className="input" required placeholder="Role" value={exp.role}
                  onChange={e => {
                    const copy = [...experience];
                    copy[i].role = e.target.value;
                    setExperience(copy);
                  }} />
                <input className="input" required placeholder="Company" value={exp.company}
                  onChange={e => {
                    const copy = [...experience];
                    copy[i].company = e.target.value;
                    setExperience(copy);
                  }} />
                <input className="input" required placeholder="Duration" value={exp.duration}
                  onChange={e => {
                    const copy = [...experience];
                    copy[i].duration = e.target.value;
                    setExperience(copy);
                  }} />
                <textarea
                  required
                  rows="3"
                  className="input"
                  placeholder="Bullet points (one per line)"
                  value={exp.points}
                  onChange={e => {
                    const copy = [...experience];
                    copy[i].points = e.target.value;
                    setExperience(copy);
                  }}
                />
              </div>
            ))}
            <span className="add-btn" onClick={addExperience}>+ Add another experience</span>
          </div>

          {/* PROJECTS */}
          <div className="section-box bg-white">
            <h2 className="font-semibold mb-4">Projects</h2>
            {projects.map((proj, i) => (
              <div key={i} className="mb-4 space-y-3">
                <input className="input" required placeholder="Project Title" value={proj.title}
                  onChange={e => {
                    const copy = [...projects];
                    copy[i].title = e.target.value;
                    setProjects(copy);
                  }} />
                <input className="input" required placeholder="Tech Stack" value={proj.tech}
                  onChange={e => {
                    const copy = [...projects];
                    copy[i].tech = e.target.value;
                    setProjects(copy);
                  }} />
                <textarea
                  required
                  rows="3"
                  className="input"
                  placeholder="Bullet points (one per line)"
                  value={proj.points}
                  onChange={e => {
                    const copy = [...projects];
                    copy[i].points = e.target.value;
                    setProjects(copy);
                  }}
                />
              </div>
            ))}
            <span className="add-btn" onClick={addProject}>+ Add another project</span>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveToDB}
              disabled={!isFormValid()}
              className={`w-1/2 py-3 rounded-lg text-white ${
                isFormValid() ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
              }`}
            >
              Save
            </button>

            <button
              onClick={handleGeneratePDF}
              disabled={!isFormValid()}
              className={`w-1/2 py-3 rounded-lg text-white ${
                isFormValid() ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-400"
              }`}
            >
              Download PDF
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT PREVIEW */}
      <div className="w-1/2 h-full bg-gray-200 flex justify-center items-start p-8 overflow-hidden">
        <div className="bg-white" style={{ width: "794px", height: "1123px" }}>
          <PDFViewer width="100%" height="1123px" showToolbar={false}>
            <ResumePDF data={{
              name, email, phone, linkedin, github, portfolio,
              summary, education, skills, experience, projects
            }} />
          </PDFViewer>
        </div>
      </div>

    </div>
  );
}
