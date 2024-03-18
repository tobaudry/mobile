import React, { useEffect, useState } from "react";
import { database } from "../../firebase-config";
import { ref, onValue } from "firebase/database";
import { useNavigate, Link } from "react-router-dom";
import useAuthState from "../Fonctions/UseAuthState";
import Header from "../Elements/Header";
import SlideEvents from "../Elements/SlideEvents";
import useInvitationCount from "../Fonctions/useInvitationCount";
import "./Events.css";

function Event() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const navigate = useNavigate();
  const user = useAuthState();
  const uid = user ? user.uid : null;

  const [filter, setFilter] = useState("invited");
  const nbrinvits = useInvitationCount(uid);
  const [totalEvents, setTotalEvents] = useState([]);

  useEffect(() => {
    const eventsRef = ref(database, "events");

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const eventData = snapshot.val();
      if (eventData) {
        const eventList = Object.values(eventData);
        setEvents(eventList);
        setLoading(false);
      } else {
        setEvents([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleEventClickNavigate = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const handleEventClick = (index) => {
    if (index === filter) {
      setFilter(0);
    } else {
      if (index === 0) {
        setFilter("invited");
      } else if (index === 1) {
        setFilter("invitedFavorites");
      } else if (index === 2) {
        setFilter("enCours");
      } else if (index === 3) {
        setFilter("Avenir");
      }
    }
  };

  function parseDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed in JavaScript Date objects
  }

  // Fonction pour vérifier si la date actuelle est supérieure à la date de début de l'événement
  function isAfterStartTime(currentDate, eventDate, startHours, startMinutes) {
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

    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    return (
      currentDateOnly > eventDateOnly ||
      (currentDateOnly.getDate() === eventDateOnly.getDate() &&
        currentDateOnly.getMonth() === eventDateOnly.getMonth() &&
        currentDateOnly.getFullYear() === eventDateOnly.getFullYear() &&
        (currentHours > startHours ||
          (currentHours === startHours && currentMinutes >= startMinutes)))
    );
  }

  // Fonction pour vérifier si la date actuelle est inférieure à la date de fin de l'événement
  function isBeforeEndTime(currentDate, eventEndDate, endHours, endMinutes) {
    const currentDateOnly = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const eventEndDateOnly = new Date(
      eventEndDate.getFullYear(),
      eventEndDate.getMonth(),
      eventEndDate.getDate()
    );

    const currentHours = currentDate.getHours();
    const currentMinutes = currentDate.getMinutes();

    return (
      currentDateOnly < eventEndDateOnly ||
      (currentDateOnly.getDate() === eventEndDateOnly.getDate() &&
        currentDateOnly.getMonth() === eventEndDateOnly.getMonth() &&
        currentDateOnly.getFullYear() === eventEndDateOnly.getFullYear() &&
        (currentHours < endHours ||
          (currentHours === endHours && currentMinutes <= endMinutes)))
    );
  }

  useEffect(() => {
    let newFilteredEvents = [];
    const currentDate = new Date();

    if (filter === "invitedFavorites") {
      newFilteredEvents = events.filter(
        (event) =>
          user &&
          event.invites &&
          event.invites.includes(user.uid) &&
          event.favorites &&
          event.favorites[user.uid] === true
      );

      // Vérifier si les événements sont en cours et ajouter l'attribut inProgress
      newFilteredEvents.forEach((event) => {
        const eventDate = parseDate(event.date);
        const eventEndDate = parseDate(event.endDate);
        const startHours = parseInt(event.startTime.split(":")[0]);
        const startMinutes = parseInt(event.startTime.split(":")[1]);
        const endHours = parseInt(event.endTime.split(":")[0]);
        const endMinutes = parseInt(event.endTime.split(":")[1]);
        const isEventInProgress =
          isAfterStartTime(currentDate, eventDate, startHours, startMinutes) &&
          isBeforeEndTime(currentDate, eventEndDate, endHours, endMinutes);

        if (isEventInProgress) {
          event.inProgress = true;
        }
      });
    } else if (filter === "invited") {
      newFilteredEvents = events.filter(
        (event) => user && event.invites && event.invites.includes(user.uid)
      );

      // Vérifier si les événements sont en cours et ajouter l'attribut inProgress
      newFilteredEvents.forEach((event) => {
        const eventDate = parseDate(event.date);
        const eventEndDate = parseDate(event.endDate);
        const startHours = parseInt(event.startTime.split(":")[0]);
        const startMinutes = parseInt(event.startTime.split(":")[1]);
        const endHours = parseInt(event.endTime.split(":")[0]);
        const endMinutes = parseInt(event.endTime.split(":")[1]);
        const isEventInProgress =
          isAfterStartTime(currentDate, eventDate, startHours, startMinutes) &&
          isBeforeEndTime(currentDate, eventEndDate, endHours, endMinutes);

        if (isEventInProgress) {
          event.inProgress = true;
        }
      });
      setTotalEvents(newFilteredEvents.length);
    } else if (filter === "enCours") {
      newFilteredEvents = events.filter((event) => {
        if (
          user &&
          event.invites &&
          event.invites.includes(user.uid) &&
          event.date &&
          event.endDate &&
          event.startTime &&
          event.endTime
        ) {
          const eventDate = new Date(event.date);
          const eventEndDate = new Date(event.endDate);
          const startHours = parseInt(event.startTime.split(":")[0]);
          const startMinutes = parseInt(event.startTime.split(":")[1]);
          const endHours = parseInt(event.endTime.split(":")[0]);
          const endMinutes = parseInt(event.endTime.split(":")[1]);
          const isEventInProgress =
            isAfterStartTime(
              currentDate,
              eventDate,
              startHours,
              startMinutes
            ) &&
            isBeforeEndTime(currentDate, eventEndDate, endHours, endMinutes);

          // Définir inProgress sur true si l'événement est en cours
          if (isEventInProgress) {
            event.inProgress = true;
          }

          return isEventInProgress;
        }

        return false;
      });
    } else if (filter === "Avenir") {
      newFilteredEvents = events.filter((event) => {
        if (
          user &&
          event.invites &&
          event.invites.includes(user.uid) &&
          event.date
        ) {
          const eventDate = new Date(event.date);
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
          const currentHours = currentDate.getHours();
          const currentMinutes = currentDate.getMinutes();
          const startHours = parseInt(event.startTime.split(":")[0]);
          const startMinutes = parseInt(event.startTime.split(":")[1]);
          return (
            currentDateOnly < eventDateOnly ||
            (currentDateOnly.getDate() === eventDateOnly.getDate() &&
              currentDateOnly.getMonth() === eventDateOnly.getMonth() &&
              currentDateOnly.getFullYear() === eventDateOnly.getFullYear() &&
              (currentHours < startHours ||
                (currentHours === startHours && currentMinutes < startMinutes)))
          );
        }
        return false;
      });
    }

    setFilteredEvents(newFilteredEvents);
  }, [filter, events, user]);

  const getRandomZeroRadiusPosition = () => {
    const positions = ["top-left", "top-right", "bottom-left", "bottom-right"];
    const randomIndex = Math.floor(Math.random() * positions.length);
    return positions[randomIndex];
  };

  const getBorderRadius = (position) => {
    switch (position) {
      case "top-left":
        return "0% 30px 30px 30px";
      case "top-right":
        return "30px 0% 30px 30px";
      case "bottom-left":
        return "30px 30px 30px 0%";
      case "bottom-right":
        return "30px 30px 0% 30px";
      default:
        return "0% 30px 30px 30px";
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="Event">
      <div class="fixed" style={{ zIndex: "3" }}>
        <Header numberOfNewItems={nbrinvits} />
        <SlideEvents
          totalEvents={totalEvents}
          updateFilter={handleEventClick}
        />
      </div>
      <div>
        <ul style={{ listStyleType: "none" }} class="EventsVertical">
          {filteredEvents.map((event) => {
            const isEventInProgress = event.inProgress;

          // À l'intérieur de la boucle map des événements
return (
  <li
    key={event.EventId}
    onClick={() => handleEventClickNavigate(event.EventId)}
  >
    <div
      style={{
        borderRadius: getBorderRadius(
          getRandomZeroRadiusPosition()
        ),
        overflow: "hidden",
        position: "relative",
        border:
          event.Cover && event.Cover[user.uid]
            ? isEventInProgress
              ? "none"
              : "none"
            : isEventInProgress
            ? "1px solid white"
            : "1px solid white",
      }}
      className="Event_1"
    >
      {/* Ajout de la pastille violette */}
      {isEventInProgress && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "15px",
            width: "15px",
            height: "15px",
            backgroundColor: "#ff28ff",
            borderRadius: "50%",
            zIndex: "1",
          }}
        ></div>
      )}
      {isEventInProgress && (
        <div
          style={{
            position: "absolute",
            top: "15px",
            left: "40px",
            color: "#ff28ff",
            fontSize: "15px",
            fontWeight: "bold",
            zIndex: "1",
          }}
        >
          En cours
        </div>
      )}
      {event.Cover && event.Cover[user.uid] && (
        <img
          src={event.Cover[user.uid]}
          alt={`Profil`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            opacity: "0.5",
          }}
        />
      )}
      <div
        className="Random"
        style={{
          paddingLeft: "5px",
          position: "absolute",
          top: `${10 + Math.random() * 50}%`,
          maxWidth: "80%",
          maxHeight: "80%",
          overflow: "hidden",
          ...(Math.random() > 0.5
            ? { right: "5px", textAlign: "right" }
            : { left: "5px", textAlign: "left" }),
        }}
      >
        <p
          className="Title"
          style={{
            color: isEventInProgress ? "inherit" : "inherit",
          }}
        >
          {event.title}
        </p>
        <p
          className="Date"
          style={{
            color: isEventInProgress ? "inherit" : "inherit",
          }}
        >
          {new Date(event.date).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  </li>
);

          })}
        </ul>
      </div>
      <Link to="/addevent">
        <button className="AddEventButton">+</button>
      </Link>
    </div>
  );
}

export default Event;
