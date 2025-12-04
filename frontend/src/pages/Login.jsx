
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { useState } from "react";
import api from '../api/axiosInstance'; 

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    // Prevent page reload if this is called via form submit
    if (e) e.preventDefault(); 

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {
      // 1. Call Backend
      const response = await api.post('/auth/login', { email, password });
      
      // 2. Get Token from response
      const { token } = response.data;

      // 3. Save Token to Local Storage
      localStorage.setItem('token', token);

      // 4. Success Feedback & Redirect
      console.log("Login Success:", response.data);
      alert("Login Successful!");
      navigate("/dashboard");

    } catch (error) {
      console.error("Login Error:", error.response?.data);
      alert(error.response?.data?.message || "Invalid Email or Password");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-purple-100 font-poppins">
      
      <h2 className="text-3xl font-bold text-gray-900 mb-6">HireReadyAI</h2>

      <div className="bg-white p-10 rounded-2xl shadow-xl w-80">
        
        <h3 className="text-center text-2xl font-semibold text-purple-600">Log In</h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          Please login to continue
        </p>

        {/* Added form tag to handle 'Enter' key submission naturally */}
        <form className="space-y-4" onSubmit={handleLogin}>

          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <FiMail className="text-gray-600" />
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <FiLock className="text-gray-600" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          <p className="text-right text-xs text-gray-500 cursor-pointer hover:text-purple-600">
            Forgot Password?
          </p>

          {/* Login Button */}
          <button
            type="submit" // changed to submit so Enter key works
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-600 hover:underline">
            Click Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;