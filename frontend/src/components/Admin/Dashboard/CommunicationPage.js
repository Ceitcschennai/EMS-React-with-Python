import React, { useState, useEffect } from "react";
import "../../../styles/Admin/Dashboard/CommunicationPage.css";
import { FaPaperPlane } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const API = "http://localhost:8000";

const CommunicationPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const location = useLocation();
  const [showCompose, setShowCompose] = useState(false);
  const [toInput, setToInput] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [mailSubject, setMailSubject] = useState("");
  const [mailBody, setMailBody] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [showSuggestions, setShowSuggestions] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [selectedMail, setSelectedMail] = useState(null);

  const [sentMails, setSentMails] = useState([]);

  const FIXED_FROM_EMAIL = "s.v.k23105@gmail.com";

  // ✅ Format date like Gmail
  // eslint-disable-next-line no-unused-vars
  const formatGmailDate = (timestamp) => {
    if (!timestamp) return "";
    const dt = new Date(timestamp.replace(" ", "T"));
    const now = new Date();
    const diff = now - dt;
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (diff < oneDay && dt.getDate() === now.getDate()) {
      return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } else if (diff < 2 * oneDay) {
      return "Yesterday " + dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } else if (diff < 7 * oneDay) {
      return dt.toLocaleDateString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit", hour12: true });
    } else {
      return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  };

  // ✅ Open Gmail-style mail view
  const openMailDetail = (mail) => {
    setSelectedMail(mail);
  };

  // ✅ Close mail detail modal
  // eslint-disable-next-line no-unused-vars
  const closeMailDetail = () => {
    setSelectedMail(null);
  };



  useEffect(() => {
    if (location.state?.employee) {
      const emp = location.state.employee;

      setShowCompose(true);
      setSelectedEmployee({
        id: emp.id,
        name: emp.name,
        email: emp.email
      });
      setToInput(emp.email);
    }
  }, [location.state]);



  /* ============================================================
      FETCH EMPLOYEES
  ============================================================ */
  useEffect(() => {
    fetch(`${API}/api/admin/employees`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((emp) => ({
          id: emp.emp_id,
          name: `${emp.first_name || ""} ${emp.last_name || ""}`.trim(),
          email: emp.email,
          dept: emp.department,
          status: emp.offer_letter_status
            ? emp.offer_letter_status
            : emp.status === "Active"
            ? "Pending"
            : emp.status,
        })).sort((a, b) => a.name.localeCompare(b.name));

        setEmployees(formatted);
      })
      .catch((err) => console.error("Employees fetch error:", err));
  }, []);

  /* ============================================================
      FETCH SENT MAILS
      ✅ Backend returns: { total_emails: N, emails: [...] }
      ✅ Each email has: id, emp_id, full_name, recipient_email,
         subject, body, email_type, sent_at, sent_by, status
  ============================================================ */
  const fetchSentMails = async () => {
    try {
      const res = await fetch(`${API}/api/admin/sent_mails`);
      if (!res.ok) {
        console.error("Sent mails API error:", res.status);
        setSentMails([]);
        return;
      }
      const data = await res.json();
      // ✅ Backend key is "emails" not "sent_mails"
      setSentMails(data?.emails || []);
    } catch (err) {
      console.error("Error loading sent mails:", err);
      setSentMails([]);
    }
  };

  useEffect(() => {
    fetchSentMails();
  }, []);

  /* ============================================================
       SEND OFFER LETTER
   ============================================================ */
  const sendOfferLetter = async (emp_id) => {
    try {
      const res = await fetch(
        `${API}/api/admin/dbsend_offer_letter/${emp_id}`,
        { method: "POST" }
      );

      const result = await res.json();

      if (res.ok) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === emp_id ? { ...emp, status: "Sent" } : emp
          )
        );
        window.alert("Offer Letter Sent! The offer letter has been sent successfully.");
      } else {
        window.alert("Send Failed: " + (result.detail || "Error sending offer letter."));
      }
    } catch (error) {
      console.error("Offer letter error:", error);
        window.alert("Error: Failed to send offer letter. Please try again.");
    }
  };

  /* ============================================================
      FILTERED EMPLOYEES
  ============================================================ */
  const filteredEmployees = employees
    .filter((emp) => (filter === "All" ? true : emp.status === filter))
    .filter((emp) => {
      const text = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(text) ||
        emp.id.toLowerCase().includes(text) ||
        emp.email.toLowerCase().includes(text)
      );
    });

  const totalEmployees = employees.length;
  const sentCount = employees.filter((e) => e.status === "Sent").length;
  const pendingCount = employees.filter((e) => e.status === "Pending").length;

  /* ============================================================
      COMPOSE MAIL
  ============================================================ */
  const openCompose = () => {
    setShowCompose(true);
    setSelectedEmployee(null);
    setToInput("");
    setMailSubject("");
    setMailBody("");
  };

  const closeCompose = () => setShowCompose(false);

  // eslint-disable-next-line no-unused-vars
  const toSuggestions =
    toInput.trim().length === 0
      ? []
      : employees.filter((emp) => {
          const text = toInput.toLowerCase();
          return (
            emp.name.toLowerCase().includes(text) ||
            emp.email.toLowerCase().includes(text) ||
            emp.id.toLowerCase().includes(text)
          );
        });

  // eslint-disable-next-line no-unused-vars
  const handleSelectSuggestion = (emp) => {
    setSelectedEmployee(emp);
    setToInput(emp.email);
    setShowSuggestions(false);
  };

  /* ============================================================
      SEND MAIL
      ✅ Backend schema: { emp_id, subject, body }
  ============================================================ */
  // eslint-disable-next-line no-unused-vars
  const sendMail = async () => {
    if (!selectedEmployee) {
      return window.alert("Selection Required: Please select an employee from suggestions.");
    }

    if (!mailSubject.trim() || !mailBody.trim()) {
      return window.alert("Fields Missing: Subject and message cannot be empty.");
    }

    // ✅ Matches SendEmailRequest schema exactly
    const payload = {
      emp_id: selectedEmployee.id,
      subject: mailSubject,
      body: mailBody,
    };

    try {
      const res = await fetch(`${API}/api/admin/send_custom_mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        window.alert("Mail Sent! Your message has been delivered successfully.");
        setShowCompose(false);

        // ✅ Refresh sent mails from server to get correct data
        await fetchSentMails();
      } else {
        window.alert("Send Failed: " + (result.detail || "Error sending mail."));
      }
    } catch (err) {
      console.error("Mail error:", err);
      window.alert("Error: Failed to send mail. Please try again.");
    }
  };

  /* ============================================================
      MAIL CLICK — open Gmail-style modal
  ============================================================ */
  // eslint-disable-next-line no-unused-vars
  const handleMailClick = (mail) => {
    openMailDetail(mail);
  };

  // ✅ Sort by sent_at (backend field name)
  // eslint-disable-next-line no-unused-vars
  const sortedSentMails = [...sentMails].sort((a, b) =>
    (b.sent_at || "").localeCompare(a.sent_at || "")
  );

  /* ============================================================
      UI
  ============================================================ */
  return (
    <div className="communication-page">
      <div className="communications-container">

        <h2 className="page-title">Communications</h2>
        <p className="subtitle">Send offer letters and manage email communications</p>

        {/* SUMMARY CARDS */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>{totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
          <div className="summary-card">
            <h3>{sentCount}</h3>
            <p>Offer Letters Sent</p>
          </div>
          <div className="summary-card">
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="controls-row">
          <input
            type="text"
            placeholder="Search employees..."
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="filter-buttons">
            <button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>All</button>
            <button className={filter === "Sent" ? "active" : ""} onClick={() => setFilter("Sent")}>Sent</button>
            <button className={filter === "Pending" ? "active" : ""} onClick={() => setFilter("Pending")}>Pending</button>
            <button className={filter === "Mails" ? "active" : ""} onClick={() => setFilter("Mails")}>Mails</button>
          </div>
        </div>

        {/* EMPLOYEE TABLE */}
        {(filter === "All" || filter === "Sent" || filter === "Pending") && (
          <div className="employee-table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.dept}</td>
                    <td>
                      <span className={emp.status === "Sent" ? "status sent" : "status pending"}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
{emp.status === "Pending" ? (
                          <button className="send-btn" onClick={() => sendOfferLetter(emp.id)}>
                            <FaPaperPlane /> Send Offer Letter
                          </button>
                        ) : (
                          <button className="sent-btn" disabled>
                            <FaPaperPlane /> Sent
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                      No employees found.
                    </td>
                  </tr>
                )}
                </tbody>
              </table>
            </div>
          )}

        {filter === "Mails" && (
          <div className="sent-mails-section">
            <h3 className="section-title">Mail History</h3>
            <div className="mail-history-table-wrap">
              <table className="mail-history-table">
                <thead>
                  <tr>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSentMails.map((mail) => (
                    <tr key={mail.id} onClick={() => openMailDetail(mail)} className="mail-row">
                      <td>{mail.first_name} {mail.last_name}</td>
                      <td>{mail.subject}</td>
                      <td>{formatGmailDate(mail.sent_at)}</td>
                      <td>
                        <span className={`mail-type ${mail.email_type?.toLowerCase() || "custom"}`}>
                          {mail.email_type || "Custom"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sortedSentMails.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                        No mails found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button className="compose-fab" onClick={openCompose}>✉️ Compose</button>
      </div>

      {showCompose && (
        <div className="compose-window">
          <div className="compose-header">
            <span>New Message</span>
            <button className="compose-close-icon" onClick={closeCompose}>✕</button>
          </div>
          <div className="compose-body">
            <div className="compose-field">
              <label className="compose-label">From</label>
              <div className="compose-static">{FIXED_FROM_EMAIL}</div>
            </div>
            <div className="compose-field">
              <label className="compose-label">To</label>
              <input
                type="text"
                className="compose-input"
                placeholder="Search employee..."
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
              />
              {toSuggestions.length > 0 && toInput.trim() && (
                <div className="suggestions-dropdown">
                  {toSuggestions.slice(0, 5).map((emp) => (
                    <div
                      key={emp.id}
                      className="suggestion-item"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setToInput(emp.email);
                      }}
                    >
                      <strong>{emp.name}</strong> - {emp.email}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="compose-field">
              <label className="compose-label">Subject</label>
              <input
                type="text"
                className="compose-input"
                value={mailSubject}
                onChange={(e) => setMailSubject(e.target.value)}
              />
            </div>
            <div className="compose-field">
              <label className="compose-label">Message</label>
              <textarea
                className="compose-textarea"
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
              />
            </div>
          </div>
          <div className="compose-footer">
            <button className="send-mail-btn" onClick={sendMail}>Send</button>
            <button className="close-btn" onClick={closeCompose}>Cancel</button>
          </div>
        </div>
      )}

      {selectedMail && (
        <div className="mail-detail-overlay" onClick={closeMailDetail}>
          <div className="mail-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mail-detail-header">
              <h3>{selectedMail.subject}</h3>
              <button className="mail-detail-close" onClick={closeMailDetail}>✕</button>
            </div>
            <div className="mail-detail-meta">
              <p><strong>To:</strong> {selectedMail.first_name} {selectedMail.last_name} &lt;{selectedMail.recipient_email}&gt;</p>
              <p><strong>Date:</strong> {formatGmailDate(selectedMail.sent_at)}</p>
              <p><strong>Type:</strong> {selectedMail.email_type || "Custom"}</p>
            </div>
            <div className="mail-detail-body">
              <p>{selectedMail.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationPage;