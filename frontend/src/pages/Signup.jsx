import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Signup successful! Please login.");

      // ✅ Redirect to login page
      navigate("/login");

    } catch (error) {
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center
    bg-gradient-to-br from-purple-50 via-purple-100 to-white">

      <div className="w-full max-w-md bg-white rounded-2xl
      shadow-xl p-8 animate-fadeIn">

        <h2 className="text-3xl font-bold text-center mb-2 text-purple-700">
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Get started for free
        </p>

        <form className="space-y-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg
            bg-purple-600 text-white font-semibold
            hover:bg-purple-700 transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
