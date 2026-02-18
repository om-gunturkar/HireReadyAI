const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY;

// ===============================
// Interview State (In-Memory)
// ===============================
let interviewState = {
  resumeText: "",
  level: "easy",
  mainQuestionCount: 0,
  followUpCount: 0,
  totalQuestionCount: 0,
  maxQuestions: 15,
};

// ===============================
// Start Interview
// ===============================
const extractRelevantSections = (text) => {
  if (!text) return "";

  // Remove emails, links, phone numbers
  let cleaned = text
    .replace(/\S+@\S+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\+?\d[\d\s-]{8,}/g, "");

  // Remove summary section completely
  cleaned = cleaned.replace(/summary[\s\S]*?(skills|projects|experience)/i, "$1");

  // Try to extract only Skills and Projects section
  const skillsMatch = cleaned.match(/skills[\s\S]*?(projects|experience|$)/i);
  const projectsMatch = cleaned.match(/projects[\s\S]*?(experience|$)/i);

  let result = "";

  if (skillsMatch) result += skillsMatch[0] + "\n";
  if (projectsMatch) result += projectsMatch[0];

  return result.trim();
};

exports.startInterview = (resumeText, level) => {

  const cleanedResume = extractRelevantSections(resumeText);

  interviewState = {
    resumeText: cleanedResume,
    level: level || "easy",
    mainQuestionCount: 0,
    followUpCount: 0,
    totalQuestionCount: 0,
    maxQuestions: 15,
  };
};


// ===============================
// Get Difficulty Instruction
// ===============================
const getDifficultyInstruction = (level) => {
  if (level === "easy") {
    return `
Ask basic conceptual and implementation questions.
Focus on understanding fundamentals.
Avoid system design and advanced scalability topics.
`;
  }

  if (level === "medium") {
    return `
Ask practical architecture and implementation questions.
Include trade-offs, optimization, and moderate depth.
`;
  }

  if (level === "hard") {
    return `
Ask advanced system design or algorithmic questions.
Include scalability, performance bottlenecks,
distributed systems, and deep technical reasoning.
`;
  }

  return "";
};

// ===============================
// Generate Next Question
// ===============================
exports.generateNextQuestion = async (previousAnswer = "") => {
  try {
    if (interviewState.totalQuestionCount >= interviewState.maxQuestions) {
      return { done: true };
    }

    let prompt = "";

    // ===============================
    // FOLLOW-UP LOGIC (max 2)
    // ===============================
    if (previousAnswer && interviewState.followUpCount < 2) {
      prompt = `
You are a strict senior technical interviewer.

Candidate answered:

"${previousAnswer}"

Generate ONE deep technical follow-up question.

Go deeper into:
- internal logic
- edge cases
- trade-offs
- performance
- security
- scalability

Do NOT ask generic questions.
Return only the question.
`;

      interviewState.followUpCount++;
    } else {
      // ===============================
      // MAIN QUESTION LOGIC
      // ===============================
      const difficultyInstruction = getDifficultyInstruction(
        interviewState.level
      );

      prompt = `
You are a strict senior technical interviewer.

Candidate resume:

${interviewState.resumeText}

Difficulty Level: ${interviewState.level}

${difficultyInstruction}

Generate ONE technical interview question based ONLY on SKILLS or PROJECTS.

Rules:
- Do NOT mention resume text
- Do NOT say "from your resume"
- No generic HR questions
- No "explain your experience"
- Must test real technical knowledge
- Return only the question
`;

      interviewState.mainQuestionCount++;
      interviewState.followUpCount = 0;
    }

    // ===============================
    // Call Grok API
    // ===============================
    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [
          { role: "system", content: "You are a strict and technical interviewer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const question =
      response.data.choices[0].message.content.trim();

    interviewState.totalQuestionCount++;

    return {
      question,
      totalQuestionCount: interviewState.totalQuestionCount,
      done: false,
    };
  } catch (err) {
    console.error("Grok Error:", err.response?.data || err.message);

    return {
      question:
        "Explain the architecture of one of your technical projects.",
      done: false,
    };
  }
};
