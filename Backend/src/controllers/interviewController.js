let difficulty = 1;

function extractConcept(answer = "") {
  const words = answer.toLowerCase().split(" ");
  return words.find((w) => w.length > 5) || "this concept";
}

function updateDifficulty(answer = "") {
  if (answer.length > 60) return 3;
  if (answer.length > 30) return 2;
  return 1;
}

function generateQuestion(answer = "") {
  difficulty = updateDifficulty(answer);
  const concept = extractConcept(answer);

  if (difficulty === 1) return `What is ${concept}?`;
  if (difficulty === 2)
    return `Why is ${concept} important in real applications?`;
  return `How does ${concept} impact performance or scalability?`;
}

exports.startInterview = (req, res) => {
  difficulty = 1;
  res.json({
    question:
      "Please explain any core concept related to your selected language.",
  });
};

exports.nextQuestion = (req, res) => {
  const { answer } = req.body;
  res.json({ question: generateQuestion(answer) });
};
