const express = require("express");
const router = express.Router();
const geminiService = require("../services/geminiService");

router.post("/next", async (req, res) => {
  try {
    const { resumeText, previousAnswer } = req.body;

   if (!previousAnswer && resumeText) {
  geminiService.startInterview(resumeText, "medium");
}

    const result = await geminiService.generateNextQuestion(previousAnswer);

    if (result.done) {
      return res.json({ question: null });
    }

    return res.json({ question: result.question });

  } catch (err) {
    console.error("Route Error:", err.message);
    res.status(500).json({ error: "Interview error" });
  }
});

module.exports = router;