import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function HeaderReturn({ text }) {
  const navigate = useNavigate();

  const handleEventsClick = () => {
    navigate("/events");
  };

  return (
    <div className="HeadEvent">
      <div className="icon" style={{ flexDirection: "row-reverse" }}>
        {" "}
        <ArrowForwardIosIcon onClick={handleEventsClick} />
      </div>
      <h2>{text}</h2>
    </div>
  );
}
