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

  const { message, id } = alert;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss && onDismiss(id), 300);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 9999,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.3s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff4e5",
          color: "#663c00",
          borderBottom: "1px solid #ffe0b2",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
            color: "#663c00",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "underline",
            padding: "4px 8px",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
