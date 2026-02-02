const express = require("express");
const router = express.Router();
const { saveResume, getResume } = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/save", authMiddleware, saveResume);
router.get("/get", authMiddleware, getResume);

module.exports = router;
