require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// CONNECT DATABASE (needed for auth)
connectDB();

app.use(cors());
app.use(express.json());

// AUTH ROUTES
app.use("/api/auth", require("./src/routes/authRoutes"));

// INTERVIEW ROUTES
app.use("/api/interview", require("./src/routes/interviewRoutes"));
app.use("/api/ai", require("./src/routes/aiRoutes"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

