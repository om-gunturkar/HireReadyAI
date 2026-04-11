import { useLocation, useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatMetricsForReport } from "../services/facialAnalysisService";

export default function InterviewFeedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const metricsHistory = state.metricsHistory || [];
  const mode = state.mode || "unknown";
  const value = state.value || "unknown";

  if (metricsHistory.length === 0) {
    return (
      <div className="app-shell min-h-[100dvh]">
        <div className="page-frame flex min-h-[80dvh] items-center justify-center py-10">
        <div className="panel-card w-full max-w-md rounded-[2rem] p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.1)] sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Behavior report</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">No interview data yet</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Complete a session with camera analysis to unlock emotion and focus charts.</p>
          <button
            type="button"
            onClick={() => navigate("/mock-interview")}
            className="primary-btn mt-8 w-full px-6 py-3 text-sm sm:w-auto"
          >
            Start mock interview
          </button>
        </div>
        </div>
      </div>
    );
  }

  const report = formatMetricsForReport(metricsHistory);

  // Prepare emotion data for chart
  const emotionData = Object.entries(report.emotionCounts).map(([emotion, count]) => ({
    name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
    value: count,
  }));

  // Prepare confidence scores over time
  const confidenceData = metricsHistory.map((metric, idx) => ({
    time: idx,
    confidence: Math.round(metric.confidence || 0),
  }));

  // Prepare head movement data
  const headMovementData = Object.entries(report.headMovementCounts).map(([position, count]) => ({
    name: position.charAt(0).toUpperCase() + position.slice(1),
    value: count,
  }));

  // Colors for charts
  const COLORS = ["#0f766e", "#2563eb", "#ea580c", "#f97316", "#64748b", "#14b8a6", "#7c3aed"];

  // Calculate scores
  const overallConfidence = Math.round(parseFloat(report.averageConfidence));
  const eyeContactScore = Math.round(parseFloat(report.eyeContactPercentage));
  const focusScore = ((report.headMovementCounts.forward / report.totalFrames) * 100).toFixed(1);
  const composureScore = Math.max(0, 100 - (report.emotionCounts.sad + report.emotionCounts.angry + report.emotionCounts.fearful) * 2);

  return (
    <div className="app-shell min-h-[100dvh]">
      <div className="page-frame py-8 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/mock-interview")}
          className="secondary-btn mb-6 px-4 py-2 text-sm"
        >
          ← Back to setup
        </button>

        <div className="glass-card rounded-[2rem] p-6 sm:p-8">
          <div className="mb-8 border-b border-slate-200/80 pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Visual analytics</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Interview behavior feedback</h1>
            <p className="mt-3 text-slate-600">
              Mode: <span className="font-semibold text-slate-900">{mode}</span> · Topic: <span className="font-semibold text-slate-900">{value}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Analyzed {report.totalFrames} frames from your camera stream</p>
          </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <ScoreCard
            label="Overall Confidence"
            score={overallConfidence}
            color="bg-gradient-to-br from-teal-500 to-teal-700"
            icon="🎯"
          />
          <ScoreCard
            label="Eye Contact"
            score={eyeContactScore}
            color="bg-gradient-to-br from-blue-500 to-indigo-600"
            icon="👀"
          />
          <ScoreCard
            label="Focus Level"
            score={focusScore}
            color="bg-gradient-to-br from-sky-500 to-cyan-600"
            icon="📍"
          />
          <ScoreCard
            label="Composure"
            score={composureScore}
            color="bg-gradient-to-br from-emerald-500 to-teal-600"
            icon="😌"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
          <div className="panel-card rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Confidence over time</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={{ fill: "#ea580c", r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="panel-card rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Emotion distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="panel-card rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Head position tracking</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={headMovementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #cbd5e1",
                  }}
                />
                <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="panel-card rounded-[1.5rem] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance summary</h2>
            <div className="space-y-4">
              <SummaryRow label="Total Frames Analyzed" value={report.totalFrames} />
              <SummaryRow label="Dominant Emotion" value={getDominantEmotion(report.emotionCounts)} />
              <SummaryRow label="Eye Contact Time" value={`${report.eyeContactPercentage}%`} />
              <SummaryRow label="Forward Looking Time" value={`${focusScore}%`} />
              <SummaryRow label="Average Confidence" value={`${report.averageConfidence}/100`} />
            </div>
          </div>
        </div>

        <div className="panel-card mb-8 rounded-[1.5rem] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">AI coaching notes</h2>
          <div className="space-y-3 text-slate-700 text-sm leading-7">
            {generateAIFeedback(report, overallConfidence, eyeContactScore, focusScore, composureScore)}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => navigate("/mock-interview")}
            className="primary-btn px-6 py-3 text-sm"
          >
            Take another interview
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="secondary-btn px-6 py-3 text-sm"
          >
            Print report
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ScoreCard({ label, score, color, icon }) {
  const displayScore = Math.round(score);
  return (
    <div className={`${color} rounded-lg p-6 text-white shadow-lg transform hover:scale-105 transition`}>
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm opacity-90">{label}</p>
      <p className="text-3xl font-bold">{displayScore}%</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-teal-800">{value}</span>
    </div>
  );
}

function getDominantEmotion(emotionCounts) {
  return Object.keys(emotionCounts).reduce((a, b) =>
    emotionCounts[a] > emotionCounts[b] ? a : b
  );
}

function generateAIFeedback(report, confidence, eyeContact, focus, composure) {
  const feedbacks = [];

  // Confidence feedback
  if (confidence >= 80) {
    feedbacks.push(<p key="1">✅ <strong>Excellent Confidence:</strong> You maintained high confidence throughout the interview. This is a strong indicator of preparation and composure.</p>);
  } else if (confidence >= 60) {
    feedbacks.push(<p key="1">⚠️ <strong>Moderate Confidence:</strong> Your confidence level was decent. Work on maintaining consistent performance under pressure.</p>);
  } else {
    feedbacks.push(<p key="1">📌 <strong>Build Confidence:</strong> Consider practicing more mock interviews to improve your confidence levels during actual interviews.</p>);
  }

  // Eye contact feedback
  if (eyeContact >= 70) {
    feedbacks.push(<p key="2">✅ <strong>Great Eye Contact:</strong> You maintained excellent eye contact, which shows engagement and confidence to the interviewer.</p>);
  } else if (eyeContact >= 50) {
    feedbacks.push(<p key="2">📌 <strong>Improve Eye Contact:</strong> Try to maintain more consistent eye contact with the camera to appear more confident and engaged.</p>);
  } else {
    feedbacks.push(<p key="2">⚠️ <strong>Focus on Eye Contact:</strong> Poor eye contact can make you appear distracted. Practice looking directly at the camera.</p>);
  }

  // Focus feedback
  if (focus >= 80) {
    feedbacks.push(<p key="3">✅ <strong>Excellent Focus:</strong> You kept your head steady and looked forward most of the time. Great job maintaining focus!</p>);
  } else if (focus >= 60) {
    feedbacks.push(<p key="3">📌 <strong>Stay Focused:</strong> You had some head movements. Try to minimize distractions and keep your focus on the camera.</p>);
  } else {
    feedbacks.push(<p key="3">⚠️ <strong>Avoid Distractions:</strong> Significant head movement detected. Ensure a quiet environment and keep your camera at eye level.</p>);
  }

  // Composure feedback
  if (composure >= 80) {
    feedbacks.push(<p key="4">✅ <strong>Excellent Composure:</strong> You remained calm and composed throughout. This will impress any interviewer!</p>);
  } else if (composure >= 60) {
    feedbacks.push(<p key="4">📌 <strong>Manage Emotions:</strong> You showed some emotional fluctuation. Practice deep breathing techniques before interviews.</p>);
  } else {
    feedbacks.push(<p key="4">⚠️ <strong>Work on Composure:</strong> You seemed nervous or distressed at times. This is normal – practice stress management techniques.</p>);
  }

  // Emotion feedback
  const dominantEmotion = getDominantEmotion(report.emotionCounts);
  if (dominantEmotion === "happy" || dominantEmotion === "neutral") {
    feedbacks.push(<p key="5">✅ <strong>Positive Attitude:</strong> Your expressions were positive and professional. Great work!</p>);
  }

  return feedbacks;
}
