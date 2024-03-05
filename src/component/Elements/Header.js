import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import CircleIcon from "@mui/icons-material/Circle";
import useAuthState from "../Fonctions/UseAuthState";
import useUserData from "../Fonctions/UserData";

export default function Header({ numberOfNewItems }) {
  const navigate = useNavigate();
  const user = useAuthState();
  const uid = user ? user.uid : null;
  const userData = useUserData(uid);

  const handleAccountClick = () => {
    navigate("/compte"); // Redirige vers la page Account.js lors du clic sur l'icône de profil
  };

  const handleFriendsClick = () => {
    navigate("/amis"); // Redirige vers la page Account.js lors du clic sur l'icône de profil
  };

  return (
    <div className="HeadEvent">
      <div className="icon">
        <div className="Friends">
          {/* Affichez le nombre d'invitations s'il y en a */}
          {numberOfNewItems > 0 && (
            <div className="NbrFriends">
              <p>{numberOfNewItems}</p>
            </div>
          )}
          <SupervisorAccountIcon onClick={handleFriendsClick} />
        </div>
        {userData && userData.photoUrl ? (
          <img
            src={userData.photoUrl}
            alt={`Profil Pic`}
            onClick={handleAccountClick}
          />
        ) : (
          <CircleIcon onClick={handleAccountClick} />
        )}
      </div>
      <h2>Mes évènements</h2>
    </div>
  );
}
