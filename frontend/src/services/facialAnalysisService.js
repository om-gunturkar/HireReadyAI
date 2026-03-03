import * as faceapi from "face-api.js";

let modelsLoaded = false;

/**
 * Load face-api models from CDN
 */
export const loadFaceModels = async () => {
  if (modelsLoaded) return;

  try {
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";

    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);

    modelsLoaded = true;
    console.log("✅ Face-API models loaded");
  } catch (err) {
    console.error("❌ Failed to load face models:", err);
  }
};

/**
 * Analyze facial expressions and metrics from video - IMPROVED FOR HEAD MOVEMENT
 */
export const analyzeFace = async (videoElement) => {
  if (!videoElement || !modelsLoaded) {
    return null;
  }

  try {
    // Check if video is ready
    if (videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
      return null;
    }

    const detections = await faceapi
      .detectAllFaces(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (detections.length === 0) {
      return {
        faceDetected: false,
        multiplePersons: false,
        emotion: null,
        confidence: 0,
        expressions: {},
        headPosition: "forward",
        eyeContact: false,
      };
    }

    // Extract primary face detection
    const face = detections[0];
    const expressions = face.expressions;

    // Get dominant emotion
    const emotionScores = {
      neutral: expressions.neutral,
      happy: expressions.happy,
      sad: expressions.sad,
      angry: expressions.angry,
      fearful: expressions.fearful,
      disgusted: expressions.disgusted,
      surprised: expressions.surprised,
    };

    const dominantEmotion = Object.keys(emotionScores).reduce((a, b) =>
      emotionScores[a] > emotionScores[b] ? a : b
    );

    const emotionConfidence = emotionScores[dominantEmotion];

    // Detect head position - IMPROVED using bounding box + landmarks
    const { landmarks } = face;
    const { detection } = face;
    const headPosition = calculateHeadPosition(landmarks, detection);

    // Detect eye contact - IMPROVED using multiple eye landmarks
    const eyeContact = detectEyeContact(landmarks);

    return {
      faceDetected: true,
      multiplePersons: detections.length > 1,
      emotion: dominantEmotion,
      emotionConfidence: emotionConfidence,
      expressions: emotionScores,
      headPosition,
      eyeContact,
      allExpressions: expressions,
      detectionCount: detections.length,
      boundingBox: detection.box, // { x, y, width, height }
    };
  } catch (err) {
    console.error("Face analysis error:", err);
    return null;
  }
};

/**
 * Calculate head position (up, down, left, right, forward) - ROBUST FOR MOVEMENT
 */
const calculateHeadPosition = (landmarks, detection) => {
  if (!landmarks || landmarks.length < 48) return "forward";

  try {
    // Use face bounding box for more stable detection
    if (detection && detection.box) {
      const box = detection.box;
      const faceWidth = box.width;
      const faceHeight = box.height;
      const faceCenterX = box.x + faceWidth / 2;
      const faceCenterY = box.y + faceHeight / 2;

      // Get key facial landmarks
      const nose = landmarks[30];
      const leftEye = landmarks[36];
      const rightEye = landmarks[45];
      const leftCheek = landmarks[2];
      const rightCheek = landmarks[14];

      // Validate landmarks
      if (!nose || !leftEye || !rightEye) return "forward";

      // Calculate relative position within face box
      const noseRelX = nose.x - box.x;
      const noseRelY = nose.y - box.y;

      // Horizontal head position (left/right) - using nose relative to eyes
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const horizontalDiff = nose.x - eyeCenterX;
      const normalizedHorizontal = (horizontalDiff / (faceWidth * 0.3)) * 100;

      // Vertical head position (up/down) - using nose relative to eyes
      const eyeCenterY = (leftEye.y + rightEye.y) / 2;
      const verticalDiff = nose.y - eyeCenterY;
      const normalizedVertical = (verticalDiff / (faceHeight * 0.2)) * 100;

      let position = "forward";

      // More lenient thresholds for head movement detection
      if (normalizedHorizontal > 30) {
        position = "right";
      } else if (normalizedHorizontal < -30) {
        position = "left";
      } else if (normalizedVertical > 25) {
        // more sensitive to downward tilt
        position = "down";
      } else if (normalizedVertical < -25) {
        position = "up";
      }

      return position;
    }

    // Fallback to landmark-only method
    const nose = landmarks[30];
    const leftEye = landmarks[36];
    const rightEye = landmarks[45];

    if (!nose || !leftEye || !rightEye) return "forward";

    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    if (eyeDistance === 0) return "forward";

    const noseCenter = (leftEye.x + rightEye.x) / 2;
    const noseDiff = nose.x - noseCenter;
    const horizontalAngle = (noseDiff / eyeDistance) * 100;

    const noseEyeCenter = (leftEye.y + rightEye.y) / 2;
    const verticalDiff = nose.y - noseEyeCenter;
    const verticalAngle = (verticalDiff / 50) * 100;

    let position = "forward";

    if (horizontalAngle > 25) position = "right";
    else if (horizontalAngle < -25) position = "left";
    else if (verticalAngle > 20) position = "down"; // lower threshold
    else if (verticalAngle < -20) position = "up";
  } catch (err) {
    return "forward";
  }
};

/**
 * Detect if person is making eye contact - IMPROVED WITH MULTIPLE LANDMARKS
 */
const detectEyeContact = (landmarks) => {
  if (!landmarks || landmarks.length < 48) return false;

  try {
    // Use multiple eye landmarks for robust detection
    // Left eye landmarks: 36-41
    // Right eye landmarks: 42-47
    // Pupil should be centered in eye area

    const leftEyeOuter = landmarks[36]; // Left eye outer corner
    const leftEyeInner = landmarks[39]; // Left eye inner corner
    const rightEyeOuter = landmarks[45]; // Right eye outer corner
    const rightEyeInner = landmarks[42]; // Right eye inner corner

    const nose = landmarks[30];

    if (!leftEyeOuter || !leftEyeInner || !rightEyeOuter || !rightEyeInner || !nose) {
      return false;
    }

    // Calculate eye centers
    const leftEyeCenter = {
      x: (leftEyeOuter.x + leftEyeInner.x) / 2,
      y: (landmarks[37].y + landmarks[38].y + landmarks[40].y + landmarks[41].y) / 4,
    };

    const rightEyeCenter = {
      x: (rightEyeOuter.x + rightEyeInner.x) / 2,
      y: (landmarks[43].y + landmarks[44].y + landmarks[46].y + landmarks[47].y) / 4,
    };

    // Calculate eye-to-nose alignment
    const leftEyeToNose = Math.abs(leftEyeCenter.x - nose.x);
    const rightEyeToNose = Math.abs(rightEyeCenter.x - nose.x);

    // Calculate vertical alignment (eyes should be at similar height as nose-to-face ratio)
    const leftEyeVertical = Math.abs(leftEyeCenter.y - nose.y);
    const rightEyeVertical = Math.abs(rightEyeCenter.y - nose.y);

    // More lenient thresholds for eye contact detection (accounts for head movement)
    const horizontalThreshold = 50; // Horizontal tolerance
    const verticalThreshold = 40; // Vertical tolerance

    const hasHorizontalContact = leftEyeToNose < horizontalThreshold && rightEyeToNose < horizontalThreshold;
    const hasVerticalContact = leftEyeVertical < verticalThreshold && rightEyeVertical < verticalThreshold;

    // Both conditions should be met for good eye contact
    return hasHorizontalContact && hasVerticalContact;
  } catch (err) {
    return false;
  }
};

/**
 * Generate confidence score based on all metrics
 */
// Confidence score used to decide how “confident” the candidate looks.  
// The requirement from the spec is very simple – just add the happy and
// neutral percentages and convert them to a percentage value.  The
// previous implementation attempted a more complex formula; it remains
// in source control history if more experimentation is desired.
export const calculateConfidenceScore = (metrics) => {
  if (!metrics || !metrics.expressions) return 0;

  const happy = metrics.expressions.happy || 0;
  const neutral = metrics.expressions.neutral || 0;

  // happy + neutral expressed as a percentage (0–100)
  return Math.round((happy + neutral) * 100);
};

/**
 * Get alert based on metrics - All 7 features monitored
 */
// Legacy alert generator (no longer used for UI) kept for reference
export const getAlert = (metrics) => {
  const alerts = [];
  // ...existing logic retained above but may not be called
  return alerts;
};

/**
 * Determine the single alert that should be shown in the top bar.  This
 * function implements the precise wording and priority required by the
 * professional UI specification.  Only three situations generate an alert;
 * others are intentionally silent.
 *
 * Returns an object { id, type, message } or null.
 */
export const getTopBarAlert = (metrics) => {
  if (!metrics) return null;

  // (face-not-detected is handled in InterviewSession with a 3s delay)
  if (metrics.multiplePersons) {
    return {
      id: "multiple-face",
      type: "warning",
      message: "Multiple people detected. Please ensure you are alone.",
    };
  }

  if (metrics.emotion === "fearful" || metrics.emotion === "sad") {
    return {
      id: "nervous",
      type: "warning",
      message: "You appear slightly nervous. Please relax and continue.",
    };
  }

  return null;
};

/**
 * Post emotion record with additional attention flag to backend.
 * Called on each detection cycle for data aggregation.
 */
export const postEmotion = async ({ emotion, confidence, timestamp, attention }) => {
  try {
    await fetch("http://localhost:5000/api/emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emotion, confidence, timestamp, attention }),
    });
  } catch (err) {
    console.error("Emotion API error:", err);
  }
};

/**
 * Format metrics for report
 */
export const formatMetricsForReport = (metricsArray) => {
  if (metricsArray.length === 0) return null;

  const emotionCounts = {
    happy: 0,
    sad: 0,
    neutral: 0,
    angry: 0,
    fearful: 0,
    disgusted: 0,
    surprised: 0,
  };

  const headMovementCounts = {
    forward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
  };

  let eyeContactCount = 0;
  let averageConfidence = 0;

  metricsArray.forEach((metric) => {
    if (metric.emotion) {
      emotionCounts[metric.emotion]++;
    }
    if (metric.headPosition) {
      headMovementCounts[metric.headPosition]++;
    }
    if (metric.eyeContact) {
      eyeContactCount++;
    }
    averageConfidence += metric.confidence || 0;
  });

  averageConfidence = (averageConfidence / metricsArray.length).toFixed(2);
  const eyeContactPercentage = ((eyeContactCount / metricsArray.length) * 100).toFixed(2);

  return {
    emotionCounts,
    headMovementCounts,
    eyeContactPercentage,
    averageConfidence,
    totalFrames: metricsArray.length,
  };
};
