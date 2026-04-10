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
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);

      const photo =
        localStorage.getItem("userFaceSnapshot") ||
        sessionStorage.getItem("userFaceSnapshot") ||
        localStorage.getItem("userPhoto");

      if (photo) setUserPhoto(photo);
    } catch {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      localStorage.removeItem("userFaceSnapshot");
      sessionStorage.removeItem("userFaceSnapshot");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("userFaceSnapshot");
    sessionStorage.removeItem("userFaceSnapshot");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-white via-purple-50 to-purple-100">
      <div className="absolute top-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-purple-400/30 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-pink-400/30 blur-[120px]" />

      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-white/30 bg-white/60 px-10 py-4 backdrop-blur-xl">
        <h1 className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-2xl font-extrabold text-transparent">
          Hire Ready AI
        </h1>

        <div className="hidden gap-8 font-medium text-gray-700 md:flex">
          {["Dashboard", "Interviews", "Resume", "Analytics"].map((item, i) => (
            <span key={i} className="group relative cursor-pointer">
              {item}
              <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-purple-500 transition-all group-hover:w-full" />
            </span>
          ))}
        </div>

        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2 shadow-sm backdrop-blur-md transition hover:bg-white/60"
            >
              <img
                src={userPhoto || `https://ui-avatars.com/api/?name=${user.name}&background=7c3aed&color=fff`}
                className="h-10 w-10 rounded-full border-2 border-purple-500 object-cover shadow-md"
              />

              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 space-y-1 rounded-2xl border bg-white/90 p-2 shadow-xl backdrop-blur-xl">
                <button
                  onClick={() => navigate("/settings")}
                  className="w-full rounded-lg px-4 py-2 text-left transition hover:bg-purple-50"
                >
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-2 text-left text-red-500 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="flex-grow">
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mt-28 flex flex-col items-center px-6 text-center"
        >
          <h2 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl">
            <span className="text-gray-900">Practice Smarter.</span> <br />
            <span className="animate-pulse bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Get Hired Faster.
            </span>
          </h2>

          <p className="mb-16 max-w-2xl text-lg text-gray-600">
            AI-powered resumes, mock interviews, and real-time feedback -
            everything you need to crack interviews confidently.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center gap-12 md:flex-row"
          >
            {[
              {
                icon: "📄",
                title: "Create Resume",
                desc: "AI-powered ATS-friendly resume builder",
                path: "/create-resume",
                btn: "Get Started ->",
              },
              {
                icon: "🎤",
                title: "Mock Interview",
                desc: "Real-time AI interview + scoring",
                path: "/mock-interview",
                btn: "Start Interview ->",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -8 }}
                onClick={() => navigate(card.path)}
                className="group w-80 cursor-pointer rounded-3xl border border-white/30 bg-white/30 p-10 shadow-lg transition duration-300 hover:shadow-[0_20px_60px_rgba(124,58,237,0.3)] backdrop-blur-xl"
              >
                <div className="mb-6 text-5xl transition group-hover:scale-110">{card.icon}</div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-800">{card.title}</h3>
                <p className="text-sm text-gray-600">{card.desc}</p>
                <button className="mt-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-6 py-2 text-sm text-white shadow-md transition hover:shadow-lg">
                  {card.btn}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>

      <footer className="mt-auto border-t bg-white/70 py-6 text-center text-sm text-gray-500 backdrop-blur-md">
        © {new Date().getFullYear()} Hire Ready AI. All rights reserved.
      </footer>
    </div>
  );
}
