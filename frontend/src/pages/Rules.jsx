import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Rules() {
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    const { mode, value, resumeText } = location.state || {};

    const handleStart = () => {
        if (!agreed) {
            setError("You must agree to the rules before starting.");
            return;
        }

        setError(""); // clear error

        navigate("/mock-interview/session", {
            state: { mode, value, resumeText },
        });
    };

    return (
        <div className="app-shell">
            <div className="page-frame flex min-h-[100dvh] flex-col justify-center py-8 sm:py-10">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-950"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card w-full rounded-[2.2rem] px-6 py-8 sm:px-10 sm:py-10"
                >
                    <div className="max-w-3xl mx-auto">

                        <p className="eyebrow">Interview Rules</p>

                        <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
                            Please read carefully before starting.
                        </h1>

                        <p className="mt-5 text-sm text-slate-600 leading-7">
                            This interview simulates a real-world screening environment.
                            Once started, strict rules apply to ensure fairness and accuracy.
                        </p>

                        {/* RULES */}
                        <div className="mt-8 space-y-4">

                            {[
                                "Once the interview starts, you cannot go back or refresh the page.",
                                "Switching tabs or minimizing the window may terminate the session.",
                                "Your camera and microphone must remain active throughout the interview.",
                                "Any suspicious activity will automatically end the interview.",
                                "Your responses are recorded and evaluated in real-time.",
                                "For resume-based interviews, ensure your resume is accurate and final.",
                            ].map((rule, index) => (
                                <div
                                    key={index}
                                    className="panel-card rounded-[1.3rem] p-4 text-sm text-slate-700"
                                >
                                    {rule}
                                </div>
                            ))}
                        </div>

                        {/* AGREEMENT */}
                        <div className="mt-8 flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={() => setAgreed(!agreed)}
                                className="w-4 h-4"
                            />
                            <label htmlFor="agree" className="text-sm text-slate-700">
                                I have read and agree to the rules
                            </label>
                        </div>
                        {error && (
                            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        {/* BUTTON */}
                        <button
                            onClick={handleStart}
                            className="primary-btn mt-8 w-full px-6 py-3.5 text-base"
                        >
                            Start Interview
                        </button>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}