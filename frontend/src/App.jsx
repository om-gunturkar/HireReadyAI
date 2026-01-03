import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home / Dashboard */}
        <Route path="/home" element={<Home />} />

        {/* Mock Interview */}
        <Route path="/mock-interview" element={<InterviewSetup />} />
        <Route
          path="/mock-interview/session"
          element={<InterviewSession />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
