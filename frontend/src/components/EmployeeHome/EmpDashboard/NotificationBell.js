import React, { useState, useEffect, useRef } from "react";
import "../../../styles/EmployeeHome/EmpDashboard/NotificationBell.css";

const NotificationBell = ({ empId }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const API = "http://localhost:8000";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API}/api/employee/notifications/${empId}`);
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).length);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [empId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeClass = (type) => {
    return type === "approved" ? "approved" : "rejected";
  };

  const getTypeIcon = (tableType) => {
    return tableType === "edit_request" ? "👤" : "📄";
  };

  const handleNotificationClick = async (notification) => {
    try {
      await fetch(`${API}/api/employee/mark_notification_read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table_type: notification.table_type,
          id: notification.id,
        }),
      });

      setNotifications((prev) =>
        prev.filter((n) => !(n.id === notification.id && n.table_type === notification.table_type))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className={`notification-bell-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>
            {notifications.length > 0 && (
              <span className="notification-count">{notifications.length} unread</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">
              <p>No unread notifications</p>
            </div>
          ) : (
            <ul className="notification-list">
              {notifications.map((notif) => (
                <li
                  key={`${notif.table_type}-${notif.id}`}
                  className={`notification-card ${getTypeClass(notif.type)}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon">{getTypeIcon(notif.table_type)}</div>
                  <div className="notification-content">
                    <h5 className="notification-title">{notif.title}</h5>
                    <p className="notification-message">{notif.message}</p>
                    {notif.reason && (
                      <div className="notification-reason">
                        <div className="notification-reason-header">
                          <span className="notification-reason-label">HR Feedback</span>
                        </div>
                        <p className="notification-reason-text">{notif.reason}</p>
                      </div>
                    )}
                    <span className="notification-date">{formatDate(notif.date)}</span>
                  </div>
                  <div className="notification-indicator"></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
