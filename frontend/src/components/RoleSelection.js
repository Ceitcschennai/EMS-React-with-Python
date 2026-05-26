import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RoleSelection.css";

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="role-main-container">
      <h1 className="role-main-title">CeiTCS Employee Management System</h1>
      <p className="role-main-subtitle">Login to access Employee Details</p><br />

      <div className="role-main-card">
        <h2 className="role-main-heading">Choose Your Role</h2>
        <p className="role-main-description">
          Select your role to continue to the login screen
        </p>

        <div className="role-main-options">
          <div
            className="role-main-box-admin"
            onClick={() => navigate("/admin-Page")}
          >
            <div className="role-main-icon-admin">👨‍💼</div>
            <h3 className="role-main-box-title">Admin</h3>
            <p className="role-main-box-text">Manage employee records</p>
          </div>

          <div
            className="role-main-box-employee"
            onClick={() => navigate("/employee-login")}
          >
            <div className="role-main-icon-employee">🧑‍💻</div>
            <h3 className="role-main-box-title">Employee</h3>
            <p className="role-main-box-text">View your details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
