import React from "react";
import "./SlideEvent.css";
import { Icon } from "@mui/material";

const SlideEvent = ({
  color,
  text,
  icon,
  isSelected,
  onClick,
  updateFilter,
  filter,
}) => {
  const handleClick = async () => {
    onClick();
    await updateFilter(filter);
  };

  return (
    <div
      className="Slide"
      style={{
        border: `1px solid ${color}`,
        color: color,
        opacity: isSelected ? 1 : 0.1,
      }}
      onClick={handleClick}
    >
      <p>{text}</p>
      {icon && <Icon>{icon}</Icon>}
    </div>
  );
};

export default SlideEvent;
