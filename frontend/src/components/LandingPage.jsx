import { HiMenu, HiX } from "react-icons/hi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FcCheckmark } from "react-icons/fc";
import { FaCheckCircle } from "react-icons/fa";

const LandingPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white font-poppins text-gray-900">

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
      <section className="px-6 md:px-16 py-20 grid md:grid-cols-2 gap-10 relative">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-[1.2]">
            Unlock Your Career Potential with <span className="text-purple-600">Intelligent AI</span>
          </h2>

          <ul className="mt-6 text-gray-700 space-y-2 text-lg">
            <li>🎯 Targeted Resumes</li>
            <li>🔍 Skill Gap Analysis</li>
            <li>🎤 Interview Confidence</li>
            <li>🤖 AI-Driven Optimization</li>
          </ul>

          <div className="mt-8 flex gap-5">
            <button 
              onClick={() => navigate("/signup")}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition">
              Get Started
            </button>
            <button className="border border-purple-600 px-8 py-3 rounded-lg hover:bg-purple-100">
              📽 Watch Demo
            </button>
          </div>
        </div>

        <div className="flex gap-6 items-center justify-center">
          <div className="bg-white shadow-lg p-6 rounded-xl text-center">
            <p className="text-purple-600 font-semibold">Resume Score</p>
            <h1 className="text-4xl font-bold">82%</h1>
          </div>
          <div className="bg-white shadow-lg p-6 rounded-xl text-center">
            <p className="text-purple-600 font-semibold">Profile Completion</p>
            <h1 className="text-4xl font-bold">70%</h1>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 md:px-16 py-20 text-center">
        <h2 className="text-4xl font-bold">
          Build a <span className="text-purple-600">Modern Resume</span> in Minutes
        </h2>
        <p className="text-gray-600 mt-3 max-w-lg mx-auto">
          Craft a polished, ATS-friendly resume quickly with AI support.
        </p>

        <div className="grid md:grid-cols-3 gap-10 mt-14 text-left">
          {[
            { title: "AI-Powered Resume Drafting", color: "pink" },
            { title: "Secure & Private Document Handling", color: "green" },
            { title: "Real-Time Insights", color: "orange" }
          ].map((item, i) => (
            <div key={i} className="bg-white shadow-md p-6 rounded-xl border">
              <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
              <p className="text-gray-500 text-sm">
                Your documents stay encrypted with real-time updates.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="px-6 md:px-16 py-20 bg-purple-50">
        <h2 className="text-4xl font-bold text-center">
          Real <span className="text-purple-600">Experiences</span>. Real Results.
        </h2>
        <p className="text-center text-gray-500 max-w-md mx-auto mt-3">
          Hear how job seekers and students landed interviews faster.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <p className="font-bold">User {i + 1}</p>
              <p className="text-gray-600 mt-2 text-sm">
                “This tool helped me build a clean resume and land calls within days.”
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="px-6 md:px-16 py-20 text-center">
        <h2 className="text-4xl font-bold">
          Choose the <span className="text-purple-600">Plan</span> That Fits You
        </h2>

        <div className="flex flex-col md:flex-row gap-12 justify-center mt-14">
          <div className="border shadow w-80 p-8 rounded-xl bg-green-50">
            <h3 className="text-xl font-bold">Free</h3>
            <p className="text-gray-600 mt-2">₹0 / Forever</p>
            <ul className="text-left mt-6 space-y-2 text-gray-700 text-sm">
              <li><FcCheckmark /> Basic Templates</li>
              <li><FcCheckmark /> AI Summary</li>
              <li><FcCheckmark /> PDF Export</li>
            </ul>
            <button className="bg-green-600 text-white px-6 py-3 w-full rounded-lg mt-8">
              Start Free
            </button>
          </div>

          <div className="border shadow w-80 p-8 rounded-xl bg-orange-50">
            <h3 className="text-xl font-bold">Pro</h3>
            <p className="text-gray-600 mt-2">₹59 / month</p>
            <ul className="text-left mt-6 space-y-2 text-gray-700 text-sm">
              <li><FaCheckCircle className="text-purple-600 inline" /> Premium Templates</li>
              <li><FaCheckCircle className="text-purple-600 inline" /> AI Optimization</li>
              <li><FaCheckCircle className="text-purple-600 inline" /> Unlimited Downloads</li>
            </ul>
            <button className="bg-purple-600 text-white px-6 py-3 w-full rounded-lg mt-8 hover:bg-purple-700 transition">
              Upgrade Now
            </button>
          </div>
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
