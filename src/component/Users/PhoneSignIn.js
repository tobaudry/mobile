import React, { useState, useEffect, useRef } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import "./Compte.css";

function PhoneSignIn() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false); // Pour l'envoi du code
  const [verifying, setVerifying] = useState(false); // Pour la vérification du code
  const navigation = useNavigate();
  const inputRefs = useRef([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation("/compte");
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/enterprise.js?render=YOUR_RECAPTCHA_KEY";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const sendCode = async () => {
    setLoading(true); // Activer le chargement
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible",
      });
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha);
      setConfirmationResult(confirmation);
      setShowVerificationPopup(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // Désactiver le chargement
    }
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (index === 5 && value !== "") {
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = async (code) => {
    setVerifying(true); // Activer le chargement de vérification
    try {
      await confirmationResult.confirm(code);
      navigation("/setusername", {
        state: { phoneNumber: phone },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false); // Désactiver le chargement de vérification
    }
  };

  useEffect(() => {
    inputRefs.current = inputRefs.current
      .slice(0, 6)
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, []);

  return (
    <div style={{ position: "fixed" }}>
      <div>
        <div className="popupPhone">
          <div className="left">
            <div className="InputTextUsername">
              <PhoneInput
                country={"fr"}
                value={phone}
                onChange={(phone) => setPhone("+" + phone)}
                inputStyle={{ backgroundColor: "transparent" }}
                style={{ touchAction: "manipulation" }}
              />
            </div>
            <div className="InvitUsers">
              <button onClick={sendCode} disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le code'}
              </button>
            </div>
          </div>
        </div>

        <div id="recaptcha"></div>

        {showVerificationPopup && (
          <div className="popupPhone">
            <div className="DataUser">
              <div
                className="description"
                style={{ padding: "0px 0px 20px 0px" }}
              >
                <p>Entrez le code</p>
              </div>
              <div className="left">
                <div className="InputCode">
                  {verificationCode.map((value, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={value}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      style={{ touchAction: "manipulation" }} // Ajout de la propriété CSS
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {verifying && <div>Chargement en cours...</div>} {/* Loader de vérification */}
      </div>
    </div>
  );
}

export default PhoneSignIn;
