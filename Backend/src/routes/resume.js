const express = require("express");
const multer = require("multer");
const {
  saveResume,
  getResume,
  parseResume
} = require("../controllers/resumeController");

const router = express.Router();

/* Memory storage (no disk save) */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* Resume DB */
router.post("/save", saveResume);
router.get("/get", getResume);

/* Resume Parse */
router.post("/parse", upload.single("resume"), parseResume);

module.exports = router;
