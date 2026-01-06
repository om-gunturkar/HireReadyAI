import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function InterviewSession() {
  const { state } = useLocation();
  const { mode, value } = state || {};

  const [question, setQuestion] = useState("Waiting for question...");

  useEffect(() => {
    fetch("http://localhost:5000/api/interview/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        value,
        questionIndex: 0,
      }),
    })
      .then((res) => res.json())
      .then((data) => setQuestion(data.question))
      .catch(() => setQuestion("Could not connect to backend"));
  }, [mode, value]);

  return (
    <div style={{ padding: "40px", fontSize: "22px" }}>
      <h2>Interview Session</h2>
      <p><b>Mode:</b> {mode}</p>
      <p><b>Selected:</b> {value}</p>
      <p>{question}</p>
    </div>
  );
}
