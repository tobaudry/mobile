import React, { useState, useRef, useEffect } from "react";
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
  const [showModal, setShowModal] = useState(false); // State for modal
  const webcamRef = useRef(null);

  const handleEventClickNavigate = () => {
    navigate(`/event/${eventId}`);
  };

  const handleSnapshot = async () => {
    setCameraActive(false);
    if (facingMode === 'user' && flash) {
      setShowModal(true); 
      setTimeout(() => {
        setShowModal(false);
        captureImage();
      }, 500);
    } else {
      captureImage();
    }
  };

  const captureImage = async () => {
    const uid = uuidv4();
    const folderPath = `events/${eventId}/${uid}`;
    const imgRef = ref(storage, `${folderPath}.jpeg`);
  
    let imageSrc = webcamRef.current.getScreenshot();
  
    // Convertir l'URL de données en un fichier JPEG
    const response = await fetch(imageSrc);
    const blob = await response.blob();
  
    // Ajouter la date de création actuelle à chaque photo
    const createdAt = new Date().toISOString();
  
    // Si facingMode est 'user', inverser l'image horizontalement
    if (facingMode === 'user') {
      // ...
    } else {
      // Ajouter la date de création à la métadonnée de l'image
      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          createdAt: createdAt
        }
      };
  
      // Upload the image blob to Firebase Storage with metadata
      await uploadBytes(imgRef, blob, metadata);
      setCameraActive(true);
    }
  };
  

  const handleToggleFlash = () => {
    setFlash(prevFlash => !prevFlash);
  };

  const handleToggleCamera = () => {
    setFacingMode(prevMode => (prevMode === 'user' ? 'environment' : 'user'));
  };

  useEffect(() => {
    if (!flash && showModal) {
      setShowModal(false);
    }
  }, [flash, showModal]);

  return (
    <div style={{position:"fixed", width:"100%"}}>
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-body">
              <div className="white-screen"></div>
            </div>
          </div>
        </div>
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
