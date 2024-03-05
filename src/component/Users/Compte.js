import React, { useState, useEffect } from "react";
import {  database } from "../../firebase-config";
import useAuthState from "../Fonctions/UseAuthState";
import useUserData from "../Fonctions/UserData";
import HeaderPics from "../Elements/HeaderPics";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import PersonIcon from "@mui/icons-material/Person";
import {
  update,
  ref,
  get,
  child,
  
} from "firebase/database";

import "./Compte.css";

function Compte() {
  const user = useAuthState();
  const uid = user ? user.uid : null;
  const userData = useUserData(uid);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    if (newUsername.trim() === "") {
      setError("");
      setIsButtonDisabled(true);
    } else {
      setError(null);
      setIsButtonDisabled(false);
    }
  }, [newUsername]);

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value.trim());
  };

  const handleUpdateUsername = () => {
    const UsersRef = ref(database, "users");
    let isUsernameAvailable = true;
    if (newUsername.trim() === "") {
      setError("Le nom d'utilisateur ne peut pas être vide");
      alert("Le nom d'utilisateur ne peut pas être vide");
      return;
    }
    get(UsersRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((userSnapshot) => {
            const userData = userSnapshot.val();
            if (userData.username === newUsername) {
              setError("Ce nom d'utilisateur est déjà pris.");
              isUsernameAvailable = false;
              return; // Sortir de la boucle forEach si l'utilisateur est trouvé
            }
          });

          if (isUsernameAvailable) {
            const userRef = child(UsersRef, uid);
            update(userRef, {
              username: newUsername,
            })
              .then(() => {
                alert("Votre nom d'utilisateur a été mis à jour avec succès.");
                console.log("Nom d'utilisateur mis à jour avec succès !");
              })
              .catch((error) => {
                console.error(
                  "Erreur lors de la mise à jour du nom d'utilisateur : ",
                  error
                );
              });
          }
        }
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la vérification du nom d'utilisateur :",
          error
        );
      });
  };

  return (
    <div className="App">
      <HeaderPics text="Ton compte" />

      <div className="description">
        {user && userData ? (
          <p>Bonjour {userData.username}, voici tes informations</p>
        ) : (
          <p>Aucun utilisateur connecté</p>
        )}
      </div>
      <div className="data">
        {userData ? (
          <div className="DataUser">
            {userData.phone ? (
              <>
                <div className="left">
                  <PhoneIphoneIcon />
                  <p style={{ paddingLeft: "20px" }}>{userData.phone}</p>
                </div>
              </>
            ) : (
              <p>Vous n'avez pas renseigné de numéro de téléphone</p>
            )}
            {userData.username ? (
              <>
                <div>
                  <p
                    style={{
                      margin: "0",
                      color: "rgba(255, 255, 255, 0.30)",
                      fontSize: "12px",
                      fontStyle: "normal",
                      fontWeight: "600",
                      lineHeight: "normal",
                    }}
                  >
                    Ici, tu peux modifier ton nom d'utilisateur
                  </p>
                </div>
                <div className="left">
                  <PersonIcon />
                  <div className="InputTextUsername">
                    <input
                      type="text"
                      placeholder={userData.username}
                      value={newUsername}
                      onChange={handleUsernameChange}
                    />
                  </div>
                  <div className="InvitUsers">
                    <button
                      onClick={handleUpdateUsername}
                      disabled={isButtonDisabled}
                    >
                      changer
                    </button>
                  </div>
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
              </>
            ) : (
              <p>Vous n'avez pas renseigné de numéro de téléphone</p>
            )}
          </div>
        ) : (
          <p>Chargement des données...</p>
        )}
      </div>
    </div>
  );
}

export default Compte;
