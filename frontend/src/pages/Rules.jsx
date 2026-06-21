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
        <div className="min-h-screen overflow-x-hidden bg-slate-50">
            <div className="flex min-h-[100dvh] w-full flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">

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
                    className="w-full border-y border-slate-200/80 bg-white/70 px-6 py-8 sm:px-10 sm:py-10"
                >
                    <div className="w-full">

                        <p className="eyebrow">Interview Rules</p>

                        <h1 className="mt-4 max-w-4xl text-3xl font-bold text-slate-950 sm:text-4xl">
                            A fair interview starts with a focused environment.
                        </h1>

                        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                            This session mirrors a real screening. Review these expectations once, then give the interview your full attention.
                        </p>

                        {/* RULES */}
                        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50/85 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                            <div className="border-b border-slate-200 bg-white/80 px-5 py-4 sm:px-6">
                                <p className="text-sm font-semibold text-slate-900">Before you begin</p>
                                <p className="mt-1 text-sm text-slate-500">Please keep these rules in mind for the full session.</p>
                            </div>
                            <ol className="divide-y divide-slate-200/80">
                                <Rule number="01"><strong>Stay in this session.</strong> You cannot go back or refresh once the interview begins.</Rule>
                                <Rule number="02"><strong>Keep this tab active.</strong> Switching tabs or minimizing the window may end the session.</Rule>
                                <Rule number="03"><strong>Keep camera and microphone on</strong> throughout your interview.</Rule>
                                <Rule number="04"><strong>Avoid suspicious activity.</strong> It will automatically end the interview.</Rule>
                                <Rule number="05"><strong>Your answers are recorded</strong> and evaluated in real time.</Rule>
                                <Rule number="06"><strong>Use an accurate final resume</strong> for resume-based interviews.</Rule>
                            </ol>
                        </div>

                        {/* AGREEMENT */}
                        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/60 px-4 py-4">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={agreed}
                                onChange={() => setAgreed(!agreed)}
                                className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
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

function Rule({ number, children }) {
    return (
        <li className="flex gap-4 px-5 py-4 text-sm leading-7 text-slate-700 sm:px-6 sm:py-5 sm:text-base">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-xs font-bold text-teal-800">{number}</span>
            <p>{children}</p>
        </li>
    );
}
