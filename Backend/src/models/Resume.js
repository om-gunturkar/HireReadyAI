const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    email: String,
    phone: String,
    linkedin: String,
    github: String,
    portfolio: String,
    summary: String,

    education: [
      {
        degree: String,
        institute: String,
        score: String,
        year: String,
      },
    ],

    skills: [String],

    experience: [
      {
        role: String,
        company: String,
        duration: String,
        points: String,
      },
    ],

    projects: [
      {
        title: String,
        tech: String,
        points: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", ResumeSchema);
