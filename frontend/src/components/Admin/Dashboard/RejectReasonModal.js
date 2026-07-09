import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import "./RejectReasonModal.css";

const suggestedReasons = [
  "Blurred document",
  "Wrong document uploaded",
  "Expired document",
  "Missing pages",
  "Incorrect information",
  "Other",
];

const RejectReasonModal = ({ isOpen, onClose, onConfirm, title = "Reject Document", loading = false }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
      document.body.style.overflow = "hidden";
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    if (reason.trim().length > 300) {
      setError("Reason must be 300 characters or less");
      return;
    }
    onConfirm(reason.trim());
  };

  const handleChipClick = (suggestion) => {
    setReason(suggestion);
    setError("");
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="reject-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className="reject-modal-container" ref={modalRef}>
        <div className="reject-modal-header">
          <div className="reject-modal-title-section">
            <AlertCircle className="reject-modal-icon" />
            <h2 id="reject-modal-title" className="reject-modal-title">{title}</h2>
          </div>
          <button className="reject-modal-close" onClick={onClose} disabled={loading}>
            <X size={20} />
          </button>
        </div>

        <div className="reject-modal-content">
          <label className="reject-modal-label">Reason for rejection</label>
          <textarea
            ref={textareaRef}
            className={`reject-modal-textarea ${error ? "error" : ""}`}
            placeholder="Enter the rejection reason..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError("");
            }}
            maxLength={300}
            rows={4}
            disabled={loading}
          />
          <div className="reject-modal-counter">
            <span className={reason.length > 250 ? "reject-counter-warning" : ""}>
              {reason.length}/300
            </span>
          </div>

          {error && (
            <div className="reject-modal-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="reject-modal-chips">
            {suggestedReasons.map((suggestion) => (
              <button
                key={suggestion}
                className={`reject-modal-chip ${reason === suggestion ? "active" : ""}`}
                onClick={() => handleChipClick(suggestion)}
                disabled={loading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="reject-modal-footer">
          <button className="reject-modal-btn cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="reject-modal-btn reject" onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <span className="reject-modal-spinner" />
                Processing...
              </>
            ) : (
              "Reject Document"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReasonModal;