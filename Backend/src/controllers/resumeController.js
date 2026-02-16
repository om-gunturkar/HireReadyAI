const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");

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
      text: resumeText,               // full resume text
      preview: resumeText.substring(0, 500) // preview for UI
    });

  } catch (err) {
    console.error("Resume Parsing Error:", err);
    res.status(500).json({ error: "Resume parsing failed" });
  }
};
