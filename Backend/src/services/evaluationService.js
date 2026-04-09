const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluateWithAI = async (question, answer) => {
  const prompt = `
You are a professional interviewer.

Evaluate the candidate answer.

Question: ${question}
Answer: ${answer}

Return STRICT JSON:
{
  "technicalScore": number (0-10),
  "communicationScore": number (0-10),
  "confidenceScore": number (0-10),
  "overallScore": number (0-10),
  "feedback": "short feedback"
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch {
    return {
      technicalScore: 5,
      communicationScore: 5,
      confidenceScore: 5,
      overallScore: 5,
      feedback: "Could not parse AI response",
    };
  }
};

module.exports = { evaluateWithAI };
