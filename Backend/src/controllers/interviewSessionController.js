const crypto = require("crypto");
const Emotion = require("../models/Emotion");
const InterviewSession = require("../models/InterviewSession");
const { evaluateWithAI } = require("../services/evaluationService");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const toHundredScale = (score) => {
  const numeric = Number(score);
  if (Number.isNaN(numeric)) return 0;
  return numeric <= 10 ? clamp(Math.round(numeric * 10), 0, 100) : clamp(Math.round(numeric), 0, 100);
};

const average = (list) => {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const sum = list.reduce((acc, value) => acc + Number(value || 0), 0);
  return Math.round(sum / list.length);
};

const pickRandomFollowUpTargets = (maxQuestions = 10, totalTargets = 2) => {
  const available = [];
  for (let questionNumber = 2; questionNumber <= maxQuestions; questionNumber += 1) {
    available.push(questionNumber);
  }

  for (let i = available.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  return available.slice(0, totalTargets).sort((a, b) => a - b);
};

const buildSummary = (session, emotions) => {
  const answers = session.answers || [];

  const technicalScore = average(answers.map((a) => a.technicalScore));
  const communicationScore = average(answers.map((a) => a.communicationScore));
  const answerConfidenceScore = average(answers.map((a) => a.confidenceScore));

  const emotionCounts = {
    happy: 0,
    neutral: 0,
    sad: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
    unknown: 0,
  };

  let emotionConfidenceSum = 0;
  let attentionSum = 0;

  emotions.forEach((item) => {
    const emotion = (item.emotion || "").toLowerCase();
    if (emotionCounts[emotion] !== undefined) {
      emotionCounts[emotion] += 1;
    } else {
      emotionCounts.unknown += 1;
    }

    emotionConfidenceSum += Number(item.confidence || 0);
    attentionSum += Number(item.attention || 0);
  });

  const totalFrames = emotions.length;
  const averageVisualConfidence = totalFrames > 0 ? Math.round(emotionConfidenceSum / totalFrames) : 0;
  const focusScore = totalFrames > 0 ? Math.round((attentionSum / totalFrames) * 100) : 0;
  const stressFrames = emotionCounts.sad + emotionCounts.angry + emotionCounts.fearful + emotionCounts.disgusted;
  const composureScore = totalFrames > 0 ? clamp(Math.round(((totalFrames - stressFrames) / totalFrames) * 100), 0, 100) : 0;

  const confidenceScore = Math.round(answerConfidenceScore * 0.6 + averageVisualConfidence * 0.4);
  const totalScore = Math.round(
    technicalScore * 0.45 + communicationScore * 0.3 + confidenceScore * 0.25
  );

  const strengths = [];
  const improvements = [];

  if (technicalScore >= 75) strengths.push("Strong technical understanding across interview responses.");
  if (communicationScore >= 75) strengths.push("Clear and structured communication while answering questions.");
  if (confidenceScore >= 75) strengths.push("Good confidence and interview presence on camera.");
  if (focusScore >= 75) strengths.push("Maintained strong focus and attention throughout the interview.");

  if (technicalScore < 65) improvements.push("Improve technical depth with more role-specific practice questions.");
  if (communicationScore < 65) improvements.push("Use clearer answer structure: context, approach, and final outcome.");
  if (confidenceScore < 65) improvements.push("Practice mock sessions to improve confidence and delivery stability.");
  if (focusScore < 65) improvements.push("Maintain consistent eye focus on camera and reduce movement.");

  const aiFeedback = [
    `Overall performance is ${totalScore >= 75 ? "strong" : totalScore >= 60 ? "moderate" : "developing"} with a score of ${totalScore}/100.`,
    `Technical: ${technicalScore}/100, Communication: ${communicationScore}/100, Confidence: ${confidenceScore}/100.`,
    answers.length > 0
      ? `You answered ${answers.length} question${answers.length === 1 ? "" : "s"} with recorded AI evaluation.`
      : "No valid question-answer pairs were recorded, so technical feedback is limited.",
  ];

  return {
    scoreData: {
      totalScore,
      technicalScore,
      communicationScore,
      confidenceScore,
    },
    summary: {
      strengths,
      improvements,
      aiFeedback,
      emotionBreakdown: emotionCounts,
      totalFrames,
      averageVisualConfidence,
      focusScore,
      composureScore,
    },
  };
};

exports.startSession = async (req, res) => {
  try {
    const { mode, topic, level } = req.body;

    if (!mode || !topic || !level) {
      return res.status(400).json({ error: "mode, topic and level are required" });
    }

    const sessionId = crypto.randomUUID();
    const session = await InterviewSession.create({
      sessionId,
      mode,
      topic,
      level,
      followUpTargets: pickRandomFollowUpTargets(10, 2),
    });

    return res.status(201).json({
      message: "Interview session started",
      sessionId: session.sessionId,
    });
  } catch (err) {
    console.error("startSession error:", err);
    return res.status(500).json({ error: "Failed to start session" });
  }
};

exports.saveAnswerEvaluation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "question and answer are required" });
    }

    const session = await InterviewSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const aiResult = await evaluateWithAI(question, answer);

    const evaluation = {
      technicalScore: toHundredScale(aiResult.technicalScore),
      communicationScore: toHundredScale(aiResult.communicationScore),
      confidenceScore: toHundredScale(aiResult.confidenceScore),
      overallScore: toHundredScale(aiResult.overallScore),
      feedback: aiResult.feedback || "Feedback generated successfully.",
    };

    session.answers.push({
      question,
      answer,
      ...evaluation,
    });

    await session.save();

    return res.status(201).json({
      message: "Answer evaluated and saved",
      evaluation,
    });
  } catch (err) {
    console.error("saveAnswerEvaluation error:", err);
    return res.status(500).json({ error: "Failed to evaluate answer" });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const emotions = await Emotion.find({ sessionId }).sort({ timestamp: 1 });
    const report = buildSummary(session, emotions);

    session.status = "completed";
    session.completedAt = new Date();
    session.scoreData = report.scoreData;
    session.summary = report.summary;
    await session.save();

    return res.status(200).json({
      message: "Interview completed",
      sessionId,
      mode: session.mode,
      topic: session.topic,
      level: session.level,
      answers: session.answers,
      ...report,
    });
  } catch (err) {
    console.error("completeSession error:", err);
    return res.status(500).json({ error: "Failed to complete session" });
  }
};

exports.getSessionReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findOne({ sessionId });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    let scoreData = session.scoreData;
    let summary = session.summary;

    if (!summary || !session.completedAt) {
      const emotions = await Emotion.find({ sessionId }).sort({ timestamp: 1 });
      const report = buildSummary(session, emotions);
      scoreData = report.scoreData;
      summary = report.summary;
    }

    return res.status(200).json({
      sessionId: session.sessionId,
      mode: session.mode,
      topic: session.topic,
      level: session.level,
      status: session.status,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      answers: session.answers,
      scoreData,
      summary,
    });
  } catch (err) {
    console.error("getSessionReport error:", err);
    return res.status(500).json({ error: "Failed to fetch session report" });
  }
};
