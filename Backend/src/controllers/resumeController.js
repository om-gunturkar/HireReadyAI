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
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    res.status(200).json({
      success: true,
      text: resumeText,
      preview: resumeText.substring(0, 500)
    });

  } catch (err) {
    console.error("Resume Parsing Error:", err);
    res.status(500).json({ error: "Resume parsing failed" });
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
Extract structured resume from this text.

Return ONLY valid JSON. No explanation.

{
  "name": "",
  "email": "",
  "summary": "",
  "skills": [],
  "experience": [],
  "education": ""
}

TEXT:
${resumeText}
            `
          }
        ],
      }),
    });

    const data = await response.json();

    let aiText = data?.choices?.[0]?.message?.content || "";

    // 🔥 FIX: extract JSON safely
    const match = aiText.match(/\{[\s\S]*\}/);

    if (!match) {
      return res.status(500).json({
        success: false,
        error: "AI did not return JSON"
      });
    }

    const parsed = JSON.parse(match[0]);

    return res.json({
      success: true,
      data: {
        extractedData: {
          name: parsed.name || "Your Name",
          email: parsed.email || "email@example.com"
        },
        summary: parsed.summary || "",
        skills: parsed.skills || [],
        experience: parsed.experience || [],
        education: parsed.education || ""
      }
    });

  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Generation failed"
    });
  }
};