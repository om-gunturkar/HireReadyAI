import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcCheckmark } from "react-icons/fc";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-100 font-poppins text-gray-900">

      {/* ================= NAVBAR ================= */}
      <header className="flex justify-between items-center px-6 md:px-16 py-4 sticky top-0 bg-white z-50 shadow-sm">
        <h1 className="text-2xl font-bold">HireReady<span className="text-purple-600">AI</span></h1>

        <ul className="hidden md:flex gap-10 text-gray-700 text-sm font-medium">
          <li className="hover:text-purple-600 cursor-pointer">Home</li>
          <li className="hover:text-purple-600 cursor-pointer">Features</li>
          <li className="hover:text-purple-600 cursor-pointer">Reviews</li>
          <li className="hover:text-purple-600 cursor-pointer">Pricing</li>
          <li className="hover:text-purple-600 cursor-pointer">Contact</li>
        </ul>

        <button
          onClick={() => navigate("/login")}
          className="hidden md:block border border-purple-600 text-purple-600 px-5 py-2 rounded-full text-sm hover:bg-purple-100">
          Login/Signup
        </button>

        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          {open ? <HiX /> : <HiMenu />}
        </button>
      </header>

      {/* MOBILE NAV */}
      {open && (
        <div className="md:hidden text-center py-4 space-y-4 bg-white shadow">
          <p onClick={() => navigate("/")} className="cursor-pointer hover:text-purple-600">Home</p>
          <p className="hover:text-purple-600 cursor-pointer">Features</p>
          <p className="hover:text-purple-600 cursor-pointer">Reviews</p>
          <p className="hover:text-purple-600 cursor-pointer">Pricing</p>
          <p className="hover:text-purple-600 cursor-pointer">Contact</p>
          <button
            onClick={() => navigate("/login")}
            className="border border-purple-600 text-purple-600 px-5 py-2 rounded-full"
          >
            Login/Signup
          </button>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="relative px-6 md:px-16 py-24 grid md:grid-cols-2 gap-10 items-center overflow-hidden">

        {/* BACKGROUND BLOBS */}
        <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] bg-purple-300 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] bg-pink-300 rounded-full blur-[120px] opacity-40"></div>

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Practice Smarter. <br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-transparent bg-clip-text">
              Get Hired Faster.
            </span>
          </h2>

          <p className="mt-6 text-gray-600 text-lg max-w-lg">
            Experience AI-powered mock interviews, real-time feedback, and smart resume building — all in one platform.
          </p>

          {/* FEATURES */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              "AI Interview",
              "Resume Builder",
              "Confidence Tracking",
              "Instant Feedback",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm bg-white/60 backdrop-blur-md px-3 py-2 rounded-lg shadow-sm"
              >
                <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                {item}
              </div>
            ))}
          </div>

          {/* BUTTONS */}
          <div className="mt-8 flex gap-5">
            <button
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition"
            >
              Get Started 🚀
            </button>

            <button className="border border-purple-600 px-8 py-3 rounded-lg hover:bg-purple-100 transition">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <div className="relative z-10 flex gap-6 items-center justify-center">
          <div className="bg-white/70 backdrop-blur-lg shadow-xl p-6 rounded-2xl text-center hover:scale-105 transition">
            <p className="text-purple-600 font-semibold">Resume Score</p>
            <h1 className="text-4xl font-bold">82%</h1>
          </div>

          <div className="bg-white/70 backdrop-blur-lg shadow-xl p-6 rounded-2xl text-center hover:scale-105 transition">
            <p className="text-purple-600 font-semibold">Confidence</p>
            <h1 className="text-4xl font-bold">76%</h1>
          </div>
        </div>

      </section>
      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 md:px-16 py-24 text-center bg-white">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            How It <span className="text-purple-600">Works</span>
          </h2>

          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            A simple 4-step process to improve your interview skills with AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-10 mt-16">

          {[
            {
              step: "01",
              title: "Choose Your Role",
              desc: "Select your job role or upload your resume to begin."
            },
            {
              step: "02",
              title: "AI Asks Questions",
              desc: "Get real interview questions generated by AI."
            },
            {
              step: "03",
              title: "Answer with Confidence",
              desc: "Speak your answers while AI tracks your confidence."
            },
            {
              step: "04",
              title: "Get Smart Feedback",
              desc: "Receive scores, feedback, and improvement tips."
            }
          ].map((item, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/40 hover:shadow-xl hover:scale-105 transition duration-300"
            >

              {/* STEP NUMBER */}
              <div className="text-purple-600 text-3xl font-bold mb-3">
                {item.step}
              </div>

              <h4 className="font-semibold text-lg mb-2">
                {item.title}
              </h4>

              <p className="text-gray-600 text-sm">
                {item.desc}
              </p>

            </motion.div>

          ))}

        </div>

      </section>
      {/* ================= FEATURES ================= */}
      <section className="px-6 md:px-16 py-24 text-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Powerful <span className="text-purple-600">AI Features</span> to Boost Your Career
          </h2>

          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Everything you need to build resumes, practice interviews, and improve confidence — all in one place.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-10 mt-16">

          {[
            {
              title: "AI Resume Builder",
              desc: "Generate ATS-friendly resumes instantly using AI suggestions.",
              icon: "📄"
            },
            {
              title: "Mock Interviews",
              desc: "Practice real interview questions with AI voice interaction.",
              icon: "🎤"
            },
            {
              title: "Confidence Analysis",
              desc: "Track your confidence, emotions, and attention in real-time.",
              icon: "👀"
            }
          ].map((item, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/40 hover:shadow-xl hover:scale-105 transition duration-300"
            >
              <div className="text-4xl mb-4">{item.icon}</div>

              <h4 className="font-semibold text-xl mb-3">{item.title}</h4>

              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>

          ))}

        </div>

      </section>
      {/* ================= TESTIMONIALS ================= */}
      <section className="px-6 md:px-16 py-24 bg-purple-50">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Trusted by <span className="text-purple-600">Students & Developers</span>
          </h2>

          <p className="text-gray-500 max-w-md mx-auto mt-4">
            See how candidates improved their interview performance using HireReadyAI.
          </p>
        </motion.div>

        <div className="mt-16 grid md:grid-cols-3 gap-10">

          {[
            {
              name: "Rahul Sharma",
              role: "Frontend Developer",
              review: "This platform helped me improve my confidence and crack my first interview!",
              img: "https://i.pravatar.cc/150?img=3"
            },
            {
              name: "Priya Verma",
              role: "Software Engineer",
              review: "AI feedback is super useful. I improved my communication a lot.",
              img: "https://i.pravatar.cc/150?img=5"
            },
            {
              name: "Amit Patel",
              role: "Full Stack Developer",
              review: "Mock interviews feel real. It boosted my preparation significantly.",
              img: "https://i.pravatar.cc/150?img=8"
            }
          ].map((user, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/40 hover:shadow-xl hover:scale-105 transition duration-300"
            >

              {/* USER */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user.img}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div className="text-left">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* ⭐ RATING */}
              <div className="text-yellow-500 mb-2">★★★★★</div>

              {/* REVIEW */}
              <p className="text-gray-600 text-sm leading-relaxed">
                “{user.review}”
              </p>

            </motion.div>

          ))}

        </div>

      </section>

      {/* ================= PRICING ================= */}
      <section className="px-6 md:px-16 py-24 text-center bg-gradient-to-b from-white to-purple-50">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold">
            Choose the <span className="text-purple-600">Plan</span> That Fits You
          </h2>

          <p className="text-gray-500 mt-4 max-w-lg mx-auto">
            Start free and upgrade when you're ready to unlock full AI power.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-12 justify-center mt-16">

          {/* FREE PLAN */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border shadow-md w-80 p-8 rounded-2xl bg-white hover:shadow-xl transition"
          >
            <h3 className="text-xl font-bold">Free</h3>
            <p className="text-gray-600 mt-2">₹0 / Forever</p>

            <ul className="text-left mt-6 space-y-3 text-gray-700 text-sm">
              <li className="flex items-center gap-2"><FcCheckmark /> Basic Templates</li>
              <li className="flex items-center gap-2"><FcCheckmark /> AI Summary</li>
              <li className="flex items-center gap-2"><FcCheckmark /> PDF Export</li>
            </ul>

            <button className="bg-gray-900 text-white px-6 py-3 w-full rounded-lg mt-8 hover:bg-black transition">
              Start Free
            </button>
          </motion.div>

          {/* PRO PLAN (🔥 HIGHLIGHTED) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative border-2 border-purple-600 shadow-xl w-80 p-8 rounded-2xl bg-white scale-105 hover:scale-110 transition"
          >

            {/* 🔥 BADGE */}
            <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-4 py-1 rounded-full shadow">
              Most Popular
            </span>

            <h3 className="text-xl font-bold">Pro</h3>
            <p className="text-gray-600 mt-2">₹59 / month</p>

            <ul className="text-left mt-6 space-y-3 text-gray-700 text-sm">
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-600" /> Premium Templates</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-600" /> AI Optimization</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-600" /> Unlimited Downloads</li>
              <li className="flex items-center gap-2"><FaCheckCircle className="text-purple-600" /> Interview Analytics</li>
            </ul>

            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 w-full rounded-lg mt-8 hover:opacity-90 transition shadow-lg">
              Upgrade Now 🚀
            </button>
          </motion.div>

        </div>

      </section>
      {/* ================= FOOTER ================= */}
      <footer className="px-6 md:px-16 py-16 bg-gradient-to-r from-purple-300 to-purple-100">
        <div className="grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <h3 className="font-semibold text-lg mb-3">HireReadyAI</h3>
            <p className="text-gray-600">Helping you create resumes that open doors.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <p>Home</p><p>Support</p><p>Pricing</p><p>Affiliate</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <p>Company</p><p>Blogs</p><p>Community</p><p>Career</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <p>Privacy Policy</p><p>Terms & Conditions</p>
          </div>
        </div>

        <p className="mt-10 text-center text-gray-700">
          © 2025 HireReadyAI. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
