import { useEffect } from "react";

export default function CameraFeed({ videoRef }) {
    useEffect(() => {
        if (!videoRef?.current) return;

        let stream;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    console.log("✅ Camera feed started");
                }
            } catch (err) {
                console.error("❌ Camera error:", err);
            }
        };

        startCamera();

        // Cleanup when component unmounts
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoRef]);

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
        />
    );
}
