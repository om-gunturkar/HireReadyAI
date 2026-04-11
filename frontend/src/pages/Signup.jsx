import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { Link, useNavigate } from "react-router-dom";
import CameraFeed from "./CameraFeed";
import { captureFaceDescriptor, loadFaceModels } from "../services/facialAnalysisService";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [faceStatus, setFaceStatus] = useState("Face scan required");
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
      setFaceStatus("Scanning face...");
      const descriptor = await captureFaceDescriptor(videoRef.current);
      setFaceDescriptor(descriptor);
      setFaceStatus("Face scan saved successfully");
    } catch (error) {
      setFaceStatus(error.message || "Face scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!faceDescriptor.length) {
      alert("Please scan your face before signing up.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, faceDescriptor }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // Show verification popup instead of immediate navigation
      alert("Signup successful! Please check your email and verify your account before logging in.");

      // Don't navigate to login immediately - user needs to verify email first
      // navigate("/login");
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
          Create Account 🚀
        </h2>

        <p className="text-center text-gray-600 mb-8">
          Start your AI interview journey
        </p>

        <form className="space-y-5" onSubmit={handleSignup}>

          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-4 rounded-xl
          border border-gray-300 bg-white/90
          outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-4 rounded-xl
          border border-gray-300 bg-white/90
          outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-4 rounded-xl
          border border-gray-300 bg-white/90
          outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {/* FACE ENROLLMENT (Styled like login) */}
          <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4">
            <p className="text-sm font-semibold text-purple-700">
              Face enrollment
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Scan your face now. Same person will be required during login.
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
                {scanning
                  ? "Scanning..."
                  : faceDescriptor.length
                    ? "Rescan Face"
                    : "Scan Face"}
              </button>
            </div>
          </div>

          {/* SIGNUP BUTTON */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl
          bg-gradient-to-r from-purple-600 to-pink-500
          text-white font-semibold text-lg
          shadow-lg hover:scale-105 hover:shadow-xl transition duration-300
          disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
