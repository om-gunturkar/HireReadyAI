import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CameraFeed from "./CameraFeed";
import { captureFaceDescriptor, captureFaceSnapshot, loadFaceModels } from "../services/facialAnalysisService";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [faceSnapshot, setFaceSnapshot] = useState("");
  const [faceStatus, setFaceStatus] = useState("Face verification required");
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFaceModels().catch(() => {
      setFaceStatus("Unable to load face scanner");
    });
  }, []);

  const handleFaceScan = async () => {
    try {
      setScanning(true);
      setFaceStatus("Verifying face...");
      const descriptor = await captureFaceDescriptor(videoRef.current);
      const snapshot = captureFaceSnapshot(videoRef.current);
      setFaceDescriptor(descriptor);
      setFaceSnapshot(snapshot);
      setFaceStatus("Face captured successfully");
    } catch (error) {
      setFaceStatus(error.message || "Face scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!faceDescriptor.length) {
      alert("Please scan your face before logging in.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, faceDescriptor }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        if (faceSnapshot) localStorage.setItem("userFaceSnapshot", faceSnapshot);
        sessionStorage.removeItem("userFaceSnapshot");
        sessionStorage.removeItem("token");
      } else {
        sessionStorage.setItem("token", data.token);
        if (faceSnapshot) sessionStorage.setItem("userFaceSnapshot", faceSnapshot);
        localStorage.removeItem("userFaceSnapshot");
        localStorage.removeItem("token");
      }
      navigate("/home");
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* 🔥 BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1920')",
        }}
      ></div>

      {/* 🔥 DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"></div>

      {/* 🔥 CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-30 w-full max-w-lg p-10
        bg-white/80 backdrop-blur-xl
        border border-white/30
        rounded-3xl shadow-2xl"
      >

        {/* TITLE */}
        <h2 className="text-4xl font-bold text-center mb-2 text-purple-700">
          Welcome Back 👋
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Login to continue your AI interview journey
        </p>

        {/* GOOGLE BUTTON */}


        {/* DIVIDER */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-400"></span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* FORM */}
        <form className="space-y-5" onSubmit={handleLogin}>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 rounded-xl
    border border-gray-300 bg-white/90
    outline-none focus:ring-2 focus:ring-purple-500"
          />

          {/* 🔐 PASSWORD WITH EYE */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 rounded-xl
      border border-gray-300 bg-white/90
      outline-none focus:ring-2 focus:ring-purple-500"
            />

            {/* Eye Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4">
            <p className="text-sm font-semibold text-purple-700">Face verification</p>
            <p className="mt-1 text-xs text-gray-600">
              Use the same person who enrolled during signup.
            </p>
            <div className="mt-4 h-52 overflow-hidden rounded-xl border border-purple-200 bg-black">
              <CameraFeed videoRef={videoRef} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-600">{faceStatus}</p>
              <button
                type="button"
                onClick={handleFaceScan}
                disabled={scanning}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm ring-1 ring-purple-200 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {scanning ? "Scanning..." : faceDescriptor.length ? "Rescan Face" : "Scan Face"}
              </button>
            </div>
          </div>

          {/* 🎨 ANIMATED CHECKBOX */}
          <div className="flex items-center justify-between px-1">

            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setRememberMe(!rememberMe)}
            >
              {/* Animated Box */}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: rememberMe ? "#9333ea" : "#fff",
                  borderColor: rememberMe ? "#9333ea" : "#9ca3af",
                }}
                transition={{ duration: 0.2 }}
                className="w-5 h-5 rounded-md border flex items-center justify-center"
              >
                {rememberMe && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white text-xs"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>

              <span className="text-sm text-gray-600 hover:text-purple-600 transition">
                Remember me
              </span>
            </div>

            <span className="text-sm text-purple-600 hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl
    bg-gradient-to-r from-purple-600 to-pink-500
    text-white font-semibold text-lg
    shadow-lg hover:scale-105 hover:shadow-xl transition duration-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
            Sign up
          </Link>
        </p>

      </motion.div>
    </div>
  );
}
