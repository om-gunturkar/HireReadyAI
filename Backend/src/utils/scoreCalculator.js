export const calculateFinalScore = ({
  // Resume inputs
  keywordMatch = 0.7,
  usability = 0.8,
  grammarResume = 0.75,

  // Technical inputs
  questionWeights = [], // [q1, q2, ...]
  answerScores = [], // [a1, a2, ...]

  // Communication inputs
  fluency = 0.6,
  asrAccuracy = 0.7,
  grammarComm = 0.65,

  // Confidence inputs
  prosody = 0.5,
  emotion = 0.6,
}) => {
  /* -----------------------------
     1. RESUME SCORE (R)
     R = β1K + β2U + β3G
  ----------------------------- */
  const beta1 = 0.4;
  const beta2 = 0.3;
  const beta3 = 0.3;

  const R = beta1 * keywordMatch + beta2 * usability + beta3 * grammarResume;

  /* -----------------------------
     2. TECHNICAL SCORE (T)
     T = (1/n) Σ (qi * ai)
  ----------------------------- */
  let T = 0;

  if (questionWeights.length && answerScores.length) {
    const n = questionWeights.length;

    const sum = questionWeights.reduce((acc, q, i) => {
      return acc + q * (answerScores[i] || 0);
    }, 0);

    T = sum / n;
  }

  /* -----------------------------
     3. COMMUNICATION SCORE (C)
     C = γ1Fl + γ2A + γ3G
  ----------------------------- */
  const gamma1 = 0.4;
  const gamma2 = 0.3;
  const gamma3 = 0.3;

  const C = gamma1 * fluency + gamma2 * asrAccuracy + gamma3 * grammarComm;

  /* -----------------------------
     4. CONFIDENCE SCORE (F)
     F = δ1P + δ2E
  ----------------------------- */
  const delta1 = 0.5;
  const delta2 = 0.5;

  const F = delta1 * prosody + delta2 * emotion;

  /* -----------------------------
     5. FINAL SCORE (Q)
  ----------------------------- */
  const wR = 0.2;
  const wT = 0.4;
  const wC = 0.25;
  const wF = 0.15;

  const Q = wR * R + wT * T + wC * C + wF * F;

  /* -----------------------------
     6. SCALE TO 100
  ----------------------------- */
  const totalScore = Math.round(Q * 100);

  return {
    totalScore,
    technicalScore: Math.round(T * 100),
    communicationScore: Math.round(C * 100),
    confidenceScore: Math.round(F * 100),
    resumeScore: Math.round(R * 100),
  };
};
