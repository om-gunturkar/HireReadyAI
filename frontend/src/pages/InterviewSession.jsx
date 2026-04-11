import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CameraFeed from "./CameraFeed";
import Lottie from "lottie-react";
import { useNavigate } from "react-router-dom";
import TopAlertBar from "../components/TopAlertBar";
import AIMonitoringStatus from "../components/AIMonitoringStatus";
import { loadFaceModels, analyzeFace, calculateConfidenceScore, getTopBarAlert, postEmotion } from "../services/facialAnalysisService";
import { completeInterviewSession, startInterviewSession, submitInterviewAnswer } from "../api/interviewSession";

import robotAnimation from "../assets/robot.json";
// import robotAnimation from "https://assets2.lottiefiles.com/packages/lf20_2ks3pjua.json";


export default function InterviewSession() {
  const [showWarning, setShowWarning] = useState(false);
  const location = useLocation();
  const state = location.state || {};
  const navigate = useNavigate();
  const isAISpeakingRef = useRef(false);
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
  const countRef = useRef(count);
  const [timeLeft, setTimeLeft] = useState(30);
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
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionTime, setCompletionTime] = useState(5);
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [topAlert, setTopAlert] = useState(null); // {id,type,message}
  const [userFaceSnapshot, setUserFaceSnapshot] = useState("");
  const alertTimerRef = useRef(null); // for auto hide
  const [dismissedAlerts, setDismissedAlerts] = useState({}); // id -> timestamp
  const facialAnalysisIntervalRef = useRef(null);
  const modelLoadedRef = useRef(false);
  const lastHeadPosRef = useRef("forward");
  const isProcessingRef = useRef(false);
  const selectedVoiceRef = useRef(null);

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
    countRef.current = count;
  }, [count]);

  useEffect(() => {
    const snapshot =
      localStorage.getItem("userFaceSnapshot") ||
      sessionStorage.getItem("userFaceSnapshot") ||
      "";
    setUserFaceSnapshot(snapshot);
  }, []);
  const startMic = () => {
    try {
      recognitionRef.current?.start();
      console.log("🎤 Mic ON");
    } catch (e) {
      console.log("Mic start error:", e);
    }
  };

  const stopMic = () => {
    try {
      recognitionRef.current?.stop();
      console.log("🎤 Mic OFF");
    } catch (e) {
      console.log("Mic stop error:", e);
    }
  };
  useEffect(() => {
    return () => {
      // ✅ Stop voice when component unmounts (page change)
      window.speechSynthesis.cancel();

      // also stop recognition
      try {
        recognitionRef.current?.stop();
      } catch { }

      // stop timers
      clearInterval(timerRef.current);
    };
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


  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) return;

    // 🔥 Warm-up speech engine (silent utterance)
    const warmUp = new SpeechSynthesisUtterance("");
    warmUp.volume = 0;

    synth.speak(warmUp);
  }, []);


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
                    sessionId,
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
  }, [sessionId]);

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
  // Face Model
  useEffect(() => {
    loadFaceModels().then(() => {
      modelLoadedRef.current = true;
      console.log("✅ Face models loaded");
    });
  }, []);
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

  /* ---------------- Block BACK Button ---------------- */

  useEffect(() => {
    const handleBack = () => {
      window.history.pushState(null, "", window.location.href);
      setShowWarning(true);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);

  /* ---------------- DETECT WINDOW BLUR ---------------- */

  useEffect(() => {
    const handleBlur = () => {
      if (phase === "interview") {
        setTopAlert({
          id: "window-blur",
          type: "warning",
          message: "⚠️ Focus lost. Please return to the interview.",
        });
      }
    };

    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [phase]);


  // auto terminate

  const violationCountRef = useRef(0);

  const handleViolation = () => {
    violationCountRef.current += 1;

    if (violationCountRef.current >= 3) {
      alert("❌ Interview terminated due to repeated violations.");
      stopInterview();
    }
  };
  /* ---------------- TAB SWITCH ---------------- */

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === "interview") {
        setTopAlert({
          id: "tab-switch",
          type: "warning",
          message: "⚠️ Please stay on the interview screen.",
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [phase]);

  /* ---------------- SPEECH RECOGNITION ---------------- */

  // handler for closing the top alert bar
  const dismissTopAlert = (id) => {
    setDismissedAlerts((prev) => ({ ...prev, [id]: Date.now() }));
    setTopAlert(null);
  };

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recog = new window.webkitSpeechRecognition();

    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    let isManuallyStopped = false;

    recog.onstart = () => {
      console.log("🎤 Mic started");
    };

    recog.onresult = (event) => {
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

    // 🔥 KEY FIX (delay restart)
    recog.onend = () => {
      console.log("⚠️ Mic stopped");

      // ❌ DO NOT restart if AI is speaking
      if (isAISpeakingRef.current) {
        console.log("🚫 Mic blocked (AI speaking)");
        return;
      }

      // ❌ DO NOT restart if manually stopped
      if (manualStopRef.current) {
        return;
      }

      // ✅ Only restart if user speaking phase
      if (phase === "interview") {
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch { }
        }, 500);
      }
    };

    recog.onerror = (e) => {
      console.log("Speech error:", e);
    };

    recognitionRef.current = recog;

    return () => {
      isManuallyStopped = true;
      try {
        recog.stop();
      } catch { }
    };
  }, [phase]);

  /* ---------------- TEXT TO SPEECH ---------------- */
  const speak = (text) => {
    const synth = window.speechSynthesis;

    if (!synth) return;

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 0.95;

    // 🔴 AI START
    utterance.onstart = () => {
      isAISpeakingRef.current = true;   // 🔥 LOCK

      setActiveSpeaker("system");
      stopMic();

      console.log("🔊 AI speaking...");
    };

    // 🟢 AI END
    utterance.onend = () => {
      isAISpeakingRef.current = false;  // 🔥 UNLOCK

      setActiveSpeaker("user");

      startMic();
      startTimer();
      startAudioAnalysis();

      console.log("🎤 User can speak now");
    };

    synth.speak(utterance);
  };


  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) return;

    // 🔥 Warm-up speech engine
    const warmUp = new SpeechSynthesisUtterance("");
    warmUp.volume = 0;

    synth.speak(warmUp);
  }, []);

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

      // 🔥 Small delay = instant speech feel
      setTimeout(() => {
        speak(`${greeting}. ${welcome}`);

        setTimeout(() => {
          setPhase("level");
        }, 10000); // adjust timing if needed
      }, 100); // ⚡ key fix
    }
  }, [phase]);
  /* ---------------- LEVEL SELECTION ---------------- */
  const chooseLevel = async (lvl) => {
    setLevel(lvl);
    levelRef.current = lvl;


    try {
      const session = await startInterviewSession({
        mode,
        role: value,
        level: lvl,
      });
      setSessionId(session.sessionId);
    } catch (error) {
      console.error("Failed to start interview session:", error);
    }

    const msg = `You have selected the ${lvl} level. Let's start the interview.`;
    setQuestion(msg);

    speak(msg);

    setTimeout(() => {
      setPhase("interview");
      getQuestion("", 1);
    }, 2500);
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
      // ✅ DEBUG LOG (VERY IMPORTANT)
      console.log("🚀 Sending Request:", {
        mode,
        value,
        level: levelRef.current,
      });

      // ✅ VALIDATION (Fix 2)
      if (!mode || !value || !levelRef.current) {
        console.error("❌ Missing required fields:", {
          mode,
          value,
          level: levelRef.current,
        });

        // 🔥 fallback (IMPORTANT)
        if (!levelRef.current && level) {
          levelRef.current = level;
        }

        if (!mode || !value || !levelRef.current) {
          setQuestion("⚠️ Interview setup missing. Please restart.");
          return;
        }
      }

      const requestBody = {
        type: mode,
        role: value,
        level: levelRef.current,
        sessionId,
      };

      if (answerText) {
        requestBody.previousAnswer = answerText;
      }

      if (rawQuestion) {
        requestBody.previousQuestion = rawQuestion;
      }

      // Add resumeText for resume-based interviews
      if (mode === "resume") {
        console.log("📄 Resume Text:", resumeText);
        requestBody.resumeText = resumeText;
      }

      const res = await fetch("http://localhost:5000/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // ✅ HANDLE 400 / API ERRORS (VERY IMPORTANT)
      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ API Error:", errText);

        setQuestion("⚠️ Failed to fetch question. Check backend.");
        return;
      }

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
      speak(displayQ);

    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setQuestion("Failed to load question.");
    }
  };
  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    clearInterval(timerRef.current); // ✅ prevents duplicate timers
    setTimeLeft(30);
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

            if (countRef.current >= MAX_QUESTIONS) {
              stopInterview();   // ✅ go to score page
            } else {
              if (!isProcessingRef.current) {
                nextQuestion();
              }
            }

            return 0;
          }

          return prev - 1;
        }

        // ⏫ EXTENSION MODE
        if (isExtendingRef.current) {

          // If silence detected during extension → move next
          if (silenceDuration > 3) {
            clearInterval(timerRef.current);

            if (countRef.current >= MAX_QUESTIONS) {
              stopInterview();
            } else {
              if (!isProcessingRef.current) {
                nextQuestion();
              }
            }

            return 0;
          }

          return prev - 1;
        }

        return prev;
      });

    }, 1000);
  };


  const stopAll = () => {
    clearInterval(timerRef.current);
    // ❌ DON'T stop recognition here
  };

  const evaluateAndSaveAnswer = async (question, answer) => {
    try {
      if (!sessionId) {
        return null;
      }

      const data = await submitInterviewAnswer(sessionId, {
        question,
        answer,
      });

      return data?.evaluation || null;
    } catch (err) {
      console.error("Failed to save answer evaluation:", err);
      return null;
    }
  };

  /* ---------------- NEXT QUESTION ---------------- */
  const nextQuestion = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    // ❌ STOP MIC before moving to next question
    try {
      recognitionRef.current?.stop();
      console.log("🎤 Mic OFF (Next question)");
    } catch { }

    stopAll();

    const userAnswer = finalTranscript + interimTranscript;
    const currentQuestion = rawQuestion;

    // 🧠 STEP 2: Evaluate answer BEFORE moving ahead
    if (currentQuestion && userAnswer.trim()) {
      const result = await evaluateAndSaveAnswer(currentQuestion, userAnswer);

      if (result) {
        console.log("✅ Score stored:", result);

        // 👉 store AI scores inside metricsHistory
        setMetricsHistory((prev) => [
          ...prev,
          {
            ...currentMetrics,   // face + emotion data
            aiScore: result,     // 🔥 AI evaluation
          },
        ]);
      }
    }

    // 🎯 END CONDITION
    if (countRef.current >= MAX_QUESTIONS) {
      speak("Your interview is completed.");

      setTimeout(() => {
        stopInterview();
      }, 1500);

      isProcessingRef.current = false;
      return;
    }

    // 🔁 NEXT QUESTION
    setCount((prev) => {
      const newCount = prev + 1;

      getQuestion(userAnswer, newCount);

      return newCount;
    });

    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  };

  /* ---------------- END BUTTON ---------------- */
  const endAndProceed = () => {
    clearInterval(timerRef.current); // only stop timer
    if (!isProcessingRef.current) {
      nextQuestion();
    }
  };

  const finalizeInterviewAndNavigate = async () => {
    let report = null;

    if (sessionId) {
      try {
        report = await completeInterviewSession(sessionId);
      } catch (err) {
        console.error("Failed to complete interview session:", err);
      }
    }

    navigate("/mock-interview/score", {
      state: {
        sessionId,
        report,
        mode,
        value,
      },
    });
  };

  useEffect(() => {
    if (!isCompleted) return;

    const audio = new Audio("/success.mp3");
    audio.play().catch(() => { });

    const timer = setInterval(() => {
      setCompletionTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finalizeInterviewAndNavigate();

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, sessionId]);
  const stopInterview = () => {
    clearInterval(timerRef.current);

    if (facialAnalysisIntervalRef.current) {
      clearInterval(facialAnalysisIntervalRef.current);
    }

    try {
      recognitionRef.current?.stop();
    } catch { }

    window.speechSynthesis.cancel();

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // ✅ SHOW OVERLAY ONLY
    setIsCompleted(true);
  };
  const calculateFinalScore = (metricsHistory = []) => {
    // 🚫 No data → return 0
    if (!Array.isArray(metricsHistory) || metricsHistory.length === 0) {
      return {
        totalScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
      };
    }

    let confidenceSum = 0;
    let emotionSum = 0;
    let attentionSum = 0;
    let validAnswers = 0;

    metricsHistory.forEach((m) => {
      // ✅ Only count if actual answer exists
      if (!m || m.skipped) return;

      validAnswers++;

      // -----------------------------
      // CONFIDENCE (F = δ1P + δ2E)
      // -----------------------------
      const confidence = m.confidence ?? 0;
      confidenceSum += confidence;

      // -----------------------------
      // EMOTION (part of confidence / communication)
      // -----------------------------
      if (m.emotion === "happy") emotionSum += 1;
      else if (m.emotion === "neutral") emotionSum += 0.7;
      else emotionSum += 0.4;

      // -----------------------------
      // ATTENTION (technical proxy)
      // -----------------------------
      if (m.headPosition === "forward") attentionSum += 1;
    });

    // 🚫 If user didn't answer anything
    if (validAnswers === 0) {
      return {
        totalScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
      };
    }

    const n = validAnswers;

    // -----------------------------
    // NORMALIZED SCORES (0–1)
    // -----------------------------
    const F = (confidenceSum / n + emotionSum / n) / 2; // confidence + emotion
    const C = emotionSum / n; // communication proxy
    const T = attentionSum / n; // technical proxy

    // -----------------------------
    // FINAL WEIGHTED SCORE (Q)
    // -----------------------------
    const wT = 0.4;
    const wC = 0.3;
    const wF = 0.3;

    const Q = wT * T + wC * C + wF * F;

    // -----------------------------
    // SCALE TO 100
    // -----------------------------
    return {
      totalScore: Math.round(Q * 100),
      technicalScore: Math.round(T * 100),
      communicationScore: Math.round(C * 100),
      confidenceScore: Math.round(F * 100),
    };
  };


  /* ---------------- Send Question ---------------- */
  const evaluateAnswer = async (question, answer) => {
    try {
      const res = await fetch("http://localhost:5000/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      });

      if (!res.ok) {
        console.error("❌ Evaluation failed");
        return null;
      }

      const data = await res.json();

      console.log("✅ AI Evaluation:", data);

      return data;
    } catch (err) {
      console.error("❌ Error sending answer:", err);
      return null;
    }
  };



  /* ---------------- UI ---------------- */
  return (
    <>
      {/* ✅ OVERLAY */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

          <div className="relative bg-white rounded-2xl shadow-2xl p-12 w-[500px] text-center animate-fadeIn">
            <h1 className="text-3xl font-bold text-purple-700 mb-4 animate-bounce">
              🎉 Thank You for Your Time!
            </h1>

            <p className="text-gray-600 mb-8">
              Your interview has been successfully completed.
            </p>

            {/* ✅ PERFECT CIRCLE */}
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 120 120"
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#7c3aed"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={(2 * Math.PI * 50 * (5 - completionTime)) / 5}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-purple-700">
                  {completionTime}s
                </div>
              </div>
            </div>

            <p className="text-gray-500 animate-pulse">
              Redirecting to Score Page...
            </p>
          </div>
        </div>
      )}

      {/* ✅ MAIN PAGE */}
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex justify-center items-center p-8">

        <AIMonitoringStatus />
        <TopAlertBar alert={topAlert} onDismiss={dismissTopAlert} />

        <div className="w-full max-w-[110rem] min-h-[90vh] 
bg-white/80 backdrop-blur-xl 
rounded-3xl shadow-[0_20px_80px_rgba(124,58,237,0.15)] 
border border-purple-200 p-12">

          <h2 className="text-2xl font-semibold text-purple-700 mb-1">
            🎯 Mock Interview
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Mode: {mode} | Topic: {value}
          </p>

          <div className="grid grid-cols-12 gap-10 h-full">

            {/* LEFT */}
            <div className="col-span-4 flex flex-col gap-8">
              <div className="h-80 bg-gradient-to-br from-purple-100 to-pink-100 
border border-purple-200 rounded-3xl flex items-center justify-center 
shadow-inner shadow-purple-200/50">
                {robotAnimation && (
                  <Lottie
                    animationData={robotAnimation}
                    loop={activeSpeaker === "system"}
                    autoplay={activeSpeaker === "system"}
                    style={{ width: 260, height: 260 }}
                  />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Camera Preview
                </p>
                <div className="h-80 bg-black/95 border border-purple-300 rounded-3xl overflow-hidden 
shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
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
            <div className="col-span-8 bg-gradient-to-br from-purple-50 to-white 
border border-purple-200 rounded-2xl p-10 
flex flex-col justify-between shadow-inner">

              <div>
                <span
                  className={`text-2xl font-bold transition-all duration-300
    ${timeLeft <= 10 && timeLeft > 0 ? "text-red-500" : ""}
    ${timeLeft <= 0 ? "text-green-500" : ""}
    ${timeLeft > 10 ? "text-purple-700" : ""}
  `}
                >
                  {timeLeft > 0
                    ? `⏱ 0:${timeLeft.toString().padStart(2, "0")}`
                    : `⏱ +${Math.abs(timeLeft).toString().padStart(2, "0")}`}
                </span>

                <div className="mt-4 flex justify-end">
                  <CandidateIdentityCard
                    title="Verified candidate"
                    subtitle="Login face scan"
                    image={userFaceSnapshot}
                    topic={value}
                  />
                </div>

                <p className="text-2xl font-semibold text-purple-900 mt-6 leading-loose tracking-wide">
                  {question}
                </p>
                {/* ✅ LEVEL SELECTION UI */}
                {phase === "level" && (
                  <div className="flex justify-center gap-6 mt-8">

                    <button
                      onClick={() => chooseLevel("Easy")}
                      className="px-6 py-2 bg-green-200 text-green-800 rounded-lg font-semibold hover:scale-105 transition"
                    >
                      Easy
                    </button>

                    <button
                      onClick={() => chooseLevel("Moderate")}
                      className="px-6 py-2 bg-yellow-200 text-yellow-800 rounded-lg font-semibold hover:scale-105 transition"
                    >
                      Moderate
                    </button>

                    <button
                      onClick={() => chooseLevel("Hard")}
                      className="px-6 py-2 bg-red-200 text-red-800 rounded-lg font-semibold hover:scale-105 transition"
                    >
                      Hard
                    </button>

                  </div>
                )}
              </div>

              {phase === "interview" && (
                <>
                  <textarea
                    rows="7"
                    className="w-full bg-white/90 border border-purple-300 
rounded-xl p-5 shadow-inner outline-none 
focus:ring-2 focus:ring-purple-400 text-gray-800"
                    value={finalTranscript + interimTranscript}
                    onChange={(e) => setFinalTranscript(e.target.value)}
                  />

                  <div className="flex justify-between items-center mt-4 gap-6">
                    <button
                      onClick={stopInterview}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg"
                    >
                      Stop Interview
                    </button>

                    <button
                      onClick={count >= MAX_QUESTIONS ? stopInterview : endAndProceed}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 
text-white rounded-xl shadow-lg hover:scale-105 transition"
                    >
                      {count >= MAX_QUESTIONS ? "Submit" : "Next Question"}
                    </button>

                    <div className="text-sm text-purple-600">
                      {Math.min(count, MAX_QUESTIONS)} / {MAX_QUESTIONS}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
          {showWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-[400px] text-center border border-purple-200">

                <h2 className="text-xl font-semibold text-purple-700 mb-3">
                  ⚠️ Action Restricted
                </h2>

                <p className="text-gray-600 mb-6">
                  You cannot go back during the interview.
                </p>

                <button
                  onClick={() => setShowWarning(false)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg shadow-md hover:scale-105 transition"
                >
                  OK
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CandidateIdentityCard({ title, subtitle, image, topic }) {
  return (
    <div className="w-full max-w-[260px] rounded-[1.5rem] border border-purple-200 bg-white/85 p-4 shadow-[0_12px_30px_rgba(124,58,237,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-500">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-purple-200 bg-purple-100">
          {image ? (
            <img src={image} alt="Verified candidate" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-purple-500">No scan</div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">Active interview: {topic || "General session"}</p>
        </div>
      </div>
    </div>
  );
}
