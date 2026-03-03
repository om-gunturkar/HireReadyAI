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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-700 mb-4">No Interview Data</h1>
          <p className="text-gray-600 mb-8">Complete an interview to view feedback</p>
          <button
            onClick={() => navigate("/mock-interview")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Start New Interview
          </button>
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
  const COLORS = ["#8B5CF6", "#EC4899", "#F59E0B", "#EF4444", "#06B6D4", "#10B981", "#6366F1"];

  // Calculate scores
  const overallConfidence = Math.round(parseFloat(report.averageConfidence));
  const eyeContactScore = Math.round(parseFloat(report.eyeContactPercentage));
  const focusScore = ((report.headMovementCounts.forward / report.totalFrames) * 100).toFixed(1);
  const composureScore = Math.max(0, 100 - (report.emotionCounts.sad + report.emotionCounts.angry + report.emotionCounts.fearful) * 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <button
        onClick={() => navigate("/mock-interview")}
        className="mb-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        ← Back to Interviews
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">📊 Interview Feedback</h1>
          <p className="text-gray-600">
            Mode: <span className="font-semibold">{mode}</span> | Topic: <span className="font-semibold">{value}</span>
          </p>
          <p className="text-sm text-gray-500">Analyzed {report.totalFrames} frames</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            label="Overall Confidence"
            score={overallConfidence}
            color="bg-gradient-to-r from-purple-400 to-purple-600"
            icon="🎯"
          />
          <ScoreCard
            label="Eye Contact"
            score={eyeContactScore}
            color="bg-gradient-to-r from-pink-400 to-pink-600"
            icon="👀"
          />
          <ScoreCard
            label="Focus Level"
            score={focusScore}
            color="bg-gradient-to-r from-blue-400 to-blue-600"
            icon="📍"
          />
          <ScoreCard
            label="Composure"
            score={composureScore}
            color="bg-gradient-to-r from-green-400 to-green-600"
            icon="😌"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Confidence Over Time */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">📈 Confidence Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F3E8FF",
                    border: "1px solid #D8B4FE",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#EA580C", r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Emotion Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">😊 Emotion Distribution</h2>
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

          {/* Head Movement */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">📍 Head Position Tracking</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={headMovementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#F3E8FF",
                    border: "1px solid #D8B4FE",
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">📋 Performance Summary</h2>
            <div className="space-y-4">
              <SummaryRow label="Total Frames Analyzed" value={report.totalFrames} />
              <SummaryRow label="Dominant Emotion" value={getDominantEmotion(report.emotionCounts)} />
              <SummaryRow label="Eye Contact Time" value={`${report.eyeContactPercentage}%`} />
              <SummaryRow label="Forward Looking Time" value={`${focusScore}%`} />
              <SummaryRow label="Average Confidence" value={`${report.averageConfidence}/100`} />
            </div>
          </div>
        </div>

        {/* AI Feedback Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-purple-100 mb-8">
          <h2 className="text-lg font-semibold text-purple-700 mb-4">🤖 AI Feedback</h2>
          <div className="space-y-3 text-gray-700">
            {generateAIFeedback(report, overallConfidence, eyeContactScore, focusScore, composureScore)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate("/mock-interview")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Print Report
          </button>
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
    <div className="flex justify-between items-center pb-2 border-b border-purple-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold text-purple-700">{value}</span>
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
