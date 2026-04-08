import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const getCategory = (Q) => {
    const score = Q / 100;

    if (score >= 0.85) return "Excellent 🚀";
    if (score >= 0.7) return "Good 👍";
    if (score >= 0.5) return "Average ⚠️";
    return "Needs Improvement ❌";
};
const ScoreAnalysis = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { scoreData } = location.state || {};
    const [animatedScore, setAnimatedScore] = useState(0);

    if (!scoreData) {
        return (
            <div className="h-screen flex items-center justify-center">
                No Score Data Found
            </div>
        );
    }

    const {
        totalScore,
        technicalScore,
        communicationScore,
        confidenceScore,
    } = scoreData;

    // 🎯 Score animation
    useEffect(() => {
        let start = 0;
        const interval = setInterval(() => {
            start += 2;
            if (start >= totalScore) {
                start = totalScore;
                clearInterval(interval);
            }
            setAnimatedScore(start);
        }, 20);

        return () => clearInterval(interval);
    }, [totalScore]);

    // 📊 Chart Data
    const data = [
        { name: "Technical", value: technicalScore },
        { name: "Communication", value: communicationScore },
        { name: "Confidence", value: confidenceScore },
    ];

    const COLORS = ["#7c3aed", "#3b82f6", "#ec4899"];

    // 🧠 AI Feedback
    const getFeedback = () => {
        if (totalScore >= 80)
            return "Excellent performance! You're interview-ready 🚀";
        if (totalScore >= 60)
            return "Good job! Improve confidence for better results 👍";
        if (totalScore >= 40)
            return "Decent attempt. Focus on communication & clarity ⚠️";
        return "Needs improvement. Practice more and stay confident ❌";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-10">

            <h1 className="text-3xl font-bold text-purple-700 mb-8">
                📊 Score Analysis
            </h1>

            {/* 🔥 TOP SECTION */}
            <div className="grid md:grid-cols-2 gap-10">

                {/* 🎯 SCORE CARD */}
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center border">
                    <h2 className="text-lg text-gray-500 mb-2">Overall Score</h2>

                    <div className="text-6xl font-bold text-purple-600">
                        {animatedScore}
                    </div>

                    <p className="text-gray-400 mt-2">out of 100</p>

                    <p className="mt-4 text-purple-600 font-semibold text-lg">
                        {getCategory(totalScore)}
                    </p>

                    <p className="text-gray-500 mt-1">
                        Based on composite score (Q)
                    </p>
                </div>

                {/* 📊 PIE CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border">
                    <h3 className="text-lg text-gray-600 mb-4 text-center">
                        Performance Breakdown
                    </h3>

                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                label
                            >
                                {data.map((entry, index) => (
                                    <Cell key={index} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 🔥 SKILL CARDS */}
            <div className="grid md:grid-cols-3 gap-8 mt-10">

                <ScoreCard title="Technical Skills" score={technicalScore} />
                <ScoreCard title="Communication" score={communicationScore} />
                <ScoreCard title="Confidence" score={confidenceScore} />

            </div>

            {/* 🎯 ACTION BUTTONS */}
            <div className="mt-12 flex justify-center gap-6">
                <button
                    onClick={() => navigate("/home")}
                    className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:scale-105 transition"
                >
                    Go Home
                </button>

                <button
                    onClick={() => navigate("/mock-interview")}
                    className="px-8 py-3 bg-green-500 text-white rounded-xl hover:scale-105 transition"
                >
                    Retry Interview
                </button>
            </div>
        </div>
    );
};


// 🔥 SIMPLE SCORE CARD
const ScoreCard = ({ title, score }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border text-center hover:scale-105 transition">
            <h3 className="text-gray-600 mb-2">{title}</h3>
            <p className="text-3xl font-bold text-purple-600">{score}</p>
            <p className="text-gray-400 text-sm">out of 100</p>
        </div>
    );
};

export default ScoreAnalysis;