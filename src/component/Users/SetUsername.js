import React, { useEffect, useState } from "react";
import { database } from "../../firebase-config";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue,
  set,
} from "firebase/database";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthState from "../Fonctions/UseAuthState";

function SetUsername() {
  const user = useAuthState();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const phoneNumber = location?.state?.phoneNumber;
  const navigation = useNavigate();

  useEffect(() => {
    if (user) {
      const usersRef = ref(database, "users");
      const userQuery = query(
        usersRef,
        orderByChild("id_utilisateur"),
        equalTo(user.uid)
      );

      onValue(userQuery, (snapshot) => {
        if (snapshot.exists()) {
          // L'utilisateur est déjà enregistré dans la base de données, redirigez-le vers la page de compte associée
          navigation("/compte", {
            state: { id_utilisateur: user.uid },
          });
        }
      });
    }
  }, [user, navigation]);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const addUser = async () => {
    const userId = user.uid;
    const usersRef = ref(database, "users/" + userId);
    const friends = [];

    try {
      await set(usersRef, {
        id_utilisateur: userId,
        username,
        phone: phoneNumber,
        friends,
      });
      setUsername("");
      navigation("/compte", {
        state: { id_utilisateur: userId },
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur : ", error);
    }
  };

  return (
    <div className="SetUsername">
      <div className="HeadEvent">
        <h2>Vous y êtes presque</h2>
        {user ? <p></p> : <p>Aucun utilisateur connecté</p>}
      </div>
      {/* <div className="LogOut">
          <button onClick={handleSignOut}>Abandonner</button>
        </div>{" "} */}
      <div class="description">
        <p>Choisissez votre nom d'utilisateur : </p>
      </div>
      <div className="InputText">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={handleUsernameChange}
        />
      </div>
      <div className="LogOut">
        <button onClick={addUser}>M'inscrire</button>
      </div>
    </div>
  );
}

export default SetUsername;
