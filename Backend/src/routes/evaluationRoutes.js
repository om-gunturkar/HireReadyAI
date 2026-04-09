const express = require("express");
const router = express.Router();
const { evaluateAnswer } = require("../controllers/evaluationController");

router.post("/", evaluateAnswer);

module.exports = router;
