const axios = require("axios");

const GROK_API_KEY = process.env.GROK_API_KEY;

exports.generateQuestion = async ({
  resumeText,
  previousAnswer,
  questionIndex,
  followUpCount,
}) => {
  try {
    let prompt = "";

    // MAIN QUESTION
    if (followUpCount === 0) {
      prompt = `
You are an AI technical interviewer.

Based on this resume:

${resumeText}

Generate question number ${questionIndex + 1}.
Make it technical and role relevant.
Do not repeat previous questions.
Return only the question.
`;
    }

    // FOLLOW-UP QUESTION
    else {
      prompt = `
Candidate answered:

"${previousAnswer}"

Generate a follow-up question to dig deeper.
Keep it relevant to the candidate’s response.
Return only the question.
`;
    }

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-beta",
        messages: [
          { role: "system", content: "You are a strict technical interviewer." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();

  } catch (err) {
    console.error("Grok Error:", err.response?.data || err.message);
    return "Tell me about a project you worked on.";
  }
};
