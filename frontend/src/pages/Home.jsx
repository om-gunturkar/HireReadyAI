import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { BarChart3, FileText, Mic, ShieldCheck } from "lucide-react";
import dashboardAccent from "../assets/hr-ai-login-hero.svg";

const mockInterviewCard = {
  title: "Mock Interview",
  desc: "10-question live flow with voice, timer, and camera analytics tied to your verified identity.",
  path: "/mock-interview",
  button: "Start Interview",
  accent: "from-teal-600 to-cyan-500",
};

const createResumeHub = {
  title: "Create Resume",
  desc: "Build your resume, pick a polished template, or shape a role-focused version—then use it in resume-based interviews.",
  accent: "from-orange-500 to-amber-400",
  primary: { label: "Open resume builder", path: "/create-resume" },
  options: [
    { label: "Resume templates", hint: "Layouts & PDF export", path: "/resume-templates" },
    { label: "Role-based resume", hint: "Tailor to a job family", path: "/role-based-resume" },
  ],
};

const workflowHints = [
  { label: "Typical session", value: "~15–25 min", detail: "Includes setup, 10 Qs, and scoring" },
  { label: "Signals captured", value: "Answers + video", detail: "Face, focus, and speech during interview" },
  { label: "After you finish", value: "Score + email", detail: "Breakdown and trend vs past attempts" },
];

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("userFaceSnapshot");
    sessionStorage.removeItem("userFaceSnapshot");
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="page-frame">
        <nav className="glass-card mt-2 flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="eyebrow">Candidate Dashboard</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950 sm:text-2xl">Hire Ready AI</h1>
            <Link to="/" className="mt-2 inline-block text-xs font-medium text-slate-500 hover:text-teal-800">Product overview</Link>
          </div>

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex max-w-full items-center gap-3 rounded-2xl bg-white/70 px-3 py-2 shadow-sm transition hover:bg-white"
              >
                <img
                  alt=""
                  src={userPhoto || `https://ui-avatars.com/api/?name=${user.name}&background=0f766e&color=fff`}
                  className="h-11 w-11 shrink-0 rounded-2xl border border-slate-200 object-cover"
                />
                <div className="min-w-0 hidden text-left sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </button>

              {open && (
                <div className="panel-card absolute right-0 z-30 mt-3 w-56 rounded-[1.25rem] p-2 shadow-lg">
                  <button type="button" onClick={() => { setOpen(false); navigate("/settings"); }} className="w-full rounded-xl px-4 py-2 text-left text-sm transition hover:bg-slate-50">
                    Settings
                  </button>
                  <button type="button" onClick={handleLogout} className="w-full rounded-xl px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <section className="pt-8 sm:pt-12">
          <div className="hero-mesh glass-card rounded-[1.75rem] px-5 py-8 sm:rounded-[2.2rem] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10">
              <div className="min-w-0">
                <p className="eyebrow">Welcome Back</p>
                <h2 className="section-title mt-4 text-slate-950">
                  Practice smarter, track improvement, and keep the same candidate identity across every session.
                </h2>
                <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                  Your face-authenticated account keeps interview history, feedback reports, and session analytics connected in one place.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <MetricTile label="Identity" value="Face Verified" />
                  <MetricTile label="Reports" value="Email Ready" />
                  <MetricTile label="Journey" value="Resume To Score" />
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {workflowHints.map((h) => (
                    <div key={h.label} className="panel-card rounded-[1.35rem] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{h.label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{h.value}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{h.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-card flex flex-col rounded-[1.75rem] p-5 sm:rounded-[1.9rem] sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Profile snapshot</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <img
                    alt=""
                    src={userPhoto || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=0f766e&color=fff`}
                    className="h-[5.5rem] w-[5.5rem] shrink-0 rounded-[1.5rem] border border-slate-200 object-cover shadow-sm sm:h-24 sm:w-24"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-slate-900">{user?.name || "Candidate"}</p>
                    <p className="mt-1 break-all text-sm text-slate-500">{user?.email || "Signed in account"}</p>
                    <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Active account session
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200/80 pt-6">
                  <p className="text-sm font-medium leading-7 text-slate-600">
                    This photo comes from your face enrollment. It appears on your interview dashboard and helps tie{" "}
                    <span className="font-semibold text-slate-800">live camera analytics</span> to your Hire Ready AI profile.
                  </p>
                  <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/60">
                    <img src={dashboardAccent} alt="" className="h-auto w-full object-cover opacity-90" />
                  </div>
                  <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <li className="flex items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      <span>Secure login with face match</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2">
                      <Mic className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      <span>Mock interviews & voice capture</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2">
                      <FileText className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      <span>Resume builder & templates</span>
                    </li>
                    <li className="flex items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2">
                      <BarChart3 className="h-4 w-4 shrink-0 text-teal-700" aria-hidden />
                      <span>Scores, trends & feedback</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <p className="eyebrow mb-3">Workspace</p>
          <h3 className="text-2xl font-bold text-slate-950 sm:text-3xl">Continue your hiring prep workflow</h3>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Everything below uses the same authenticated session and face snapshot as your live interview room.</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <motion.div
              whileHover={{ y: -4 }}
              className="panel-card cursor-pointer rounded-[1.75rem] p-6 sm:rounded-[2rem] sm:p-7"
              onClick={() => navigate(mockInterviewCard.path)}
              onKeyDown={(e) => e.key === "Enter" && navigate(mockInterviewCard.path)}
              role="button"
              tabIndex={0}
              aria-label="Start mock interview"
            >
              <div className={`h-3 w-28 rounded-full bg-gradient-to-r ${mockInterviewCard.accent}`} />
              <h3 className="mt-5 text-xl font-semibold text-slate-950 sm:text-2xl">{mockInterviewCard.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{mockInterviewCard.desc}</p>
              <button type="button" className="primary-btn mt-6 px-6 py-3 text-sm">{mockInterviewCard.button}</button>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="panel-card rounded-[1.75rem] p-6 sm:rounded-[2rem] sm:p-7"
            >
              <div className={`h-3 w-28 rounded-full bg-gradient-to-r ${createResumeHub.accent}`} />
              <h3 className="mt-5 text-xl font-semibold text-slate-950 sm:text-2xl">{createResumeHub.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">{createResumeHub.desc}</p>

              <button
                type="button"
                onClick={() => navigate(createResumeHub.primary.path)}
                className="primary-btn mt-6 w-full px-6 py-3 text-sm sm:w-auto"
              >
                {createResumeHub.primary.label}
              </button>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Or start from</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {createResumeHub.options.map((opt) => (
                  <button
                    key={opt.path}
                    type="button"
                    onClick={() => navigate(opt.path)}
                    className="flex flex-col rounded-[1.25rem] border border-slate-200 bg-white/90 px-4 py-3.5 text-left shadow-sm ring-1 ring-slate-100 transition hover:border-teal-300/80 hover:bg-teal-50/60 hover:ring-teal-100"
                  >
                    <span className="text-sm font-semibold text-slate-900">{opt.label}</span>
                    <span className="mt-1 text-xs leading-5 text-slate-500">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div className="metric-chip">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
