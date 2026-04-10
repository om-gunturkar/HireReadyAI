console.log("InterviewRoutes loaded");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  startSession,
  saveAnswerEvaluation,
  completeSession,
  getSessionReport,
} = require("../controllers/interviewSessionController");

// Role-based questions
const frontend = require("../questions/role/frontend");
const backend = require("../questions/role/backend");
const fullstack = require("../questions/role/fullstack");
const dataAnalyst = require("../questions/role/dataAnalyst");
const hr = require("../questions/role/hr");

// Language-based questions

const cpp = require("../questions/language/c_cpp");
const java = require("../questions/language/java");
const javascript = require("../questions/language/javascript");
const python = require("../questions/language/python");

// Groq service for resume-based interviews
const groqService = require("../services/groqService");
const InterviewSession = require("../models/InterviewSession");

// Helper function to get random question
function getRandomQuestion(questionsArray) {
  const randomIndex = Math.floor(Math.random() * questionsArray.length);
  return questionsArray[randomIndex];
}

async function maybeGenerateFollowUp({
  sessionId,
  type,
  role,
  level,
  previousQuestion,
  previousAnswer,
  resumeText,
}) {
  if (!sessionId || !previousQuestion || !previousAnswer?.trim()) {
    return null;
  }

  const session = await InterviewSession.findOne({ sessionId });
  if (!session) {
    return null;
  }

  const nextQuestionNumber = (session.questionCount || 0) + 1;
  const followUpTargets = Array.isArray(session.followUpTargets) ? session.followUpTargets : [];

  if ((session.followUpCount || 0) >= 2) {
    return null;
  }

  if (!followUpTargets.includes(nextQuestionNumber)) {
    return null;
  }

  const result = await groqService.generateFollowUpQuestion({
    mode: type,
    role,
    level,
    previousQuestion,
    previousAnswer,
    resumeText,
  });

  if (!result?.question || result.question === "AI generation failed.") {
    return null;
  }

  session.followUpCount = (session.followUpCount || 0) + 1;
  session.questionCount = nextQuestionNumber;
  await session.save();

  return {
    question: result.question,
    isFollowUp: true,
    followUpCount: session.followUpCount,
  };
}

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  return authMiddleware(req, res, next);
};

router.post("/session/start", optionalAuth, startSession);
router.post("/session/:sessionId/answer", optionalAuth, saveAnswerEvaluation);
router.post("/session/:sessionId/complete", optionalAuth, completeSession);
router.get("/session/:sessionId/report", optionalAuth, getSessionReport);

router.post("/next", async (req, res) => {
  console.log("Incoming body:", req.body);
  let { type, role, level, sessionId, previousQuestion, previousAnswer } = req.body;

  // Normalize inputs
  type = type?.toLowerCase().trim();
  role = role?.trim();
  level = level?.toLowerCase().trim();

  // Map medium → moderate
  if (level === "medium") {
    level = "moderate";
  }

  if (!type || !role || !level) {
    return res.status(400).json({ error: "Type, role and level are required" });
  }

  let selectedQuestions;

  // ================= ROLE BASED =================
  if (type === "role") {
    const followUp = await maybeGenerateFollowUp({
      sessionId,
      type,
      role,
      level,
      previousQuestion,
      previousAnswer,
    });

    if (followUp) {
      return res.json(followUp);
    }

    switch (role) {
      case "Frontend Developer":
        selectedQuestions = frontend[level];
        break;
      case "Backend Developer":
        selectedQuestions = backend[level];
        break;
      case "Full Stack Developer":
        selectedQuestions = fullstack[level];
        break;
      case "Data Analyst":
        selectedQuestions = dataAnalyst[level];
        break;
      case "HR / Fresher":
        selectedQuestions = hr[level];
        break;
      default:
        return res.status(400).json({ error: "Invalid role selected" });
    }
  }

  // ================= LANGUAGE BASED =================
  else if (type === "language") {
    const followUp = await maybeGenerateFollowUp({
      sessionId,
      type,
      role,
      level,
      previousQuestion,
      previousAnswer,
    });

    if (followUp) {
      return res.json(followUp);
    }

    switch (role) {
      case "C/C++":
        selectedQuestions = cpp[level];
        break;
      case "Java":
        selectedQuestions = java[level];
        break;
      case "JavaScript":
        selectedQuestions = javascript[level];
        break;
      case "Python":
        selectedQuestions = python[level];
        break;
      default:
        return res.status(400).json({ error: "Invalid language selected" });
    }
  }

  // ================= RESUME BASED =================
  else if (type === "resume") {
    // For resume-based interviews, we need resumeText from the request body
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required for resume-based interview" });
    }

    const followUp = await maybeGenerateFollowUp({
      sessionId,
      type,
      role,
      level,
      previousQuestion,
      previousAnswer,
      resumeText,
    });

    if (followUp) {
      return res.json(followUp);
    }

    // Generate question using Groq (resume-based)
    try {
      const result = await groqService.generateResumeQuestion(resumeText, level);

      if (sessionId) {
        await InterviewSession.findOneAndUpdate(
          { sessionId },
          { $inc: { questionCount: 1 } }
        );
      }

      return res.json({ ...result, isFollowUp: false });
    } catch (err) {
      console.error("Groq service error:", err);
      return res.status(500).json({ error: "Failed to generate question" });
    }
  }

  if (!selectedQuestions || !Array.isArray(selectedQuestions)) {
    return res.status(400).json({ error: "Invalid level selected" });
  }

  const question = getRandomQuestion(selectedQuestions);

  if (sessionId) {
    await InterviewSession.findOneAndUpdate(
      { sessionId },
      { $inc: { questionCount: 1 } }
    );
  }

  return res.json({ question, isFollowUp: false });
});

module.exports = router;
