import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../firebase-config";
import { ref, uploadBytes } from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import LoopIcon from "@mui/icons-material/Loop";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

import "./TakePicture.css";

export default function TakePicture() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [cameraActive, setCameraActive] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment");

  useEffect(() => {
    const constraints = { video: { facingMode: cameraFacingMode } };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((error) => {
        console.error("Error accessing media devices: ", error);
      });

    return () => {
      // Cleanup: Stop the video stream when component unmounts
      if (videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();

        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
  }, [cameraFacingMode]);

  const handleEventClickNavigate = () => {
    navigate(`/event/${eventId}`);
  };

  const handleSnapshot = async () => {
    setCameraActive(false);

    const uid = uuidv4();
    const folderPath = `events/${eventId}/${uid}`;
    const imgRef = ref(storage, folderPath);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    // Draw the current frame from the video element onto the canvas
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert the canvas content to a data URL representing the image
    const dataUrl = canvas.toDataURL("image/jpeg");

    // Upload the image data to Firebase Storage
    await uploadBytes(imgRef, dataUrl);

    // Reset camera active state
    setCameraActive(true);
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const toggleCameraFacingMode = () => {
    setCameraFacingMode(cameraFacingMode === "environment" ? "user" : "environment");
  };

  return (
    <div>
      <div className="HeadEvent">
        <div className="icon">
          <ArrowBackIosIcon onClick={handleEventClickNavigate} />
          <div>
            {flashOn ? (
              <FlashOnIcon onClick={toggleFlash} />
            ) : (
              <FlashOffIcon onClick={toggleFlash} />
            )}
            <LoopIcon onClick={toggleCameraFacingMode} />
          </div>
        </div>
        <h2>v1</h2>
      </div>

      {cameraActive && (
        <button className="AddEventButton" onClick={handleSnapshot}>
          <CameraAltIcon />
        </button>
      )}

      <div className="Camera">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform: `scaleX(${cameraFacingMode === 'user' ? -1 : 1})` }}
        />
      </div>
    </div>
  );
}
