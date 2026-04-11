import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CameraFeed from "../components/CameraFeed";
import loginHero from "../assets/hr-ai-login-hero.svg";
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

  const isValidGmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);
  };

  useEffect(() => {
    loadFaceModels().catch(() => setFaceStatus("Unable to load face scanner"));
  }, []);

  const handleFaceScan = async () => {
    try {
      setScanning(true);
      setFaceStatus("Scanning and verifying...");
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
    if (!isValidGmail(email)) {
      alert("Please enter a valid Gmail address");
      return;
    }

    if (!isStrongPassword(password)) {
      alert("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
      return;
    }

    e.preventDefault();
    if (!faceDescriptor.length) {
      alert("Please scan your face before logging in.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, faceDescriptor }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (rememberMe) {
        localStorage.setItem("token", data.token);
        if (faceSnapshot) localStorage.setItem("userFaceSnapshot", faceSnapshot);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userFaceSnapshot");
      } else {
        sessionStorage.setItem("token", data.token);
        if (faceSnapshot) sessionStorage.setItem("userFaceSnapshot", faceSnapshot);
        localStorage.removeItem("token");
        localStorage.removeItem("userFaceSnapshot");
      }

      navigate("/home");
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
          <p className="text-xs text-slate-500">Face scan matches your enrolled profile</p>
        </div>
        <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-stretch lg:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hero-mesh glass-card order-2 flex flex-col justify-between rounded-[1.5rem] px-6 py-8 sm:rounded-[2rem] sm:px-10 sm:py-10 lg:order-1 lg:min-h-0"
          >
            <div>
              <p className="eyebrow">Secure Login</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Login with credentials plus verified face scan.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-8 text-slate-600 sm:text-base">
                Your interview data, score trends, and feedback reports stay connected to the same candidate identity throughout the full workflow.
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.35rem] border border-white/50 bg-white/30 shadow-inner">
              <img src={loginHero} alt="" className="h-auto w-full object-cover object-center" />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <InfoPill title="Secure Access" text="Email, password, and face verification" />
              <InfoPill title="Tracked Reports" text="Score history stays tied to your profile" />
              <InfoPill title="Interview Ready" text="Continue practice from the same account" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card order-1 rounded-[1.5rem] px-5 py-7 sm:rounded-[2rem] sm:px-8 sm:py-10 lg:order-2 lg:min-h-0"
          >
            <div className="mb-8">
              <p className="eyebrow">Welcome Back</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Continue your AI interview journey</h2>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="field pr-14"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="panel-card rounded-[1.6rem] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Face verification</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500">Use the same person who enrolled during signup.</p>
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
                      The scanned image will also appear during the interview session and feedback report.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
                  />
                  Remember me
                </label>
                <span className="text-slate-400">Face scan remains required for login.</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="primary-btn w-full px-6 py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800">
                Create one
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ title, text }) {
  return (
    <div className="panel-card rounded-[1.4rem] p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-xs leading-6 text-slate-600">{text}</p>
    </div>
  );
}
