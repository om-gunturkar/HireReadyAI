import { useState } from "react";
import html2pdf from "html2pdf.js";

export default function RoleBasedResume() {
  const API = "http://localhost:5000";

  const [role, setRole] = useState("");
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);

  // PARSE
  const handleParse = async () => {
    if (!file) return alert("Upload resume");

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch(`${API}/api/resume/parse`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!data.success) return alert("Parse failed");

    setText(data.text);
    setPreview(data.preview);
  };

  // GENERATE (STATIC FOR NOW)
  const handleGenerate = async () => {
    if (!role || !text) {
      return alert("Enter role + parse resume");
    }

    setLoading(true);

    const res = await fetch(`${API}/api/resume/generate-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, resumeText: text }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Generation failed");
      setLoading(false);
      return;
    }

    setGenerated(data.data);
    setLoading(false);
  };

  const downloadPDF = () => {
    html2pdf().from(document.getElementById("pdf")).save();
  };

  return (
    <div className="min-h-screen bg-purple-50 p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
          Role-Based Resume Generator
        </h1>

        {/* INPUT CARD */}
        <div className="bg-white p-6 rounded-xl shadow mb-6">

          <input
            placeholder="Enter Role (e.g Software Engineer)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border p-3 rounded mb-4"
          />

          <div className="flex gap-3 items-center">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button
              onClick={handleParse}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              Parse
            </button>
          </div>

          {preview && (
            <div className="mt-4 bg-gray-100 p-3 text-sm max-h-40 overflow-auto rounded">
              {preview}
            </div>
          )}

          <button
            onClick={handleGenerate}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Generating..." : "Generate Resume"}
          </button>

        </div>

        {/* OUTPUT */}
        {generated && (
  <div className="bg-white p-8 rounded-xl shadow">

    <div id="pdf" className="text-sm text-gray-800 leading-relaxed">

      {/* HEADER */}
      <h1 className="text-xl font-bold">
        {generated.extractedData?.name}
      </h1>

      <p className="text-xs text-gray-600 mb-2">
        {generated.extractedData?.email}
      </p>

      <hr className="my-2" />

      {/* SUMMARY */}
      <h2 className="font-bold mt-3">Summary</h2>
      <p>{generated.summary}</p>

      {/* EDUCATION (STATIC FOR NOW) */}
      <h2 className="font-bold mt-3">Education</h2>
      <p>{generated.education}</p> ✅

      {/* SKILLS */}
      <h2 className="font-bold mt-3">Skills</h2>
      <ul className="list-disc ml-5">
        {generated.skills?.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>

      {/* EXPERIENCE */}
      <h2 className="font-bold mt-3">Experience</h2>
      <ul className="list-disc ml-5">
        {generated.experience?.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>

    </div>

    <button
      onClick={handleDownloadPDF}
      className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
    >
      Download PDF
    </button>

  </div>
)}

      </div>
    </div>
  );
}