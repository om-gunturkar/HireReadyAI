import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getInterviewSessionReport } from "../api/interviewSession";

const SCORE_COLORS = ["#0f766e", "#ea580c", "#2563eb"];
const EMOTION_COLORS = ["#0f766e", "#eab308", "#3b82f6", "#f97316", "#ef4444", "#8b5cf6", "#14b8a6", "#64748b"];

const getCategory = (score) => {
  if (score >= 85) return "Interview ready";
  if (score >= 70) return "Strong progress";
  if (score >= 50) return "Developing";
  return "Needs more practice";
};

const toTitle = (value) =>
  String(value || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatAttemptDate = (value) => {
  if (!value) return "In progress";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getImprovementInsight = ({ history, scoreData, previousAttempt }) => {
  if (!history.length || history.length === 1) {
    return {
      title: "First benchmark recorded",
      body: "This is the first saved interview in this domain, so future attempts will show whether the student is improving over time.",
      tone: "border-slate-200 bg-slate-50 text-slate-700",
    };
  }

  const previousScores = history
    .slice(0, -1)
    .map((attempt) => attempt.scoreData?.totalScore || 0);

  const previousAverage = previousScores.length
    ? Math.round(previousScores.reduce((sum, value) => sum + value, 0) / previousScores.length)
    : 0;

  const previousScore = previousAttempt?.scoreData?.totalScore || 0;
  const currentScore = scoreData.totalScore || 0;
  const deltaFromPrevious = currentScore - previousScore;
  const deltaFromAverage = currentScore - previousAverage;

  if (deltaFromPrevious >= 3 && deltaFromAverage >= 3) {
    return {
      title: "Student is improving",
      body: `The current score is ${currentScore}, which is ${deltaFromPrevious} points above the last attempt and ${deltaFromAverage} points above the earlier average. This shows clear progress in this domain.`,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-800",
    };
  }

  if (Math.abs(deltaFromPrevious) <= 2 && Math.abs(deltaFromAverage) <= 2) {
    return {
      title: "Performance is stable",
      body: `The current score is close to the student's earlier results. It is ${deltaFromPrevious >= 0 ? `${deltaFromPrevious} points above` : `${Math.abs(deltaFromPrevious)} points below`} the last attempt, so the trend is steady but still needs stronger gains.`,
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    };
  }

  return {
    title: "Student is not improving yet",
    body: `The current score is ${Math.abs(deltaFromPrevious)} points ${deltaFromPrevious >= 0 ? "above" : "below"} the previous attempt and ${Math.abs(deltaFromAverage)} points ${deltaFromAverage >= 0 ? "above" : "below"} the earlier average. More focused practice is needed to create a stronger upward trend.`,
    tone: "border-rose-200 bg-rose-50 text-rose-800",
  };
};

export default function ScoreAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialReport = location.state?.report || null;
  const sessionId = location.state?.sessionId || initialReport?.sessionId || "";
  const metricsHistory = location.state?.metricsHistory || [];

  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(!initialReport && !!sessionId);
  const [error, setError] = useState("");
  const [animatedScore, setAnimatedScore] = useState(0);
  const [userFaceSnapshot, setUserFaceSnapshot] = useState("");

  useEffect(() => {
    if (!sessionId || initialReport) return;

    let isMounted = true;

    const loadReport = async () => {
      try {
        const data = await getInterviewSessionReport(sessionId);
        if (isMounted) {
          setReport(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load the interview feedback report.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [sessionId, initialReport]);

  useEffect(() => {
    const totalScore = report?.scoreData?.totalScore || 0;
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
  }, [report?.scoreData?.totalScore]);

  useEffect(() => {
    const snapshot =
      localStorage.getItem("userFaceSnapshot") ||
      sessionStorage.getItem("userFaceSnapshot") ||
      "";
    setUserFaceSnapshot(snapshot);
  }, []);

  if (loading) {
    return (
      <div className="app-shell min-h-screen">
        <div className="page-frame flex min-h-[70dvh] items-center justify-center py-12">
          <div className="rounded-[2rem] border border-white/70 bg-white/80 px-10 py-8 text-center shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-700">Analyzing Interview</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Preparing your feedback report</h1>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report?.scoreData) {
    return (
      <div className="app-shell min-h-screen">
        <div className="page-frame flex min-h-[70dvh] items-center justify-center py-12">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/85 p-10 text-center shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <h1 className="text-3xl font-bold text-slate-900">No feedback report found</h1>
            <p className="mt-3 text-slate-600">{error || "Complete an interview to generate a real-time feedback summary."}</p>
            <button
              type="button"
              onClick={() => navigate("/mock-interview")}
              className="mt-8 rounded-full bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { scoreData, summary = {}, answers = [], mode, topic, level, history = [], previousAttempt = null } = report;

  const performanceData = [
    { name: "Technical", value: scoreData.technicalScore },
    { name: "Communication", value: scoreData.communicationScore },
    { name: "Confidence", value: scoreData.confidenceScore },
  ];

  const emotionData = Object.entries(summary.emotionBreakdown || {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({ name: toTitle(key), value }));

  const strengths = summary.strengths?.length ? summary.strengths : ["Interview data captured successfully and ready for continued practice."];
  const improvements = summary.improvements?.length ? summary.improvements : ["Keep practicing full answers with examples to build stronger consistency."];
  const aiFeedback = summary.aiFeedback?.length ? summary.aiFeedback : ["Your report combines answer evaluation and on-camera behavior analysis."];
  const trendData = history.map((attempt) => ({
    name: `Attempt ${attempt.attempt}`,
    totalScore: attempt.scoreData?.totalScore || 0,
    technicalScore: attempt.scoreData?.technicalScore || 0,
    communicationScore: attempt.scoreData?.communicationScore || 0,
    confidenceScore: attempt.scoreData?.confidenceScore || 0,
    date: formatAttemptDate(attempt.completedAt),
  }));
  const scoreDelta = previousAttempt ? scoreData.totalScore - (previousAttempt.scoreData?.totalScore || 0) : null;
  const latestTrendLabel = scoreDelta === null ? "First recorded attempt in this domain" : scoreDelta >= 0 ? `+${scoreDelta} vs previous attempt` : `${scoreDelta} vs previous attempt`;
  const improvementInsight = getImprovementInsight({ history, scoreData, previousAttempt });

  return (
    <div className="app-shell min-h-screen">
      <div className="page-frame py-6 sm:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="border-b border-slate-200/70 bg-[linear-gradient(120deg,rgba(15,118,110,0.08),rgba(249,115,22,0.08),rgba(37,99,235,0.08))] px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-teal-700">Post Interview Feedback</p>
                <h1 className="mt-3 text-4xl font-bold text-slate-900">Real-time performance report</h1>
                <p className="mt-3 text-slate-600">
                  {toTitle(mode)} interview for <span className="font-semibold text-slate-900">{topic}</span> at <span className="font-semibold text-slate-900">{level}</span> level.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  A feedback copy is also sent to the registered email used for this account after the interview is completed.
                </p>
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                <CandidateIdentityCard
                  title="Verified candidate"
                  subtitle="Login face scan"
                  image={userFaceSnapshot}
                  helper={`Feedback for ${topic}`}
                />
                <div className="rounded-[1.75rem] bg-slate-950 px-8 py-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.35)]">
                  <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Overall Score</p>
                  <div className="mt-3 text-6xl font-bold">{animatedScore}</div>
                  <p className="mt-3 text-sm text-slate-300">{getCategory(scoreData.totalScore)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-6 py-6 sm:px-10 lg:grid-cols-4">
            <MetricCard label="Technical" value={scoreData.technicalScore} accent="from-teal-600 to-emerald-500" />
            <MetricCard label="Communication" value={scoreData.communicationScore} accent="from-orange-500 to-amber-400" />
            <MetricCard label="Confidence" value={scoreData.confidenceScore} accent="from-blue-600 to-cyan-400" />
            <MetricCard label="Focus Score" value={summary.focusScore || 0} accent="from-slate-700 to-slate-500" />
          </div>

          <div className="grid gap-6 px-6 pb-6 sm:px-10 lg:grid-cols-[1.25fr_0.95fr]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Performance breakdown</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">Scored out of 100</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#475569" />
                  <YAxis stroke="#475569" domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[16, 16, 0, 0]}>
                    {performanceData.map((entry, index) => (
                      <Cell key={entry.name} fill={SCORE_COLORS[index % SCORE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-bold text-slate-900">Visual interview signals</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InsightCard label="Frames Analyzed" value={summary.totalFrames || 0} />
                <InsightCard label="Visual Confidence" value={`${summary.averageVisualConfidence || 0}%`} />
                <InsightCard label="Focus Level" value={`${summary.focusScore || 0}%`} />
                <InsightCard label="Composure" value={`${summary.composureScore || 0}%`} />
              </div>
              <div className="mt-6 h-[240px]">
                {emotionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={emotionData} dataKey="value" nameKey="name" outerRadius={80} innerRadius={45}>
                        {emotionData.map((entry, index) => (
                          <Cell key={entry.name} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-500">
                    Emotion samples will appear here after camera analysis is recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 sm:px-10">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Improvement trend</h2>
                  <p className="text-sm text-slate-500">
                    Previous and current score analysis for <span className="font-semibold text-slate-700">{topic}</span>.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {latestTrendLabel}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_0.85fr]">
                <div>
                  <div className="h-[260px] rounded-[1.5rem] bg-slate-50/80 p-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#475569" />
                        <YAxis stroke="#475569" domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="totalScore" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="technicalScore" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="confidenceScore" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className={`mt-4 rounded-[1.25rem] border p-4 ${improvementInsight.tone}`}>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em]">Trend insight</p>
                    <h3 className="mt-2 text-lg font-bold">{improvementInsight.title}</h3>
                    <p className="mt-2 text-sm leading-6">{improvementInsight.body}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <TrendSummaryCard
                    label="Previous score"
                    value={previousAttempt?.scoreData?.totalScore ?? "NA"}
                    helper={previousAttempt ? `${formatAttemptDate(previousAttempt.completedAt)} • ${previousAttempt.level}` : "No earlier attempt stored"}
                  />
                  <TrendSummaryCard
                    label="Current score"
                    value={scoreData.totalScore}
                    helper={`${formatAttemptDate(report.completedAt)} • ${level}`}
                  />
                  <TrendSummaryCard
                    label="Attempts in domain"
                    value={history.length}
                    helper={`${toTitle(mode)} interviews tracked for ${topic}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-6 pb-6 sm:px-10 lg:grid-cols-3">
            <FeedbackColumn title="Strengths" items={strengths} tone="text-teal-800 bg-teal-50 border-teal-200" />
            <FeedbackColumn title="Improvements" items={improvements} tone="text-orange-800 bg-orange-50 border-orange-200" />
            <FeedbackColumn title="AI Summary" items={aiFeedback} tone="text-blue-800 bg-blue-50 border-blue-200" />
          </div>

          <div className="px-6 pb-6 sm:px-10">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Question-by-question feedback</h2>
                  <p className="text-sm text-slate-500">Each answer is saved and analyzed from the actual mock interview flow.</p>
                </div>
                <p className="text-sm font-medium text-slate-600">{answers.length} evaluated responses</p>
              </div>
              <div className="mt-6 space-y-4">
                {answers.length > 0 ? (
                  answers.map((answer, index) => (
                    <div key={`${answer.question}-${index}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="max-w-3xl">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Question {index + 1}</p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-900">{answer.question}</h3>
                          <p className="mt-3 text-sm leading-7 text-slate-600">{answer.feedback || "Feedback generated successfully."}</p>
                        </div>
                        <div className="grid min-w-[220px] grid-cols-2 gap-3">
                          <MiniScore label="Tech" value={answer.technicalScore} />
                          <MiniScore label="Comm" value={answer.communicationScore} />
                          <MiniScore label="Confidence" value={answer.confidenceScore} />
                          <MiniScore label="Overall" value={answer.overallScore} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
                    No answer-level evaluation was stored for this session.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200/70 px-6 py-6 sm:flex-row sm:justify-end sm:px-10">
            {metricsHistory.length > 0 ? (
              <button
                onClick={() => navigate("/mock-interview/feedback", {
                  state: {
                    metricsHistory,
                    mode,
                    value: topic,
                  },
                })}
                className="rounded-full border border-teal-300 px-6 py-3 font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                View behavior feedback
              </button>
            ) : null}
            <button
              onClick={() => navigate("/home")}
              className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Go Home
            </button>
            <button
              onClick={() => navigate("/mock-interview")}
              className="rounded-full bg-teal-700 px-6 py-3 font-semibold text-white transition hover:bg-teal-800"
            >
              Retry Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className={`h-2 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-bold text-slate-900">{value}</p>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">out of 100</p>
    </div>
  );
}

function InsightCard({ label, value }) {
  return (
    <div className="rounded-[1.25rem] bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function FeedbackColumn({ title, items, tone }) {
  return (
    <div className={`rounded-[1.75rem] border p-6 ${tone}`}>
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7">
        {items.map((item, index) => (
          <p key={`${title}-${index}`}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function MiniScore({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  );
}

function TrendSummaryCard({ label, value, helper }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50/90 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

function CandidateIdentityCard({ title, subtitle, image, helper }) {
  return (
    <div className="w-full max-w-[280px] rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {image ? (
            <img src={image} alt="Verified candidate" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500">No scan</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
      </div>
    </div>
  );
}
