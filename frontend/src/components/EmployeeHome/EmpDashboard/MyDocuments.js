import React, { useEffect, useState, useCallback } from "react";
import { FaCloudUploadAlt, FaCertificate } from "react-icons/fa";
import "../../../styles/EmployeeHome/EmpDashboard/MyDocuments.css";
import EmployeeLayout from "./EmployeeLayout";

const API = "http://127.0.0.1:8000";

const EmpMyDocuments = () => {
  const emp_id = localStorage.getItem("emp_id");
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState(null);

  // ✅ profile section removed from open state
  const [open, setOpen] = useState({
    identity: true,
    education: false,
    additional: false,
    experience: false,
  });

  const toggleSection = (key) => {
    setOpen((prev) => {
      const newState = {};
      Object.keys(prev).forEach((k) => (newState[k] = false));
      newState[key] = !prev[key];
      return newState;
    });
  };

  /* ============================================================
        REFRESH DOCUMENTS
  ============================================================ */
  const refreshDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/all_documents`);
      const data = await res.json();

      const rawDocs = (data.documents || []).filter(
        (d) => d.emp_id === emp_id
      );

      const structured = {};
      rawDocs.forEach((doc) => {
        const category = doc.document_category;
        const subKey = doc.document_sub_category;
        if (!structured[category]) structured[category] = {};
        structured[category][subKey] = {
          document_status: doc.document_status,
          document_name: doc.document_name,
          document_url: doc.document_url,
        };
      });

      setDocuments(structured);

    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  }, [emp_id]);

  /* ============================================================
        LOAD ON MOUNT
  ============================================================ */
  useEffect(() => {
    if (emp_id) {
      refreshDocuments();
    }
  }, [emp_id, refreshDocuments]);

  /* ============================================================
        UPLOAD HANDLER
  ============================================================ */
  const handleUpload = async (mainKey, subKey, event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uploadKey = `${mainKey}.${subKey}`;

    const form = new FormData();
    form.append("emp_id", emp_id);
    form.append("document_type", uploadKey);
    form.append("file", file);

    setUploading(uploadKey);

    try {
      const res = await fetch(`${API}/api/employee/upload_document`, {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      if (data.error) {
        window.alert(`Upload Error: ${data.error}`);
        return;
      }

      if (
        data.status === "pending" &&
        data.message === "Admin needs to verify your document"
      ) {
        window.alert("Already Pending: Document is already uploaded and waiting for admin verification.");
        return;
      }

      if (data.status === "verified") {
        window.alert("Already Verified: This document is already verified. No need to upload again.");
        return;
      }

      // ✅ Optimistic UI update
      setDocuments((prev) => {
        const updated = { ...prev };
        if (!updated[mainKey]) updated[mainKey] = {};
        updated[mainKey] = { ...updated[mainKey] };
        updated[mainKey][subKey] = {
          document_status: "pending",
          document_name: file.name,
          document_url: "",
        };
        return updated;
      });

      window.alert(`Document uploaded successfully! ${data.message || ""}`.trim());
      await refreshDocuments();

    } catch (err) {
      console.error("Upload error:", err);
      window.alert("Upload Failed: Please try again later.");
    } finally {
      setUploading(null);
      event.target.value = "";
    }
  };

  /* ============================================================
        RENDER CARD
  ============================================================ */
  const renderCard = (mainKey, subKey, label, required = false) => {
    const doc = documents?.[mainKey]?.[subKey];
    const inputId = `${mainKey}-${subKey}`;
    const uploadKey = `${mainKey}.${subKey}`;
    const isUploading = uploading === uploadKey;

    let status = "Not Uploaded";
    let buttonLabel = "Upload";
    let buttonClass = "emp-doc-upload-btn";
    let disabled = false;

    if (isUploading) {
      status = "Uploading...";
      buttonLabel = "Uploading...";
      disabled = true;
    } else if (doc && doc.document_status) {
      if (doc.document_status === "pending") {
        status = "Uploaded";
        buttonLabel = "Uploaded";
        buttonClass = "emp-doc-uploaded-btn";
        disabled = true;
      } else if (doc.document_status === "verified") {
        status = "Approved";
        buttonLabel = "Approved";
        buttonClass = "emp-doc-approved-btn";
        disabled = true;
      } else if (doc.document_status === "rejected") {
        status = "Rejected";
        buttonLabel = "Re-upload";
        buttonClass = "emp-doc-reupload-btn";
        disabled = false;
      }
    }

    return (
      <React.Fragment key={inputId}>
        <input
          type="file"
          id={inputId}
          style={{ display: "none" }}
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
          onChange={(e) => handleUpload(mainKey, subKey, e)}
        />

        <div className="emp-doc-card">
          <div className="emp-doc-left">
            <div className="emp-doc-left-row">
               <FaCertificate className="emp-doc-icon" />
              <span className="emp-doc-name">
                {label}
                {required && (
                  <span style={{ color: "red", fontWeight: "bold" }}> *</span>
                )}
              </span>
            </div>

            <span
              className={`emp-doc-status-text ${
                status === "Approved"
                  ? "status-green"
                  : status === "Rejected"
                  ? "status-red"
                  : status === "Uploaded" || status === "Uploading..."
                  ? "status-blue"
                  : "status-gray"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="emp-doc-right">
              <button
                className={buttonClass}
                disabled={disabled}
                onClick={() =>
                  !disabled && document.getElementById(inputId).click()
                }
              >
                <FaCloudUploadAlt />
                {isUploading ? " Uploading..." : ` ${buttonLabel}`}
              </button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  /* ============================================================
        RENDER
  ============================================================ */
  return (
    <EmployeeLayout>
      <div className="emp-doc-wrapper">
        <div className="emp-doc-container">
          <h2 className="emp-doc-title">My Documents</h2>

          {/* ✅ PROFILE PHOTO SECTION REMOVED */}

          {/* IDENTITY PROOFS */}
          <div className="emp-section" onClick={() => toggleSection("identity")}>
            <h3>Identity Proofs</h3>
            <span className="arrow">{open.identity ? "▲" : "▼"}</span>
          </div>
          {open.identity && (
            <div className="emp-doc-grid">
              {renderCard("identity_proofs", "passport", "Passport")}
              {renderCard("identity_proofs", "aadhar_card", "Aadhar Card", true)}
              {renderCard("identity_proofs", "pan_card", "PAN Card", true)}
              {renderCard("identity_proofs", "driving_license", "Driving License")}
            </div>
          )}

          {/* EDUCATIONAL CERTIFICATES */}
          <div className="emp-section" onClick={() => toggleSection("education")}>
            <h3>Educational Certificates</h3>
            <span className="arrow">{open.education ? "▲" : "▼"}</span>
          </div>
          {open.education && (
            <div className="emp-doc-grid">
              {renderCard("educational_certificates", "diploma_certificate", "Diploma")}
              {renderCard("educational_certificates", "degree_certificate", "UG", true)}
              {renderCard("educational_certificates", "postgraduate_certificate", "PG")}
              {renderCard("educational_certificates", "consolidated_marksheet", "Consolidated Marksheet", true)}
              {renderCard("educational_certificates", "provisional_certificate", "Provisional Certificate", true)}
              {renderCard("educational_certificates", "transfer_certificate", "Transfer Certificate", true)}
            </div>
          )}

          {/* ADDITIONAL CERTIFICATES */}
          <div className="emp-section" onClick={() => toggleSection("additional")}>
            <h3>Additional Certificates</h3>
            <span className="arrow">{open.additional ? "▲" : "▼"}</span>
          </div>
          {open.additional && (
            <div className="emp-doc-grid">
              {renderCard("additional_certificates", "language_certificate", "Language Certificate")}
              {renderCard("additional_certificates", "other_certificate", "Other Certificate")}
            </div>
          )}

          {/* EXPERIENCE DOCUMENTS */}
          <div className="emp-section" onClick={() => toggleSection("experience")}>
            <h3>Experience Documents</h3>
            <span className="arrow">{open.experience ? "▲" : "▼"}</span>
          </div>
          {open.experience && (
            <div className="emp-doc-grid">
              {renderCard("experience_documents", "experience_certificate_1", "Experience Certificate 1", true)}
              {renderCard("experience_documents", "experience_certificate_2", "Experience Certificate 2", true)}
              {renderCard("experience_documents", "experience_certificate_3", "Experience Certificate 3")}
              {renderCard("experience_documents", "relieving_certificate", "Relieving Letter", true)}
            </div>
          )}

        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmpMyDocuments;