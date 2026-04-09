import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);

      // ✅ LOAD PROFILE IMAGE FROM LOCALSTORAGE
      const photo = localStorage.getItem("userPhoto");
      if (photo) setUserPhoto(photo);

    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden
    bg-gradient-to-br from-white via-purple-50 to-purple-100">

      {/* 🌈 BACKGROUND GLOW */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px]
      bg-purple-400/30 blur-[120px] rounded-full"></div>

      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px]
      bg-pink-400/30 blur-[120px] rounded-full"></div>

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50
      bg-white/60 backdrop-blur-xl border-b border-white/30
      px-10 py-4 flex justify-between items-center">

        {/* LOGO */}
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Hire Ready AI
        </h1>

        {/* MENU */}
        <div className="hidden md:flex gap-8 text-gray-700 font-medium">
          {["Dashboard", "Interviews", "Resume", "Analytics"].map((item, i) => (
            <span key={i} className="relative group cursor-pointer">
              {item}
              <span className="absolute left-0 -bottom-1 w-0 h-[2px]
              bg-purple-500 transition-all group-hover:w-full"></span>
            </span>
          ))}
        </div>

        {/* USER */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl
              bg-white/40 backdrop-blur-md
              hover:bg-white/60 transition shadow-sm"
            >
              {/* ✅ UPDATED AVATAR */}
              <img
                src={
                  userPhoto ||
                  `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=fff`
                }
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 shadow-md"
              />

              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56
  bg-white/90 backdrop-blur-xl
  rounded-2xl shadow-xl border p-2 space-y-1">

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left px-4 py-2
      hover:bg-purple-50 rounded-lg transition"
                >
                  ⚙️ Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2
      text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-grow">

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center mt-28 px-6 relative"
        >

          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="text-gray-900">Practice Smarter.</span> <br />
            <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Get Hired Faster.
            </span>
          </h2>

          <p className="max-w-2xl text-gray-600 text-lg mb-16">
            AI-powered resumes, mock interviews, and real-time feedback —
            everything you need to crack interviews confidently.
          </p>

          {/* CARDS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-12 justify-center"
          >
            {[
              {
                icon: "📄",
                title: "Create Resume",
                desc: "AI-powered ATS-friendly resume builder",
                path: "/create-resume",
                btn: "Get Started →"
              },
              {
                icon: "🎤",
                title: "Mock Interview",
                desc: "Real-time AI interview + scoring",
                path: "/mock-interview",
                btn: "Start Interview →"
              }
            ].map((card, i) => (

              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => navigate(card.path)}
                className="group cursor-pointer w-80 rounded-3xl p-10
                bg-white/30 backdrop-blur-xl border border-white/30
                shadow-lg hover:shadow-[0_20px_60px_rgba(124,58,237,0.3)]
                transition duration-300"
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition">
                  {card.icon}
                </div>

                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  {card.title}
                </h3>

                <p className="text-gray-600 text-sm">{card.desc}</p>

                <button className="mt-6 px-6 py-2 rounded-full
                bg-gradient-to-r from-purple-600 to-pink-500
                text-white text-sm shadow-md hover:shadow-lg transition">
                  {card.btn}
                </button>
              </motion.div>
            ))}
          </motion.div>

        </motion.section>
      </div>

      {/* STATS
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
          <p className="text-gray-500 text-sm">Interviews Taken</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-1">12</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
          <p className="text-gray-500 text-sm">Avg Score</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-1">78%</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-lg border">
          <p className="text-gray-500 text-sm">Confidence</p>
          <h3 className="text-3xl font-bold text-purple-600 mt-1">85%</h3>
        </div>

      </motion.div> */}

      {/* FOOTER */}
      <footer className="bg-white/70 backdrop-blur-md border-t py-6 text-center text-sm text-gray-500 mt-auto">
        © {new Date().getFullYear()} Hire Ready AI. All rights reserved.
      </footer>
    </div>
  );
}