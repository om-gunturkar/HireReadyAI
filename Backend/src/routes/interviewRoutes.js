console.log("InterviewRoutes loaded");
const express = require("express");
const router = express.Router();

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

// Helper function to get random question
function getRandomQuestion(questionsArray) {
  const randomIndex = Math.floor(Math.random() * questionsArray.length);
  return questionsArray[randomIndex];
}

router.post("/next", (req, res) => {
  console.log("Incoming body:", req.body);
  let { type, role, level } = req.body;

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
    return res.json({
      question: "Resume-based interview currently disabled.",
    });
  }

  if (!selectedQuestions || !Array.isArray(selectedQuestions)) {
    return res.status(400).json({ error: "Invalid level selected" });
  }

  const question = getRandomQuestion(selectedQuestions);

  return res.json({ question });
});

module.exports = router;
