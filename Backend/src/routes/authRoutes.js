const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User.js");
const { sendVerificationEmail } = require("../services/authEmailService");

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
   🧪 TEST EMAIL ENDPOINT
============================== */
router.post("/test-email", async (req, res) => {
  try {
    const { testEmail } = req.body;
    
    if (!testEmail) {
      return res.status(400).json({ message: "Please provide testEmail in request body" });
    }

    console.log("\n========== TESTING EMAIL CONFIGURATION ==========");
    console.log("Test email to:", testEmail);
    
    const result = await sendVerificationEmail({
      to: testEmail,
      name: "Test User",
      verificationUrl: "http://localhost:5000/api/auth/verify-email/test-token-123",
      loginUrl: "http://localhost:5173/login",
    });

    console.log("Email test result:", result);
    console.log("==================================================\n");

    if (result.sent) {
      res.json({
        success: true,
        message: "✅ Test email sent successfully!",
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: "❌ Test email failed",
        reason: result.reason,
        error: result.error
      });
    }
  } catch (error) {
    console.error("Test email endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Test failed",
      error: error.message
    });
  }
});

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
    verificationToken: null,
    verificationExpires: null,
  });

  await user.save();

  res.json({
    message: "Signup successful. You can log in with your email, password, and face scan.",
    requiresVerification: false,
  });
});

/* ==============================
   ✅ VERIFY EMAIL
============================== */
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).send(`
        <html>
          <head>
            <title>Email Verification Failed</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
              .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .btn { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Verification Link Expired or Invalid</h2>
              <p>The verification link is invalid or has expired. Please request a new verification email.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Go to Login</a>
            </div>
          </body>
        </html>
      `);
    }

    res.send(`
      <html>
        <head>
          <title>Email Verification - Hire Ready AI</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .btn { display: inline-block; padding: 12px 24px; background: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 10px; cursor: pointer; border: none; font-size: 14px; }
            .login-link { background: #10b981; }
            .login-link:disabled { background: #ccc; cursor: not-allowed; opacity: 0.6; }
            .hidden { display: none; }
            .loading { opacity: 0.6; pointer-events: none; }
            .message { margin: 15px 0; }
          </style>
          <script>
            async function verifyEmail() {
              const verifyBtn = document.getElementById('verifyBtn');
              const status = document.getElementById('status');
              
              verifyBtn.classList.add('loading');
              verifyBtn.textContent = 'Verifying...';
              
              try {
                const response = await fetch('/api/auth/confirm-verification/${token}', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                  verifyBtn.classList.add('hidden');
                  document.getElementById('loginBtn').disabled = false;
                  document.getElementById('loginBtn').style.opacity = '1';
                  status.innerHTML = '<div class="message" style="color: #10b981; font-weight: bold;">✓ Email verified successfully!</div>';
                  setTimeout(() => {
                    window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/login';
                  }, 2000);
                } else {
                  status.innerHTML = '<div class="message" style="color: #dc2626; font-weight: bold;">❌ Verification failed: ' + (data.message || 'Unknown error') + '</div>';
                  verifyBtn.classList.remove('loading');
                  verifyBtn.textContent = 'Try Again';
                }
              } catch (error) {
                console.error('Error:', error);
                status.innerHTML = '<div class="message" style="color: #dc2626;">❌ Error verifying email. Please try again.</div>';
                verifyBtn.classList.remove('loading');
                verifyBtn.textContent = 'Try Again';
              }
            }
            
            function goToLogin() {
              window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:5173'}/login';
            }
          </script>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Hire Ready AI, ${user.name}!</h2>
            <p>Your email has been successfully registered.</p>
            <div id="status">
              <p>Please confirm this is you by clicking the button below to verify your email.</p>
            </div>
            <button id="verifyBtn" onclick="verifyEmail()" class="btn">It's me - Verify Email</button>
            <button id="loginBtn" onclick="goToLogin()" class="btn login-link" disabled style="display: none;">Continue to Login</button>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body><h2>Something went wrong. Please try again.</h2></body>
      </html>
    `);
  }
});

/* ==============================
   ✅ CONFIRM EMAIL VERIFICATION (API)
============================== */
router.post("/confirm-verification/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or has expired. Please sign up again.",
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;
    await user.save();

    return res.json({
      message: "Email verified successfully! You can now log in.",
      success: true,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({
      message: "Error verifying email. Please try again.",
    });
  }
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
