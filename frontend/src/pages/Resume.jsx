import { useState, lazy, Suspense } from "react";
import { pdf, PDFViewer } from "@react-pdf/renderer";
import { saveResume } from "../api/resume";
import { useLocation, useNavigate } from "react-router-dom";

/* TEMPLATES */
const ResumePDFClassic = lazy(() => import("../resume/ResumePDFClassic"));
const ResumePDFTech = lazy(() => import("../resume/ResumePDFTech"));
const ResumePDFCreative = lazy(() => import("../resume/ResumePDFCreative"));

const getTemplate = (id) => {
  switch (id) {
    case "tech":
      return ResumePDFTech;
    case "creative":
      return ResumePDFCreative;
    default:
      return ResumePDFClassic;
  }
};

export default function Resume() {
  const location = useLocation();
  const navigate = useNavigate();
  const templateId = location.state?.templateId || "classic";
  const SelectedTemplate = getTemplate(templateId);

  /* =======================
        BASIC STATE
  ======================== */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [summary, setSummary] = useState("");
  const [profileImage, setProfileImage] = useState(null);

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

  /* =======================
        TECH EXTRA STATE
  ======================== */

  const [internships, setInternships] = useState([
    { role: "", company: "", duration: "", points: "" }
  ]);

  const [certifications, setCertifications] = useState([""]);
  const [achievements, setAchievements] = useState([""]);

  /* =======================
        GENERIC ADD
  ======================== */

  const addItem = (setter, template) =>
    setter((prev) => [...prev, template]);

  /* =======================
        GENERIC REMOVE
  ======================== */

  const removeItem = (setter, arr, index) => {
    if (arr.length === 1) return;
    setter(arr.filter((_, i) => i !== index));
  };

  /* =======================
        VALIDATION
  ======================== */

  const validateForm = () => {
    if (!name || !email || !phone || !linkedin || !summary) {
      alert("Please fill required fields.");
      return false;
    }
    if (!education[0].degree || !education[0].institute) {
      alert("Education is required.");
      return false;
    }
    return true;
  };

  /* =======================
        DATA TO PDF
  ======================== */

  const resumeData = {
    name,
    email,
    phone,
    linkedin,
    github,
    portfolio,
    summary,
    education,
    skills,
    experience,
    projects,
    internships,
    certifications,
    achievements,
    profileImage
  };

  /* =======================
        SAVE
  ======================== */

  const handleSaveToDB = async () => {
    if (!validateForm()) return;
    await saveResume(resumeData);
    alert("Resume saved");
  };

  /* =======================
        DOWNLOAD PDF
  ======================== */

  const handleGeneratePDF = async () => {
    if (!validateForm()) return;

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

  /* =======================
        STYLES
  ======================== */

  const card = "bg-white p-6 rounded-2xl shadow-sm";
  const block = "bg-gray-50 p-4 rounded-xl mb-4 relative";
  const inputClass =
    "w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300";
  const deleteBtn =
    "absolute top-3 right-3 bg-red-100 text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-sm cursor-pointer";
  const addBtn = "text-purple-600 font-medium mt-2";

  /* =======================
        UI
  ======================== */

  return (
    <div className="flex h-screen bg-gray-50">

      {/* LEFT SIDE */}
      <div className="w-1/2 h-full overflow-y-auto px-10 py-10">

        <h1 className="text-3xl font-bold mb-6">Create Resume</h1>

        {/* PERSONAL */}
        <div className={card}>
          <input required className={inputClass + " mb-3"} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          <input required className={inputClass + " mb-3"} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input required className={inputClass + " mb-3"} placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
          <input required className={inputClass + " mb-3"} placeholder="LinkedIn" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
          <input className={inputClass + " mb-3"} placeholder="GitHub" value={github} onChange={e => setGithub(e.target.value)} />
          <input className={inputClass} placeholder="Portfolio" value={portfolio} onChange={e => setPortfolio(e.target.value)} />
        </div>

        {/* CREATIVE IMAGE */}
        {templateId === "creative" && (
          <div className={card + " mt-6"}>
            <h2 className="font-semibold mb-4">Profile Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setProfileImage(reader.result);
                reader.readAsDataURL(file);
              }}
            />
          </div>
        )}

        {/* SUMMARY */}
        <div className={card + " mt-6"}>
          <textarea required rows="4" className={inputClass} placeholder="Summary"
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </div>

        {/* EDUCATION */}
        <div className={card + " mt-6"}>
          {education.map((edu, i) => (
            <div key={i} className={block}>
              <div onClick={() => removeItem(setEducation, education, i)} className={deleteBtn}>✕</div>
              <input className={inputClass + " mb-2"} placeholder="Degree"
                value={edu.degree}
                onChange={e => {
                  const c = [...education];
                  c[i].degree = e.target.value;
                  setEducation(c);
                }}
              />
              <input className={inputClass + " mb-2"} placeholder="Institute"
                value={edu.institute}
                onChange={e => {
                  const c = [...education];
                  c[i].institute = e.target.value;
                  setEducation(c);
                }}
              />
              <input className={inputClass + " mb-2"} placeholder="Score"
                value={edu.score}
                onChange={e => {
                  const c = [...education];
                  c[i].score = e.target.value;
                  setEducation(c);
                }}
              />
              <input className={inputClass} placeholder="Year"
                value={edu.year}
                onChange={e => {
                  const c = [...education];
                  c[i].year = e.target.value;
                  setEducation(c);
                }}
              />
            </div>
          ))}
          <button onClick={() => addItem(setEducation, { degree: "", institute: "", score: "", year: "" })} className={addBtn}>
            + Add Education
          </button>
        </div>
{/* SKILLS */}
<div className={card + " mt-6"}>
  <h2 className="font-semibold mb-4">Skills</h2>

  {skills.map((skill, i) => (
    <div key={i} className="flex gap-2 mb-3">
      <input
        className={inputClass}
        value={skill}
        onChange={(e) => {
          const c = [...skills];
          c[i] = e.target.value;
          setSkills(c);
        }}
      />

      <div
        onClick={() => removeItem(setSkills, skills, i)}
        className="text-red-500 cursor-pointer"
      >
        ✕
      </div>
    </div>
  ))}

  <button
    onClick={() => addItem(setSkills, "")}
    className={addBtn}
  >
    + Add Skill
  </button>
</div>

        {/* EXPERIENCE */}
        <div className={card + " mt-6"}>
          {experience.map((exp, i) => (
            <div key={i} className={block}>
              <div onClick={() => removeItem(setExperience, experience, i)} className={deleteBtn}>✕</div>
              <input className={inputClass + " mb-2"} placeholder="Role"
                value={exp.role}
                onChange={e => {
                  const c = [...experience];
                  c[i].role = e.target.value;
                  setExperience(c);
                }}
              />
              <input className={inputClass + " mb-2"} placeholder="Company"
                value={exp.company}
                onChange={e => {
                  const c = [...experience];
                  c[i].company = e.target.value;
                  setExperience(c);
                }}
              />
              <input className={inputClass + " mb-2"} placeholder="Duration"
                value={exp.duration}
                onChange={e => {
                  const c = [...experience];
                  c[i].duration = e.target.value;
                  setExperience(c);
                }}
              />
              <textarea rows="3" className={inputClass}
                value={exp.points}
                onChange={e => {
                  const c = [...experience];
                  c[i].points = e.target.value;
                  setExperience(c);
                }}
              />
            </div>
          ))}
          <button onClick={() => addItem(setExperience, { role: "", company: "", duration: "", points: "" })} className={addBtn}>
            + Add Experience
          </button>
        </div>
 {/* PROJECTS */}
<div className={card + " mt-6"}>
  <h2 className="font-semibold mb-4">Projects</h2>

  {projects.map((proj, i) => (
    <div key={i} className={block}>
      <div
        onClick={() => removeItem(setProjects, projects, i)}
        className={deleteBtn}
      >
        ✕
      </div>

      <input
        className={inputClass + " mb-2"}
        placeholder="Title"
        value={proj.title}
        onChange={(e) => {
          const c = [...projects];
          c[i].title = e.target.value;
          setProjects(c);
        }}
      />

      <input
        className={inputClass + " mb-2"}
        placeholder="Tech"
        value={proj.tech}
        onChange={(e) => {
          const c = [...projects];
          c[i].tech = e.target.value;
          setProjects(c);
        }}
      />

      <textarea
        rows="3"
        className={inputClass}
        placeholder="Points (new line for bullets)"
        value={proj.points}
        onChange={(e) => {
          const c = [...projects];
          c[i].points = e.target.value;
          setProjects(c);
        }}
      />
    </div>
  ))}

  <button
    onClick={() =>
      addItem(setProjects, { title: "", tech: "", points: "" })
    }
    className={addBtn}
  >
    + Add Project
  </button>
</div>

        {/* TECH EXTRA */}
        {templateId === "tech" && (
          <>
            <div className={card + " mt-6"}>
              <h2 className="font-semibold mb-4">Internships</h2>
              {internships.map((int, i) => (
                <div key={i} className={block}>
                  <div onClick={() => removeItem(setInternships, internships, i)} className={deleteBtn}>✕</div>
                  <input className={inputClass + " mb-2"} placeholder="Role"
                    value={int.role}
                    onChange={e => {
                      const c = [...internships];
                      c[i].role = e.target.value;
                      setInternships(c);
                    }}
                  />
                  <input className={inputClass + " mb-2"} placeholder="Company"
                    value={int.company}
                    onChange={e => {
                      const c = [...internships];
                      c[i].company = e.target.value;
                      setInternships(c);
                    }}
                  />
                  <input className={inputClass + " mb-2"} placeholder="Duration"
                    value={int.duration}
                    onChange={e => {
                      const c = [...internships];
                      c[i].duration = e.target.value;
                      setInternships(c);
                    }}
                  />
                  <textarea rows="3" className={inputClass}
                    value={int.points}
                    onChange={e => {
                      const c = [...internships];
                      c[i].points = e.target.value;
                      setInternships(c);
                    }}
                  />
                </div>
              ))}
              <button onClick={() => addItem(setInternships, { role: "", company: "", duration: "", points: "" })} className={addBtn}>
                + Add Internship
              </button>
            </div>

            <div className={card + " mt-6"}>
              <h2 className="font-semibold mb-4">Certifications</h2>
              {certifications.map((cert, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input className={inputClass} value={cert}
                    onChange={e => {
                      const c = [...certifications];
                      c[i] = e.target.value;
                      setCertifications(c);
                    }}
                  />
                  <div onClick={() => removeItem(setCertifications, certifications, i)} className="text-red-500 cursor-pointer">✕</div>
                </div>
              ))}
              <button onClick={() => addItem(setCertifications, "")} className={addBtn}>
                + Add Certification
              </button>
            </div>

            <div className={card + " mt-6"}>
              <h2 className="font-semibold mb-4">Achievements</h2>
              {achievements.map((ach, i) => (
                <div key={i} className="flex gap-2 mb-3">
                  <input className={inputClass} value={ach}
                    onChange={e => {
                      const c = [...achievements];
                      c[i] = e.target.value;
                      setAchievements(c);
                    }}
                  />
                  <div onClick={() => removeItem(setAchievements, achievements, i)} className="text-red-500 cursor-pointer">✕</div>
                </div>
              ))}
              <button onClick={() => addItem(setAchievements, "")} className={addBtn}>
                + Add Achievement
              </button>
            </div>
          </>
        )}

        <div className="flex gap-4 mt-6">
          <button onClick={handleSaveToDB} className="w-1/2 py-3 bg-green-600 text-white rounded-lg">
            Save
          </button>
          <button onClick={handleGeneratePDF} className="w-1/2 py-3 bg-purple-600 text-white rounded-lg">
            Download PDF
          </button>
        </div>

      </div>

      {/* RIGHT PDF */}
      <div className="w-1/2 h-full bg-gray-200 flex justify-center p-6 overflow-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <PDFViewer width="100%" height="100%">
            <SelectedTemplate data={resumeData} />
          </PDFViewer>
        </Suspense>
      </div>

    </div>
  );
}
