import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../../styles/EmployeeHome/EmpDashboard/EmployeeDashboard.css";
import EmployeeLayout from "./EmployeeLayout";
import NotificationBell from "./NotificationBell";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

   const [employee, setEmployee] = useState({});
   const [documents, setDocuments] = useState([]);
   const [error, setError] = useState("");
   const [profileImage, setProfileImage] = useState(null);
   const [currentDate, setCurrentDate] = useState(new Date());

  const emp_id = localStorage.getItem("emp_id");

  // Calendar navigation functions
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  /* -----------------------------------------------------
     PROFILE COMPLETION CALCULATOR
  ----------------------------------------------------- */
   const calculateCompletion = (employee) => {
     // Handle case where employee is empty object
     if (!employee || Object.keys(employee).length === 0) {
       return { percent: 0, pending: 0 };
     }
     
     let total = 0;
     let filled = 0;

     const check = (value) => {
       if (value !== null && value !== "" && value !== undefined) filled++;
       total++;
     };

     check(employee.first_name);
     check(employee.last_name);
     check(employee.email);
     check(employee.department);
     check(employee.position);
     check(employee.date_of_join);
     check(employee.status);

     if (employee.personal_info) {
       check(employee.personal_info.gender);
       check(employee.personal_info.dob);
       check(employee.personal_info.contact_number);
       check(employee.personal_info.Nationality);
       check(employee.personal_info.Martial_status);
       check(employee.personal_info.temporary_address);
       check(employee.personal_info.permanent_address);
     }

     if (employee.personal_info?.emergency_contact) {
       const ec = employee.personal_info.emergency_contact;
       check(ec.contact_name);
       check(ec.relationship);
       check(ec.contact_number);
       check(ec.contact_Address);
     }

     if (employee.personal_info?.education?.undergraduate) {
       const ug = employee.personal_info.education.undergraduate;
       check(ug.degree_name);
       check(ug.university);
       check(ug.year_of_completion);
       check(ug.percentage_or_cgpa);
     }

     if (employee.personal_info?.bank_details) {
       const bd = employee.personal_info.bank_details;
       check(bd.account_holder_name);
       check(bd.bank_name);
       check(bd.branch_name);
       check(bd.ifsc);
       check(bd.account_number);
     }

     const percent = Math.round((filled / total) * 100);
     const pending = total - filled;
     return { percent, pending };
   };

  /* -----------------------------------------------------
     FETCH EMPLOYEE PROFILE DATA
  ----------------------------------------------------- */
  const fetchEmployee = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/admin/employees/${emp_id}`);
      const data = res.data;
      setEmployee(data);
    } catch (err) {
      console.error("Employee fetch error:", err);
      setError("Failed to fetch employee data.");
    }
  }, [emp_id]);

  /* -----------------------------------------------------
     FETCH DOCUMENTS FROM EMPLOYEE_DOCUMENTS TABLE
  ----------------------------------------------------- */
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/all_documents`);
      const data = await res.json();

      const rawDocs = (data.documents || []).filter((d) => d.emp_id === emp_id);

      setDocuments(rawDocs);

      const profileDoc = rawDocs.find(
        (d) =>
          d.document_category === "profile_photo" &&
          d.document_sub_category === "profile_photo" &&
          d.document_status === "verified"
      );

      if (profileDoc?.document_url) {
        setProfileImage(`http://localhost:8000/${profileDoc.document_url.replace(/\\/g, "/")}`);
      }
    } catch (err) {
      console.error("Documents fetch error:", err);
    }
   }, [emp_id]);

    /* -----------------------------------------------------
       LOAD ALL DATA ON MOUNT
   ----------------------------------------------------- */
   useEffect(() => {
     if (!emp_id) {
       setError("No employee ID found. Please login again.");
       return;
     }

     const loadAll = async () => {
       await Promise.all([fetchEmployee(), fetchDocuments()]);
     };

     loadAll();
   }, [emp_id, fetchEmployee, fetchDocuments]);

  /* -----------------------------------------------------
     DOCUMENT STATS
  ----------------------------------------------------- */
  const getDocumentCounts = (docs) => {
    if (!docs || docs.length === 0) {
      return { total: 0, approved: 0, rejected: 0, pending: 0 };
    }

    let approved = 0;
    let rejected = 0;
    let pending = 0;

    docs.forEach((doc) => {
      if (doc.document_category === "profile_photo") return;

      const status = doc.document_status?.toLowerCase();
      if (status === "verified" || status === "approved") approved++;
      else if (status === "rejected") rejected++;
      else pending++;
    });

    return { total: docs.length, approved, rejected, pending };
  };

  /* -----------------------------------------------------
     DOCUMENT NOTIFICATION
  ----------------------------------------------------- */
  useEffect(() => {
    if (!documents.length) return;

    const newStats = getDocumentCounts(documents);
    const oldStats = JSON.parse(localStorage.getItem("doc_stats"));

    if (oldStats) {
      if (oldStats.approved !== newStats.approved || oldStats.rejected !== newStats.rejected) {
        // Notification state removed - kept for localStorage tracking
      }
    }

    localStorage.setItem("doc_stats", JSON.stringify(newStats));
  }, [documents]);

  
   /* -----------------------------------------------------
      EARLY RETURNS
  ----------------------------------------------------- */
  if (error) return <h2 style={{ padding: "20px", color: "red" }}>{error}</h2>;
  if (!employee) return <h2>No employee data found.</h2>;

  const docStats = getDocumentCounts(documents);
  const { percent, pending } = calculateCompletion(employee);

  /* -----------------------------------------------------
     UI
  ----------------------------------------------------- */
  return (
    <EmployeeLayout>
      <div className="emp-dash-main-content">
        {/* ================= HERO / PROFILE CARD ================= */}
        <div className="emp-dash-hero-card">
          <div className="emp-dash-hero-avatar">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="emp-dash-hero-avatar-img"
                onError={() => setProfileImage(null)}
              />
            ) : (
              <div className="emp-dash-hero-avatar-fallback">
                {((employee.first_name?.charAt(0) || "") + (employee.last_name?.charAt(0) || "")).toUpperCase()}
              </div>
            )}
          </div>
          <div className="emp-dash-hero-content">
            <h1 className="emp-dash-hero-title">
              Welcome back, {employee.first_name} {employee.last_name}
            </h1>
            <p className="emp-dash-hero-subtitle">
              {employee.position} • {employee.department}
            </p>
            <div className="emp-dash-hero-badge">
              <span className={`emp-dash-hero-badge-dot ${employee.status === "Active" ? "active" : "inactive"}`}></span>
              {employee.status}
            </div>
          </div>
          {/* Notification Bell */}
          <div className="emp-dash-hero-notification">
            <NotificationBell empId={emp_id} />
          </div>
        </div>

        {/* ================= STAT CARDS (ROW) ================= */}
        <div className="emp-dash-stats-row">
          <div className="emp-dash-stat-card">
            <div className="emp-dash-stat-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="emp-dash-stat-info">
              <p className="emp-dash-stat-label">Employee ID</p>
              <h3 className="emp-dash-stat-value">{employee.emp_id}</h3>
            </div>
          </div>

          <div className="emp-dash-stat-card">
            <div className="emp-dash-stat-icon purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div className="emp-dash-stat-info">
              <p className="emp-dash-stat-label">Profile Complete</p>
              <h3 className="emp-dash-stat-value">{percent}%</h3>
              <p className="emp-dash-stat-meta">{pending} fields pending</p>
            </div>
            <div className="emp-dash-stat-progress">
              <div className="emp-dash-stat-progress-bar" style={{ width: `${percent}%` }}></div>
            </div>
          </div>

          <div className="emp-dash-stat-card">
            <div className="emp-dash-stat-icon green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div className="emp-dash-stat-info">
              <p className="emp-dash-stat-label">Documents</p>
              <h3 className="emp-dash-stat-value">{docStats.approved}/{docStats.total}</h3>
              <p className="emp-dash-stat-meta">
                <span style={{ color: "var(--success)" }}>{docStats.approved} approved</span> • {docStats.pending} pending
              </p>
            </div>
          </div>

          <div className="emp-dash-stat-card">
            <div className="emp-dash-stat-icon orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div className="emp-dash-stat-info">
              <p className="emp-dash-stat-label">Joined Date</p>
              <h3 className="emp-dash-stat-value">
                {employee.date_of_join ? new Date(employee.date_of_join).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
              </h3>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM GRID: Calendar + Quick Links ================= */}
        <div className="emp-dash-bottom-grid">
          {/* CALENDAR */}
          <div className="emp-dash-cal-card">
            <div className="emp-dash-cal-header">
              <h3>Company Calendar</h3>
              <div className="emp-dash-cal-nav">
                <button onClick={goToPrevMonth} aria-label="Previous month">‹</button>
                <span className="emp-dash-cal-month">
                  {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
                </span>
                <button onClick={goToNextMonth} aria-label="Next month">›</button>
              </div>
            </div>
            <div className="emp-dash-cal-grid">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="emp-dash-cal-weekday">{d}</div>
              ))}
              {(() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
                const cells = [];
                for (let i = 0; i < firstDay; i++) cells.push(<div key={`e${i}`} className="emp-dash-cal-day empty"></div>);
                for (let d = 1; d <= daysInMonth; d++) {
                  const isToday = isCurrentMonth && d === today.getDate();
                  cells.push(<div key={d} className={`emp-dash-cal-day ${isToday ? "today" : ""}`}>{d}</div>);
                }
                return cells;
              })()}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="emp-dash-links-card">
            <h3>Quick Actions</h3>
            <div className="emp-dash-links-list">
              <button className="emp-dash-link-btn" onClick={() => navigate("/employee/ProfilePage")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                My Profile
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
              </button>
              <button className="emp-dash-link-btn" onClick={() => navigate("/employee/MyDocuments")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                My Documents
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
              </button>
            </div>

            <div className="emp-dash-info-box">
              <h4>Employee Info</h4>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Position:</strong> {employee.position}</p>
              <p><strong>Email:</strong> {employee.email}</p>
            </div>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;