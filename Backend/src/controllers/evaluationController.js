const { evaluateWithAI } = require("../services/evaluationService");

const evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Missing question or answer" });
    }

    const result = await evaluateWithAI(question, answer);

    res.json(result);
  } catch (err) {
    console.error("Evaluation Error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};

module.exports = { evaluateAnswer };
