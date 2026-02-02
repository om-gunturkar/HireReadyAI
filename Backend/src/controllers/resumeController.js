const Resume = require("../models/Resume");

exports.saveResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, resume });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    res.status(200).json(resume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
