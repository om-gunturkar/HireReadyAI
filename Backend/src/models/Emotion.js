const mongoose = require("mongoose");

const EmotionSchema = new mongoose.Schema({
  emotion: { type: String, trim: true, default: "" },
  confidence: { type: Number, required: true },
  attention: { type: Number, default: 0 }, // 0 or 1 (poor or good)
  timestamp: { type: Date, required: true, default: Date.now },
  sessionId: { type: String, default: null }, // link to interview session
});

module.exports = mongoose.model("Emotion", EmotionSchema);
