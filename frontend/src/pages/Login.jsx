import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("token", data.token);
      } else {
        sessionStorage.setItem("token", data.token);
      }
      navigate("/home");
    } catch (error) {
      alert("Something went wrong");
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
            className="w-full py-4 rounded-xl
    bg-gradient-to-r from-purple-600 to-pink-500
    text-white font-semibold text-lg
    shadow-lg hover:scale-105 hover:shadow-xl transition duration-300"
          >
            Login
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