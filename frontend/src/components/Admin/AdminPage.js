import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin/AdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-ad-wrapper">         {/* ← this owns the blue gradient */}
      <div className="page-ad-container">

        <h1 className="page-ad-title">Admin Login Page</h1>

        <div className="page-ad-card">
          <h2 className="page-ad-heading">Choose Your Path</h2>
          <p className="page-ad-description">
            If Your New Admin Choose Super Admin and Register. <br />
            If Already Registered Select Admin Login.
          </p>

          <div className="page-ad-options">
            <div
              className="page-ad-super-admin-box"
              onClick={() => navigate("/superadmin-login")}
            >
              <div className="page-ad-super-admin-icon">👨‍💼</div>
              <p className="page-ad-box-title">Super Admin</p>
              <p className="page-ad-box-text">New User Admin Login</p>
            </div>

            <div
              className="page-ad-admin-box"
              onClick={() => navigate("/admin-login")}
            >
              <div className="page-ad-admin-icon">🧑‍💻</div>
              <p className="page-ad-box-title">Admin Login</p>
              <p className="page-ad-box-text">Manage employee records</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPage;