const express = require("express");
const router = express.Router();

/* ---------------- MOCK INTERVIEW QUESTIONS ---------------- */
const questions = {
  C: [
    "What is a variable in C?",
    "What is a pointer?",
    "Difference between array and pointer?",
    "What is malloc?",
    "What is a structure?"
  ],
  Java: [
    "What is JVM?",
    "Difference between JDK and JRE?",
    "What is inheritance?",
    "What is polymorphism?",
    "What is garbage collection?"
  ],
  Python: [
    "What is Python?",
    "What are lists?",
    "Difference between list and tuple?",
    "What is a dictionary?",
    "What is a lambda function?"
  ]
};

router.post("/next", (req, res) => {
  const { value, questionIndex } = req.body;

  if (!value) {
    return res.status(400).json({ question: "Invalid interview topic." });
  }

  const list = questions[value] || [
    "Tell me about yourself.",
    "What are your strengths?",
    "What are your weaknesses?"
  ];

  const question =
    list[questionIndex] || "Interview completed. Thank you.";

  res.json({ question });
});

module.exports = router;
