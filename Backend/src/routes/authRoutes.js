const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const User = require("../models/User.js");

const router = express.Router();

const compareFaceDescriptors = (stored = [], incoming = []) => {
  if (!Array.isArray(stored) || !Array.isArray(incoming) || stored.length !== incoming.length || stored.length === 0) {
    return { matched: false, distance: null };
  }

  const sum = stored.reduce((acc, value, index) => {
    const diff = Number(value) - Number(incoming[index] || 0);
    return acc + diff * diff;
  }, 0);

  const distance = Math.sqrt(sum);
  return {
    matched: distance <= 0.6,
    distance,
  };
};

/* ==============================
   🔐 AUTH MIDDLEWARE (INLINE)
============================== */
const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ==============================
   📁 FILE UPLOAD CONFIG
============================== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

/* ==============================
   🚀 SIGNUP
============================== */
router.post("/signup", async (req, res) => {
  const { name, email, password, faceDescriptor = [] } = req.body;

  if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return res.status(400).json({ message: "Face scan is required during signup" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    faceDescriptor,
    faceEnrolledAt: new Date(),
    emailVerified: true,
  });

  await user.save();

  res.json({
    message: "Signup successful. You can log in with password and face scan.",
  });
});

/* ==============================
   🔑 LOGIN
============================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password, faceDescriptor = [] } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
      return res.status(400).json({ message: "Face verification is required to log in" });
    }

    const { matched } = compareFaceDescriptors(user.faceDescriptor, faceDescriptor);
    if (!matched) {
      return res.status(401).json({ message: "Face verification failed. Please use the enrolled person to log in." });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        photo: user.photo || "",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ==============================
   ⚙️ UPDATE PROFILE (NEW)
============================== */
router.put(
  "/update-profile",
  protect,
  upload.single("photo"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      const { name, password } = req.body;
      const updateData = {};

      // ✅ update name
      if (name) updateData.name = name;

      // ✅ update password
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
      }

      // ✅ update photo
      if (req.file) {
        updateData.photo = req.file.path;
      }

      // 🔥 RETURN UPDATED USER
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");

      res.json({
        message: "Profile updated successfully",
        user: {
          ...updatedUser._doc,
          photo: updatedUser.photo
            ? `http://localhost:5000/${updatedUser.photo}`
            : null,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update failed" });
    }
  },
);

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json({
      ...user._doc,
      photo: user.photo ? `http://localhost:5000/${user.photo}` : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});
module.exports = router;
