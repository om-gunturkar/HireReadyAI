const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
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
    askedQuestions: [], // NEW
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

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // free & good model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const question = response.choices[0].message.content.trim();

    interviewState.totalQuestionCount++;

    return {
      question,
      done: false,
      totalQuestionCount: interviewState.totalQuestionCount,
    };
  } catch (err) {
    console.error("Groq Error:", err.message);

    return {
      question: "AI generation failed.",
      done: false,
    };
  }
};
