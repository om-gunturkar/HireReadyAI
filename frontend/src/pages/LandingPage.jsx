import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const featureCards = [
  {
    title: "Mock Interviews That Feel Real",
    text: "Role-based, language-based, and resume-based interviews with live scoring, camera analysis, and structured answer evaluation.",
    stat: "10-question live flow",
  },
  {
    title: "Confidence + Focus Tracking",
    text: "Keep facial signals, focus stability, and speaking behavior in one practical performance report instead of scattered metrics.",
    stat: "Behavior + answer analytics",
  },
  {
    title: "Resume To Interview Journey",
    text: "Build, optimize, and practice in the same product so candidates can improve fast without switching tools.",
    stat: "Single workflow product",
  },
];

const workflow = [
  "Create your account and secure it with face scan login.",
  "Choose a domain, role, language, or upload a resume.",
  "Practice with the live AI interview and camera analysis flow.",
  "Review score trends, strengths, improvements, and email-ready reports.",
];

const trustStats = [
  { label: "Interview modes", value: "3", hint: "Role, language, resume" },
  { label: "Live questions", value: "10", hint: "Per scored session" },
  { label: "Signals tracked", value: "6+", hint: "Face, voice, focus, time" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell overflow-hidden">
      <div className="page-frame">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card sticky top-3 z-40 mt-2 flex flex-wrap items-center gap-3 rounded-[1.75rem] px-5 py-3.5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-6 sm:py-4"
        >
          <Link to="/" className="min-w-0 flex-1 basis-[200px]" onClick={() => setMenuOpen(false)}>
            <p className="eyebrow">Hire Ready AI</p>
            <h1 className="mt-1 text-lg font-semibold leading-snug text-slate-900 sm:text-xl lg:text-2xl">Interview prep with a product feel</h1>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-900">Features</a>
            <a href="#workflow" className="transition hover:text-slate-900">Workflow</a>
            <a href="#project" className="transition hover:text-slate-900">Why Us</a>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            <button
              type="button"
              className="rounded-2xl border border-slate-200 p-2.5 text-slate-700 md:hidden"
              aria-expanded={menuOpen}
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/login" className="secondary-btn px-4 py-2 text-sm whitespace-nowrap">Login</Link>
            <Link to="/signup" className="primary-btn px-4 py-2.5 text-sm whitespace-nowrap sm:px-5">Start Free</Link>
          </div>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full basis-full overflow-hidden border-t border-slate-200/80 pt-3 md:hidden"
              >
                <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  <a href="#features" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Features</a>
                  <a href="#workflow" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Workflow</a>
                  <a href="#project" className="rounded-xl px-3 py-2 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Why Us</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14">
          <div className="hero-mesh glass-card rounded-[2rem] px-6 py-9 shadow-[0_24px_60px_rgba(15,23,42,0.1)] sm:rounded-[2.25rem] sm:px-10 sm:py-11 lg:px-12 lg:py-14">
            <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
              <div className="min-w-0">
                <p className="eyebrow">AI Interview Platform</p>
                <h2 className="section-title mt-4 text-slate-950">
                  From resume to mock interview to feedback report, all in one polished practice loop.
                </h2>
                <p className="mt-6 max-w-[36rem] text-base leading-[1.75] text-slate-700 sm:text-[1.05rem]">
                  Improve technical answers, confidence, focus, and delivery with a workflow that feels closer to a real interview product than a demo project.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link to="/signup" className="primary-btn px-7 py-3 text-center text-[0.95rem]">Create Account</Link>
                  <Link to="/mock-interview" className="secondary-btn px-7 py-3 text-center text-[0.95rem]">Explore Interview Setup</Link>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {["Real-time scoring", "Face-secured login", "Trend-based reports"].map((item) => (
                    <div key={item} className="metric-chip text-sm font-medium text-slate-800">{item}</div>
                  ))}
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {trustStats.map((s) => (
                    <div key={s.label} className="panel-card rounded-[1.35rem] border-slate-200/90 p-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:text-left">
                      <p className="text-2xl font-bold text-slate-950 sm:text-3xl">{s.value}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{s.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{s.hint}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="panel-card rounded-[1.75rem] border-slate-200/90 p-5 shadow-[0_12px_36px_rgba(15,23,42,0.07)] sm:col-span-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">Live Interview Snapshot</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Active</span>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Technical" value="82" helper="out of 100" />
                    <StatCard label="Confidence" value="78" helper="camera + answers" />
                    <StatCard label="Focus" value="91" helper="screen attention" />
                  </div>
                  <div className="soft-grid mt-5 h-36 rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <div className="flex h-full items-end gap-3">
                      {[38, 54, 47, 72, 81, 76, 90].map((bar, index) => (
                        <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-teal-600 via-cyan-500 to-sky-300" style={{ height: `${bar}%` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>

                {featureCards.slice(0, 2).map((item) => (
                  <motion.div key={item.title} whileHover={{ y: -4 }} className="panel-card rounded-[1.5rem] border-slate-200/90 p-5 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item.text}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">{item.stat}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-14 sm:py-16 lg:py-20">
          <div className="mb-10 max-w-2xl">
            <p className="eyebrow">Core Features</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Built for actual practice, not just a pretty demo.</h3>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="panel-card rounded-[1.75rem] border-slate-200/90 p-6 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"
              >
                <div className="mb-5 h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-600" />
                <h4 className="text-xl font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-4 text-sm leading-7 text-slate-700">{item.text}</p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-orange-600">{item.stat}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="workflow" className="pb-14 sm:pb-16 lg:pb-20">
          <div className="glass-card rounded-[2rem] px-6 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-10 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="eyebrow">Workflow</p>
                <h3 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">A clean candidate journey from first screen to final report.</h3>
                <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
                  The strongest interview-prep products reduce friction. This flow is designed so each step leads naturally into the next one.
                </p>
              </div>

              <div className="space-y-4">
                {workflow.map((step, index) => (
                  <div key={step} className="panel-card flex gap-4 rounded-[1.5rem] p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-7 text-slate-700 sm:text-base">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="project" className="pb-14 sm:pb-16 lg:pb-20">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="panel-card rounded-[1.9rem] border-slate-200/90 p-7 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-8">
              <p className="eyebrow">Project Quality</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-950">A better foundation for a strong portfolio-level product.</h3>
              <p className="mt-5 text-sm leading-8 text-slate-700 sm:text-base">
                The goal is not only to make the screens attractive, but to make them feel intentional, responsive, and trustworthy while preserving the core interview logic and stored analytics.
              </p>
            </div>

            <div className="panel-card rounded-[1.9rem] border-slate-200/90 p-7 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-500">Ready To Start</p>
              <p className="mt-4 text-2xl font-semibold text-slate-900">Create your account, secure it with face scan, and begin practicing today.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup" className="primary-btn px-6 py-3 text-center">Sign Up</Link>
                <Link to="/login" className="secondary-btn px-6 py-3 text-center">Login</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">{helper}</p>
    </div>
  );
}
