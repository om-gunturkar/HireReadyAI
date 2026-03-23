const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const fetch = require("node-fetch");

/* =========================
   SAVE RESUME (DB)
========================= */
exports.saveResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, resume });
  } catch (err) {
    console.error("Save Resume Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   GET RESUME (DB)
========================= */
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    res.status(200).json(resume);
  } catch (err) {
    console.error("Get Resume Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   PARSE RESUME (PDF Upload)
========================= */
exports.parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }

    const pdfData = await pdfParse(req.file.buffer);

    let text = pdfData.text;

    // 🔥 FIX 1: normalize spacing
    text = text.replace(/\r/g, "\n");

    // 🔥 FIX 2: add line breaks before common sections
    const sections = [
      "Summary",
      "Education",
      "Skills",
      "Projects",
      "Internships",
      "Experience",
      "Certifications"
    ];

    sections.forEach(sec => {
      const regex = new RegExp(`\\s*${sec}\\s*`, "gi");
      text = text.replace(regex, `\n\n${sec}\n`);
    });

    // 🔥 FIX 3: split long lines into readable chunks
    text = text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n");

    console.log("FINAL PARSED TEXT:\n", text.slice(0, 1000)); // debug

    return res.json({
      success: true,
      text: text,                // ✅ CLEAN FULL TEXT
      preview: text.substring(0, 400)
    });

  } catch (err) {
    console.error("Parse Error:", err);
    return res.status(500).json({
      success: false,
      error: "Resume parsing failed"
    });
  }
};

/* =========================
   ROLE-BASED GENERATION (NEW)
========================= */
exports.generateRoleResume = async (req, res) => {
  try {
    const { role, resumeText } = req.body;

    if (!role || !resumeText) {
      return res.status(400).json({
        success: false,
        error: "Missing data"
      });
    }

    const text = resumeText.replace(/\r/g, "").replace(/\n/g, " ");

    /* =========================
       KEEP PERSONAL INFO SAME
    ========================= */

    const nameMatch = text.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

    /* =========================
       EXTRACT PROJECTS (RAW)
    ========================= */

    const projectSectionMatch = text.match(/Projects\s*(.*?)\s*(Education|Skills|Internships|$)/i);
    const projectText = projectSectionMatch ? projectSectionMatch[1] : "";

    const projects = projectText
      .split(/•|\n|-/)
      .map(p => p.trim())
      .filter(p => p.length > 10)
      .slice(0, 4);

    /* =========================
       AI MODIFY PROJECT DESC
    ========================= */

    let enhancedProjects = projects;

try {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
You are an expert resume writer.

Improve these project descriptions for ATS.

Rules:
- Keep project names same
- Improve ONLY description
- Add action verbs (Developed, Built, Designed)
- Add impact (efficiency, automation, analysis)
- Make each point strong and professional
- Keep it concise (1–2 lines per project)

Return ONLY JSON:
{
  "projects": [
    "Project Name — improved description",
    "Project Name — improved description"
  ]
}

Role: ${role}

Projects:
${projects.join("\n")}
          `
        }
      ],
    }),
  });

  const data = await response.json();

  const aiText = data?.choices?.[0]?.message?.content || "";
  const match = aiText.match(/\{[\s\S]*\}/);

  if (match) {
    const parsed = JSON.parse(match[0]);
    enhancedProjects = parsed.projects || projects;
  }

} catch (err) {
  console.log("AI enhancement failed → using original");
}

    /* =========================
       FINAL RESPONSE
    ========================= */

    res.json({
      success: true,
      data: {
        extractedData: {
          name: nameMatch ? nameMatch[0] : "Your Name",
          email: emailMatch ? emailMatch[0] : "email@example.com"
        },

        // ❗ KEEP THESE SAME / BASIC
        summary: `Applying for ${role} role`,
        education: "",

        // ❗ SKILLS untouched or basic
        skills: [],

        // 🔥 ONLY THIS IS MODIFIED
        experience: enhancedProjects
      }
    });

  } catch (err) {
    console.error("FINAL ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Generation failed"
    });
  }
};