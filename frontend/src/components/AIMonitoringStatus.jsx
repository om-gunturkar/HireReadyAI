import React from "react";

/**
 * AI Monitoring Status Indicator
 * Green dot with "AI Monitoring Active" text in top right corner
 */
export default function AIMonitoringStatus() {
  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#f1f5fe",
        paddingLeft: "12px",
        paddingRight: "12px",
        paddingTop: "6px",
        paddingBottom: "6px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 500,
        color: "#2e7d32",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: "#2e7d32",
          borderRadius: "50%",
          animation: "pulse 2s infinite",
        }}
      />
      <span>AI Monitoring Active</span>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
