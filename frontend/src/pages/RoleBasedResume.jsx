import { useState } from "react";
import html2pdf from "html2pdf.js";

const API = "http://localhost:5000";

const sectionTitle = "text-xs font-bold tracking-[0.25em] text-slate-500 uppercase mb-3";
const cardClass = "bg-white/95 backdrop-blur rounded-3xl shadow-[0_24px_80px_rgba(15,23,42,0.10)]";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100";

const renderBullets = (value) =>
  String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export default function RoleBasedResume() {
  const [role, setRole] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

  const handleParse = async () => {
    if (!file) {
      alert("Upload a PDF resume first.");
      return;
    }

    setParsing(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${API}/api/resume/parse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Parse failed");
        return;
      }

      setText(data.text || "");
      setPreview(data.preview || "");
    } catch (error) {
      alert("Unable to parse the full PDF right now.");
    } finally {
      setParsing(false);
    }
  };

  const handleGenerate = async () => {
    if (!role || !text) {
      alert("Enter the target role and parse the resume first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/resume/generate-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role, resumeText: text }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Generation failed");
        return;
      }

      setGenerated(data.data);
    } catch (error) {
      alert("Unable to generate the role-based resume right now.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("pdf");
    if (!element) return;

    html2pdf()
      .set({
        margin: 0.4,
        filename: `${role || "Role-Based-Resume"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save();
  };

  const contact = generated?.extractedData || {};
  const contactText =
    contact.contactLine ||
    [contact.email, contact.phone, contact.linkedin, contact.github, contact.portfolio]
      .filter(Boolean)
      .join(" | ");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_45%,_#e2e8f0)] px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className={`${cardClass} h-fit p-6`}>
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-600">
              Role-Based Builder
            </p>
            <h1 className="text-3xl font-black text-slate-900">Tailor your resume to the role</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Parse the complete PDF, then generate a cleaner ATS-friendly version using all extracted sections.
            </p>
          </div>

          <div className="space-y-4">
            <input
              placeholder="Target role, for example Frontend Developer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            />

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-700"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleParse}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {parsing ? "Parsing full PDF..." : "Parse Resume"}
              </button>

              <button
                onClick={handleGenerate}
                className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                {loading ? "Generating..." : "Generate Resume"}
              </button>
            </div>
          </div>

          {preview && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                Parsed Preview
              </p>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-6 text-slate-700">
                {preview}
              </pre>
            </div>
          )}
        </div>

        <div className={`${cardClass} overflow-hidden`}>
          {generated ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    Generated Resume
                  </p>
                  <p className="mt-1 text-sm text-slate-600">Structured from the full uploaded PDF</p>
                </div>

                <button
                  onClick={downloadPDF}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  Download PDF
                </button>
              </div>

              <div className="bg-slate-100 p-4 md:p-8">
                <div
                  id="pdf"
                  className="mx-auto max-w-4xl bg-white px-8 py-10 text-[14px] leading-6 text-slate-800 shadow-[0_16px_50px_rgba(15,23,42,0.08)]"
                >
                  <header className="border-b border-slate-300 pb-5">
                    <h1 className="text-3xl font-black uppercase tracking-[0.18em] text-slate-900">
                      {contact.name}
                    </h1>
                    <p className="mt-3 text-sm text-slate-600">{contactText}</p>
                  </header>

                  {generated.summary && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Professional Summary</h2>
                      <p>{generated.summary}</p>
                    </section>
                  )}

                  {generated.skills?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Technical Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {generated.skills.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-slate-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {generated.experience?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Experience</h2>
                      <div className="space-y-5">
                        {generated.experience.map((item, index) => (
                          <div key={`${item.role || "experience"}-${index}`}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {item.role}
                                {item.company ? ` | ${item.company}` : ""}
                              </h3>
                              {item.duration && (
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  {item.duration}
                                </span>
                              )}
                            </div>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {renderBullets(item.points).map((point, bulletIndex) => (
                                <li key={`${point}-${bulletIndex}`}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {generated.projects?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Projects</h2>
                      <div className="space-y-5">
                        {generated.projects.map((item, index) => (
                          <div key={`${item.title || "project"}-${index}`}>
                            <h3 className="text-base font-bold text-slate-900">
                              {item.title}
                              {item.tech ? ` | ${item.tech}` : ""}
                            </h3>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                              {renderBullets(item.points).map((point, bulletIndex) => (
                                <li key={`${point}-${bulletIndex}`}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {generated.education?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Education</h2>
                      <div className="space-y-4">
                        {generated.education.map((item, index) => (
                          <div key={`${item.degree || "education"}-${index}`}>
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 className="text-base font-bold text-slate-900">{item.degree}</h3>
                              {item.year && (
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  {item.year}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700">
                              {[item.institute, item.score].filter(Boolean).join(" | ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {generated.certifications?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Certifications</h2>
                      <ul className="list-disc space-y-1 pl-5">
                        {generated.certifications.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {generated.achievements?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Achievements</h2>
                      <ul className="list-disc space-y-1 pl-5">
                        {generated.achievements.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {generated.activities?.length > 0 && (
                    <section className="mt-7">
                      <h2 className={sectionTitle}>Activities</h2>
                      <ul className="list-disc space-y-1 pl-5">
                        {generated.activities.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[640px] items-center justify-center p-10 text-center">
              <div className="max-w-md">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">Preview Area</p>
                <h2 className="mt-3 text-3xl font-black text-slate-900">Your generated resume will appear here</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Upload a PDF, parse the full document, and generate a role-focused version with better structure.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
