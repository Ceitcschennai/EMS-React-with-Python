import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "../../../styles/Admin/Dashboard/Dashboard.css";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-dash-layout">

      {/* FIXED SIDEBAR */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* MOBILE OVERLAY */}
      {mobileOpen && <div className="admin-mobile-overlay" onClick={() => setMobileOpen(false)} />}

      {/* MAIN AREA */}
      <div className={`admin-dash-main ${collapsed ? "admin-dash-main-collapsed" : ""}`}>

        {/* TOPBAR — sticky inside the flex column */}
        <Topbar collapsed={collapsed} setMobileOpen={setMobileOpen} mobileOpen={mobileOpen} />

        {/* SCROLLABLE CONTENT — needs admin-dash-content for scroll + padding */}
        <div className="admin-dash-content">
          <div className="admin-dash-content-inner">
            <Outlet />
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;