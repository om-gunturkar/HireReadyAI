const mongoose = require("mongoose");

const FeedbackScoreSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    mode: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true, index: true },
    level: { type: String, required: true, trim: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, required: true, index: true },
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
    answers: { type: [Object], default: [] },
  },
  {
    timestamps: true,
    collection: "feedbackscores",
  }
);

FeedbackScoreSchema.index({ userId: 1, mode: 1, topic: 1, completedAt: 1 });

module.exports = mongoose.model("FeedbackScore", FeedbackScoreSchema);
