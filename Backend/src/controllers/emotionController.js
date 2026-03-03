const Emotion = require("../models/Emotion");

/**
 * Save a single emotion record to MongoDB.
 * Expects: { emotion, confidence, attention, timestamp, sessionId }
 */
exports.saveEmotion = async (req, res, next) => {
  try {
    const { emotion, confidence, attention, timestamp, sessionId } = req.body;

    if (confidence === undefined) {
      return res.status(400).json({ error: "Missing confidence score" });
    }

    const record = new Emotion({ emotion, confidence, attention, timestamp, sessionId });
    await record.save();

    res.status(201).json({ message: "Emotion logged" });
  } catch (err) {
    next(err);
  }
};

/**
 * Fetch monitoring data for a specific session (for feedback report)
 */
exports.getSessionData = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const records = await Emotion.find({ sessionId }).sort({ timestamp: 1 });

    if (!records || records.length === 0) {
      return res.status(404).json({ error: "No data found for this session" });
    }

    res.status(200).json({ data: records });
  } catch (err) {
    next(err);
  }
};
