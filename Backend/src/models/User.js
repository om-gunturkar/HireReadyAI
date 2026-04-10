const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    photo: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null, index: true },
    verificationExpires: { type: Date, default: null },
    faceDescriptor: { type: [Number], default: [] },
    faceEnrolledAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
