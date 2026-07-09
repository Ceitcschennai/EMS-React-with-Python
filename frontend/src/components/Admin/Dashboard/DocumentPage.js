import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "../../../styles/Admin/Dashboard/DocumentPage.css";
import RejectReasonModal from "./RejectReasonModal";

const API = "http://localhost:8000";

const normalizeUrl = (url) => {
  if (!url) return "";
  let clean = url.replace(/\\/g, "/");
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return `${API}/${clean}`;
};

const DocumentVerification = () => {
  const [employees, setEmployees] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [screen, setScreen] = useState("employees");
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [selectedEmpDocs, setSelectedEmpDocs] = useState([]);
  const [search, setSearch] = useState("");
  const [docFilter, setDocFilter] = useState("all");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [pendingReject, setPendingReject] = useState(null);
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState("Active");

  useEffect(() => {
    loadEmployees();
    loadAllDocuments();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/employees`);
      // setEmployees(res.data.filter(emp => emp.status === "Active")|| []);
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Employees Fetch Error:", err);
    }
  };

  const loadAllDocuments = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/all_documents`);
      const docs = res.data?.documents || [];
      setAllDocuments(docs);
    } catch (err) {
      console.error("Documents Fetch Error:", err);
    }
  };

  // ✅ Filter from allDocuments — no API call needed
  const loadEmployeeDocs = (emp_id) => {
    const empDocs = allDocuments.filter((d) => d.emp_id === emp_id);
    setSelectedEmpDocs(empDocs);
  };

  

  // ✅ Exclude profile_photo from per-employee count
  const countEmployeeDocs = (emp_id) =>
    allDocuments.filter((d) => d.emp_id === emp_id && d.document_category !== "profile_photo").length;

  
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim().toLowerCase();
      const q = search.toLowerCase();

      const matchesSearch =
        fullName.includes(q) ||
        emp.emp_id?.toLowerCase().includes(q) ||
        emp.department?.toLowerCase().includes(q) ||
        emp.position?.toLowerCase().includes(q);

      const matchesStatus =
        employeeStatusFilter === "All"
          ? true
          : emp.status === employeeStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, search, employeeStatusFilter]);


  // ✅ Exclude profile_photo from docList screen
  const filteredDocs = useMemo(() => {

    const employeeIds = filteredEmployees.map(emp => emp.emp_id);

    const enriched = allDocuments
      .filter(doc =>
          employeeIds.includes(doc.emp_id) &&
          doc.document_category !== "profile_photo"
      )
      .map((doc) => {
        const emp = employees.find((e) => e.emp_id === doc.emp_id);
        const fullName = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : doc.emp_id;
        return {
          ...doc,
          full_name: fullName,
          first_name: emp?.first_name || "",
          last_name: emp?.last_name || "",
          department: emp?.department || "",
          position:   emp?.position  || "",
          file_url:   normalizeUrl(doc.document_url),
        };
      });
    if (docFilter === "all") return enriched;
    return enriched.filter((d) => d.document_status === docFilter);
  }, [docFilter, allDocuments, employees, filteredEmployees]);

  

  const counts = useMemo(() => {

    // Employee IDs based on current filter
    const employeeIds = filteredEmployees.map(emp => emp.emp_id);

    // Documents belonging only to those employees
    const filteredDocuments = allDocuments.filter(doc =>
      employeeIds.includes(doc.emp_id) &&
      doc.document_category !== "profile_photo"
    );

    return {
      totalEmployees: filteredEmployees.length,

      pending: filteredDocuments.filter(
        doc => doc.document_status === "pending"
      ).length,

      verified: filteredDocuments.filter(
        doc => doc.document_status === "verified"
      ).length,

      rejected: filteredDocuments.filter(
        doc => doc.document_status === "rejected"
      ).length,
    };

  }, [filteredEmployees, allDocuments]);


  /* ============================================================
      APPROVE / REJECT
  ============================================================ */
  const handleApprove = async (empId, category, docKey) => {
    try {
      const formData = new FormData();
      formData.append("emp_id", empId);
      formData.append("document_type", `${category}.${docKey}`);
      formData.append("status", "verified");

      await axios.post(`${API}/api/admin/verify_document`, formData);

      // Reload all documents
      const res = await axios.get(`${API}/api/admin/all_documents`);
      const updatedDocs = res.data?.documents || [];
      setAllDocuments(updatedDocs);

      // Re-filter selected employee docs from fresh data
      if (screen === "employeeDocs" && selectedEmp) {
        setSelectedEmpDocs(updatedDocs.filter((d) => d.emp_id === selectedEmp.emp_id));
      }

    } catch (err) {
      console.error("Error updating document:", err);
      window.alert("Update Failed: Failed to update document status.");
    }
  };

  const handleReject = (empId, category, docKey) => {
    setPendingReject({ empId, category, docKey });
    setRejectModalOpen(true);
  };

  const confirmReject = async (reason) => {
    if (!pendingReject) return;
    
    setRejectLoading(true);
    try {
      const formData = new FormData();
      formData.append("emp_id", pendingReject.empId);
      formData.append("document_type", `${pendingReject.category}.${pendingReject.docKey}`);
      formData.append("status", "rejected");
      formData.append("remarks", reason);

      await axios.post(`${API}/api/admin/verify_document`, formData);

      // Reload all documents
      const res = await axios.get(`${API}/api/admin/all_documents`);
      const updatedDocs = res.data?.documents || [];
      setAllDocuments(updatedDocs);

      // Re-filter selected employee docs from fresh data
      if (screen === "employeeDocs" && selectedEmp) {
        setSelectedEmpDocs(updatedDocs.filter((d) => d.emp_id === selectedEmp.emp_id));
      }

      setRejectModalOpen(false);
      setPendingReject(null);

    } catch (err) {
      console.error("Error updating document:", err);
      window.alert("Update Failed: Failed to update document status.");
      setRejectModalOpen(false);
      setPendingReject(null);
    } finally {
      setRejectLoading(false);
    }
  };

  const handleRejectClose = () => {
    setRejectModalOpen(false);
    setPendingReject(null);
  };

  /* ============================================================
      RENDER
  ============================================================ */
  return (
    <>
      {screen === "employees" && (
        <div className="ad-doc-container">
          {/* HEADER */}
          <div className="page-header">
            <h1 className="page-title">Employee Document Verification</h1>
            <p className="page-subtitle">Review and manage employee documents</p>
          </div>

          {/* STATS */}
         <div className="ad-doc-stats-grid">
            <div className="ad-doc-stat-card">
              <h3>{counts.totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
            <div className="ad-doc-stat-card ad-doc-yellow"
              onClick={() => { setDocFilter("pending"); setScreen("docList"); }}>
              <h3>{counts.pending}</h3>
              <p>Pending</p>
            </div>
            <div className="ad-doc-stat-card ad-doc-green"
              onClick={() => { setDocFilter("verified"); setScreen("docList"); }}>
              <h3>{counts.verified}</h3>
              <p>Verified</p>
            </div>
            <div className="ad-doc-stat-card ad-doc-red"
              onClick={() => { setDocFilter("rejected"); setScreen("docList"); }}>
              <h3>{counts.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>

          {/* SEARCH & Filter*/}
          <div className="ad-doc-filters">

            <input
              className="ad-doc-search-input"
              placeholder="Search by name, ID, department, position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="ad-doc-status-filter"
              value={employeeStatusFilter}
              onChange={(e) => setEmployeeStatusFilter(e.target.value)}
            >
              <option value="Active">Active Employees</option>
              <option value="Inactive">Inactive Employees</option>
              <option value="All">All Employees</option>
            </select>

          </div>

          {/* EMPLOYEE TABLE */}
          <div className="ad-doc-table-wrap">
            <table className="ad-doc-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Total Docs</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.emp_id}>
                    <td>
                      <b>{emp.first_name} {emp.last_name}</b><br />
                      <span className="ad-doc-id">{emp.emp_id}</span>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>
                      <span
                        className={`employee-status-badge ${
                          emp.status === "Active" ? "active" : "inactive"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td>{countEmployeeDocs(emp.emp_id)}</td>
                    <td>
                      <button
                        className="ad-doc-view-btn"
                        onClick={() => {
                          setSelectedEmp(emp);
                          loadEmployeeDocs(emp.emp_id);
                          setScreen("employeeDocs");
                        }}
                      >
                        View Documents
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {screen === "docList" && (
        <div className="ad-doc-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                {docFilter.charAt(0).toUpperCase() + docFilter.slice(1)} Documents
              </h1>
              <p className="page-subtitle">Review and manage document submissions</p>
            </div>
            <button className="ad-doc-back-btn" onClick={() => setScreen("employees")}>
              ← Back
            </button>
          </div>

          <div className="ad-doc-table1-wrap">
            <table className="ad-doc-table1">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                      No {docFilter} documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc, index) => (
                    <tr key={index}>
                      <td>
                        <b>{doc.full_name}</b><br />
                        <span className="ad-doc-id">{doc.emp_id}</span>
                      </td>
                      <td>{doc.document_category}</td>
                      <td>{doc.document_sub_category}</td>
                      <td>
                        <span className={`ad-doc-badge ${doc.document_status}`}>
                          {doc.document_status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="ad-doc-btn view"
                          onClick={() => window.open(normalizeUrl(doc.document_url), "_blank")}
                        >
                          View File
                        </button>
                      </td>
                      <td>
                        {doc.document_status === "pending" ? (
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button className="ad-doc-btn approve"
                              onClick={() => handleApprove(doc.emp_id, doc.document_category, doc.document_sub_category)}>
                              Approve
                            </button>
                            <button className="ad-doc-btn reject"
                              onClick={() => handleReject(doc.emp_id, doc.document_category, doc.document_sub_category)}>
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="ad-doc-badge done">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {screen === "employeeDocs" && selectedEmp && (
        <div className="ad-doc-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Documents of {selectedEmp.first_name} {selectedEmp.last_name}
              </h1>
              <p className="page-subtitle">Review and verify employee documents</p>
            </div>
            <button className="ad-doc-back-btn" onClick={() => setScreen("employees")}>
              ← Back
            </button>
          </div>

          <div className="ad-doc-table1-wrap">
            <table className="ad-doc-table1">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>File</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedEmpDocs.filter((doc) => doc.document_category !== "profile_photo").length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No documents uploaded yet.
                    </td>
                  </tr>
                ) : (
                  selectedEmpDocs
                    .filter((doc) => doc.document_category !== "profile_photo")
                    .map((doc, index) => (
                      <tr key={index}>
                        <td>{doc.document_category}</td>
                        <td>{doc.document_sub_category}</td>
                        <td>
                          <span className={`ad-doc-badge ${doc.document_status}`}>
                            {doc.document_status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="ad-doc-btn view"
                            onClick={() => window.open(normalizeUrl(doc.document_url), "_blank")}
                          >
                            View File
                          </button>
                        </td>
                        <td>
                          {doc.document_status === "pending" ? (
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button className="ad-doc-btn approve"
                                onClick={() => handleApprove(selectedEmp.emp_id, doc.document_category, doc.document_sub_category)}>
                                Approve
                              </button>
                              <button className="ad-doc-btn reject"
                                onClick={() => handleReject(selectedEmp.emp_id, doc.document_category, doc.document_sub_category)}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="ad-doc-badge done">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <RejectReasonModal
        isOpen={rejectModalOpen}
        onClose={handleRejectClose}
        onConfirm={confirmReject}
        loading={rejectLoading}
      />
    </>
  );
};

export default DocumentVerification;