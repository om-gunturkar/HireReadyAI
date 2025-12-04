import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser } from "react-icons/fi";
import { useState } from "react";
import api from '../api/axiosInstance';

const Signup = () => {
  const navigate = useNavigate();
  
  // 1. State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // 2. Update state when user types
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Send data to Backend
  const handleSignup = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await api.post('/auth/signup', formData);
      console.log("Signup Success:", response.data);
      alert("Registration Successful! Please Login.");
      navigate('/login'); // Redirect to Login page
    } catch (error) {
      console.error("Signup Error:", error.response?.data);
      alert(error.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-purple-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">HireReadyAI</h2>

      <div className="bg-white p-10 rounded-2xl shadow-xl w-80">
        <h3 className="text-center text-2xl font-semibold text-purple-600">
          Sign Up
        </h3>
        <p className="text-center text-gray-500 text-sm mb-6">
          Please register to continue
        </p>

        <div className="space-y-4">

          {/* Name */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <FiUser className="text-gray-600" />
            <input
              type="text"
              name="name"  // Added name attribute
              value={formData.name} // Added value binding
              onChange={handleChange} // Added onChange handler
              placeholder="Name"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <FiMail className="text-gray-600" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email ID"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
            <FiLock className="text-gray-600" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>

          <p className="text-right text-xs text-gray-500 hover:text-purple-600 cursor-pointer">
            Forget Password?
          </p>

          <button 
            onClick={handleSignup} // Connected the button
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-md transition"
          >
            Signup
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-600 hover:underline">
            Click Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;