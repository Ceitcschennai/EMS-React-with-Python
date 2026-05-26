// EmployeeLayout.js - Separate styling for Employee Portal
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaFileAlt,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
} from "react-icons/fa";
import "../../../styles/EmployeeHome/EmpDashboard/EmployeeLayout.css";

const EmployeeLayout = ({ children }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = () => {
    if (window.innerWidth <= 992) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && <div className="emp-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`emp-sidebar-container ${collapsed ? "emp-sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        
        {/* HEADER */}
        <div className="emp-sidebar-header">
          {/* Collapse Button */}
          <button
            className="emp-sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>

          {!collapsed && (
            <div className="emp-sidebar-logo-container">
              <h2 className="emp-sidebar-logo-icon">CeiTCS</h2>
              <p className="emp-sidebar-subtitle">Employee Portal</p>
            </div>
          )}
        </div>
        <hr className="emp-sidebar-logo-container-hr" />

        

        {/* MENU */}
        <ul className="emp-sidebar-menu">
          <li>
            <NavLink
              to="/employee/dashboard"
              end
              onClick={handleNavClick}
              className={({ isActive }) =>
                isActive
                  ? "emp-sidebar-active emp-sidebar-menu-link"
                  : "emp-sidebar-menu-link"
              }
            >
              <FaHome /> {!collapsed && <span>Dashboard</span>}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/employee/ProfilePage"
              onClick={handleNavClick}
              className={({ isActive }) =>
                isActive
                  ? "emp-sidebar-active emp-sidebar-menu-link"
                  : "emp-sidebar-menu-link"
              }
            >
              <FaUser /> {!collapsed && <span>My Profile</span>}
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/employee/MyDocuments"
              onClick={handleNavClick}
              className={({ isActive }) =>
                isActive
                  ? "emp-sidebar-active emp-sidebar-menu-link"
                  : "emp-sidebar-menu-link"
              }
            >
              <FaFileAlt /> {!collapsed && <span>My Documents</span>}
            </NavLink>
          </li>
        </ul>

        {/* LOGOUT BUTTON */}
        <button className="emp-sidebar-logout-btn" onClick={() => navigate("/")}>
          <FaSignOutAlt /> {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* MOBILE HAMBURGER */}
      <button
        className="emp-mobile-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>

      {/* CONTENT AREA */}
      <div className={`emp-layout-content ${collapsed ? "emp-layout-content-collapsed" : ""}`}>
        {children}
      </div>
    </>
  );
};

export default EmployeeLayout;