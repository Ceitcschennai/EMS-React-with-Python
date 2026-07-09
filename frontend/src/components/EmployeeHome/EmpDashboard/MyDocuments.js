import React, { useEffect, useState, useCallback } from "react";
import {
  FaCloudUploadAlt,
  FaFileAlt,
  FaIdCard,
  FaGraduationCap,
  FaAward,
  FaBriefcase,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaChevronDown,
  FaEye,
  FaExclamationTriangle,
  FaSpinner,
  FaClipboardList,
  FaShieldAlt,
} from "react-icons/fa";
import "../../../styles/EmployeeHome/EmpDashboard/MyDocuments.css";
import EmployeeLayout from "./EmployeeLayout";

const API = "http://127.0.0.1:8000";

// ✅ Same normalization logic as the admin DocumentVerification page
const normalizeUrl = (url) => {
  if (!url) return "";
  let clean = url.replace(/\\/g, "/");
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("/")) return `${API}${clean}`;
  return `${API}/${clean}`;
};

const CATEGORY_META = {
  identity: {
    key: "identity_proofs",
    title: "Identity Proofs",
    icon: FaIdCard,
    fields: [
      { sub: "passport", label: "Passport", required: false },
      { sub: "aadhar_card", label: "Aadhar Card", required: true },
      { sub: "pan_card", label: "PAN Card", required: true },
      { sub: "driving_license", label: "Driving License", required: false },
    ],
  },
  education: {
    key: "educational_certificates",
    title: "Educational Certificates",
    icon: FaGraduationCap,
    fields: [
      { sub: "diploma_certificate", label: "Diploma", required: false },
      { sub: "degree_certificate", label: "UG", required: true },
      { sub: "postgraduate_certificate", label: "PG", required: false },
      { sub: "consolidated_marksheet", label: "Consolidated Marksheet", required: true },
      { sub: "provisional_certificate", label: "Provisional Certificate", required: true },
      { sub: "transfer_certificate", label: "Transfer Certificate", required: true },
    ],
  },
  additional: {
    key: "additional_certificates",
    title: "Additional Certificates",
    icon: FaAward,
    fields: [
      { sub: "language_certificate", label: "Language Certificate", required: false },
      { sub: "other_certificate", label: "Other Certificate", required: false },
    ],
  },
  experience: {
    key: "experience_documents",
    title: "Experience Documents",
    icon: FaBriefcase,
    fields: [
      { sub: "experience_certificate_1", label: "Experience Certificate 1", required: true },
      { sub: "experience_certificate_2", label: "Experience Certificate 2", required: true },
      { sub: "experience_certificate_3", label: "Experience Certificate 3", required: false },
      { sub: "relieving_certificate", label: "Relieving Letter", required: true },
    ],
  },
};

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
          rejection_reason: doc.rejection_reason || "",
          reviewed_at: doc.verified_at,
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

    const statusMeta = {
      "Approved": { cls: "badge-verified", Icon: FaCheckCircle, text: "Verified" },
      "Rejected": { cls: "badge-rejected", Icon: FaTimesCircle, text: "Rejected" },
      "Uploaded": { cls: "badge-pending", Icon: FaClock, text: "Pending Review" },
      "Uploading...": { cls: "badge-pending", Icon: FaSpinner, text: "Uploading..." },
      "Not Uploaded": { cls: "badge-empty", Icon: FaFileAlt, text: "Not Uploaded" },
    }[status];

    return (
      <React.Fragment key={inputId}>
        <input
          type="file"
          id={inputId}
          style={{ display: "none" }}
          accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
          onChange={(e) => handleUpload(mainKey, subKey, e)}
        />

        <div className={`emp-doc-card card-${statusMeta.cls}`}>
          <div className="emp-doc-card-top">
            <div className="emp-doc-icon-wrap">
              <FaFileAlt className="emp-doc-icon" />
            </div>
            <div className="emp-doc-name-block">
              <span className="emp-doc-name">{label}</span>
              {required && <span className="emp-doc-required-badge">Required</span>}
            </div>
          </div>

          <div className="emp-doc-card-middle">
            <span className={`emp-doc-status-badge ${statusMeta.cls}`}>
              <statusMeta.Icon
                className={status === "Uploading..." ? "spin-icon" : ""}
              />
              {statusMeta.text}
            </span>

            {status === "Rejected" && (
              <div className="emp-doc-rejection-panel">
                <FaExclamationTriangle className="reject-icon" />
                <div className="reject-content">
                  <strong>HR Feedback</strong>
                  <p>
                    {doc?.rejection_reason
                      ? doc.rejection_reason
                      : "No rejection reason was provided by the administrator."}
                  </p>
                </div>
              </div>
            )}

            {doc?.reviewed_at &&
              (doc.document_status === "verified" ||
                doc.document_status === "rejected") && (
                <div className="emp-doc-reviewed-time">
                  <FaClock className="review-icon" />
                  <span>
                    Reviewed On{" "}
                    {new Date(doc.reviewed_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
          </div>

          <div className="emp-doc-card-bottom">
            <button
              className={buttonClass}
              disabled={disabled}
              onClick={() =>
                !disabled && document.getElementById(inputId).click()
              }
            >
              {isUploading ? (
                <FaSpinner className="spin-icon" />
              ) : (
                <FaCloudUploadAlt />
              )}
              {isUploading ? " Uploading..." : ` ${buttonLabel}`}
            </button>

            {doc?.document_url && (
              <a
                href={normalizeUrl(doc.document_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="emp-doc-view-btn"
              >
                <FaEye /> View
              </a>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  /* ============================================================
        STATS (derived only — does not touch existing logic)
  ============================================================ */
  const computeCategoryStats = (catKey, fields) => {
    let verified = 0;
    let pending = 0;
    let rejected = 0;
    let total = fields.length;

    fields.forEach(({ sub }) => {
      const doc = documents?.[catKey]?.[sub];
      const status = doc?.document_status;

      if (status === "verified") verified++;
      else if (status === "pending") pending++;
      else if (status === "rejected") rejected++;
    });

    return {
      total,
      verified,
      pending,
      rejected,
    };
  };

  const totalRequiredDocuments = Object.values(CATEGORY_META).reduce(
  (count, cat) => count + cat.fields.filter(field => field.required).length,
  0
);

  const requiredVerified = Object.values(CATEGORY_META).reduce((count, cat) => {
    cat.fields
      .filter(field => field.required)
      .forEach(({ sub }) => {
        const doc = documents?.[cat.key]?.[sub];

        if (doc?.document_status === "verified") {
          count++;
        }
      });

    return count;
  }, 0);

  const totalDocuments = Object.values(CATEGORY_META).reduce(
    (count, cat) => count + cat.fields.length,
    0
  );

  const overallStats = Object.values(CATEGORY_META).reduce(
    (acc, cat) => {
      const stats = computeCategoryStats(cat.key, cat.fields);

      acc.verified += stats.verified;
      acc.pending += stats.pending;
      acc.rejected += stats.rejected;

      return acc;
    },
    {
      verified: 0,
      pending: 0,
      rejected: 0,
    }
  );

  const completionPct =
  totalRequiredDocuments > 0
    ? Math.round((requiredVerified / totalRequiredDocuments) * 100)
    : 0;

  const completionHint =
    completionPct === 100
      ? "All documents verified. You're all set!"
      : completionPct === 0
      ? "Let's get started — upload your documents."
      : "Great start! Keep uploading.";

  /* ============================================================
        RENDER
  ============================================================ */
  return (
    <EmployeeLayout>
      <div className="emp-doc-wrapper">
        <div className="emp-doc-container">

          <h1 className="emp-doc-page-title">My Documents</h1>
          <p className="emp-doc-page-subtitle">
            Manage and track all your employment documents
          </p>

          {/* OVERVIEW: donut completion card + 5 pastel stat tiles */}
          <div className="emp-doc-overview-row">
            <div className="ov-card ov-completion">
              <div className="ov-completion-top">
                <div
                  className="ov-donut"
                  style={{
                    background: `conic-gradient(var(--doc-primary) ${completionPct}%, #ede9fe ${completionPct}% 100%)`,
                  }}
                >
                  <div className="ov-donut-hole" />
                </div>
                <span className="ov-label">
                  Overall Required Documents Completion
                </span>
              </div>
              <span className="ov-completion-value">{completionPct}%</span>
              <div className="ov-completion-track">
                <div
                  className="ov-completion-fill"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="ov-completion-hint">{completionHint}</span>
            </div>

            <div className="ov-card ov-total-documents">
              <div className="ov-icon-wrap">
                <FaFileAlt />
              </div>
              <span className="ov-label">Total Documents</span>
              <span className="ov-value">{totalDocuments}</span>
              <span className="ov-accent-bar" />
            </div>

            <div className="ov-card ov-required">
              <div className="ov-icon-wrap">
                <FaClipboardList />
              </div>
              <span className="ov-label">Total Required Documents</span>
              <span className="ov-value">{totalRequiredDocuments}</span>
              <span className="ov-accent-bar" />
            </div>

            <div className="ov-card ov-verified">
              <div className="ov-icon-wrap">
                <FaShieldAlt />
              </div>
              <span className="ov-label">Verified Documents</span>
              <span className="ov-value">{overallStats.verified}</span>
              <span className="ov-accent-bar" />
            </div>

            <div className="ov-card ov-pending">
              <div className="ov-icon-wrap">
                <FaClock />
              </div>
              <span className="ov-label">Pending Review Documents</span>
              <span className="ov-value">{overallStats.pending}</span>
              <span className="ov-accent-bar" />
            </div>

            <div className="ov-card ov-rejected">
              <div className="ov-icon-wrap">
                <FaTimesCircle />
              </div>
              <span className="ov-label">Rejected Documents</span>
              <span className="ov-value">{overallStats.rejected}</span>
              <span className="ov-accent-bar" />
            </div>
          </div>

          {/* CATEGORIES */}
          {Object.entries(CATEGORY_META).map(([sectionKey, cat]) => {
            const stats = computeCategoryStats(cat.key, cat.fields);
            const isOpen = open[sectionKey];
            const Icon = cat.icon;

            return (
              <div className="emp-category-card" key={sectionKey}>
                <div
                  className="emp-category-header"
                  onClick={() => toggleSection(sectionKey)}
                >
                  <div className="emp-category-header-left">
                    <div className="emp-category-icon-wrap">
                      <Icon />
                    </div>
                    <div>
                      <h3>{cat.title}</h3>
                      <div className="emp-category-mini-stats">
                        <span>{stats.total} total</span>
                        <span className="dot">•</span>
                        <span className="mini-verified">{stats.verified} verified</span>
                        <span className="dot">•</span>
                        <span className="mini-pending">{stats.pending} pending</span>
                        <span className="dot">•</span>
                        <span className="mini-rejected">{stats.rejected} rejected</span>
                      </div>
                    </div>
                  </div>
                  <FaChevronDown
                    className={`emp-category-arrow ${isOpen ? "open" : ""}`}
                  />
                </div>

                <div className={`emp-doc-grid-wrap ${isOpen ? "open" : ""}`}>
                  <div className="emp-doc-grid">
                    {cat.fields.map(({ sub, label, required }) =>
                      renderCard(cat.key, sub, label, required)
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmpMyDocuments;