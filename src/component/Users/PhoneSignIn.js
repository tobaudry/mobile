import React, { useState, useEffect, useRef } from "react";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import "./Compte.css";
import BackspaceIcon from "@mui/icons-material/Backspace";

function PhoneSignIn() {
  const [phone, setPhone] = useState("+33");
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
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showCustomKeyboard] = useState(true);
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

  const sendCode = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    console.log("handle", verificationCode);
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    if (index === 5 && value !== "") {
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = async (code) => {
    setVerifying(true);
    try {
      await confirmationResult.confirm(code);
      navigation("/setusername", {
        state: { phoneNumber: phone },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    inputRefs.current = inputRefs.current
      .slice(0, 6)
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, []);

  const addDigitToCode = (digit) => {
    if (phone.length < 13) {
      setPhone(phone + digit);
    }
  };
  const addPlusToCode = () => {
    if (!phone.startsWith("+")) {
      setPhone("+33" + phone);
    }
  };

  const handleBackspace = () => {
    if (phone.length > 0) {
      const newPhone = phone.slice(0, -1);
      setPhone(newPhone);
    }
  };

  const handleCountryChange = (countryCode) => {
    setPhone("+" + countryCode);
  };

  const addDigitToVerifyCode = (digit) => {
    const updatedCode = [...verificationCode];
    const emptyIndex = updatedCode.findIndex((value) => value === "");
    if (emptyIndex !== -1) {
      updatedCode[emptyIndex] = digit.toString();
      setVerificationCode(updatedCode);
      if (emptyIndex < 5) {
        inputRefs.current[emptyIndex + 1].focus();
      } else {
        // Vérifier si tous les chiffres sont entrés
        if (updatedCode.every((value) => value !== "")) {
          verifyCode(updatedCode.join(""));
        }
      }
    }
  };

  const handleBackspaceVerifyCode = () => {
    const lastFilledIndex = verificationCode.findIndex((value, index) => {
      return index < 5 && verificationCode[index + 1] === "";
    });
    if (lastFilledIndex !== -1) {
      const updatedCode = [...verificationCode];
      updatedCode[lastFilledIndex] = "";
      setVerificationCode(updatedCode);
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  return (
    <div style={{ position: "fixed" }}>
      <div>
        <div className="popupPhone">
          <div className="left">
            <div className="InputTextUsername">
              <PhoneInput
                country={"fr"}
                value={phone}
                inputStyle={{ backgroundColor: "transparent" }}
                style={{ touchAction: "manipulation" }}
                readOnly // Utilisation de l'attribut readOnly pour empêcher l'utilisateur d'entrer du texte
                onFocus={(e) => e.target.blur()} // Empêche le focus
                onChange={(value, country) => {
                  handleCountryChange(country.dialCode);
                }}
              />
            </div>
            <div className="InvitUsers">
              <button onClick={sendCode} disabled={loading}>
                {loading ? "Envoi en cours..." : "Envoyer le code"}
              </button>
            </div>
          </div>
        </div>
        <div className="custom-keyboard-div">
          {showCustomKeyboard && (
            <div className="custom-keyboard">
              {[...Array(9)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => addDigitToCode(index + 1)}>
                  {index + 1}
                </button>
              ))}
              <button onClick={addPlusToCode}>+</button>
              <button key={0} onClick={() => addDigitToCode(0)}>
                0
              </button>
              <button onClick={handleBackspace}>
                <BackspaceIcon />
              </button>
            </div>
          )}
        </div>
      </div>
      <div id="recaptcha"></div>
      {showVerificationPopup && (
        <div>
          <div className="popupPhone">
            <div className="DataUser">
              <div
                className="description"
                style={{ padding: "0px 0px 20px 0px" }}>
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
                      onFocus={(e) => e.target.blur()} // Empêche le focus
                      style={{
                        touchAction: "manipulation",
                        userSelect: "none",
                      }}
                      inputMode="numeric"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="custom-keyboard-div">
            {showCustomKeyboard && (
              <div className="custom-keyboard">
                {[...Array(9)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => addDigitToVerifyCode(index + 1)}>
                    {index + 1}
                  </button>
                ))}
                <button></button>
                <button key={0} onClick={() => addDigitToVerifyCode(0)}>
                  0
                </button>
                <button onClick={handleBackspaceVerifyCode}>
                  <BackspaceIcon />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {verifying && <div>Chargement en cours...</div>}
    </div>
  );
}

export default PhoneSignIn;
