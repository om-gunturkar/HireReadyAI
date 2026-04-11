import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import InterviewFeedback from "./pages/InterviewFeedback";
import Resume from "./pages/Resume";
import ResumeTemplates from "./pages/ResumeTemplates";
import CreateResume from "./pages/CreateResume";
import RoleBasedResume from "./pages/RoleBasedResume";
import ScoreAnalysis from "./pages/ScoreAnalysis";
import Settings from "./pages/Settings";
import Rules from "./pages/Rules";



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
        <Route path="/settings" element={<Settings />} />

        {/* Mock Interview */}
        <Route path="/mock-interview" element={<InterviewSetup />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/mock-interview/session" element={<InterviewSession />} />
        <Route path="/mock-interview/feedback" element={<InterviewFeedback />} />

        {/* Resume Flow */}
        <Route path="/resume-templates" element={<ResumeTemplates />} />
        <Route path="/resume" element={<Resume />} />
        <Route path="/create-resume" element={<CreateResume />} />
        <Route path="/role-based-resume" element={<RoleBasedResume />} />
        <Route path="/mock-interview/score" element={<ScoreAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
