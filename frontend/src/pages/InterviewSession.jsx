import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CameraFeed from "./CameraFeed";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import TopAlertBar from "../components/TopAlertBar";
import AIMonitoringStatus from "../components/AIMonitoringStatus";
import {
  loadFaceModels,
  analyzeFace,
  calculateConfidenceScore,
  getTopBarAlert,
  postEmotion,
} from "../services/facialAnalysisService"; // postEmotion will send data to backend


import robotAnimation from "../assets/robot.json";
// import robotAnimation from "https://assets2.lottiefiles.com/packages/lf20_2ks3pjua.json";


export default function InterviewSession() {
  const location = useLocation();
  const state = location.state || {};
  const navigate = useNavigate();

  const mode = state.mode || "";
  const value = state.value || "";
  const resumeText = state.resumeText || "";
  const silenceTimerRef = useRef(null);
  const levelRef = useRef("");
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
  const canvasRef = useRef(null); // used to draw bounding box
  const [cameraOn, setCameraOn] = useState(false);

  // Facial Analysis State
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [topAlert, setTopAlert] = useState(null); // {id,type,message}
  const alertTimerRef = useRef(null); // for auto hide
  const [dismissedAlerts, setDismissedAlerts] = useState({}); // id -> timestamp
  const facialAnalysisIntervalRef = useRef(null);
  const modelLoadedRef = useRef(false);
  const lastHeadPosRef = useRef("forward"); // remembers last known head orientation

  // alert state tracker (ref so mutations don't trigger renders)
  const alertStateRef = useRef({
    faceNotDetected: false,
    faceNotDetectedStart: null,
    headTurnedAway: false,
    headAwayStart: null, // timestamp when head first moved away
    nervousStart: null,
    nervous: false, // whether nervous alert already shown
    nervousCount: 0, // consecutive nervous samples
    multiplePersons: false,
  });
  const lastDataAlertRef = useRef(0); // timestamp of last data-sent alert

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Load face detection models
    loadFaceModels().then(() => {
      modelLoadedRef.current = true;
      console.log("✅ Face models loaded successfully");
    });
  }, []);


  const [voiceLevel, setVoiceLevel] = useState(0);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      console.log("Available voices:", voices);
    };

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }

    loadVoices();
  }, []);


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

  //Camera + Facial Analysis
  useEffect(() => {
    const startFacialAnalysis = async () => {
      if (!videoRef.current) {
        console.warn("⚠️ Video ref not available");
        return;
      }

      // Wait until video element has enough data to analyze
      const checkVideoReady = setInterval(() => {
        if (
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
        ) {
          clearInterval(checkVideoReady);

          if (modelLoadedRef.current) {
            console.log("✅ Starting facial analysis...");

            facialAnalysisIntervalRef.current = setInterval(async () => {
              if (
                videoRef.current &&
                videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
              ) {
                const metrics = await analyzeFace(videoRef.current);
                if (metrics) {
                  const now = Date.now();

                  // ===== FACE VISIBILITY MONITORING =====
                  if (metrics.faceDetected) {
                    // keep track of orientation
                    lastHeadPosRef.current = metrics.headPosition || "forward";

                    if (alertStateRef.current.faceNotDetected) {
                      // State transition: face was missing, now detected
                      alertStateRef.current.faceNotDetected = false;
                      alertStateRef.current.faceNotDetectedStart = null;
                      // positive notification briefly
                      const alertObj = {
                        id: "face-back",
                        type: "info",
                        message:
                          "Face detected. You may continue the interview.",
                      };
                      setTopAlert(alertObj);
                    }
                  } else {
                    // if face is gone but we remembered a head tilt, treat as focus issue
                    const wasTilt = lastHeadPosRef.current !== "forward";
                    if (wasTilt) {
                      // show head-movement alert immediately
                      if (!alertStateRef.current.headTurnedAway) {
                        alertStateRef.current.headTurnedAway = true;
                        const alertObj = {
                          id: "head-movement",
                          type: "warning",
                          message: "Please maintain your focus on the interview screen.",
                        };
                        if (shouldShow(alertObj)) setTopAlert(alertObj);
                      }
                    } else {
                      // normal face visibility handling
                      if (!alertStateRef.current.faceNotDetectedStart) {
                        alertStateRef.current.faceNotDetectedStart = now;
                      } else if (
                        now - alertStateRef.current.faceNotDetectedStart > 3000
                      ) {
                        if (!alertStateRef.current.faceNotDetected) {
                          // State transition: face missing for 3s
                          alertStateRef.current.faceNotDetected = true;
                          const alertObj = {
                            id: "no-face",
                            type: "warning",
                            message:
                            "Your face is not clearly visible. Please adjust your position.",
                          };
                          if (shouldShow(alertObj)) {
                            setTopAlert(alertObj);
                          }
                        }
                      }
                    }
                  }

                  // ===== HEAD MOVEMENT / ATTENTION MONITORING =====
                  const isHeadForward = metrics.headPosition === "forward";
                  if (!isHeadForward) {
                    // head not forward -> start or continue timer
                    if (!alertStateRef.current.headAwayStart) {
                      alertStateRef.current.headAwayStart = now;
                    } else if (
                      now - alertStateRef.current.headAwayStart > 3000 &&
                      !alertStateRef.current.headTurnedAway
                    ) {
                      // persisted away more than 3s, show alert once
                      alertStateRef.current.headTurnedAway = true;
                      const alertObj = {
                        id: "head-movement",
                        type: "warning",
                        message: "Please maintain your focus on the interview screen.",
                      };
                      if (shouldShow(alertObj)) {
                        setTopAlert(alertObj);
                      }
                    }
                  } else {
                    // head returned to forward
                    alertStateRef.current.headAwayStart = null;
                    if (alertStateRef.current.headTurnedAway) {
                      alertStateRef.current.headTurnedAway = false;
                      setTopAlert(null);
                    }
                  }

                  // ===== NERVOUS EXPRESSION ALERT (smoothed) =====
                  // Use consecutive sample counting to avoid resets caused by
                  // intermittent fluctuations. Samples are taken every ~2000ms.
                  const expr = metrics.expressions || {};
                  const nervousScore = (expr.fearful || 0) + (expr.sad || 0) + (expr.disgusted || 0);
                  const isNervousFrame =
                    nervousScore > 0.25 ||
                    metrics.emotion === "fearful" ||
                    metrics.emotion === "sad" ||
                    metrics.emotion === "disgusted";

                  if (isNervousFrame) {
                    alertStateRef.current.nervousCount = (alertStateRef.current.nervousCount || 0) + 1;
                    console.log("[nervous] score", nervousScore, "count", alertStateRef.current.nervousCount, "dominant", metrics.emotion);
                  } else {
                    if (alertStateRef.current.nervousCount > 0) console.log("[nervous] reset");
                    alertStateRef.current.nervousCount = 0;
                    // clear shown flag when expression normalizes so it can trigger again later
                    alertStateRef.current.nervous = false;
                  }

                  // require N consecutive samples -> with 2s sampling interval, 3 samples ~= 6s
                  const REQUIRED_NERVOUS_SAMPLES = 3;
                  if (alertStateRef.current.nervousCount >= REQUIRED_NERVOUS_SAMPLES && !alertStateRef.current.nervous) {
                    alertStateRef.current.nervous = true;
                    const alertObj = {
                      id: "nervous",
                      type: "warning",
                      message: "You appear slightly nervous. Please relax and continue confidently.",
                    };
                    if (shouldShow(alertObj)) setTopAlert(alertObj);
                  }

                  // ===== MULTIPLE FACE DETECTION =====
                  if (metrics.multiplePersons) {
                    if (!alertStateRef.current.multiplePersons) {
                      // State transition: multiple faces detected
                      alertStateRef.current.multiplePersons = true;
                      const alertObj = {
                        id: "multiple-face",
                        type: "warning",
                        message:
                          "Multiple people detected. Please ensure you are alone during the interview.",
                      };
                      if (shouldShow(alertObj)) {
                        setTopAlert(alertObj);
                      }
                    }
                  } else {
                    if (alertStateRef.current.multiplePersons) {
                      // State transition: back to single face
                      alertStateRef.current.multiplePersons = false;
                      if (topAlert?.id === "multiple-face") {
                        setTopAlert(null);
                      }
                    }
                  }

                  // ===== UPDATE METRICS =====
                  const confidence = calculateConfidenceScore(metrics);
                  const metricsWithConfidence = { ...metrics, confidence };
                  setCurrentMetrics(metricsWithConfidence);
                  setMetricsHistory((prev) => [...prev, metricsWithConfidence]);

                  // ===== DRAW BOUNDING BOX =====
                  if (metricsWithConfidence.boundingBox) {
                    const ctx = canvasRef.current?.getContext("2d");
                    const vid = videoRef.current;
                    if (ctx && vid) {
                      canvasRef.current.width = vid.videoWidth;
                      canvasRef.current.height = vid.videoHeight;
                      ctx.clearRect(
                        0,
                        0,
                        canvasRef.current.width,
                        canvasRef.current.height
                      );
                      ctx.strokeStyle = "#00FF00";
                      ctx.lineWidth = 2;
                      let { x, y, width, height } =
                        metricsWithConfidence.boundingBox;
                      const vw = canvasRef.current.width;
                      x = vw - x - width;
                      ctx.strokeRect(x, y, width, height);
                    }
                  } else if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext("2d");
                    ctx.clearRect(
                      0,
                      0,
                      canvasRef.current.width,
                      canvasRef.current.height
                    );
                  }

                  // ===== SEND DATA TO BACKEND =====
                  const attention = isHeadForward ? 1 : 0; // 1 for good, 0 for poor
                  postEmotion({
                    emotion: metricsWithConfidence.emotion || "",
                    confidence: metricsWithConfidence.confidence,
                    attention,
                    timestamp: new Date().toISOString(),
                  }).then(() => {
                    const now = Date.now();
                    // notify user that data is recorded but only once every 30s
                    if (now - lastDataAlertRef.current > 30000) {
                      lastDataAlertRef.current = now;
                      const alertObj = {
                        id: "data-sent",
                        type: "info",
                        message:
                          "Your responses are being securely logged for analysis.",
                      };
                      if (shouldShow(alertObj)) {
                        setTopAlert(alertObj);
                      }
                    }
                  });
                }
              }
            }, 2000); // run every 2 seconds
          } else {
            console.warn("⚠️ Face models not loaded yet");
          }
        }
      }, 100);

      return () => {
        clearInterval(checkVideoReady);
        if (facialAnalysisIntervalRef.current) {
          clearInterval(facialAnalysisIntervalRef.current);
        }
      };
    };

    startFacialAnalysis();

    return () => {
      if (facialAnalysisIntervalRef.current) {
        clearInterval(facialAnalysisIntervalRef.current);
      }
    };
  }, []);

  /**
   * Check if an alert should be shown (not recently dismissed)
   */
  const shouldShow = (alert) => {
    if (!alert) return false;
    const last = dismissedAlerts[alert.id];
    if (last && Date.now() - last < 10000) {
      // dismissed within last 10 seconds
      return false;
    }
    return true;
  };

  // automatically clear top alert after 3 seconds
  useEffect(() => {
    if (alertTimerRef.current) {
      clearTimeout(alertTimerRef.current);
    }
    if (topAlert) {
      alertTimerRef.current = setTimeout(() => {
        setTopAlert(null);
      }, 3000);
    }
    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    };
  }, [topAlert]);






  /* ---------------- SPEECH RECOGNITION ---------------- */

  // handler for closing the top alert bar
  const dismissTopAlert = (id) => {
    setDismissedAlerts((prev) => ({ ...prev, [id]: Date.now() }));
    setTopAlert(null);
  };

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
    const synth = window.speechSynthesis;

    if (!synth) return;

    synth.cancel(); // clear previous queue

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    const voices = synth.getVoices();

    if (voices.length > 0) {
      const female =
        voices.find(v =>
          v.name.includes("Zira") ||
          v.name.includes("Samantha") ||
          v.name.toLowerCase().includes("female")
        ) || voices[0];

      utterance.voice = female;
    }

    utterance.rate = 1;
    utterance.pitch = 1.1;

    utterance.onstart = () => {
      setActiveSpeaker("system");
    };

    utterance.onend = () => {
      setActiveSpeaker("user");
      if (onEnd) onEnd();
    };

    synth.speak(utterance);
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
  const chooseLevel = async (lvl) => {
    setLevel(lvl);
    levelRef.current = lvl;

    const msg = `You have selected the ${lvl} level. Let's start the interview.`;
    setQuestion(msg);

    speak(msg, () => {
      setPhase("interview");
      getQuestion("", 1, lvl); // just call next
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

  const cleanResume = (text) => {
    return text
      .replace(/linkedin|github|portfolio|gmail|@\S+|\+91\d+/gi, "")
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "") // remove name-like patterns
      .trim();
  };


  /* ---------------- FETCH QUESTION ---------------- */
  const getQuestion = async (answerText = "", qCount = count) => {
    setFinalTranscript("");
    setInterimTranscript("");
    clearInterval(timerRef.current);

    try {
      const requestBody = {
        type: mode,
        role: value,
        level: levelRef.current,
      };

      // Add resumeText for resume-based interviews
      if (mode === "resume") {
        requestBody.resumeText = resumeText;
        if (answerText) {
          requestBody.previousAnswer = answerText;
        }
      }

      const res = await fetch("http://localhost:5000/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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

        // ⏳ NORMAL COUNTDOWN
        if (!isExtendingRef.current) {

          if (prev <= 1) {

            // If user still speaking → extend
            if (silenceDuration < 2) {
              isExtendingRef.current = true;
              return -1;
            }

            // If NOT speaking → go next question
            clearInterval(timerRef.current);
            nextQuestion();
            return 0;
          }

          return prev - 1;
        }

        // ⏫ EXTENSION MODE
        if (isExtendingRef.current) {

          // If silence detected during extension → move next
          if (silenceDuration > 3) {
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

    setCount((prev) => {
      const newCount = prev + 1;
      getQuestion(finalTranscript + interimTranscript, newCount);
      return newCount;
    });
  };

  /* ---------------- END BUTTON ---------------- */
  const endAndProceed = () => {
    stopAll();
    setTimeLeft(15);
    nextQuestion();
  };
  const stopInterview = () => {
    // Stop timer
    clearInterval(timerRef.current);

    // Stop facial analysis
    if (facialAnalysisIntervalRef.current) {
      clearInterval(facialAnalysisIntervalRef.current);
    }

    // Stop speech recognition
    try {
      recognitionRef.current?.stop();
    } catch { }

    // Stop speech synthesis
    window.speechSynthesis.cancel();

    // Stop camera
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    // Stop audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // Navigate to feedback with metrics
    navigate("/mock-interview/feedback", {
      state: {
        metricsHistory,
        mode,
        value,
      },
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center p-8">
      <AIMonitoringStatus />
      <TopAlertBar alert={topAlert} onDismiss={dismissTopAlert} />

      {/* Debug panel: show only when ?debug=1 in URL */}
      {new URLSearchParams(window.location.search).get("debug") === "1" && (
        <div style={{ position: "fixed", top: 72, right: 16, zIndex: 11000, display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              // force nervous alert for quick testing
              alertStateRef.current.nervousStart = Date.now() - 6000; // pretend it started 6s ago
              alertStateRef.current.nervous = false;
              const alertObj = {
                id: "nervous",
                type: "warning",
                message: "You appear slightly nervous. Please relax and continue confidently.",
              };
              setTopAlert(alertObj);
              console.log("[debug] forced nervous alert");
            }}
            style={{ padding: "8px 10px", borderRadius: 8, background: "#f8d7da", border: "1px solid #f5c6cb", color: "#721c24", fontWeight: 600 }}
          >
            Simulate Nervous
          </button>

          <button
            onClick={() => {
              // force head-away alert for quick testing
              alertStateRef.current.headAwayStart = Date.now() - 4000; // pretend it started 4s ago
              alertStateRef.current.headTurnedAway = false;
              const alertObj = {
                id: "head-movement",
                type: "warning",
                message: "Please maintain your focus on the interview screen.",
              };
              setTopAlert(alertObj);
              console.log("[debug] forced head-away alert");
            }}
            style={{ padding: "8px 10px", borderRadius: 8, background: "#fff4e5", border: "1px solid #ffe0b2", color: "#663c00", fontWeight: 600 }}
          >
            Simulate Head Away
          </button>
        </div>
      )}
      
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
              className={`h-64 bg-purple-100 border rounded-xl flex items-center justify-center ${activeSpeaker === "system"
                ? "border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
                : "border-purple-200"
                }`}
            >
              {robotAnimation && (
                <Lottie
                  animationData={robotAnimation}
                  loop={activeSpeaker === "system"}
                  autoplay={activeSpeaker === "system"}
                  style={{
                    width: 220,
                    height: 220,
                  }}
                />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Camera Preview</p>
              <div className="h-56 bg-purple-100 border border-purple-200 rounded-[12px] overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div className="relative w-full h-full">
                  <CameraFeed videoRef={videoRef} />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </div>
              </div>
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
                <button onClick={() => chooseLevel("moderate")} className="px-6 py-2 bg-yellow-100 text-yellow-700 rounded-lg">Moderate</button>
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

                <div className="flex justify-between items-center mt-4 gap-6">
                  <button
                    onClick={stopInterview}
                    className="px-6 py-2 bg-[#9c142f] text-white rounded-lg hover:bg-red-600"
                  >
                    Stop Interview
                  </button>

                  <button
                    onClick={endAndProceed}
                    className="px-6 py-2 bg-[#207018] text-white rounded-lg hover:bg-green-600"
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
