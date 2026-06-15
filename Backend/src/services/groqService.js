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
  followUpPositions: [],
};

exports.startInterview = (resumeText, level) => {

  const positions = [];

  while (positions.length < 3) {
    const pos = Math.floor(Math.random() * 9) + 2; // 2-10

    if (!positions.includes(pos)) {
      positions.push(pos);
    }
  }

  positions.sort((a, b) => a - b);

  interviewState = {
    resumeText: resumeText || "",
    level: level || "easy",
    totalQuestionCount: 0,
    maxQuestions: 10,
    askedQuestions: [],
    followUpPositions: positions,
  };

  console.log("Follow-up positions:", positions);
};

exports.generateResumeQuestion = async (resumeText = "", level = "easy") => {
  try {
    const prompt = `
You are a strict technical interviewer conducting an interview based on the candidate's resume.

Candidate resume:
${resumeText}

Difficulty: ${level}

Generate ONE technical interview question based on the candidate's resume and experience.
Return only the question.
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
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

exports.generateFollowUpQuestion = async ({
  mode = "role",
  role = "",
  level = "easy",
  previousQuestion = "",
  previousAnswer = "",
  resumeText = "",
}) => {
  try {
    let prompt = `
You are a strict technical interviewer.

Interview mode: ${mode}
Topic or role: ${role}
Difficulty: ${level}

Previous interview question:
"${previousQuestion}"

Candidate's previous answer:
"${previousAnswer}"

Ask ONE deep follow-up technical question based on the candidate's previous answer.
Return only the question.
`;

    if (mode === "resume") {
      prompt = `
You are continuing a technical interview based on the candidate's resume.

Candidate resume:
${resumeText || interviewState.resumeText}

Difficulty: ${level}

Candidate's previous answer:
"${previousAnswer}"

Ask ONE deep follow-up technical question related to their resume or their previous answer.
Return only the question.
`;
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const question = response.choices[0].message.content.trim();

    return {
      question,
      done: false,
    };
  } catch (err) {
    console.error("Groq Follow-up Error:", err.message);

    return {
      question: "AI generation failed.",
      done: false,
    };
  }
};

exports.generateNextQuestion = async (previousAnswer = "") => {
  try {
    if (interviewState.totalQuestionCount >= interviewState.maxQuestions) {
      return { done: true };
    }
    const nextQuestionNumber = interviewState.totalQuestionCount + 1;

const isFollowUp =
  interviewState.followUpPositions.includes(nextQuestionNumber);

    let prompt = `
You are a strict technical interviewer conducting an interview based on the candidate's resume.

Candidate resume:
${interviewState.resumeText}

Difficulty: ${interviewState.level}

Generate ONE technical interview question based on the candidate's resume and experience.
Return only the question.
`;

if (isFollowUp && previousAnswer) {
  prompt = `
You are continuing a technical interview based on the candidate's resume.

Candidate resume:
${interviewState.resumeText}

Difficulty: ${interviewState.level}

Candidate's previous answer:
"${previousAnswer}"

Ask ONE deep follow-up technical question related to the candidate's answer.
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
