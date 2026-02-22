require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const resumeRoutes = require("./src/routes/resume");
const interviewRoutes = require("./src/routes/interviewRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is working" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

// Global Error Handler (Good Practice)
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message);
  res.status(500).json({ error: "Something went wrong" });
});

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
