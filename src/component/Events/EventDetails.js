import React, { useEffect, useState } from "react";
import {  database } from "../../firebase-config";
import { ref, onValue, set } from "firebase/database"; 
import { readAllPhotos } from "./Files";
import { useParams, useNavigate } from "react-router-dom";
import useAuthState from "../Fonctions/UseAuthState";
import HeaderReturnFav from "../Elements/HeaderReturnFav";
import { update } from "firebase/database";
import afficherLoader from "../Fonctions/Loader";

import "./EventDetails.css";

function EventDetails() {
  const [loading, setLoading] = useState(true);
  const { eventId } = useParams();
  const [eventDetails, setEventDetails] = useState(null);
  const [photoURLs, setPhotoURLs] = useState([]);
  const user = useAuthState();
  const [favoritedUsers, setFavoritedUsers] = useState([]);
  const navigate = useNavigate();
  const [popupImage, setPopupImage] = useState(null);
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true); // Set loading to true before fetching data
        const folderPath = `events/${eventId}`;
        const urls = await readAllPhotos(folderPath);
        urls.sort((a, b) => b.createdAt - a.createdAt);
        setPhotoURLs(urls);
        setLoading(false); // Set loading to false after fetching data
      } catch (error) {
        console.error(
          "Une erreur s'est produite lors de la récupération des photos :",
          error
        );
        setLoading(false); // Set loading to false in case of error
      }
    }

    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const eventRef = ref(database, `events/${eventId}`);

    onValue(eventRef, (snapshot) => {
      const eventData = snapshot.val();
      setEventDetails(eventData);
      if (eventData) {
        const favorites = eventData.favorites || [];
        setFavoritedUsers(Object.keys(favorites));
      }
    });

    return () => {
      setEventDetails(null);
    };
  }, [eventId]);

  if (!eventDetails) {
    return <div>Chargement...</div>;
  }

  function startCountdown(targetDate) {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        clearInterval(interval);
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);
  }

  const currentDate = new Date();
  const { date, startTime, endDate, endTime } = eventDetails;
  const eventDate = new Date(date);
  const eventEndDate = new Date(endDate);
  const currentDateOnly = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const eventDateOnly = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );
  const eventEndDateOnly = new Date(
    eventEndDate.getFullYear(),
    eventEndDate.getMonth(),
    eventEndDate.getDate()
  );
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  const startHours = parseInt(startTime.split(":")[0]);
  const startMinutes = parseInt(startTime.split(":")[1]);

  const endHours = parseInt(endTime.split(":")[0]);
  const endMinutes = parseInt(endTime.split(":")[1]);

  const isAfterStartTime =
    currentDateOnly > eventDateOnly ||
    (currentDateOnly.getDate() === eventDateOnly.getDate() &&
      currentDateOnly.getMonth() === eventDateOnly.getMonth() &&
      currentDateOnly.getFullYear() === eventDateOnly.getFullYear() &&
      (currentHours > startHours ||
        (currentHours === startHours && currentMinutes >= startMinutes)));

  const isBeforeEndTime =
    currentDateOnly < eventEndDateOnly ||
    (currentDateOnly.getDate() === eventEndDateOnly.getDate() &&
      currentDateOnly.getMonth() === eventEndDateOnly.getMonth() &&
      currentDateOnly.getFullYear() === eventEndDateOnly.getFullYear() &&
      (currentHours < endHours ||
        (currentHours === endHours && currentMinutes <= endMinutes)));
  if (!isAfterStartTime) {
    startCountdown(eventDateOnly);
  } else if (isAfterStartTime) {
    startCountdown(eventEndDate);
  }

  const handleToggleFavorite = () => {
    if (user) {
      const userUid = user.uid;
      const isFavorited = favoritedUsers.includes(userUid);

      // Update the database with the updated list of favorited users
      update(ref(database, `events/${eventId}/favorites`), {
        [userUid]: !isFavorited, // Toggle the favorite status
      })
        .then(() => {
          // Update favoritedUsers state based on whether the user has already favorited the event
          setFavoritedUsers((prevFavoritedUsers) => {
            if (isFavorited) {
              return prevFavoritedUsers.filter((uid) => uid !== userUid);
            } else {
              return [...prevFavoritedUsers, userUid];
            }
          });
        })
        .catch((error) => {
          console.error("Error updating favorite status:", error);
        });
    }
  };

  const handleTakePicture = () => {
    navigate(`/TakePicture/${eventId}`);
  };

  const handleImageClick = (url) => {
    setPopupImage(url);
  };

  const closePopup = () => {
    setPopupImage(null);
  };

  const handleChooseMainPhoto = () => {
    if (user && popupImage) {
      const userUid = user.uid;
      const photoRef = ref(database, `events/${eventId}/Cover/${userUid}`);

      // Ajout de l'URL de l'image à la base de données de l'utilisateur
      set(photoRef, popupImage)
        .then(() => {
          console.log(
            "URL de l'image ajoutée avec succès à la base de données de l'utilisateur"
          );
        })
        .catch((error) => {
          console.error(
            "Erreur lors de l'ajout de l'URL de l'image à la base de données:",
            error
          );
        });
    }
  };

  if (loading) {
    return <div>{afficherLoader()}</div>; // Display loading indicator while loading
  }

  if (eventDetails) {
    return (
      <div>
        <HeaderReturnFav
          text={eventDetails.title}
          isFavorited={
            favoritedUsers.includes(user?.uid) &&
            eventDetails?.favorites[user?.uid] === true
          }
          handleToggleFavorite={handleToggleFavorite}
        />
        <div className="EventDetails">
          {/* Evenement pas commencé  */}
          {!isAfterStartTime && (
            <div>
              <div className="description">
                <p style={{ fontSize: "20px" }}>
                  L'événement n'a pas encore commencé
                </p>
              </div>
              <div class="countdown-container">
                <div class="countdown">
                  <ul>
                    <li>
                      <span>{countdown.days}</span>Jours
                    </li>
                    <li>
                      <span>{countdown.hours}</span>Heures
                    </li>
                    <li>
                      <span>{countdown.minutes}</span>Minutes
                    </li>
                    <li>
                      <span>{countdown.seconds}</span>Secondes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Evenemnt en cours  */}
          {isBeforeEndTime && isAfterStartTime ? (
            <div>
              <div className="description">
                <p>Vous devez ajouter une photo pour accéder à l'événement</p>
              </div>
              <div className="description">
                <p style={{ color: "#FFF" }}>
                  Temps restant : {countdown.days}j {countdown.hours}h{" "}
                  {countdown.minutes}m {countdown.seconds}s
                </p>
              </div>
              <div className="photo-container">
                <div className="overlay" onClick={handleTakePicture}></div>
                {photoURLs.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${index}`}
                    onClick={() => handleImageClick(url)}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {/* Evenemnt fini  */}
          {!isBeforeEndTime && isAfterStartTime ? (
            <div>
              <div className="description">
                <p>Événement fini !</p>
              </div>
              <div className="photo-container">
                {photoURLs.map((url, index) => (
                  <img
                    key={index}
                    src={highQualityLoaded ? url : `${url}-lowres`}
                    alt={`${index}`}
                    onClick={() => handleImageClick(url)}
                    style={{
                      visibility: highQualityLoaded ? "visible" : "hidden",
                    }}
                    onLoad={() => {
                      if (!highQualityLoaded) {
                        setHighQualityLoaded(true);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {popupImage && (
          <div className="popup" onClick={closePopup}>
            <div className="popup-inner">
              <img src={popupImage} alt="Popup" />
              <div className="popup-content" style={{ paddingTop: "20px" }}>
                <div className="ChangePic">
                  {/* Ajout du bouton pour choisir comme photo principale */}
                  <button onClick={handleChooseMainPhoto}>
                    choisir comme photo principale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default EventDetails;