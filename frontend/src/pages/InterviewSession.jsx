import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function InterviewSession() {
  const { state } = useLocation();
  const { mode, value } = state || {};

  /* ---------------- STATE ---------------- */
  const [phase, setPhase] = useState("greeting"); // greeting | level | interview
  const [level, setLevel] = useState("");
  const [question, setQuestion] = useState("");
  const [rawQuestion, setRawQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [count, setCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [askedQuestions, setAskedQuestions] = useState([]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const speakingRef = useRef(false);
  const greetedRef = useRef(false);

  const MAX_QUESTIONS = 10;

  /* ---------------- GREETING ---------------- */
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  /* ---------------- SPEECH RECOGNITION ---------------- */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event) => {
        let text = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        setTranscript(text);
      };

      recog.onend = () => {
        if (
          phase === "interview" &&
          !speakingRef.current &&
          transcript.trim().length > 3
        ) {
          nextQuestion();
        }
      };

      recognitionRef.current = recog;
    }
  }, [phase, transcript]);

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speak = (text, onEnd) => {
    speakingRef.current = true;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";

    u.onend = () => {
      speakingRef.current = false;
      onEnd && onEnd();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  /* ---------------- INITIAL GREETING ---------------- */
  useEffect(() => {
    if (phase === "greeting" && !greetedRef.current) {
      greetedRef.current = true;

      const greeting = getGreeting();
      const welcome =
        "Welcome to Hire Ready AI, an AI powered resume builder and mock interview platform. " +
        "To continue with the interview, please select the level of interview.";

      const fullText = `${greeting}. ${welcome}`;
      setQuestion(fullText);

      speak(greeting, () => {
        speak(welcome, () => {
          setPhase("level");
        });
      });
    }
  }, [phase]);

  /* ---------------- LEVEL SELECTION ---------------- */
  const chooseLevel = (lvl) => {
    setLevel(lvl);
    const msg = `You have selected the ${lvl} level. Let's start the interview.`;
    setQuestion(msg);

    speak(msg, () => {
      setPhase("interview");
      getQuestion("", 1, lvl);
    });
  };

  /* ---------------- FETCH QUESTION ---------------- */
  const getQuestion = async (answerText = "", qCount = count, lvl = level) => {
    setTranscript("");
    clearInterval(timerRef.current);

    try {
      const res = await fetch("http://localhost:5000/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          value,
          level: lvl,
          questionIndex: qCount - 1,
        }),
      });

      const data = await res.json();

      if (!data.question) {
        setQuestion("No question received from server.");
        return;
      }

      const cleanQ = data.question;
      const displayQ = `Here is question number ${qCount}. ${cleanQ}`;

      // UI FIRST
      setRawQuestion(cleanQ);
      setQuestion(displayQ);
      setAskedQuestions((prev) => [...prev, cleanQ]);

      // Voice + mic + timer
      speak(displayQ, () => {
        recognitionRef.current?.start();
        startTimer();
      });
    } catch (err) {
      console.error(err);
      setQuestion("Failed to load question.");
    }
  };

  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          nextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopAll = () => {
    clearInterval(timerRef.current);
    recognitionRef.current?.stop();
  };

  /* ---------------- NEXT QUESTION ---------------- */
  const nextQuestion = async () => {
    stopAll();

    if (count >= MAX_QUESTIONS) {
      speak("Your interview is completed. Thank you for your time.");
      return;
    }

    const next = count + 1;
    setCount(next);
    await getQuestion(transcript, next);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center p-8">
      <div className="w-full max-w-[90rem] min-h-[85vh] bg-white rounded-2xl shadow-lg border border-purple-100 p-10">

        {/* HEADER */}
        <h2 className="text-2xl font-semibold text-purple-700 mb-1">
          🎯 Mock Interview
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Mode: {mode} | Topic: {value}
        </p>

        {/* MAIN GRID */}
        <div className="grid grid-cols-12 gap-8 h-full">

          {/* LEFT */}
          <div className="col-span-4 flex flex-col gap-6">
            <div className="h-56 bg-purple-100 border border-purple-200 rounded-xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2">
                🤖
              </div>
              <p className="font-medium text-purple-700">System</p>
              <p className="text-sm text-purple-500">AI Interviewer</p>
            </div>

            <div className="h-56 bg-purple-100 border border-purple-200 rounded-xl flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-400 text-white flex items-center justify-center mb-2">
                👤
              </div>
              <p className="font-medium text-purple-700">User</p>
              <p className="text-sm text-purple-500">Candidate</p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col-span-8 bg-purple-50 border border-purple-200 rounded-xl p-8 flex flex-col justify-between">

            {/* QUESTION */}
            <div>
              <div className="flex justify-between mb-3">
                <p className="text-xs uppercase tracking-wide text-purple-500">
                  Question
                </p>
                {phase === "interview" && (
                  <span className="text-sm text-purple-600">
                    ⏱ 0:{timeLeft.toString().padStart(2, "0")}
                  </span>
                )}
              </div>

              <p className="text-lg font-medium text-purple-900 leading-relaxed">
                {question}
              </p>
            </div>

            {/* LEVEL BUTTONS */}
            {phase === "level" && (
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => chooseLevel("easy")}
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Easy
                </button>
                <button
                  onClick={() => chooseLevel("medium")}
                  className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  Medium
                </button>
                <button
                  onClick={() => chooseLevel("hard")}
                  className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Hard
                </button>
              </div>
            )}

            {/* ANSWER */}
            {phase === "interview" && (
              <>
                <textarea
                  rows="7"
                  className="w-full bg-white border border-purple-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="User spoken answer will be converted to text here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                />
                <div className="flex justify-end text-sm text-purple-600 mt-3">
                  {count} / {MAX_QUESTIONS}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
