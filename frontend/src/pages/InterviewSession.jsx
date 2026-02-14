import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CameraFeed from "./CameraFeed";

export default function InterviewSession() {
  const { state } = useLocation();
  const { mode, value } = state || {};
  const silenceTimerRef = useRef(null);

  /* ---------------- STATE ---------------- */
  const [phase, setPhase] = useState("greeting");
  const [level, setLevel] = useState("");
  const [question, setQuestion] = useState("");
  const [rawQuestion, setRawQuestion] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [count, setCount] = useState(1);
  const [timeLeft, setTimeLeft] = useState(15);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const isExtendingRef = useRef(false);
  const lastSpeechTimeRef = useRef(Date.now());
  const [activeSpeaker, setActiveSpeaker] = useState("system");
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  // "system" | "user"

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);


  const [voiceLevel, setVoiceLevel] = useState(0);

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

  //Camera
  useEffect(() => {
    const startCameraOnLoad = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraOn(true);
        }
      } catch (err) {
        console.error("Camera start failed:", err);
      }
    };

    startCameraOnLoad();
  }, []);




  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();   // 👈 important
        setCameraOn(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };




  /* ---------------- SPEECH RECOGNITION ---------------- */
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event) => {
        clearTimeout(silenceTimerRef.current);

        lastSpeechTimeRef.current = Date.now();

        let finalText = "";
        let interimText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalText += text + " ";
          } else {
            interimText += text;
          }
        }

        if (finalText) {
          setFinalTranscript((prev) => prev + finalText);
        }

        setInterimTranscript(interimText);
      };
      /*
      recog.onend = () => {
        const fullText = finalTranscript + interimTranscript;

        if (
          phase === "interview" &&
          !speakingRef.current &&
          fullText.trim().length > 3
        ) {
          silenceTimerRef.current = setTimeout(() => {
            nextQuestion();
          }, 3000); // waits 3 seconds
        }
      };
      */


      recognitionRef.current = recog;
    }
  }, [phase]);

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speak = (text, onEnd) => {
    speakingRef.current = true;
    setActiveSpeaker("system"); // glow on system

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      speakingRef.current = false;
      setActiveSpeaker("user"); // switch glow to user
      if (onEnd) onEnd();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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

  /*--Audio Analysis Function*/
  const startAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      const checkVolume = () => {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }

        const avg = sum / bufferLength;

        setVoiceLevel(avg); // 0 → 255

        requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.log("Mic analysis error:", err);
    }
  };




  /* ---------------- FETCH QUESTION ---------------- */
  const getQuestion = async (answerText = "", qCount = count, lvl = level) => {
    setFinalTranscript("");
    setInterimTranscript("");
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
      const displayQ = `Q${qCount}. ${cleanQ}`;

      setRawQuestion(cleanQ);
      setQuestion(displayQ);
      setAskedQuestions((prev) => [...prev, cleanQ]);

      speak(displayQ, () => {
        setActiveSpeaker("user");   // user turn starts
        recognitionRef.current?.start();
        startAudioAnalysis();
        startTimer();
      });

    } catch (err) {
      console.error(err);
      setQuestion("Failed to load question.");
    }
  };

  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    setTimeLeft(15);
    isExtendingRef.current = false;
    lastSpeechTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const silenceDuration = (now - lastSpeechTimeRef.current) / 1000;

      setTimeLeft((prev) => {

        // 🟣 NORMAL COUNTDOWN (90 → 0)
        if (!isExtendingRef.current) {
          if (prev <= 1) {
            // If still speaking → go into extension mode
            if (silenceDuration < 2) {
              isExtendingRef.current = true;
              return -1;
            }

            // If NOT speaking → just stay at 0
            return 0;
          }

          return prev - 1;
        }

        // 🟢 EXTENSION MODE (+01, +02...)
        if (isExtendingRef.current) {

          // 🔴 ONLY HERE check silence
          if (silenceDuration > 4) {
            clearInterval(timerRef.current);
            nextQuestion();
            return prev;
          }

          return prev - 1;
        }

        return prev;
      });

    }, 1000);
  };


  const stopAll = () => {
    clearInterval(timerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch { }
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
    const fullAnswer = finalTranscript + interimTranscript;
    await getQuestion(fullAnswer, next);
  };

  /* ---------------- END BUTTON ---------------- */
  const endAndProceed = () => {
    stopAll();
    setTimeLeft(15);
    nextQuestion();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center p-8">
      <div className="w-full max-w-[90rem] min-h-[85vh] bg-white rounded-2xl shadow-lg border border-purple-100 p-10">

        <h2 className="text-2xl font-semibold text-purple-700 mb-1">
          🎯 Mock Interview
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Mode: {mode} | Topic: {value}
        </p>

        <div className="grid grid-cols-12 gap-8 h-full">

          {/* LEFT */}
          <div className="col-span-4 flex flex-col gap-6">
            <div
              className={`h-56 bg-purple-100 border rounded-xl flex flex-col items-center justify-center ${activeSpeaker === "system"
                ? "border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                : "border-purple-200"
                }`}
            >
              <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center mb-2">
                🤖
              </div>
              <p className="font-medium text-purple-700">System</p>
              <p className="text-sm text-purple-500">AI Interviewer</p>
            </div>


            <div className="h-56 bg-purple-100 border rounded-xl overflow-hidden">
              <CameraFeed />
            </div>




          </div>

          {/* RIGHT */}
          <div className="col-span-8 bg-purple-50 border border-purple-200 rounded-xl p-8 flex flex-col justify-between">

            <div>
              <span
                className={`text-sm font-semibold ${timeLeft > 10
                  ? "text-purple-600"
                  : timeLeft > 0
                    ? "text-red-600 animate-pulse"
                    : "text-green-600"
                  }`}
              >
                {timeLeft > 0
                  ? `⏱ 0:${timeLeft.toString().padStart(2, "0")}`
                  : `⏱ +${Math.abs(timeLeft).toString().padStart(2, "0")}`}
              </span>



              <p className="text-lg font-medium text-purple-900 leading-relaxed">
                {question}
              </p>
            </div>

            {phase === "level" && (
              <div className="flex justify-center gap-6">
                <button onClick={() => chooseLevel("easy")} className="px-6 py-2 bg-green-100 text-green-700 rounded-lg">Easy</button>
                <button onClick={() => chooseLevel("medium")} className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg">Medium</button>
                <button onClick={() => chooseLevel("hard")} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg">Hard</button>
              </div>
            )}

            {phase === "interview" && (
              <>
                <textarea
                  rows="7"
                  className="w-full bg-white border border-purple-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="User spoken answer will be converted to text here..."
                  value={finalTranscript + interimTranscript}
                  onChange={(e) => setFinalTranscript(e.target.value)}
                />

                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={endAndProceed}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Next Question
                  </button>

                  <div className="text-sm text-purple-600">
                    {count} / {MAX_QUESTIONS}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
