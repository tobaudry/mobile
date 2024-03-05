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
  const navigation = useNavigate();
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
    console.log();
    try {
      const recaptcha = new RecaptchaVerifier(auth, "recaptcha", {
        size: "invisible",
      });
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptcha);
      setConfirmationResult(confirmation);
      setShowVerificationPopup(true);
    } catch (err) {
      console.error(err);
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
      console.log(newCode);
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = async (code) => {
    try {
      await confirmationResult.confirm(code);
      navigation("/setusername", {
        state: { phoneNumber: phone },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const inputRefs = useRef([]);
  useEffect(() => {
    inputRefs.current = inputRefs.current
      .slice(0, 6)
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, []);

  return (
    <div>
      <div>
        <div className="popupPhone">
          <div className="left">
            <div className="InputTextUsername">
              <PhoneInput
                country={"fr"}
                value={phone}
                onChange={(phone) => setPhone("+" + phone)}
                inputStyle={{ backgroundColor: "transparent" }}
              />
            </div>
            <div className="InvitUsers">
              <button onClick={sendCode}>Envoyer le code</button>
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
                    />
                  ))}
                </div>
              </div>
            
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhoneSignIn;
