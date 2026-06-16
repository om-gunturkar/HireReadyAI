// routes/interviewRoutes.js

const express = require("express");
const router = express.Router();

router.post("/next", async (req, res) => {
  try {
    const { type, role, level, previousQuestion, previousAnswer, resumeText } =
      req.body;

    let result;

    // Follow-up question if previous answer exists
    if (previousAnswer && previousQuestion) {
      result = await generateFollowUpQuestion({
        mode: type,
        role,
        level,
        previousQuestion,
        previousAnswer,
        resumeText,
      });
    } else {
      // First/new question
      result = await generateResumeQuestion(resumeText, level);
    }

    res.json({
      question: result.question,
      done: result.done || false,
    });
  } catch (error) {
    console.error("Interview next route error:", error);
    res.status(500).json({
      message: "Failed to generate interview question",
    });
  }
});

module.exports = router;
