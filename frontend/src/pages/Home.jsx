import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
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
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100">


      {/* ================= NAVBAR ================= */}
      <nav className="bg-white/70 backdrop-blur-lg shadow-sm px-10 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">
          Hire Ready AI
        </h1>

        {user && (
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
              hover:bg-white/60 transition"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="user"
                className="w-8 h-8 rounded-full"
              />
              <div className="text-left">
                <p className="font-semibold text-gray-700 text-sm">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2
                  text-red-600 hover:bg-gray-100 rounded-xl"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="flex flex-col items-center text-center mt-24 px-6">
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-800 mb-6">
          Practice Smarter. <br /> Get Hired Faster.
        </h2>

        <p className="max-w-3xl text-gray-700 text-lg mb-20">
          Build professional resumes, practice AI-powered mock interviews,
          and receive real-time feedback to crack real-world interviews with confidence.
        </p>

        {/* ================= GLASS ACTION CARDS ================= */}
        <div className="flex flex-col md:flex-row gap-12">

          {/* Create Resume */}
          <div
            onClick={() => navigate("/resume-templates")}
            className="
              cursor-pointer w-80 rounded-3xl p-10
              bg-gradient-to-br from-white/40 to-white/10
              backdrop-blur-xl
              border border-white/40
              shadow-[0_8px_32px_rgba(31,38,135,0.25)]
              hover:shadow-[0_12px_40px_rgba(31,38,135,0.4)]
              hover:-translate-y-1
              hover:ring-2 hover:ring-purple-300/40
              transition-all duration-300
            "
          >
            <div className="text-5xl mb-6">📄</div>
            <h3 className="text-2xl font-semibold text-purple-800 mb-2">
              Create Resume
            </h3>
            <p className="text-gray-700 text-sm">
              Design ATS-friendly resumes using modern templates.
            </p>

            <button className="
              mt-6 px-6 py-2 rounded-full
              bg-purple-600/80 text-white text-sm
              backdrop-blur-md hover:bg-purple-700
              transition
            ">
              Get Started →
            </button>
          </div>

          {/* Mock Interview */}
          <div
            onClick={() => navigate("/mock-interview")}
            className="
              cursor-pointer w-80 rounded-3xl p-10
              bg-gradient-to-br from-white/40 to-white/10
              backdrop-blur-xl
              border border-white/40
              shadow-[0_8px_32px_rgba(31,38,135,0.25)]
              hover:shadow-[0_12px_40px_rgba(31,38,135,0.4)]
              hover:-translate-y-1
              hover:ring-2 hover:ring-purple-300/40
              transition-all duration-300
            "
          >
            <div className="text-5xl mb-6">🎤</div>
            <h3 className="text-2xl font-semibold text-purple-800 mb-2">
              Mock Interview
            </h3>
            <p className="text-gray-700 text-sm">
              Practice AI interviews with instant performance feedback.
            </p>

            <button className="
              mt-6 px-6 py-2 rounded-full
              bg-purple-600/80 text-white text-sm
              backdrop-blur-md hover:bg-purple-700
              transition
            ">
              Start Interview →
            </button>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-28 bg-white/70 backdrop-blur-md border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Hire Ready AI. All rights reserved.
      </footer>
    </div>
  );
}
