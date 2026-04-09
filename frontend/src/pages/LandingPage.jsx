import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mt-20 flex justify-center"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-4xl border">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Interview Dashboard</h3>
          <span className="text-sm text-green-500">● Live</span>
        </div>

        {/* CONTENT */}
        <div className="grid md:grid-cols-3 gap-4">

          {/* SCORE */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 p-4 rounded-xl"
          >
            <p className="text-sm text-gray-500">Confidence</p>
            <p className="text-2xl font-bold text-purple-600">85%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 p-4 rounded-xl"
          >
            <p className="text-sm text-gray-500">Communication</p>
            <p className="text-2xl font-bold text-purple-600">78%</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-50 p-4 rounded-xl"
          >
            <p className="text-sm text-gray-500">Technical</p>
            <p className="text-2xl font-bold text-purple-600">82%</p>
          </motion.div>

        </div>

        {/* FAKE GRAPH */}
        <div className="mt-6 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-xl animate-pulse"></div>

      </div>
    </motion.div>
  );
}
export default function App() {
  return (
    <div className="font-sans text-gray-800 bg-gradient-to-b from-white to-purple-50">

      {/* ================= NAVBAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center px-10 py-5 backdrop-blur-md bg-white/70 sticky top-0 z-50"
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
          Hire Ready AI
        </h1>

        <div className="flex items-center gap-6">
          <a href="#features" className="hover:text-purple-600 transition">Features</a>
          <a href="#pricing" className="hover:text-purple-600 transition">Pricing</a>

          <Link to="/login">
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-5 py-2 rounded-xl shadow hover:scale-105 transition">
              Login
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* ================= HERO ================= */}
      <section className="px-8 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 🔥 HERO HEADING */}
            <h1 className="text-5xl font-bold leading-tight">
              Practice Smarter. <br />

              <span className="gradient-text">
                <Typewriter
                  words={[
                    "Get Hired Faster.",
                    "Crack Interviews Easily.",
                    "Boost Your Confidence.",
                    "Land Your Dream Job."
                  ]}
                  loop={true}
                  cursor={false} // ❌ disable default cursor
                  typeSpeed={65}
                  deleteSpeed={40}
                  delaySpeed={1500}
                />
              </span>

              {/* 🔥 GLOW CURSOR */}
              <span className="glow-cursor ml-1">|</span>
            </h1>

            {/* 🔥 DESCRIPTION */}
            <p className="text-gray-600 text-lg">
              AI-powered resumes, mock interviews, and real-time feedback —
              everything you need to crack interviews confidently.
            </p>

            {/* 🔥 FEATURES LIST */}
            <ul className="space-y-2 text-gray-700">
              <li className="hover:translate-x-1 transition">🎯 Personalized Resume Builder</li>
              <li className="hover:translate-x-1 transition">📊 Skill Gap Analysis</li>
              <li className="hover:translate-x-1 transition">🎤 AI Mock Interviews</li>
              <li className="hover:translate-x-1 transition">📈 Confidence Tracking</li>
            </ul>

            {/* 🔥 BUTTONS */}
            <div className="flex gap-4">
              <Link to="/signup">
                <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition duration-300">
                  Get Started Free
                </button>
              </Link>

              <button className="border px-6 py-3 rounded-xl hover:bg-gray-100 hover:scale-105 transition duration-300">
                ▶ Watch Demo
              </button>
            </div>
          </motion.div>


          {/* ================= RIGHT SIDE ================= */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <p className="text-sm text-gray-500">Resume Score</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">82%</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition"
            >
              <p className="text-sm text-gray-500">Profile Completion</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">70%</p>
            </motion.div>
          </motion.div>

        </div>
      </section>
      <DashboardPreview />
      {/* ================= FEATURES ================= */}
      <section id="features" className="py-28 px-8 bg-gradient-to-b from-white to-purple-50">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Powerful <span className="text-purple-600">AI Features</span>
          </h2>

          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Everything you need to build resumes, crack interviews, and boost confidence — powered by AI.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          {[
            {
              title: "AI Resume Builder",
              desc: "Generate ATS-friendly resumes tailored to job roles instantly.",
              icon: "📄"
            },
            {
              title: "Skill Gap Analysis",
              desc: "Identify missing skills and improve your profile strategically.",
              icon: "📊"
            },
            {
              title: "AI Mock Interviews",
              desc: "Practice real interview questions with AI voice interaction.",
              icon: "🎤"
            },
            {
              title: "Confidence Tracking",
              desc: "Track facial expressions and confidence in real-time.",
              icon: "🧠"
            },
            {
              title: "Real-Time Feedback",
              desc: "Get instant AI feedback to improve your answers.",
              icon: "⚡"
            },
            {
              title: "ATS Optimization",
              desc: "Ensure your resume passes modern ATS systems easily.",
              icon: "✅"
            }
          ].map((item, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/40 hover:shadow-2xl transition duration-300"
            >

              {/* ICON */}
              <div className="text-4xl mb-4">{item.icon}</div>

              {/* TITLE */}
              <h3 className="text-xl font-semibold mb-2 text-purple-600">
                {item.title}
              </h3>

              {/* DESC */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>

            </motion.div>

          ))}

        </div>

      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-28 px-8 bg-purple-50">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Loved by <span className="text-purple-600">Developers</span>
          </h2>

          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            See how candidates improved their interview performance using Hire Ready AI.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          {[
            {
              name: "Rahul Sharma",
              role: "Frontend Developer",
              review: "This platform helped me boost my confidence and crack my first interview!",
              img: "https://i.pravatar.cc/150?img=3"
            },
            {
              name: "Priya Verma",
              role: "Software Engineer",
              review: "AI feedback is incredibly accurate. My communication improved a lot.",
              img: "https://i.pravatar.cc/150?img=5"
            },
            {
              name: "Amit Patel",
              role: "Full Stack Developer",
              review: "Mock interviews feel real. It’s like practicing with a real interviewer.",
              img: "https://i.pravatar.cc/150?img=8"
            }
          ].map((user, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/40 hover:shadow-2xl transition duration-300"
            >

              {/* USER INFO */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user.img}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* ⭐ RATING */}
              <div className="text-yellow-500 mb-2 text-lg">★★★★★</div>

              {/* REVIEW */}
              <p className="text-gray-600 text-sm leading-relaxed">
                “{user.review}”
              </p>

            </motion.div>

          ))}

        </div>

      </section>
      {/* ================= PRICING ================= */}
      {/* ================= PRICING ================= */}
      <section id="pricing" className="py-28 px-8 bg-gradient-to-b from-white to-purple-50">

        {/* TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Simple, Transparent <span className="text-purple-600">Pricing</span>
          </h2>

          <p className="text-gray-500 mt-4">
            Start free. Upgrade when you're ready to get serious.
          </p>
        </motion.div>

        {/* CARDS */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">

          {/* ================= FREE ================= */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/40"
          >
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-gray-500 mb-6">Best for beginners</p>

            <p className="text-4xl font-bold mb-6">₹0</p>

            <ul className="text-gray-600 space-y-3 mb-6 text-sm">
              <li>✔ 3 Mock Interviews</li>
              <li>✔ Basic Resume Builder</li>
              <li>✔ Limited AI Feedback</li>
              <li>❌ No Confidence Tracking</li>
              <li>❌ No Advanced Analytics</li>
            </ul>

            <button className="w-full border py-3 rounded-xl hover:bg-gray-100 transition">
              Get Started
            </button>
          </motion.div>

          {/* ================= PRO (MOST POPULAR) ================= */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="relative bg-gradient-to-br from-purple-600 to-pink-500 text-white p-8 rounded-2xl shadow-2xl"
          >
            {/* BADGE */}
            <div className="absolute top-0 right-0 bg-white text-purple-600 text-xs px-3 py-1 rounded-bl-xl rounded-tr-xl font-semibold">
              MOST POPULAR
            </div>

            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <p className="opacity-80 mb-6">For serious candidates</p>

            <p className="text-4xl font-bold mb-6">₹99/mo</p>

            <ul className="space-y-3 mb-6 text-sm">
              <li>✔ Unlimited Mock Interviews</li>
              <li>✔ AI Answer Evaluation</li>
              <li>✔ Confidence Tracking (Face AI)</li>
              <li>✔ Real-time Feedback</li>
              <li>✔ ATS Resume Optimization</li>
            </ul>

            <button className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold hover:scale-105 transition">
              Upgrade Now
            </button>
          </motion.div>

          {/* ================= PREMIUM ================= */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/40"
          >
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <p className="text-gray-500 mb-6">For top performers</p>

            <p className="text-4xl font-bold mb-6">₹199/mo</p>

            <ul className="text-gray-600 space-y-3 mb-6 text-sm">
              <li>✔ Everything in Pro</li>
              <li>✔ Personalized AI Coaching</li>
              <li>✔ Detailed Performance Reports</li>
              <li>✔ Interview Strategy Tips</li>
              <li>✔ Priority Support</li>
            </ul>

            <button className="w-full border py-3 rounded-xl hover:bg-gray-100 transition">
              Go Premium
            </button>
          </motion.div>

        </div>

      </section>
      {/* ================= FOOTER ================= */}
      <footer className="py-10 text-center text-gray-500">
        © {new Date().getFullYear()} HireReadyAI. All rights reserved.
      </footer>

    </div>
  );
}