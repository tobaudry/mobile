import React, { useState } from "react";
import "./SlideEvents.css";
import SlideEvent from "./SlideEvent";
import StarIcon from "@mui/icons-material/Star";
import CircleIcon from "@mui/icons-material/Circle";
import UpdateIcon from "@mui/icons-material/Update";
export default function SlideEvents({ totalEvents, updateFilter }) {
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  return (
    <div className="SlideEvents">
      <div className="SlideEvents-2">
        <SlideEvent
          color="#FFF"
          text={`Tous ${totalEvents}`}
          isSelected={selectedEventIndex === 0}
          onClick={() => setSelectedEventIndex(0)}
          updateFilter={() => updateFilter(0)}
          filter={selectedEventIndex}
        />
        <SlideEvent
          color="#FFF"
          text="Favoris"
          icon={<StarIcon />}
          isSelected={selectedEventIndex === 1}
          onClick={() => setSelectedEventIndex(1)}
          updateFilter={() => updateFilter(1)}
          filter={selectedEventIndex}
        />
        <SlideEvent
          color="#ff28ff"
          text="En cours"
          icon={<CircleIcon />}
          isSelected={selectedEventIndex === 2}
          onClick={() => setSelectedEventIndex(2)}
          updateFilter={() => updateFilter(2)}
          filter={selectedEventIndex}
        />
        <SlideEvent
          color="#FFF"
          text="À venir"
          icon={<UpdateIcon />}
          isSelected={selectedEventIndex === 3}
          onClick={() => setSelectedEventIndex(3)}
          updateFilter={() => updateFilter(3)}
          filter={selectedEventIndex}
        />
      </div>
    </div>
  );
}
