import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserCircle, FaSignOutAlt, FaCalendarAlt, FaBell, FaCog, FaBars, FaUserEdit } from "react-icons/fa";
import "../../../styles/Admin/Dashboard/Topbar.css";
import { timeAgo } from "../../utils/TimeAgo";

const Topbar = ({ setMobileOpen, mobileOpen }) => {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [adminName, setAdminName] = useState("");
    const [adminEmail, setAdminEmail] = useState("");

    const [notifications, setNotifications] = useState([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [notifCount, setNotifCount] = useState(0);

  const navigate = useNavigate();
  const profileRef = useRef();
  const profileBarRef = useRef();
  const notifRef = useRef();


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // Fetch admin profile from DB
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const email = localStorage.getItem("email");

        if (!email) return;

        const res = await axios.post(
          "http://localhost:8000/api/admin/dbprofile",
          { email: email }
        );

        setAdminName(res.data?.name ?? "Admin");
        setAdminEmail(res.data?.email ?? "admin@example.com");
      } catch (error) {
        console.error("Profile fetch failed:", error);
      }
    };

    fetchProfile();
  }, []);

  // Hide topbar on scroll
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setHidden(currentScroll > lastScroll && currentScroll > 60);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        profileBarRef.current &&
        !profileBarRef.current.contains(e.target)
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  // 🔥 OPEN REQUEST
  const openRequest = (req) => {
    // ✅ close panel immediately
    setShowNotifPanel(false);

    // Remove the clicked notification
    setNotifications((prev) => prev.filter((n) => n.id !== req.id));
    setNotifCount((prev) => prev - 1);

    localStorage.setItem("selected_request", JSON.stringify(req));
    navigate(`/admin/dashboard/employee/${req.emp_id}`);
  };

  // Handler for marking all notifications as read
  const handleMarkAllRead = () => {
    setNotifications([]);
    setNotifCount(0);
  };


  // 🔥 FETCH NOTIFICATIONS
  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/admin/edit_notifications"
        );

        setNotifications(res.data);
        setNotifCount(res.data.length);

      } catch (err) {
        console.error(err);
      }
    };

    // First load
    fetchNotifications();

    // Refresh every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);

    return () => clearInterval(interval);

  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className={`admin-topbar-container ${hidden ? "admin-topbar-hidden" : ""}`}>
      <button
        className="admin-mobile-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <FaBars />
      </button>
      <h2 className="admin-topbar-title">
        Welcome, {adminName}
      </h2>

      <div className="admin-topbar-right">
        <div className="admin-topbar-date">
          <FaCalendarAlt />
          {today}
        </div>

        <div className="admin-topbar-actions">
          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              className="admin-topbar-icon-btn1"
              onClick={() => setShowNotifPanel(!showNotifPanel)}
            >
              <FaBell />
              {notifCount > 0 && (
                <span className="notification-dot">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </button>

            {showNotifPanel && (
              <div className="admin-notif-panel">

                {/* Header */}
                <div className="admin-notif-header">
                  <p className="admin-notif-title">
                    Notifications
                    {notifications.length > 0 && (
                      <span>{notifications.length} new</span>
                    )}
                  </p>
                   {notifications.length > 0 && (
                     <button className="admin-notif-mark-all" onClick={handleMarkAllRead}>
                       Mark all read
                     </button>
                   )}
                </div>

                {/* List */}
                <div className="admin-notif-list">
                  {notifications.length === 0 ? (
                    <div className="admin-notif-empty">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="admin-notif-item"
                        onClick={() => openRequest(n)}
                      >
                        <div className="admin-notif-icon">
                          <FaUserEdit />
                        </div>

                        <div className="admin-notif-body">
                          <p className="admin-notif-emp">{n.emp_id}</p>

                          <p className="admin-notif-desc">
                            Updated profile information
                          </p>

                          <p className="admin-notif-time">
                            {timeAgo(n.requested_at)}
                          </p>
                        </div>

                        <div className="admin-notif-unread-dot"></div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="admin-notif-footer">
                    <button className="admin-notif-view-all">
                      View all notifications
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Settings */}
          {/*<button className="admin-topbar-icon-btn">
            <FaCog />
          </button>*/}

          {/* Avatar */}
          <div
            className="admin-topbar-avatar"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            ref={profileRef}
          >
            {adminName ? adminName.charAt(0).toUpperCase() : "A"}
          </div>

          {profileMenuOpen && (
            <div className="admin-topbar-profile-menu" ref={profileBarRef}>

              <div className="profile-info">
                <div className="profile-avatar-large">
                  {adminName ? adminName.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="profile-text">
                  <p className="profile-name">{adminName || "Admin"}</p>
                  <p className="topbar-profile-email">{adminEmail}</p>
                  <span className="profile-role">Administrator</span>
                </div>
              </div>

              {/* <hr />

              <div className="profile-menu-item1" onClick={() => navigate("")}>
                <span className="profile-menu-item1-icon"><FaUserCircle /></span>
                My Profile
              </div>

              <div className="profile-menu-item1" onClick={() => navigate("")}>
                <span className="profile-menu-item1-icon"><FaCog /></span>
                Settings
              </div>

              <hr /> */}

              <div className="profile-menu-item1 logout" onClick={handleLogout}>
                <span className="profile-menu-item1-icon"><FaSignOutAlt /></span>
                Logout
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
