import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CameraFeed from "./CameraFeed";
import { captureFaceDescriptor, loadFaceModels } from "../services/facialAnalysisService";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [faceStatus, setFaceStatus] = useState("Face scan required");
  const [submitting, setSubmitting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFaceModels().catch(() => {
      setFaceStatus("Unable to load face scanner");
    });
  }, []);

  const handleFaceScan = async () => {
    try {
      setScanning(true);
      setFaceStatus("Scanning face...");
      const descriptor = await captureFaceDescriptor(videoRef.current);
      setFaceDescriptor(descriptor);
      setFaceStatus("Face scan saved successfully");
    } catch (error) {
      setFaceStatus(error.message || "Face scan failed");
    } finally {
      setScanning(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!faceDescriptor.length) {
      alert("Please scan your face before signing up.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, faceDescriptor }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      alert("Signup successful. You can now log in with your password and face scan.");

      navigate("/login");
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
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

          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4">
            <p className="text-sm font-semibold text-purple-700">Face enrollment</p>
            <p className="mt-1 text-xs text-gray-600">
              Scan your face now. The same person will be required during login.
            </p>
            <div className="mt-4 h-56 overflow-hidden rounded-xl border border-purple-200 bg-black">
              <CameraFeed videoRef={videoRef} />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-gray-600">{faceStatus}</p>
              <button
                type="button"
                onClick={handleFaceScan}
                disabled={scanning}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm ring-1 ring-purple-200 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {scanning ? "Scanning..." : faceDescriptor.length ? "Rescan Face" : "Scan Face"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg
            bg-purple-600 text-white font-semibold
            hover:bg-purple-700 transition disabled:cursor-not-allowed disabled:bg-purple-400"
          >
            {submitting ? "Creating Account..." : "Sign Up"}
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
