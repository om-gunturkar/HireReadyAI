const express = require("express");
const router = express.Router();

const {
  startInterview,
  nextQuestion,
} = require("../controllers/interviewController");

router.post("/start", startInterview);
router.post("/next", nextQuestion);

module.exports = router;
