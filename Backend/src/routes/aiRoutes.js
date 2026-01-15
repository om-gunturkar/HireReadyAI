const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/interview", async (req, res) => {
  try {
    const { mode, value, answer, count, askedQuestions } = req.body;

    let interviewContext = "";

    if (mode === "language") {
      interviewContext = `This is a technical job interview focused strictly on the programming language ${value}.`;
    } else if (mode === "role") {
      interviewContext = `This is a technical job interview for the role of ${value}.`;
    } else {
      interviewContext = `This is a technical job interview based on the candidate's resume.`;
    }

    // 🎯 difficulty control
    let level = "easy";
    let levelInstruction = "";

    if (count <= 3) {
      level = "easy";
      levelInstruction = "Ask basic interview questions on fundamentals, syntax, and simple concepts. These should be warm-up interview questions.";
    } else if (count <= 7) {
      level = "medium";
      levelInstruction = "Ask intermediate interview questions. Focus on internal working, 'why' questions, comparisons, debugging, and practical usage.";
    } else {
      level = "hard";
      levelInstruction = "Ask advanced interview questions. Focus on real-world scenarios, problem-solving, system design, performance, edge cases, and architecture.";
    }

const prompt = `
You are acting as a professional interviewer conducting a MOCK INTERVIEW.


Interview topic: ${value}
INTERVIEW DIFFICULTY LEVEL: ${level.toUpperCase()}

DIFFICULTY RULES:
- If EASY → basic definitions and fundamentals.
- If MEDIUM → why/how questions, comparisons, internal working.
- If HARD → conceptual depth, best practices, real interview tricks (but still short).


These questions were already asked:
${(askedQuestions || []).join("\n- ")}

STRICT RULES:

- Do NOT repeat, rephrase, or modify previous questions.
- Each question must test a DIFFERENT concept.
- Do NOT provide answers.
- Keep the tone professional like a real interviewer.
- Ask ONLY short mock interview questions.
- Each question must be 1–2 lines maximum.
- Questions must be SPOKEN-friendly.
- Do NOT describe long scenarios.
- Do NOT ask system design or coding questions.
- Do NOT explain the question.
- Ask ONLY ONE clear question.

Do NOT repeat or rephrase any previous question.

This is question number ${count} of 10.

Candidate’s last answer:
${answer || "No answer yet. Start with an interview question."}

Now generate the NEXT interview question.
`;


    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.9,
    });

    let aiQuestion = chatCompletion.choices[0].message.content;

    // 🛡️ repetition safety
    const isRepeated = (askedQuestions || []).some(q =>
      aiQuestion.toLowerCase().includes(q.toLowerCase().slice(0, 25))
    );

    if (isRepeated) {
      const retryPrompt = prompt + "\n\nThe last question is too similar. Generate a COMPLETELY DIFFERENT interview question on a new topic.";
      const retry = await groq.chat.completions.create({
        messages: [{ role: "user", content: retryPrompt }],
        model: "llama-3.1-8b-instant",
        temperature: 1,
      });
      aiQuestion = retry.choices[0].message.content;
    }

    res.json({ question: aiQuestion });

  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ message: "AI server error" });
  }
});

module.exports = router;
