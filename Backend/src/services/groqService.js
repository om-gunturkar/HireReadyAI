const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// keep your existing generateResumeQuestion function here
const generateResumeQuestion = async (resumeText, level) => {
  // your existing code
};

const generateFollowUpQuestion = async ({
  mode,
  role,
  level,
  previousQuestion,
  previousAnswer,
  resumeText,
}) => {
  try {
    const prompt = `
You are an AI interviewer.

Generate ONE short follow-up question based on the candidate's previous answer.

Interview type: ${mode}
Role/Topic: ${role}
Level: ${level}

Previous question:
${previousQuestion}

Candidate answer:
${previousAnswer}

Rules:
- Ask only one question.
- It must be related to the previous question and answer.
- Do not explain.
- Do not give answer.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 80,
    });

    return {
      question:
        completion.choices?.[0]?.message?.content?.trim() ||
        "Can you explain that in more detail?",
    };
  } catch (error) {
    console.error("Groq follow-up error:", error.message);
    return {
      question: "Can you explain that in more detail?",
    };
  }
};

module.exports = {
  generateResumeQuestion,
  generateFollowUpQuestion,
};
