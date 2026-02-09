require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const resumeRoutes = require("./src/routes/resumeRoutes");
const interviewRoutes = require("./src/routes/interviewRoutes");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
