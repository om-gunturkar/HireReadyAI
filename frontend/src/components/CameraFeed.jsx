import { useEffect, useState } from "react";
import placeholderImg from "../assets/hr-ai-camera-placeholder.svg";

/**
 * Webcam for face enrollment / login. Fills parent (use aspect-[4/3] on parent).
 * Gradient + SVG show until video frames are visible (no black letterbox bar).
 */
export default function CameraFeed({ videoRef }) {
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    if (!videoRef?.current) return;
    const el = videoRef.current;
    const onReady = () => setVideoVisible(true);
    el.addEventListener("loadeddata", onReady);
    el.addEventListener("playing", onReady);
    if (el.readyState >= 2) setVideoVisible(true);
    return () => {
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("playing", onReady);
    };
  }, [videoRef]);

  useEffect(() => {
    if (!videoRef?.current) return;

    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setVideoVisible(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  return (
    <div className="relative h-full w-full min-h-0 overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-teal-950">
      <img
        src={placeholderImg}
        alt=""
        className={`absolute inset-0 z-0 h-full w-full object-cover object-center transition-opacity duration-300 ${
          videoVisible ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        draggable={false}
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`absolute inset-0 z-10 h-full w-full object-cover object-center scale-x-[-1] transition-opacity duration-300 ${
          videoVisible ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
