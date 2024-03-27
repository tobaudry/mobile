import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { database } from "../../firebase-config";
import { ref, onValue, set, remove, get } from "firebase/database";
import useAuthState from "../Fonctions/UseAuthState";
import useUserData from "../Fonctions/UserData";
import HeaderReturn from "../Elements/HeaderReturn";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import "./Amis.css";

function Amis() {
  const user = useAuthState();
  const uid = user ? user.uid : null;
  const userData = useUserData(uid);
  const navigation = useNavigate();

  const [amis, setAmis] = useState([]);
  const [friendsUsernames, setFriendsUsernames] = useState([]);
  const [friendsPics, setfriendsPics] = useState([]);
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [senderUserData, setSenderUserData] = useState([]); // State pour les données de l'utilisateur envoyant l'invitation

  useEffect(() => {
    if (uid) {
      const amisRef = ref(database, `users/${uid}/friends`);
      onValue(amisRef, (snapshot) => {
        const amisData = snapshot.val();
        if (amisData) {
          const amisList = Object.values(amisData);
          setAmis(amisList);

          const promises = amisList.map((amiUid) => {
            const userRef = ref(database, `users/${amiUid}`);
            return get(userRef).then((snapshot) => snapshot.val());
          });

          Promise.all(promises)
            .then((friendsData) => {
              const friendsUsernames = friendsData.map(
                (friend) => friend.username
              );
              setFriendsUsernames(friendsUsernames);
              const friendsPics = friendsData.map((friend) => friend.photoUrl);
              setfriendsPics(friendsPics);
            })
            .catch((error) => {
              console.error(
                "Erreur lors de la récupération des usernames :",
                error.message
              );
            });
        } else {
          setAmis([]);
        }
      });
    }
  }, [uid]);

  useEffect(() => {
    const usersRef = ref(database, "users");
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        const userList = Object.keys(usersData).map((uid) => ({
          uid,
          ...usersData[uid],
        }));
        setUsers(userList);
      }
    });
  }, [uid]);

  useEffect(() => {
    const invitationsRef = ref(database, `invitations`);
    onValue(invitationsRef, async (snapshot) => {
      const invitationsData = snapshot.val();
      if (invitationsData) {
        const invitationsList = Object.values(invitationsData).filter(
          (invitation) => invitation.receiver === uid
        );

        setInvitations(invitationsList);
        setShowInvitations(invitationsList.length > 0);

        // Promesses pour récupérer les données de l'utilisateur envoyant l'invitation
        const promises = invitationsList.map((invitation) => {
          const senderUid = invitation.sender;
          const senderRef = ref(database, `users/${senderUid}`);
          return get(senderRef)
            .then((snapshot) => snapshot.val())
            .catch((error) => {
              console.error(
                "Erreur lors de la récupération des données de l'expéditeur :",
                error.message
              );
            });
        });

        try {
          const senderDataArray = await Promise.all(promises);
          // Mettre à jour les données de l'utilisateur envoyant l'invitation
          senderDataArray.forEach((senderData) => {
            setSenderUserData(senderData);
          });
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données de l'expéditeur :",
            error.message
          );
        }
      } else {
        setInvitations([]);
        setShowInvitations(false);
      }
    });
  }, [uid]);

  const handleFriendToggle = (uid) => {
    if (friends.includes(uid)) {
      setFriends(friends.filter((friendUid) => friendUid !== uid));
    } else {
      setFriends([...friends, uid]);
    }
  };

  const sendInvitation = async (invitedUid) => {
    const invitationRef = ref(database, `invitations/${invitedUid}`);
    try {
      await set(invitationRef, {
        sender: uid,
        receiver: invitedUid,
      });
      setSearchTerm("");
      navigation("/amis");
      console.log("Invitation envoyée avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'invitation :", error.message);
    }
  };
  const confirmRemoveFriend = (uid, friendUid) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet ami ?")) {
      removeFriend(uid, friendUid);
    }
  };

  const confirmRemoveInvitation = (invitationUid) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette invitation ?")
    ) {
      removeInvitation(invitationUid);
    }
  };

  const removeInvitation = async (invitationUid) => {
    const invitationRef = ref(database, `invitations/${invitationUid}`);
    try {
      await remove(invitationRef);
      console.log("Invitation supprimée avec succès !");
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de l'invitation :",
        error.message
      );
    }
  };

  const addFriend = async (uid, friendUid) => {
    try {
      const amisRef = ref(database, `users/${uid}/friends/${friendUid}`);
      await set(amisRef, friendUid);
      window.location.reload();
      console.log("Ami ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'ami :", error.message);
    }
  };

  const removeFriend = async (uid, friendUid) => {
    const amisRef = ref(database, `users/${uid}/friends/${friendUid}`);
    const otherAmisRef = ref(database, `users/${friendUid}/friends/${uid}`);
    try {
      await remove(amisRef);
      await remove(otherAmisRef);
      window.location.reload();
      console.log("Ami supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ami :", error.message);
    }
  };

  const isFriend = (uid) => {
    return amis.includes(uid);
  };

  const handleSearch = (e) => {
    const searchTerm = e.target.value.trim().toLowerCase();
    setSearchTerm(searchTerm);
    if (searchTerm === "") {
      setSearchResults([]);
    } else {
      const results = users.filter((user) =>
        user.username.toLowerCase().includes(searchTerm)
      );
      setSearchResults(results);
    }
  };

  return (
    <div className="App" style={{ position: "fixed", width: "100%" }}>
      <HeaderReturn text="Ajouter des amis" />
      {showInvitations && userData && senderUserData ? (
        <div>
          <div className="description">
            <p style={{ paddingBottom: "10px" }}>
              Vous avez une invitation en attente
            </p>
          </div>

          <ul style={{ listStyleType: "none" }}>
            {invitations.map((invitation, index) => (
              <li key={index}>
                <div className="InvitUsers">
                  <div class="left">
                    {/* Affichage de l'username et de la photo de profil de l'utilisateur envoyant l'invitation */}
                    <div className="iconFriends">
                      <img src={senderUserData.photoUrl} alt="Profil" />
                    </div>
                    <p style={{ paddingLeft: "20px" }}>
                      {senderUserData.username}
                    </p>
                  </div>
                  <div class="right">
                    <button
                      onClick={() => {
                        addFriend(invitation.sender, uid);
                        addFriend(uid, invitation.sender);
                        removeInvitation(uid);
                      }}>
                      Accepter
                    </button>
                    <button
                      onClick={() => confirmRemoveInvitation(invitation.uid)}
                      style={{
                        color: "red",
                        border: "1px solid red",
                        marginLeft: "20px",
                      }}>
                      x
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="None">
          <p></p>
        </div>
      )}
      <div className="InputText">
        <input
          type="text"
          placeholder="Rechercher par nom d'utilisateur"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      {/* Affichage des suggestions d'utilisateurs */}
      {searchTerm !== "" && (
        <>
          {searchResults
            .filter((user) => user.uid !== uid) // Filtrer pour exclure l'utilisateur actif
            .map((user) => (
              <div key={user.uid} onClick={() => handleFriendToggle(user.uid)}>
                <div
                  className="InvitUsers"
                  style={{
                    paddingBottom: "10px",
                  }}>
                  <div className="left">
                    <label>{user.username}</label>
                  </div>
                  <div className="right">
                    {isFriend(user.uid) ? (
                      <button onClick={() => removeFriend(uid, user.uid)}>
                        <DeleteOutlineIcon />
                      </button>
                    ) : (
                      <button onClick={() => sendInvitation(user.uid)}>
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </>
      )}
      {/* Affichage de la liste des amis */}
      {amis.length > 0 && searchTerm === "" && (
        <div className="MyFriends">
          <h3>Mes amis</h3>
          <ul style={{ listStyleType: "none" }}>
            {amis.map((ami, index) => (
              <li key={index}>
                <div className="InvitUsers">
                  <div className="left">
                    <div className="iconFriends">
                      <img src={friendsPics[index]} alt="Friend" />
                    </div>
                    <p style={{ paddingLeft: "20px" }}>
                      {friendsUsernames[index]}
                    </p>
                  </div>
                  <div className="right">
                    <button
                      onClick={() => confirmRemoveFriend(uid, amis[index])}
                      style={{ border: "none" }}>
                      {isFriend(amis[index]) ? (
                        <DeleteOutlineIcon />
                      ) : (
                        "Ajouter"
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Affichage lorsque l'utilisateur n'a pas encore d'amis */}
      {amis.length === 0 && searchTerm === "" && (
        <div className="description">
          <p>Vous n'avez pas encore d'amis...</p>
        </div>
      )}
    </div>
  );
}

export default Amis;
