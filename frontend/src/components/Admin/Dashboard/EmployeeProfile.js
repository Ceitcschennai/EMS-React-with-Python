import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../../styles/Admin/Dashboard/EmployeeProfile.css";

const API = "http://localhost:8000";

const EmployeeProfile = () => {
  const { emp_id } = useParams();
  const navigate = useNavigate();
   const [employee, setEmployee] = useState(null);
   const [documents, setDocuments] = useState([]);
   const [profileImage, setProfileImage] = useState(null);
   const [requestData, setRequestData] = useState(null);


   useEffect(() => {
     const req = JSON.parse(localStorage.getItem("selected_request"));

     // ✅ ONLY show if pending
     if (req && req.status === "pending") {
       setRequestData(req);
     } else {
       setRequestData(null);
       localStorage.removeItem("selected_request");
     }
   }, []);


  const fetchEmployeeDetails = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/employees/${emp_id}`);
      const data = await res.json();
      setEmployee(data);
    } catch (err) {
      console.error("Error fetching employee details:", err);
    }
  }, [emp_id]);

  /* -----------------------------------------------------
     FETCH DOCUMENTS FROM EMPLOYEE_DOCUMENTS TABLE
  ----------------------------------------------------- */
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/all_documents`);
      const data = await res.json();

      // Filter only this employee's documents
      const rawDocs = (data.documents || []).filter(
        (d) => d.emp_id === emp_id
      );

      setDocuments(rawDocs);

      // Find verified profile photo
      const profileDoc = rawDocs.find(
        (d) =>
          d.document_category === "profile_photo" &&
          d.document_sub_category === "profile_photo" &&
          d.document_status === "verified"
      );

      if (profileDoc?.document_url) {
        setProfileImage(
          `${API}/${profileDoc.document_url.replace(/\\/g, "/")}`
        );
      }
    } catch (err) {
      console.error("Documents fetch error:", err);
    }
  }, [emp_id]);

  useEffect(() => {
    const loadAll = async () => {
      await Promise.all([fetchEmployeeDetails(), fetchDocuments()]);
    };
    loadAll();
  }, [fetchEmployeeDetails, fetchDocuments]);

  if (!employee) {
    return (
      <div className="ad-emp-pro-page ad-emp-pro-loading">
        Loading employee details...
      </div>
    );
  }







  const normalizeUrl = (url) => {
    if (!url) return "";
    let clean = url.replace(/\\/g, "/");
    if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
    return `${API}/${clean}`;
  };

  const updateDocument = async (category, key, newStatus) => {
    try {
      const formData = new FormData();
      formData.append("emp_id", employee.emp_id);
      formData.append("document_type", `${category}.${key}`);
      formData.append("status", newStatus);
      formData.append("remarks", newStatus === "rejected" ? "Incorrect document" : "");
      await fetch(`${API}/api/admin/verify_document`, { method: "POST", body: formData });
      fetchEmployeeDetails();
      fetchDocuments();
    } catch (err) {
      console.error("Document update failed:", err);
      window.alert("Update Failed: Failed to update document.");
    }
  };

  const allDocs = [];
  if (documents.length > 0) {
    documents.forEach((doc) => {
      allDocs.push({
        category: doc.document_category,
        key: doc.document_sub_category,
        name: doc.document_name,
        url: normalizeUrl(doc.document_url),
        status: doc.document_status,
        remarks: doc.remarks || "",
      });
    });
  }


  const approve = async (id) => {
    const btn = document.activeElement;
    if (btn) btn.disabled = true;

    await fetch(`${API}/api/admin/approve_update/${id}`, { method: "POST" });

    window.alert("Request Approved: The employee's update request has been approved.");

    setRequestData(null);

    localStorage.removeItem("selected_request");
  };

   const reject = async (id) => {
     const btn = document.activeElement;
     if (btn) btn.disabled = true;

      const confirmed = window.confirm("Are you sure you want to reject this update request?");
      if (!confirmed) return;

     await fetch(`${API}/api/admin/reject_update/${id}`, { method: "POST" });

      window.alert("Request Rejected: The update request has been rejected.");

     setRequestData(null);

     localStorage.removeItem("selected_request");
   };

   return (
     <div className="ad-emp-pro-page">

       {/* ── BACK + TITLE ── */}
      <div className="ad-emp-pro-top-back-wrapper">
        <button className="ad-emp-pro-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="ad-emp-pro-profile-title-box">
          <h2>Employee Profile</h2>
          <p className="ad-emp-pro-last-updated">
            Profile Uploaded on : <b>{employee.profile_completed_at || "Not updated yet"}</b>
          </p>
        </div>
      </div>

      {/* ── HEADER CARD ── */}
      <div className="profile-header-card">

        <div className="profile-left">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.target.style.display = "none";
                setProfileImage(null);
              }}
            />
          ) : (
            <div className="profile-avatar">
              {employee.first_name?.charAt(0)}
            </div>
          )}
        </div>

        <div className="profile-right">

          {/* ── Single row with all info ── */}
          <div className="profile-all-info-row">
            <h2 className="profile-name">
              <span className="profile-name-emoji">🧑‍💼</span>
              {employee.first_name || ""} {employee.initial_name ? employee.initial_name + "." : ""} {employee.last_name || "—"}
            </h2>
            
            <span className="profile-separator"></span>
            
            <span className="profile-email">
              <span>📧</span> {employee.email || "—"}
            </span>
            
            <span className="profile-separator"></span>
            
            <span className="profile-id">
              <span>🪪</span> <strong>ID:</strong> {employee.emp_id || "—"}
            </span>
            
            <span className="profile-separator"></span>
            
            <span className={`profile-status ${employee.status?.toLowerCase()}`}>
              {employee.status || "—"}
            </span>
          </div>

        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="ad-emp-pro-grid">

        {/* 💼 Employment */}
        <div className="ad-emp-pro-profile-section">
          <h3>💼 Employment Details</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Type:</strong>        {employee.employment_type || "—"}</p>
            <p><strong>Department:</strong>  {employee.department || "—"}</p>
            <p><strong>Position:</strong>    {employee.position || "—"}</p>
            <p><strong>Joined Date:</strong> {employee.date_of_join || "—"}</p>
            <p><strong>Status:</strong>      {employee.status || "—"}</p>
          </div>
        </div>

        {/* 👤 Personal */}
        <div className="ad-emp-pro-profile-section">
          <h3>👤 Personal Information</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Gender:</strong>         {employee.gender || "—"}</p>
            <p><strong>Date of Birth:</strong>  {employee.dob || "—"}</p>
            <p><strong>Nationality:</strong>    {employee.nationality || "—"}</p>
            <p><strong>Marital Status:</strong> {employee.marital_status || "—"}</p>
            <p><strong>Contact:</strong>        {employee.contact_number || "—"}</p>
          </div>
        </div>

        {/* 🚨 Emergency */}
        <div className="ad-emp-pro-profile-section">
          <h3>🚨 Emergency Contact</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Name:</strong>         {employee.emergency_contact_name || "—"}</p>
            <p><strong>Relationship:</strong> {employee.emergency_relationship || "—"}</p>
            <p><strong>Phone:</strong>        {employee.emergency_contact_number || "—"}</p>
            <p><strong>Address:</strong>      {employee.emergency_contact_address || "—"}</p>
          </div>
        </div>

        {/* 🏦 Bank */}
        <div className="ad-emp-pro-profile-section">
          <h3>🏦 Bank Details</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Account Holder:</strong> {employee.account_holder_name || "—"}</p>
            <p><strong>Bank:</strong>           {employee.bank_name || "—"}</p>
            <p><strong>Branch:</strong>         {employee.branch_name || "—"}</p>
            <p><strong>IFSC:</strong>           {employee.ifsc || "—"}</p>
            <p><strong>Account No:</strong>     {employee.account_number || "—"}</p>
          </div>
        </div>

        {/* 📍 Address */}
        <div className="ad-emp-pro-profile-section">
          <h3>📍 Permanent Address</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Address:</strong> {employee.permanent_address || "—"}</p>
            <p><strong>State:</strong>   {employee.permanent_state || "—"}</p>
            <p><strong>Country:</strong> {employee.permanent_country || "—"}</p>
            <p><strong>Pincode:</strong> {employee.permanent_pincode || "—"}</p>
          </div>

          {employee.temporary_address && (
            <>
              <h3 style={{ marginTop: "18px" }}>📍 Temporary Address</h3>
              <div className="ad-emp-pro-detail-grid" style={{ marginTop: "10px" }}>
                <p><strong>Address:</strong> {employee.temporary_address || "—"}</p>
                <p><strong>State:</strong>   {employee.temporary_state || "—"}</p>
                <p><strong>Country:</strong> {employee.temporary_country || "—"}</p>
                <p><strong>Pincode:</strong> {employee.temporary_pincode || "—"}</p>
              </div>
            </>
          )}
        </div>

        {/* 🎓 Education */}
        <div className="ad-emp-pro-profile-section">
          <h3>🎓 Education</h3>
          <div className="ad-emp-pro-detail-grid">
            
                <p><strong>School:</strong>     {employee.school_name}</p>
                <p><strong>Board:</strong>      {employee.school_board_name || "—"}</p>
                <p><strong>Level:</strong>      {employee.school_level || "—"}</p>
                <p><strong>Year:</strong>       {employee.school_year_of_completion || "—"}</p>
                <p><strong>Percentage:</strong> {employee.school_percentage || "—"}</p>
              <hr />
                <p><strong>UG Degree:</strong>     {employee.undergraduate_name || "—"}</p>
                <p><strong>UG University:</strong> {employee.undergraduate_university || "—"}</p>
                <p><strong>UG Year:</strong>       {employee.undergraduate_year_of_completion || "—"}</p>
                <p><strong>UG Grade:</strong>      {employee.undergraduate_percentage_or_cgpa || "—"}</p>
              <hr />
                <p><strong>PG Degree:</strong>     {employee.PostGraduate_degree_name || "—"}</p>
                <p><strong>PG University:</strong> {employee.PostGraduate_university || "—"}</p>
                <p><strong>PG Year:</strong>       {employee.PostGraduate_year_of_completion || "—"}</p>
                <p><strong>PG Grade:</strong>      {employee.PostGraduate_percentage_or_cgpa || "—"}</p>
               
            
          </div>
        </div>

        {/* 💰 Salary */}
        <div className="ad-emp-pro-profile-section">
          <h3>💰 Salary Breakdown</h3>
          <div className="ad-emp-pro-detail-grid">
            <p><strong>Basic Salary:</strong>     ₹{employee.basic_salary ?? "—"}</p>
            <p><strong>HRA:</strong>              ₹{employee.house_rent_allowance ?? "—"}</p>
            <p><strong>DA:</strong>               ₹{employee.dearness_allowance ?? "—"}</p>
            <p><strong>Travel Allowance:</strong> ₹{employee.travel_allowance ?? "—"}</p>
            <p><strong>Other Allowance:</strong>  ₹{employee.other_allowance ?? "—"}</p>
            <p className="ad-emp-pro-highlight">
              <strong>Total CTC:</strong> ₹{employee.total_ctc ?? "—"}
            </p>
          </div>
        </div>

        {/* 📄 Documents */}
        {allDocs.length > 0 && (
          <div className="ad-emp-pro-profile-section full-width">
            <h3>📄 Uploaded Documents</h3>
            <table className="ad-doc-table1">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Document</th>
                  <th>Status</th>
                  <th>View</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allDocs.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.category}</td>
                    <td>{doc.key}</td>
                    <td>
                      <span className={`ad-doc-badge ${doc.status}`}>{doc.status}</span>
                    </td>
                    <td>
                      <button className="ad-doc-btn view" onClick={() => window.open(doc.url, "_blank")}>
                        View
                      </button>
                    </td>
                    <td>
                      {doc.status === "pending" ? (
                        <>
                          <button className="ad-doc-btn approve" onClick={() => updateDocument(doc.category, doc.key, "verified")}>Accept</button>
                          <button className="ad-doc-btn reject"  onClick={() => updateDocument(doc.category, doc.key, "rejected")}>Reject</button>
                        </>
                      ) : (
                        <span className="ad-doc-badge done">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {requestData && requestData.status === "pending" && (
          <div className="ad-edit-request-panel">
            <h4>Edit Request</h4>

            <div className="ad-edit-request-details">

              {requestData.new_email && (
                <div className="request-change-box">
                  <p><strong>Email Changed</strong></p>

                  <p>
                    <span className="old-value">
                      Old: {employee.email || "—"}
                    </span>
                  </p>

                  <p>
                    <span className="new-value">
                      New: {requestData.new_email}
                    </span>
                  </p>
                </div>
              )}

              {requestData.new_phone && (
                <div className="request-change-box">
                  <p><strong>Phone Changed</strong></p>

                  <p>
                    <span className="old-value">
                      Old: {employee.contact_number || "—"}
                    </span>
                  </p>

                  <p>
                    <span className="new-value">
                      New: {requestData.new_phone}
                    </span>
                  </p>
                </div>
              )}

            </div>

            <div className="ad-edit-request-actions">
              <button className="ad-edit-request-btn approve" onClick={() => approve(requestData.id)}>✅ Approve</button>
              <button className="ad-edit-request-btn reject" onClick={() => reject(requestData.id)}>❌ Reject</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
