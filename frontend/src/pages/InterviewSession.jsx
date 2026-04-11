import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import CameraFeed from "../components/CameraFeed";
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
  const faceViolationRef = useRef(0);
  const multipleViolationRef = useRef(0);
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
                const now = Date.now();
                // ===== FACE NOT DETECTED (5s TERMINATION) =====
                if (!metrics || !metrics.faceDetected) {

                  if (!alertStateRef.current.faceNotDetectedStart) {
                    alertStateRef.current.faceNotDetectedStart = now;
                  } else if (now - alertStateRef.current.faceNotDetectedStart > 5000) {

                    setTopAlert({
                      id: "no-face-terminate",
                      type: "error",
                      message: "❌ Interview terminated: Face not visible for 5 seconds.",
                    });

                    setTimeout(() => {
                      stopInterview();
                    }, 1500);
                  }

                } else {
                  // ✅ reset when face comes back
                  alertStateRef.current.faceNotDetectedStart = null;
                }
                if (metrics) {
                  // ===== CAMERA OFF DETECTION =====
                  if (!videoRef.current?.srcObject) {
                    if (!alertStateRef.current.cameraOffStart) {
                      alertStateRef.current.cameraOffStart = now;
                    } else if (now - alertStateRef.current.cameraOffStart > 5000) {
                      setTopAlert({
                        id: "camera-off",
                        type: "error",
                        message: "❌ Interview terminated: Camera turned off for too long.",
                      });

                      setTimeout(() => {
                        stopInterview();
                      }, 1500);
                    }
                  } else {
                    // reset if camera comes back
                    alertStateRef.current.cameraOffStart = null;
                  }

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
                          alertStateRef.current.faceNotDetected = true;

                          faceViolationRef.current += 1;

                          const alertObj = {
                            id: "no-face",
                            type: "warning",
                            message: "Your face is not clearly visible. Please adjust your position.",
                          };

                          if (shouldShow(alertObj)) {
                            setTopAlert(alertObj);
                          }

                          // 🔥 TERMINATE AFTER 3 TIMES
                          if (faceViolationRef.current >= 3) {
                            setTopAlert({
                              id: "terminated",
                              type: "error",
                              message: "❌ Interview terminated: Face not detected multiple times.",
                            });

                            setTimeout(() => {
                              stopInterview();
                            }, 1500);
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
                      alertStateRef.current.multiplePersons = true;

                      multipleViolationRef.current += 1;

                      const alertObj = {
                        id: "multiple-face",
                        type: "warning",
                        message: "Multiple people detected. Please ensure you are alone.",
                      };

                      if (shouldShow(alertObj)) {
                        setTopAlert(alertObj);
                      }

                      // 🔥 TERMINATE AFTER 3 TIMES
                      if (multipleViolationRef.current >= 3) {
                        setTopAlert({
                          id: "terminated",
                          type: "error",
                          message: "❌ Interview terminated: Multiple people detected.",
                        });

                        setTimeout(() => {
                          stopInterview();
                        }, 1500);
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
          message: "Focus lost. Please return to the interview.",
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

    // ✅ 1. CAMERA CHECK (your original)
    if (!videoRef.current || !videoRef.current.srcObject) {
      setTopAlert({
        id: "camera-required",
        type: "error",
        message: "❌ Camera is required to start the interview.",
      });
      return;
    }

    // ✅ 2. WAIT FOR CAMERA READY (NEW - important)
    if (videoRef.current.readyState !== 4) {
      setTopAlert({
        id: "camera-loading",
        type: "warning",
        message: "⏳ Camera is still loading. Please wait...",
      });
      return;
    }

    // ✅ 3. FACE DETECTION (YOUR REQUIREMENT 🔥)
    const metrics = await analyzeFace(videoRef.current);

    if (!metrics || !metrics.faceDetected) {
      setTopAlert({
        id: "face-required",
        type: "error",
        message: "❌ Face not detected. Please sit properly in front of camera.",
      });
      return;
    }

    // ✅ 4. MULTIPLE PERSON CHECK (BONUS 🔥)
    if (metrics.multiplePersons) {
      setTopAlert({
        id: "multiple-person",
        type: "error",
        message: "❌ Multiple people detected. Only one person allowed.",
      });
      return;
    }

    // ✅ 5. YOUR ORIGINAL CODE CONTINUES (UNCHANGED)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />

          <div className="relative w-full max-w-md rounded-[1.75rem] border border-white/60 bg-white/95 p-8 text-center shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl animate-fadeIn sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">Session complete</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              Thank you — your responses are saved
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Building your score breakdown and behavioral summary. You will be redirected to the report view.
            </p>

            <div className="mt-8 flex justify-center">
              <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
                  <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#0f766e"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={(2 * Math.PI * 50 * (5 - completionTime)) / 5}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-teal-800">
                  {completionTime}s
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-500">Redirecting to score analysis…</p>
          </div>
        </div>
      )}

      {/* ✅ MAIN PAGE */}
      <div className="app-shell min-h-screen">
        <AIMonitoringStatus />
        <TopAlertBar alert={topAlert} onDismiss={dismissTopAlert} />

        <div className="page-frame flex justify-center py-4 sm:py-6">
          <div className="glass-card w-full min-h-[min(90vh,100dvh)] rounded-[1.5rem] border border-white/60 p-4 sm:rounded-[2rem] sm:p-6 lg:p-8 xl:p-10">

            <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Live mock interview</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Hire Ready AI — session room</h2>
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">Mode:</span> {mode || "—"} · <span className="font-medium text-slate-800">Focus:</span> {value || "—"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Camera + face mesh</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">Speech capture</span>
              </div>
            </div>

            <div className="interview-live-grid mt-6 lg:mt-8">
              <div className="order-2 flex flex-col gap-5 lg:order-1">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI interviewer</p>
                  <div className="flex min-h-[200px] items-center justify-center rounded-[1.5rem] border border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-sky-50 shadow-inner sm:min-h-[240px] lg:min-h-[280px]">
                    {robotAnimation && (
                      <div className="flex max-h-[200px] w-full max-w-[260px] justify-center sm:max-h-[240px] sm:max-w-[280px] lg:max-h-[260px]">
                        <Lottie
                          animationData={robotAnimation}
                          loop={activeSpeaker === "system"}
                          autoplay={activeSpeaker === "system"}
                          style={{ width: "100%", height: "100%", maxHeight: 260 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Camera preview</p>
                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.25)] ring-1 ring-slate-200/50">
                    <div className="relative aspect-[4/3] w-full max-h-[min(50vh,420px)] min-h-[200px]">
                      <CameraFeed videoRef={videoRef} />
                      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 flex min-h-0 flex-col rounded-[1.5rem] border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/90 p-5 shadow-inner sm:p-6 lg:p-8 lg:order-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <span
                    className={`text-2xl font-bold tabular-nums transition-colors duration-300 sm:text-3xl ${timeLeft <= 10 && timeLeft > 0 ? "text-red-600" : ""
                      } ${timeLeft <= 0 ? "text-emerald-600" : ""} ${timeLeft > 10 ? "text-teal-800" : ""}`}
                  >
                    {timeLeft > 0
                      ? `0:${timeLeft.toString().padStart(2, "0")}`
                      : `+${Math.abs(timeLeft).toString().padStart(2, "0")}`}
                    <span className="ml-2 text-sm font-semibold uppercase tracking-wider text-slate-500">timer</span>
                  </span>
                  <CandidateIdentityCard
                    title="Verified candidate"
                    subtitle="Login face scan"
                    image={userFaceSnapshot}
                    topic={value}
                  />
                </div>

                <p className="mt-5 text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl lg:text-2xl lg:leading-snug">
                  {question}
                </p>

                {phase === "level" && (
                  <div className="mt-8">
                    <p className="mb-3 text-sm font-medium text-slate-600">Select difficulty for this run</p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => chooseLevel("Easy")}
                        className="rounded-full bg-emerald-100 px-5 py-2.5 text-sm font-semibold text-emerald-900 ring-1 ring-emerald-200/80 transition hover:bg-emerald-200/80"
                      >
                        Easy
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseLevel("Moderate")}
                        className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-amber-900 ring-1 ring-amber-200/80 transition hover:bg-amber-200/80"
                      >
                        Moderate
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseLevel("Hard")}
                        className="rounded-full bg-rose-100 px-5 py-2.5 text-sm font-semibold text-rose-900 ring-1 ring-rose-200/80 transition hover:bg-rose-200/80"
                      >
                        Hard
                      </button>
                    </div>
                  </div>
                )}

                {phase === "interview" && (
                  <div className="mt-6 flex flex-1 flex-col">
                    <label className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Your answer (live transcript)</label>
                    <textarea
                      rows={6}
                      className="field min-h-[140px] resize-y border-slate-200/90 text-slate-800 sm:min-h-[180px]"
                      value={finalTranscript + interimTranscript}
                      onChange={(e) => setFinalTranscript(e.target.value)}
                    />

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={stopInterview}
                        className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                      >
                        Stop interview
                      </button>
                      <div className="flex flex-1 flex-wrap items-center justify-end gap-3 sm:justify-end">
                        <span className="text-sm font-semibold text-teal-800">
                          Question {Math.min(count, MAX_QUESTIONS)} / {MAX_QUESTIONS}
                        </span>
                        <button
                          type="button"
                          onClick={count >= MAX_QUESTIONS ? stopInterview : endAndProceed}
                          className="primary-btn px-6 py-3 text-sm"
                        >
                          {count >= MAX_QUESTIONS ? "Submit" : "Next question"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showWarning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
                <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white/95 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
                  <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Navigation locked</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">You cannot use the back button during an active interview. Continue in this tab.</p>
                  <button
                    type="button"
                    onClick={() => setShowWarning(false)}
                    className="primary-btn mt-6 w-full px-6 py-2.5 text-sm sm:w-auto"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function CandidateIdentityCard({ title, subtitle, image, topic }) {
  return (
    <div className="w-full max-w-[280px] rounded-[1.35rem] border border-slate-200 bg-white/90 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:max-w-[260px]">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{title}</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-16 sm:w-16">
          {image ? (
            <img src={image} alt="Verified candidate" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-1 text-center text-[9px] font-semibold leading-tight text-slate-500">No scan</div>
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
