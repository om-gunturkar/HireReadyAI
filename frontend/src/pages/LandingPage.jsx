import { Link } from "react-router-dom";
export default function App() {
  return (
    <div className="font-sans text-gray-800">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 bg-white shadow-lg sticky top-0 z-50">
        <h1 className="text-5xl font-extrabold text-purple-600">Hire Ready AI</h1>
       <button className="
  bg-purple-600 text-white px-5 py-2 rounded-lg
  hover:bg-purple-700 hover:scale-105
  transition-all duration-300 shadow
">
  <Link to="/login">
    Login / Sign Up
  </Link>
</button>

      </nav>

      {/* HERO */}
      <section className="px-8 py-20 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div className="space-y-6 animate-fadeUp">
            <h1 className="text-5xl font-bold leading-tight">
              Unlock Your Career Potential with{" "}
              <span className="text-purple-600">Intelligent AI</span>
            </h1>

            <p className="text-gray-600 text-lg">
              Build ATS-friendly resumes, identify skill gaps, and ace interviews
              with AI-powered tools designed to get you hired faster.
            </p>

            <ul className="space-y-2 text-gray-700">
              <li>🎯 Targeted Resumes</li>
              <li>📊 Skill Gap Analysis</li>
              <li>🎤 Interview Confidence</li>
              <li>🤖 AI-Driven Optimization</li>
            </ul>

            <div className="flex gap-4">
              <button className="
                bg-purple-600 text-white px-6 py-3 rounded-xl
                hover:bg-purple-700 hover:scale-105
                transition-all duration-300 shadow-lg
              ">
                Get Started Free
              </button>

              <button className="
                border px-6 py-3 rounded-xl
                hover:bg-gray-100 hover:scale-105
                transition-all duration-300
              ">
                ▶ Watch Demo
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="grid grid-cols-2 gap-6">
            <div className="
              bg-white p-6 rounded-2xl shadow-md
              hover:shadow-xl hover:-translate-y-2
              transition-all duration-300
            ">
              <p className="text-sm text-gray-500">Resume Score</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">82%</p>
            </div>

            <div className="
              bg-white p-6 rounded-2xl shadow-md
              hover:shadow-xl hover:-translate-y-2
              transition-all duration-300
            ">
              <p className="text-sm text-gray-500">Profile Completion</p>
              <p className="text-4xl font-bold text-purple-600 mt-2">70%</p>
            </div>
          </div>

        </div>
      </section>

      {/* INFO */}
      <section className="py-20 px-8 bg-white text-center animate-fadeUp">
        <h2 className="text-3xl font-semibold mb-4">
          Build a Modern Resume in Minutes
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Craft polished, ATS-friendly resumes using AI-powered templates,
          real-time feedback, and intelligent keyword suggestions.
        </p>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-8 bg-slate-50">
        <h2 className="text-3xl font-semibold text-center mb-12">Features</h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            ["AI Resume Drafting", "Generate job-specific resumes instantly."],
            ["Skill Gap Analysis", "Identify missing skills and improve employability."],
            ["Mock Interviews", "Practice real interview questions with AI feedback."],
            ["Real-Time Insights", "Track resume strength live."],
            ["Secure Storage", "Encrypted cloud storage for documents."],
            ["ATS Optimization", "Ensure resumes pass applicant tracking systems."]
          ].map(([title, desc], i) => (
            <div
              key={i}
              className="
                bg-white p-6 rounded-2xl shadow-sm
                hover:shadow-xl hover:-translate-y-2
                transition-all duration-300 group
              "
            >
              <h3 className="
                text-xl font-semibold mb-2
                group-hover:text-purple-600 transition
              ">
                {title}
              </h3>
              <p className="text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-8 bg-white">
        <h2 className="text-3xl font-semibold text-center mb-12">
          What Users Say
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            "AI suggestions improved my resume instantly.",
            "The analytics score gave me confidence before applying.",
            "Built an ATS-friendly resume in under 10 minutes."
          ].map((text, i) => (
            <div
              key={i}
              className="
                bg-slate-50 p-6 rounded-xl
                hover:bg-white hover:shadow-lg
                transition-all duration-300
              "
            >
              <p className="text-gray-700">“{text}”</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-8 bg-slate-50">
        <h2 className="text-3xl font-semibold text-center mb-4">
          Choose the Plan That Fits Your Career Goals
        </h2>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mt-12">

          <div className="
            bg-white p-8 rounded-2xl shadow
            hover:shadow-xl hover:-translate-y-1
            transition-all duration-300
          ">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <p className="text-2xl font-bold mb-6">₹0 / Forever</p>
            <button className="w-full border py-3 rounded-lg">
              Start Free
            </button>
          </div>

          <div className="
            bg-purple-600 text-white p-8 rounded-2xl
            shadow-lg scale-105
            hover:scale-110 hover:shadow-2xl
            transition-all duration-300
          ">
            <h3 className="text-xl font-semibold mb-2">Pro ⭐</h3>
            <p className="text-2xl font-bold mb-6">₹499 / month</p>
            <button className="
              w-full bg-white text-purple-600 py-3 rounded-lg font-semibold
              hover:bg-gray-100 transition-all
            ">
              Upgrade Now
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-gray-500">
        © {new Date().getFullYear()} HireReadyAI. All rights reserved.
      </footer>

    </div>
  );
}

