// src/components/Admin/Dashboard/MailDetail.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";  // ADD THIS AT TOP

import "../../../styles/Admin/Dashboard/MailDetail.css";

const API_BASE = "http://localhost:8000";
const FROM_EMAIL = "s.v.k23105@gmail.com";
const formatReadableDate = (timestamp) => {
const dt = new Date(timestamp.replace(" ", "T"));
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
};

const MailDetail = () => {
  const { mailId } = useParams();
  const navigate = useNavigate();
  const [mail, setMail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/sent_mails/${mailId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mail) {
          setMail(data.mail);
        } else {
          setError("Mail not found");
        }
      })
      .catch(() => setError("Error fetching mail"))
      .finally(() => setLoading(false));
  }, [mailId]);

  if (loading) {
    return <div className="mail-detail-page">Loading...</div>;
  }

  if (error || !mail) {
    return (
      <div className="mail-detail-page">
        <button className="Mail-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <p className="error-text">{error || "Mail not found."}</p>
      </div>
    );
  }

  return (
    <div className="mail-detail-page">


      <div className="mail-card">
        {/* Header: Subject + meta */}
        <button className="Mail-back-btn" onClick={() => navigate(-1)}>
         ← 
         </button>
        <div className="mail-card-header">
          <h2 className="mail-subject">{mail.subject || "(No subject)"}</h2>
<div className="mail-meta-row">
        <FaUserCircle className="mail-avatar-icon" />
        <div className="mail-IDS">
              <div className="mail-from-id">
                <strong>From:</strong> {FROM_EMAIL}
              </div>
              <div>
                <strong>To:</strong> {mail.to_email}
              </div>
            </div>
            <div className="mail-date">{formatReadableDate(mail.timestamp)}</div>
          </div>
        </div>

        {/* Message */}
        <div className="mail-card-section">
          <h4>Message</h4>
          <div className="mail-message-box">
            {mail.message?.split("\n").map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
        </div>

        {/* Employee Details */}
        <div className="mail-card-section">
          <h4>Employee Details</h4>
          <div className="employee-card">
            <div>
              <strong>Name:</strong> {mail.employee_name}
            </div>
            <div>
              <strong>Employee ID:</strong> {mail.employee_id}
            </div>
            <div>
              <strong>Email:</strong> {mail.to_email}
            </div>
          </div>
        </div>
      </div>
  );
};

export default MailDetail;
