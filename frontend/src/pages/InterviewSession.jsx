import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export default function InterviewSession() {
  const { state } = useLocation();
  const { mode, value } = state || {};

  const [phase, setPhase] = useState("greeting"); // greeting | level | interview
  const [level, setLevel] = useState("");
  const [question, setQuestion] = useState("");
  const [rawQuestion, setRawQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState("🧑‍💼 Interviewer");
  const [timeLeft, setTimeLeft] = useState(60);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [interviewHistory, setInterviewHistory] = useState([]);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const speakingRef = useRef(false);

  const MAX_QUESTIONS = 10;

  /* ---------------- HELPERS ---------------- */

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
  }, [transcript, phase]);

  /* ---------------- TEXT TO SPEECH ---------------- */

  const speak = (text, onEnd) => {
    speakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      speakingRef.current = false;
      if (onEnd) onEnd();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };


  /* ---------------- GREETING (100% RELIABLE) ---------------- */
useEffect(() => {
  if (phase === "greeting") {
    const greetingOnly = getGreeting();
    const welcomeText =
      "Welcome to Hire Ready AI, an AI powered resume builder and mock interview platform. " +
      "To continue with the interview, please select the level of interview.";

    // Step 1: Speak greeting
    speak(greetingOnly, () => {
      // Step 2: Speak welcome + instruction
      setQuestion(`${greetingOnly}. ${welcomeText}`);
      speak(welcomeText, () => {
        setPhase("level"); // buttons appear only AFTER speech
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

  /* ---------------- AI CALL ---------------- */

  const getQuestion = async (answerText = "", qCount = count, lvl = level) => {
    setTranscript("");
    setStatus("🤖 Interviewer is thinking...");

    const res = await fetch("http://localhost:5000/api/ai/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        value,
        level: lvl,
        answer: answerText,
        count: qCount,
        askedQuestions
      })
    });

    const data = await res.json();
    const cleanQ = data.question;

    setRawQuestion(cleanQ);
    setAskedQuestions((prev) => [...prev, cleanQ]);
    setQuestion(cleanQ);

  setStatus("🧑‍💼 Interviewer speaking...");

const spokenQuestion = `Here is question number ${qCount}. ${cleanQ}`;
setQuestion(spokenQuestion);

speak(spokenQuestion, () => {
  setStatus("🎙 Listening...");
  startAnswerPhase();
});

  };

  /* ---------------- ANSWER PHASE ---------------- */

  const startAnswerPhase = () => {
    recognitionRef.current?.start();
    startTimer();
  };

  const stopAnswerPhase = () => {
    recognitionRef.current?.stop();
    clearInterval(timerRef.current);
  };

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

  /* ---------------- NEXT QUESTION ---------------- */

  const nextQuestion = async () => {
    stopAnswerPhase();

    setInterviewHistory((prev) => [
      ...prev,
      { question: rawQuestion, answer: transcript }
    ]);

    if (count >= MAX_QUESTIONS) {
      speak("Your interview is completed. Thank you for your time.");
      setStatus("✅ Interview completed");
      console.log("FINAL INTERVIEW DATA:", interviewHistory);
      return;
    }

    const next = count + 1;
    setCount(next);
    await getQuestion(transcript, next);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-2xl p-6 shadow-lg border border-purple-100">

        <h2 className="text-2xl font-semibold text-purple-700 mb-1 flex items-center gap-2">
          🎯 Mock Interview
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Mode: {mode} | Topic: {value}
        </p>

        {/* SYSTEM & USER */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl bg-purple-100 p-6 flex flex-col items-center justify-center h-52 border border-purple-200">
            <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-xl mb-3">
              🤖
            </div>
            <p className="text-purple-700 font-medium">System</p>
            <p className="text-purple-500 text-sm">AI Interviewer</p>
          </div>

          <div className="rounded-2xl bg-purple-50 p-6 flex flex-col items-center justify-center h-52 border border-purple-200">
            <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center text-white text-xl mb-3">
              👤
            </div>
            <p className="text-purple-700 font-medium">User</p>
            <p className="text-purple-500 text-sm">Candidate</p>
          </div>
        </div>

        {/* LEVEL SELECTION */}
        {phase === "level" && (
          <div className="flex justify-center gap-6 mb-8">
            <button onClick={() => chooseLevel("easy")} className="px-6 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium border border-purple-300">
              Easy
            </button>
            <button onClick={() => chooseLevel("medium")} className="px-6 py-2 rounded-xl bg-purple-200 hover:bg-purple-300 text-purple-800 font-medium border border-purple-300">
              Medium
            </button>
            <button onClick={() => chooseLevel("hard")} className="px-6 py-2 rounded-xl bg-purple-300 hover:bg-purple-400 text-purple-900 font-medium border border-purple-400">
              Hard
            </button>
          </div>
        )}

        {/* INTERVIEW */}
        {phase === "interview" && (
          <div className="rounded-2xl bg-purple-50 p-6 border border-purple-200">
            <p className="text-sm uppercase text-purple-500 mb-2">Question</p>
            <p className="text-lg font-medium text-purple-900 mb-4">{question}</p>

            <p className="text-sm uppercase text-purple-500 mb-2">Answer</p>
            <textarea
              rows="4"
              className="w-full bg-white border border-purple-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-400"
              placeholder="Your spoken answer will appear here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <div className="flex justify-between mt-4 text-sm text-purple-600">
              <span>⏰ 0:{timeLeft.toString().padStart(2, "0")}</span>
              <span>Question {count} / {MAX_QUESTIONS}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
