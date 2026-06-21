import React, { useEffect, useState } from "react";

/**
 * Professional top-fixed alert bar following AI interview platform standards.
 * Shows only one alert at a time with smooth slide animations.
 *
 * Props:
 *   alert: { id, type, message } | null
 *   onDismiss: (id) => void
 */
export default function TopAlertBar({ alert, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (alert) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [alert]);

  if (!alert) return null;

  const { message, id, type } = alert;
  const isError = type === "error";
  const palette = isError
    ? { background: "#fff1f2", border: "#fecdd3", accent: "#e11d48", text: "#881337" }
    : { background: "#fffbeb", border: "#fde68a", accent: "#d97706", text: "#78350f" };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss && onDismiss(id), 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "16px",
        width: "min(420px, calc(100vw - 32px))",
        zIndex: 9999,
        transform: visible ? "translateX(0)" : "translateX(-120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s ease, opacity 0.3s ease",
      }}
    >
      <div
        style={{
          backgroundColor: palette.background,
          color: palette.text,
          border: `1px solid ${palette.border}`,
          borderLeft: `5px solid ${palette.accent}`,
          borderRadius: "16px",
          minHeight: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "12px 14px",
          boxShadow: "0 16px 36px rgba(15, 23, 42, 0.16)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <span style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>
            {message}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: "none",
            border: "none",
            color: palette.text,
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
