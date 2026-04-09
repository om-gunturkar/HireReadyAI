let openaiClient = null;

const getOpenAIClient = () => {
  if (openaiClient) return openaiClient;
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    // Lazy-load so backend still works even if openai package is not installed.
    // eslint-disable-next-line global-require
    const OpenAI = require("openai");
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
  } catch (err) {
    console.warn("OpenAI SDK not available, using fallback evaluator.");
    return null;
  }
};

const fallbackEvaluate = (question, answer) => {
  const answerWordCount = (answer || "").trim().split(/\s+/).filter(Boolean).length;
  const questionWords = new Set((question || "").toLowerCase().split(/\W+/).filter(Boolean));
  const answerWords = new Set((answer || "").toLowerCase().split(/\W+/).filter(Boolean));

  let overlap = 0;
  questionWords.forEach((word) => {
    if (answerWords.has(word)) overlap += 1;
  });

  const relevanceRatio = questionWords.size > 0 ? overlap / questionWords.size : 0;
  const structureBonus = answerWordCount >= 30 ? 1.5 : answerWordCount >= 15 ? 1 : 0.5;

  const technicalScore = Math.min(10, Math.max(2, relevanceRatio * 8 + structureBonus));
  const communicationScore = Math.min(10, Math.max(2, answerWordCount / 12));
  const confidenceScore = Math.min(10, Math.max(2, answerWordCount >= 20 ? 7 : 5));
  const overallScore = (technicalScore + communicationScore + confidenceScore) / 3;

  return {
    technicalScore: Number(technicalScore.toFixed(1)),
    communicationScore: Number(communicationScore.toFixed(1)),
    confidenceScore: Number(confidenceScore.toFixed(1)),
    overallScore: Number(overallScore.toFixed(1)),
    feedback:
      overallScore >= 7
        ? "Strong answer with good structure and relevance."
        : "Answer captured the basics. Add more technical depth and examples.",
  };
};

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

  const openai = getOpenAIClient();
  if (!openai) {
    return fallbackEvaluate(question, answer);
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0].message.content;

  try {
    return JSON.parse(text);
  } catch {
    return fallbackEvaluate(question, answer);
  }
};

module.exports = { evaluateWithAI };
