import React from "react";
import "../../../styles/Admin/Dashboard/InfoCard.css";

const InfoCard = ({ title, value, subtitle, icon }) => {
  return (
    <div className="ic-card">
      <div className="ic-icon">{icon}</div>

      <div className="ic-content">
        <h3>{title}</h3>
        <h1>{value}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default InfoCard;
