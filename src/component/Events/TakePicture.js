import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { storage } from "../../firebase-config";
import { ref, uploadBytes } from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import FlashOffIcon from "@mui/icons-material/FlashOff";
import LoopIcon from "@mui/icons-material/Loop";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Webcam from 'react-webcam';

import "./TakePicture.css";

export default function TakePicture() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [cameraActive, setCameraActive] = useState(true);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const webcamRef = useRef(null); 

  const handleEventClickNavigate = () => {
    navigate(`/event/${eventId}`);
  };

  const handleSnapshot = async () => {
    setCameraActive(false);

    const uid = uuidv4();
    const folderPath = `events/${eventId}/${uid}`;
    const imgRef = ref(storage, `${folderPath}.jpeg`);

    const imageSrc = webcamRef.current.getScreenshot();

    // Convertir l'URL de données en un fichier JPEG
    const response = await fetch(imageSrc);
    const blob = await response.blob();

    // Upload the image blob to Firebase Storage
    await uploadBytes(imgRef, blob);

    // Réinitialiser l'état de la caméra
    setCameraActive(true);
  };

  const handleToggleFlash = () => {
    setFlash(prevFlash => !prevFlash);
  };

  const handleToggleCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  return (
    <div>
      <div className="HeadEvent">
        <div className="icon">
          <ArrowBackIosIcon onClick={handleEventClickNavigate} />
          <div>
            {flash ? (
              <FlashOnIcon onClick={handleToggleFlash} />
            ) : (
              <FlashOffIcon onClick={handleToggleFlash} />
            )}
            <LoopIcon onClick={handleToggleCamera}/>
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
        <Webcam
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: facingMode }}
          flash={flash}
          ref={webcamRef}
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
      </div>
    </div>
  );
}
