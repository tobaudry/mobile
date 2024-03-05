import { useEffect, useState } from "react";
import { database } from "../../firebase-config";
import { ref, onValue } from "firebase/database";
import useAuthState from "../Fonctions/UseAuthState";

const useFilteredEvents = (filter) => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const user = useAuthState();

  useEffect(() => {
    const eventsRef = ref(database, "events");

    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const eventData = snapshot.val();
      if (eventData) {
        const eventList = Object.values(eventData);
        let newFilteredEvents = eventList;

        if (filter === "invitedFavorites") {
          newFilteredEvents = eventList.filter(
            (event) =>
              user &&
              event.invites &&
              event.invites.includes(user.uid) &&
              event.favorites &&
              event.favorites[user.uid] === true
          );
        } else if (filter === "invited") {
          newFilteredEvents = eventList.filter(
            (event) => user && event.invites && event.invites.includes(user.uid)
          );
        } else if (filter === "EnCours") {
          const currentDate = new Date();

          newFilteredEvents = eventList.filter((event) => {
            if (!user || !event.invites || !event.invites.includes(user.uid)) {
              return false;
            }

            const startDate = new Date(event.date + "T" + event.startTime);
            const endDate = new Date(event.date + "T" + event.endTime);

            return currentDate >= startDate && currentDate <= endDate;
          });
        }

        setFilteredEvents(newFilteredEvents);
      } else {
        setFilteredEvents([]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [filter, user]);

  return filteredEvents;
};

export default useFilteredEvents;
