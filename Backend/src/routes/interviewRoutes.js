const express = require("express");
const router = express.Router();

let sessionStore = {};

router.post("/next", async (req, res) => {
  try {
    const { mode, value, resumeText, previousAnswer } = req.body;

    const sessionId = "demo-session";

    if (!sessionStore[sessionId]) {
      sessionStore[sessionId] = {
        mainIndex: 0,
        followUpCount: 0,
        mainQuestions: [],
      };
    }

    const session = sessionStore[sessionId];

    if (session.mainIndex >= 10) {
      return res.json({ question: null });
    }

    if (previousAnswer && session.followUpCount < 2) {
      session.followUpCount++;
      return res.json({
        question: `Can you elaborate more on: "${previousAnswer.substring(0, 50)}"?`,
      });
    }

    session.followUpCount = 0;
    session.mainIndex++;

    let mainQuestion;

    if (mode === "resume" && resumeText) {
      mainQuestion = `From your resume: "${resumeText.substring(
        0,
        100
      )}", explain your experience.`;
    } else {
      mainQuestion = `Question ${session.mainIndex} about ${value}`;
    }

    return res.json({ question: mainQuestion });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Interview error" });
  }
});

module.exports = router;
