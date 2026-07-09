import React from "react";
import { useNavigate, NavLink } from "react-router-dom";

import {
  MdDashboard,
  MdGroups,
  MdEngineering,
  MdPersonAddAlt1,
  MdGroupAdd,
  MdDescription,
  MdForum,
  MdLogout,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";

import "../../../styles/Admin/Dashboard/Sidebar.css";

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (window.innerWidth <= 992 && setMobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <div
      className={`admin-sidebar-container ${
        collapsed ? "admin-sidebar-collapsed" : ""
      } ${mobileOpen ? "mobile-open" : ""}`}
    >

      {/* HEADER */}
      <div className="admin-sidebar-header">
        <button
          className="admin-sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? (
            <MdKeyboardDoubleArrowRight />
          ) : (
            <MdKeyboardDoubleArrowLeft />
          )}
        </button>

        {!collapsed && (
          <div className="admin-sidebar-logo-container">
            <h2 className="admin-sidebar-logo">CeiTCS</h2>
            <p className="admin-sidebar-subtitle">
              Admin Portal
            </p>
          </div>
        )}
      </div>

      <hr className="admin-sidebar-logo-container-hr" />

      {/* MENU */}
      <ul className="admin-sidebar-menu">

        {/* Dashboard */}
        <li>
          <NavLink
            to="/admin/dashboard"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdDashboard className="sidebar-icon" />
            {!collapsed && <span>Dashboard</span>}
          </NavLink>
        </li>

        {/* Employees */}
        <li>
          <NavLink
            to="/admin/dashboard/employees"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdGroups className="sidebar-icon" />
            {!collapsed && <span>Employees</span>}
          </NavLink>
        </li>

        

        {/* Add Employee */}
        <li>
          <NavLink
            to="/admin/dashboard/add-employee"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdPersonAddAlt1 className="sidebar-icon" />
            {!collapsed && <span>Add Employee</span>}
          </NavLink>
        </li>

        

        {/* Documents */}
        <li>
          <NavLink
            to="/admin/dashboard/DocumentVerification"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdDescription className="sidebar-icon" />
            {!collapsed && <span>Employee Documents</span>}
          </NavLink>
        </li>

        {/* Communications */}
        <li>
          <NavLink
            to="/admin/dashboard/communicationpage"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdForum className="sidebar-icon" />
            {!collapsed && <span>Employee Communications</span>}
          </NavLink>
        </li>

        {/* Workers */}
        <li>
          <NavLink
            to="/admin/dashboard/workerspage"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdEngineering className="sidebar-icon" />
            {!collapsed && <span>Workers</span>}
          </NavLink>
        </li>

        {/* Add Worker */}
        <li>
          <NavLink
            to="/admin/dashboard/Add-Worker"
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-active admin-sidebar-menu-link"
                : "admin-sidebar-menu-link"
            }
          >
            <MdGroupAdd className="sidebar-icon" />
            {!collapsed && <span>Add Worker</span>}
          </NavLink>
        </li>

      </ul>

      {/* LOGOUT */}
      <button
        className="admin-sidebar-logout-btn"
        onClick={() => navigate("/")}
      >
        <MdLogout className="sidebar-icon" />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  );
};

export default Sidebar;