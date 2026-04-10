const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    overallScore: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InterviewSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    mode: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    answers: { type: [AnswerSchema], default: [] },
    scoreData: {
      totalScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      communicationScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
    },
    summary: {
      strengths: { type: [String], default: [] },
      improvements: { type: [String], default: [] },
      aiFeedback: { type: [String], default: [] },
      emotionBreakdown: { type: Object, default: {} },
      totalFrames: { type: Number, default: 0 },
      averageVisualConfidence: { type: Number, default: 0 },
      focusScore: { type: Number, default: 0 },
      composureScore: { type: Number, default: 0 },
    },
    followUpCount: { type: Number, default: 0 },
    questionCount: { type: Number, default: 0 },
    followUpTargets: { type: [Number], default: [] },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", InterviewSessionSchema);
