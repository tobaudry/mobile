// Importez useState en haut de votre fichier
import React, { useRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../firebase-config";
import { ref, uploadBytes } from "firebase/storage";
import { useParams } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import LoopIcon from "@mui/icons-material/Loop";

import "./TakePicture.css";

export default function TakePicture() {
  const videoRef = useRef(null);
  const { eventId } = useParams();
  const [cameraActive, setCameraActive] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState("environment"); // "user" for front camera, "environment" for back camera

  useEffect(() => {
    const videoRefCurrent = videoRef.current;
  
    const handleCapture = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacingMode // Utiliser la caméra avant ou arrière selon l'état de cameraFacingMode
          }
        });
        videoRefCurrent.srcObject = stream;
      } catch (error) {
        console.error("Erreur lors de l'accès à la caméra:", error);
      }
    };
  
    handleCapture();
  
    return () => {
      if (videoRefCurrent && videoRefCurrent.srcObject) {
        const tracks = videoRefCurrent.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraFacingMode]); // Assurez-vous de réagir aux changements de cameraFacingMode

  const handleSnapshot = async () => {
    setCameraActive(false);

    const uid = uuidv4();
    const folderPath = `events/${eventId}/${uid}`;
    const imgRef = ref(storage, folderPath);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    // Logique du flash
    if (flashOn) {
      // Activer le flash
      const popup = document.createElement("div");
      popup.style.position = "fixed";
      popup.style.top = 0;
      popup.style.left = 0;
      popup.style.width = "100%";
      popup.style.height = "100%";
      popup.style.background = "white";
      popup.style.zIndex = 9999;
      document.body.appendChild(popup);

      // Déclencher la prise de photo après la moitié du temps du flash
      setTimeout(() => {
        document.body.removeChild(popup);
        takePhoto();
      }, 500); // 250 ms pour prendre la photo au milieu du flash
    } else {
      // Si le flash est désactivé, prendre la photo directement
      takePhoto();
    }

    // Fonction pour prendre la photo
    function takePhoto() {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        await uploadBytes(imgRef, blob);
        setCameraActive(true); // Réactivez la caméra après la capture de la photo
      }, "image/jpeg");
    }
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const toggleCameraFacingMode = () => {
    // Basculez entre la caméra avant et arrière
    setCameraFacingMode(cameraFacingMode === "environment" ? "user" : "environment");
  };

  return (
    <div>
      <div className="HeadEvent">
        <div className="icon">
          <ArrowBackIosIcon onClick={() => setCameraActive(true)} />
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
          +
        </button>
      )}
      <div className="Camera">
        <video
          ref={videoRef}
          autoPlay
          style={{ width: "100%", transform: "scaleX(-1)" }}
        ></video>
      </div>
    </div>
  );
}
