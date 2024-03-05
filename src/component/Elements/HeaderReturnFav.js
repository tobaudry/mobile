import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import StarIcon from "@mui/icons-material/Star";

export default function HeaderReturnFav({
  text,
  isFavorited,
  handleToggleFavorite,
}) {
  const navigate = useNavigate();

  const handleEventsClick = () => {
    navigate("/events");
  };

  return (
    <div className="HeadEvent">
      <div className="icon">
        <ArrowBackIosIcon onClick={handleEventsClick} />
        {isFavorited ? (
          <StarIcon onClick={handleToggleFavorite} />
        ) : (
          <StarOutlineIcon onClick={handleToggleFavorite} />
        )}
      </div>
      <h2>{text}</h2>
    </div>
  );
}
