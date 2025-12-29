import { Link } from "react-router-dom";

export default function Signup() {
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

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg
            border border-gray-300
            outline-none focus:ring-2 focus:ring-purple-500"
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
