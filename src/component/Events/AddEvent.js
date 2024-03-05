import React, { useState, useEffect } from "react";
import { ref, push, set, onValue, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import {  database } from "../../firebase-config";
import useAuthState from "../Fonctions/UseAuthState";
import HeaderReturn from "../Elements/HeaderReturn";
import "./AddEvent.css";

function AddEvent() {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [date, setDate] = useState("");
  const [invites, setInvites] = useState([]);
  const navigation = useNavigate();
  const user = useAuthState();
  const uid = user ? user.uid : null;
  const [amis, setAmis] = useState([]);
  const [friendsPics, setfriendsPics] = useState([]);
  const [friendsUsernames, setFriendsUsernames] = useState([]);
  const [endTime, setEndTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [errorDate, setErrorDate] = useState("");
  const [errorInput, setErrorInput] = useState("");

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

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (newTitle.length > 15) {
      setError("Le titre ne doit pas dépasser 15 caractères.");
    } else {
      setError("");
    }
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Convertir les dates en objets Date pour la comparaison
    const startDate = new Date(date);
    const endDate = new Date(newEndDate);

    // Vérifier si la date de fin est antérieure à la date de début
    if (endDate < startDate) {
      setErrorDate(
        "La date de fin ne peut pas être antérieure à la date de début."
      );
      setEndDate("");
      // Effacer l'erreur après 2000ms (2 secondes)
      setTimeout(() => {
        setErrorDate("");
      }, 2000);
    } else {
      setErrorDate(""); // Effacer l'erreur si les dates sont valides
    }
  };

  const handleInviteToggle = (uid) => {
    if (invites.includes(uid)) {
      setInvites(invites.filter((invite) => invite !== uid));
    } else {
      setInvites([...invites, uid]);
    }
  };

  const addEvent = async () => {
    if (
      title !== "" &&
      startTime !== "" &&
      date !== "" &&
      endTime !== "" &&
      endDate !== ""
    ) {
      const eventsRef = ref(database, "events");
      const newEventRef = push(eventsRef);
      const eventId = newEventRef.key;
      const updatedInvites = [...invites, uid];

      set(newEventRef, {
        id_utilisateur: user.uid,
        EventId: eventId,
        title,
        startTime,
        endTime,
        date,
        endDate,
        invites: updatedInvites,
      })
        .then(() => {
          setTitle("");
          setStartTime("");
          setDate("");
          setEndTime("");
          setEndDate("");
          setInvites([]);
          navigation("/events");
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout de l'événement : ", error);
        });
    } else {
      setErrorInput("Vous avez oublié de remplir un des champs.");
      setTimeout(() => {
        setErrorInput("");
      }, 2000);

      // setTitle("");
      // setStartTime("");
      // setDate("");
      // setEndTime("");
      // setEndDate("");
      // setInvites([]);
    }
  };

  return (
    <div className="AddEvent">
      <div class="fixed">
        <div className="description" style={{ position: "fixed", top: "10px" }}>
          <p style={{ color: "red" }}>{errorInput}</p>
        </div>
        <HeaderReturn text="Ajouter un événement" />
        <div className="description">
          <p style={{ color: "white" }}>Titre de l'événement</p>
        </div>
        <div className="InputText" style={{ paddingBottom: "10px" }}>
          <input
            type="text"
            placeholder="Titre"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        {error && (
          <div>
            <div className="description" style={{ paddingTop: "0" }}>
              <p style={{ color: "red" }}>{error}</p>
            </div>
            <div className="description" style={{ paddingTop: "5px" }}>
              <p style={{ color: "white" }}>Début de l'événement</p>
            </div>
          </div>
        )}
        {!error && (
          <div className="description" style={{ paddingTop: "19px" }}>
            <p style={{ color: "white" }}>Début de l'événement</p>
          </div>
        )}
        <div class="InvitUsers" style={{ padding: "20px 0px 20px 0px" }}>
          <div class="left">
            <div className="description">
              <p>date :</p>
            </div>
            <div class="input-date">
              <input
                type="date"
                placeholder="Date"
                value={date}
                onChange={handleDateChange}
              />
            </div>
            <div class="description">
              <p>heure :</p>
            </div>
            <div class="input-date">
              <input
                type="time"
                placeholder="Heure de début"
                value={startTime}
                onChange={handleStartTimeChange}
              />
            </div>
          </div>
        </div>

        <div className="description">
          <p style={{ color: "white" }}>fin de l'événement</p>
        </div>
        {!errorDate && (
          <div class="InvitUsers" style={{ padding: "20px 0px 20px 0px" }}>
            <div class="left">
              <div className="description">
                <p>date :</p>
              </div>
              <div class="input-date">
                <input
                  type="date"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
              <div class="description">
                <p>heure :</p>
              </div>
              <div class="input-date">
                <input
                  type="time"
                  placeholder="Heure de fin"
                  value={endTime}
                  onChange={handleEndTimeChange}
                />
              </div>
            </div>
          </div>
        )}
        {errorDate && (
          <div>
            <div
              className="description"
              style={{ padding: "20px 20px 20px 20px" }}
            >
              <p style={{ color: "red" }}>{errorDate}</p>
            </div>
          </div>
        )}
        <div className="description">
          <p style={{ color: "white" }}>Ajouter des amis </p>
        </div>
      </div>
      {amis.length === 0 && (
        <div class="SelectFriends" style={{ paddingLeft: "0" }}>
          <div className="description">
            <p>Vous n'avez pas encore d'amis...</p>
          </div>
        </div>
      )}
      {amis.length > 0 && (
        <div className="SelectFriends">
          {amis.map((ami, index) => (
            <div
              class="left-friends"
              key={index}
              onClick={() => handleInviteToggle(ami)}
            >
              <input type="checkbox" checked={invites.includes(ami)} />
              <img
                src={friendsPics[index]}
                alt={ami.displayName}
                className="ami-image"
              />
              <label>{friendsUsernames[index]}</label>
            </div>
          ))}
        </div>
      )}
      <button class="AddEventButton" onClick={addEvent}>
        +
      </button>
    </div>
  );
}

export default AddEvent;
