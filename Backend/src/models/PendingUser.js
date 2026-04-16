const mongoose = require("mongoose");

const PendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    password: { type: String, required: true },
    faceDescriptor: { type: [Number], default: [] },
    faceEnrolledAt: { type: Date, default: null },
    verificationToken: { type: String, required: true, unique: true, index: true },
    verificationExpires: { type: Date, required: true, index: true },
  },
  { timestamps: true, collection: "pendingusers" }
);

module.exports = mongoose.model("PendingUser", PendingUserSchema);
