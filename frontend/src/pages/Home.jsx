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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-white">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-sm px-10 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-700">
          Hire Ready AI
        </h1>

        {user && (
          <div className="relative">
            {/* User Button */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
              hover:bg-gray-100 transition"
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

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg border">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2
                  text-red-600 hover:bg-gray-100 rounded-lg"
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
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-700 mb-6">
          Practice Smarter. <br /> Get Hired Faster.
        </h2>

        <p className="max-w-3xl text-gray-600 text-lg mb-20">
          Build professional resumes, practice AI-powered mock interviews,
          and receive real-time feedback to crack real-world interviews with confidence.
        </p>

        {/* ================= ACTION CARDS ================= */}
        <div className="flex flex-col md:flex-row gap-12">

          {/* Create Resume */}
          <div
            onClick={() => navigate("/resume")}
            className="bg-white rounded-3xl p-10 w-80 cursor-pointer
            shadow-lg hover:shadow-2xl hover:-translate-y-1 transition"
          >
            <div className="text-5xl mb-6">📄</div>
            <h3 className="text-2xl font-semibold text-purple-700 mb-2">
              Create Resume
            </h3>
            <p className="text-gray-600 text-sm">
              Design ATS-friendly resumes using modern templates.
            </p>
          </div>

          {/* Mock Interview */}
          <div
            onClick={() => navigate("/mock-interview")}
            className="bg-white rounded-3xl p-10 w-80 cursor-pointer
            shadow-lg hover:shadow-2xl hover:-translate-y-1 transition"
          >
            <div className="text-5xl mb-6">🎤</div>
            <h3 className="text-2xl font-semibold text-purple-700 mb-2">
              Mock Interview
            </h3>
            <p className="text-gray-600 text-sm">
              Practice AI interviews with instant performance feedback.
            </p>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-28 bg-white border-t py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Hire Ready AI. All rights reserved.
      </footer>
    </div>
  );
}
