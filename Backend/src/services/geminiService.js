const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Interview state
let interviewState = {
  resumeText: "",
  level: "easy",
  totalQuestionCount: 0,
  maxQuestions: 15,
};

exports.startInterview = (resumeText, level) => {
  interviewState = {
    resumeText: resumeText || "",
    level: level || "easy",
    totalQuestionCount: 0,
    maxQuestions: 15,
  };
};

exports.generateNextQuestion = async (previousAnswer = "") => {
  try {
    if (interviewState.totalQuestionCount >= interviewState.maxQuestions) {
      return { done: true };
    }

    let prompt = `
You are a strict technical interviewer.

Candidate resume:
${interviewState.resumeText}

Difficulty: ${interviewState.level}

Generate ONE technical interview question.
Return only the question.
`;

    if (previousAnswer) {
      prompt = `
Candidate answered:
"${previousAnswer}"

Ask ONE deep follow-up technical question.
Return only the question.
`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const question = response.text.trim();

    interviewState.totalQuestionCount++;

    return {
      question,
      done: false,
      totalQuestionCount: interviewState.totalQuestionCount,
    };

  } catch (err) {
    console.error("Gemini Error:", err.message);

    return {
      question: "AI generation failed.",
      done: false,
    };
  }
};