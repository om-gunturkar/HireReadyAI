const { sendScoreAnalysisEmail } = require("../services/emailService");

// Send score analysis to user email
const sendScoreAnalysis = async (req, res) => {
  try {
    const { scoreData, userEmail, userName } = req.body;

    if (!scoreData || !userEmail) {
      return res.status(400).json({
        success: false,
        message: "scoreData and userEmail are required",
      });
    }

    const result = await sendScoreAnalysisEmail(userEmail, scoreData, userName);

    res.status(200).json({
      success: true,
      message: "Score analysis sent to email successfully",
      data: result,
    });
  } catch (error) {
    console.error("Score analysis error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendScoreAnalysis,
};
