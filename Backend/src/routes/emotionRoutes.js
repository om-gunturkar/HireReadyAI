const express = require("express");
const { saveEmotion, getSessionData } = require("../controllers/emotionController");

const router = express.Router();

// POST /api/emotion  - save a new emotion record
router.post("/", saveEmotion);

// GET /api/emotion/session/:sessionId - fetch all records for a session
router.get("/session/:sessionId", getSessionData);

module.exports = router;
