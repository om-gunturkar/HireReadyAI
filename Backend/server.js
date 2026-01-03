require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.use("/api/auth", require("./src/routes/authRoutes"));


app.listen(5000, () => {
  console.log("Server running on port 5000");
});
