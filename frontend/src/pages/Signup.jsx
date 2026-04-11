import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import CameraFeed from "../components/CameraFeed";
import loginHero from "../assets/hr-ai-login-hero.svg";
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
  const [error, setError] = useState("");

  useEffect(() => {
    loadFaceModels().catch(() => setFaceStatus("Unable to load face scanner"));
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
  const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!isValidGmail(email)) {
      setError("Please enter a valid Gmail address");
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      return;
    }

    if (!faceDescriptor.length) {
      setError("Please scan your face before signing up.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, faceDescriptor }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Signup successful. You can now log in with password and face scan.");
      navigate("/login");
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="page-frame flex min-h-[100dvh] flex-col justify-center py-8 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="text-sm font-semibold text-teal-800 transition hover:text-teal-950">← Hire Ready AI</Link>
          <p className="text-xs text-slate-500">One face enrollment for login + interviews</p>
        </div>
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            className="hero-mesh glass-card order-2 rounded-[1.5rem] px-6 py-8 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:order-1 lg:min-h-0"
          >
            <p className="eyebrow">Candidate Onboarding</p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Create a stronger interview profile from day one.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600 sm:text-base">
              Account setup now enrolls the user face so the same verified person continues through login, interview session, feedback, and score history.
            </p>

            <div className="mt-8 overflow-hidden rounded-[1.35rem] border border-white/50 bg-white/30 shadow-inner">
              <img src={loginHero} alt="" className="h-auto w-full object-cover object-center" />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoTile title="Single identity" text="Signup face links to all sessions" />
              <InfoTile title="Faster workflow" text="Resume, interview, and report in one account" />
              <InfoTile title="Safer access" text="Face + password based login flow" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card order-1 rounded-[1.5rem] px-5 py-7 sm:rounded-[2rem] sm:px-8 sm:py-10 lg:order-2 lg:min-h-0"
          >
            <div className="mb-8">
              <p className="eyebrow">Create Account</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Start your AI interview journey</h2>
            </div>

            <form className="space-y-5" onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="field"
                required
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                required
              />

              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field"
                required
              />

              <div className="panel-card rounded-[1.6rem] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Face enrollment</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">Scan now. The same person will be required for login and interview access.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFaceScan}
                    disabled={scanning}
                    className="secondary-btn px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {scanning ? "Scanning..." : faceDescriptor.length ? "Rescan" : "Scan Face"}
                  </button>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="overflow-hidden rounded-[1.25rem] border border-slate-200 shadow-sm ring-1 ring-slate-200/60">
                    <div className="aspect-[4/3] w-full max-h-[min(52vh,340px)] sm:max-h-[380px]">
                      <CameraFeed videoRef={videoRef} />
                    </div>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/85 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.26em] text-teal-700">Status</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{faceStatus}</p>
                    <div className="mt-5 rounded-[1rem] bg-white p-3 text-sm text-slate-500">
                      Your interview reports and analysis will stay associated with this account and its registered email.
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="primary-btn w-full px-6 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
                Login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ title, text }) {
  return (
    <div className="panel-card rounded-[1.4rem] p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs leading-6 text-slate-600">{text}</p>
    </div>
  );
}
