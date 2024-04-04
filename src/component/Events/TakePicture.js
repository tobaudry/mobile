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
import Webcam from "react-webcam";

import "./TakePicture.css";

export default function TakePicture() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [cameraActive, setCameraActive] = useState(true);
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [showModal, setShowModal] = useState(false);
  const webcamRef = useRef(null);

  const handleEventClickNavigate = () => {
    navigate(`/event/${eventId}`);
  };

  const handleSnapshot = async () => {
    setCameraActive(false);
    if (facingMode === "user" && flash) {
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

    let imageSrc = await webcamRef.current.getScreenshot();
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (facingMode === "user") {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.translate(img.width, 0);
      ctx.scale(-1, 1); // Inverser horizontalement
      ctx.drawImage(img, 0, 0);
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    }

    canvas.toBlob(async (canvasBlob) => {
      const createdAt = new Date().toISOString();

      const metadata = {
        contentType: "image/jpeg",
        customMetadata: {
          createdAt: createdAt,
        },
      };

      await uploadBytes(imgRef, canvasBlob, metadata);

      setCameraActive(true);
    }, "image/jpeg");
  };

  const handleToggleFlash = () => {
    setFlash((prevFlash) => !prevFlash);
  };

  const handleToggleCamera = () => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  useEffect(() => {
    if (!flash && showModal) {
      setShowModal(false);
    }
  }, [flash, showModal]);

  return (
    <div style={{ position: "fixed", width: "100%" }}>
      <div className="HeadEvent">
        <div className="icon">
          <ArrowBackIosIcon onClick={handleEventClickNavigate} />
          <div>
            {flash ? (
              <FlashOnIcon onClick={handleToggleFlash} />
            ) : (
              <FlashOffIcon onClick={handleToggleFlash} />
            )}
            <LoopIcon onClick={handleToggleCamera} />
          </div>
        </div>
        <h2>Take A picture</h2>
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
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />
      </div>
    </div>
  );
}
