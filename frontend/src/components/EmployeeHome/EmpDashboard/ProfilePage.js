import React, { useState, useEffect, useCallback, useRef } from "react"; // ✅ added useCallback
import "../../../styles/EmployeeHome/EmpDashboard/ProfilePage.css";
import axios from "axios";
import EmployeeLayout from "./EmployeeLayout";
import { FaCheck, FaTimes  } from "react-icons/fa";
import { MdEdit } from "react-icons/md";

const API = "http://localhost:8000";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [profile, setProfile] = useState({});
  const [profileImage, setProfileImage] = useState(null);

  const emp_id = localStorage.getItem("emp_id");
  const menuRef = useRef();

  // // 🔥 EDIT FEATURE STATES
  // const [showMenu, setShowMenu] = useState(false);
  const [editingField, setEditingField] = useState(null);




  const [editData, setEditData] = useState({
    email: "",
    contact_number: "",
    marital_status: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    emergency_relationship: "",
    emergency_contact_address: "",
  });


  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };
/* ============================================================
        FETCH PROFILE PHOTO
    ============================================================ */
    const fetchProfilePhoto = useCallback(async () => {
      try {
        const res = await axios.get(`${API}/api/employee/profile-photo/${emp_id}`);
        const profile = res.data.profile_photo;

        if (profile?.document_url) {
          setProfileImage(`${API}/${profile.document_url.replace(/\\/g, "/")}`);
        }
      } catch (err) {
        console.error("Failed to fetch profile photo:", err);
      }
    }, [emp_id]);


    const startEditing = (field) => {

      setEditingField(field);

      setEditData({

          email: profile.email || "",

          contact_number: profile.contact_number || "",

          marital_status: profile.marital_status || "",

          emergency_contact_address: profile.emergency_contact_address || "",

          emergency_relationship: profile.emergency_relationship || "",

          emergency_contact_name: profile.emergency_contact_name || "",

          emergency_contact_number: profile.emergency_contact_number || ""

      });

  };

  // // 🔥 OPEN EDIT PANEL
  // const openEditPanel = () => {
  //   setEditData({
  //     email: profile.email || "",
  //     contact_number: profile.contact_number || "",
  //   });

  //   setShowEditPanel(true);
  //   setShowMenu(false);
  // };

  // 🔥 SUBMIT REQUEST
  const handleSubmit = async () => {
    try {
      const payload = {
        emp_id,
      };

      switch (editingField) {
        case "email":
          payload.email = editData.email;
          break;

        case "contact_number":
          payload.phone = editData.contact_number;
          break;

        case "marital_status":
          payload.marital_status = editData.marital_status;
          break;

        case "emergency_contact_name":
          payload.emergency_contact_name =
            editData.emergency_contact_name;
          break;

        case "emergency_contact_number":
          payload.emergency_contact_number =
            editData.emergency_contact_number;
          break;

        case "emergency_relationship":
          payload.emergency_relationship =
            editData.emergency_relationship;
          break;

        case "emergency_contact_address":
          payload.emergency_contact_address =
            editData.emergency_contact_address;
          break;

        default:
          return;
      }

      const res = await axios.post(
        `${API}/api/employee/request_update`,
        payload
      );

      alert(res.data.message);

      setEditingField(null);

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.detail ||
        "Failed to send request."
      );
    }
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setShowMenu(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  /* ============================================================
        LOAD EMPLOYEE PROFILE DATA
  ============================================================ */
   useEffect(() => {
     if (!emp_id) {
       console.error("Employee ID missing in localStorage");
       return;
     }

     const loadAll = async () => {
       try {
         await Promise.all([
           axios.get(`${API}/api/admin/employees/${emp_id}`).then((res) => {
             setProfile(res.data);
           }),
           fetchProfilePhoto(),
         ]);
       } catch (err) {
         console.error("Failed to fetch employee data:", err);
       }
     };

     loadAll();
   }, [emp_id, fetchProfilePhoto]);

  /* ============================================================
        UPLOAD PROFILE PICTURE
  ============================================================ */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("emp_id", emp_id);
    formData.append("document_type", "profile_photo.profile_photo");
    formData.append("file", file);

    try {
      const res = await axios.post(`${API}/api/employee/upload_document`, formData);
      const data = res.data;

      if (data.error) {
        window.alert(`Upload Error: ${data.error}`);
        return;
      }

      // ✅ Show preview immediately
      setProfileImage(URL.createObjectURL(file));
      window.alert("Photo Updated! Your profile photo has been updated successfully.");

      // Refresh from server
      await fetchProfilePhoto();

    } catch (err) {
      window.alert("Upload Failed: Could not upload your photo. Please try again.");
      console.error(err);
    }
  };

  // Removed loading and profile blocking returns to allow immediate rendering
  // if (loading) return <h2 className="Pro-emp-loading">Loading...</h2>;
  // if (!profile) return <h2 className="Pro-emp-loading">No Profile Found</h2>;

   const initials = (() => {
     const first = profile?.first_name?.charAt(0) || "";
     const last = profile?.last_name?.charAt(0) || "";
     return (first + last).toUpperCase();
   })();

  return (
    <EmployeeLayout>
      <div className="Pro-emp-profile-container">
        <div className="Pro-emp-profile-wrapper">

          {/* ── SIDEBAR ── */}
          <div className="Pro-emp-sidebar" style={{ position: "relative" }}>
            <div className="Pro-emp-sidebar-menu" ref={menuRef}>

                {/*{showMenu && (
                  <div className="Pro-emp-sidebar-dropdown">
                    <button 
                      onClick={openEditPanel}
                      className="Pro-emp-dropdown-item"
                    >
                      <span>Edit Profile</span>
                    </button>
                  </div>
                )}*/}
              </div>
            <div className="Pro-emp-profile-pic-container">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="Pro-emp-profile-img"
                  onError={() => setProfileImage(null)}
                />
              ) : (
                <div className="Pro-emp-profile-initials">{initials}</div>
              )}

              <label htmlFor="uploadImage" className="Pro-emp-upload-btn">⬆</label>
              <input
                id="uploadImage"
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </div>

             <h3 className="Pro-emp-profile-name">{profile?.first_name || ''} {profile?.last_name || ''}</h3>

            <div className="Pro-emp-profile-info-box">
              <p>{editingField === "email" ? (
                  <div className="inline-edit">

                    <input
                        name="email"
                        value={editData.email}
                        onChange={handleChange}
                    />

                    <button
                        className="save-btn"
                        onClick={handleSubmit}
                    >
                        <FaCheck />
                    </button>

                    <button
                        className="cancel-btn1"
                        onClick={() => setEditingField(null)}
                    >
                        <FaTimes />
                    </button>

                </div>
              ) : (
                  <>
                      <span>{profile.email}</span>

                      <button
                        className="edit-btn"
                        onClick={() => startEditing("email")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </>
              )}</p>
              <p>{editingField === "contact_number" ? (
                  <div className="inline-edit">

                    <input
                        name="contact_number"
                        value={editData.contact_number}
                        onChange={handleChange}
                    />

                    <button
                        className="save-btn"
                        onClick={handleSubmit}
                    >
                        <FaCheck />
                    </button>

                    <button
                        className="cancel-btn1"
                        onClick={() => setEditingField(null)}
                    >
                        <FaTimes />
                    </button>

                </div>
              ) : (
                  <>
                      <span>{profile.contact_number}</span>

                      <button
                        className="edit-btn"
                        onClick={() => startEditing("contact_number")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </>
              )}</p>
              <p><span>📅</span> Joined: {profile.date_of_join || "—"}</p>
            </div>

          </div>

          {/* ── RIGHT CONTENT ── */}
          <div className="Pro-emp-content">

            <div className="Pro-emp-tabs">
              {["personal", "address", "employment", "salary", "bank"].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "Pro-emp-active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* ── PERSONAL TAB ── */}
            {activeTab === "personal" && (
              <div className="Pro-emp-tab-content">
                <div className="Pro-emp-card">

                  <h4 className="Pro-emp-section-title">Personal Information</h4>
                  <div className="Pro-emp-row">
                    <div><label>Name</label><p>{profile?.first_name || ''} {profile?.last_name || ''}</p></div>
             <div><label>Gender</label><p>{profile?.gender || "—"}</p></div>
             <div><label>Date of Birth</label><p>{profile?.dob || "—"}</p></div>
             <div><label>Nationality</label><p>{profile?.nationality || "—"}</p></div>
             <div className="profile-field">

                <div className="profile-field-header">

                    <label>MARITAL STATUS</label>

                    <button
                        className="edit-btn"
                        onClick={() => startEditing("marital_status")}
                    >
                        <MdEdit size={15} />
                    </button>

                </div>

                <p>
                    {editingField === "marital_status" ? (
                        <div className="inline-edit">

                            <select
                                name="marital_status"
                                value={editData.marital_status}
                                onChange={handleChange}
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                            </select>

                            <button
                                className="save-btn"
                                onClick={handleSubmit}
                            >
                                <FaCheck />
                            </button>

                            <button
                                className="cancel-btn1"
                                onClick={() => setEditingField(null)}
                            >
                                <FaTimes />
                            </button>

                        </div>
                    ) : (
                        profile.marital_status
                    )}
                </p>

            </div>
             <div><label>Contact Number</label><p>{profile?.contact_number || "—"}</p></div>
                  </div>

                  <hr />

                  <h4 className="Pro-emp-section-title">Emergency Contact</h4>
                  <div className="Pro-emp-row">
             <div className="profile-field">
                  <div className="profile-field-header">

                    <label>Emergency Contact Name</label>

                    <button
                        className="edit-btn"
                        onClick={() => startEditing("emergency_contact_name")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </div>
                    <p>
                        {editingField === "emergency_contact_name" ? (
                            <div className="inline-edit">

                              <input
                                  name="emergency_contact_name"
                                  value={editData.emergency_contact_name}
                                  onChange={handleChange}
                              />

                              <button
                                  className="save-btn"
                                  onClick={handleSubmit}
                              >
                                  <FaCheck />
                              </button>

                              <button
                                  className="cancel-btn1"
                                  onClick={() => setEditingField(null)}
                              >
                                  <FaTimes />
                              </button>

                          </div>
              ) : (
                  profile.emergency_contact_name
              )}</p></div>
             <div className="profile-field">
                  <div className="profile-field-header">

                    <label>Relationship</label>

                    <button
                        className="edit-btn"
                        onClick={() => startEditing("emergency_relationship")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </div>
                    <p>
                        {editingField === "emergency_relationship" ? (
                            <div className="inline-edit">

                              <input
                                  name="emergency_relationship"
                                  value={editData.emergency_relationship}
                                  onChange={handleChange}
                              />

                              <button
                                  className="save-btn"
                                  onClick={handleSubmit}
                              >
                                  <FaCheck />
                              </button>

                              <button
                                  className="cancel-btn1"
                                  onClick={() => setEditingField(null)}
                              >
                                  <FaTimes />
                              </button>

                          </div>
              ) : (
                  profile.emergency_relationship
              )}</p></div>

             <div className="profile-field">
                  <div className="profile-field-header">
                    <label>Phone</label>
                    <button
                        className="edit-btn"
                        onClick={() => startEditing("emergency_contact_number")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </div>
                    <p>
                        {editingField === "emergency_contact_number" ? (
                            <div className="inline-edit">

                              <input
                                  name="emergency_contact_number"
                                  value={editData.emergency_contact_number}
                                  onChange={handleChange}
                              />

                              <button
                                  className="save-btn"
                                  onClick={handleSubmit}
                              >
                                  <FaCheck />
                              </button>

                              <button
                                  className="cancel-btn1"
                                  onClick={() => setEditingField(null)}
                              >
                                  <FaTimes />
                              </button>

                          </div>
              ) : (
                  profile.emergency_contact_number
              )}</p></div>
             <div className="profile-field">
                  <div className="profile-field-header">
                    <label>Address</label>
                    <button
                        className="edit-btn"
                        onClick={() => startEditing("emergency_contact_address")}
                    >
                        <MdEdit size={15} />
                    </button>
                  </div>
                    <p>
                        {editingField === "emergency_contact_address" ? (
                            <div className="inline-edit">

                              <input
                                  name="emergency_contact_address"
                                  value={editData.emergency_contact_address}
                                  onChange={handleChange}
                              />

                              <button
                                  className="save-btn"
                                  onClick={handleSubmit}
                              >
                                  <FaCheck />
                              </button>

                              <button
                                  className="cancel-btn1"
                                  onClick={() => setEditingField(null)}
                              >
                                  <FaTimes />
                              </button>

                          </div>
              ) : (
                  profile.emergency_contact_address
              )}</p></div>
                  </div>

                  <hr />

                  <h4 className="Pro-emp-section-title">Education — Undergraduate</h4>
                  <div className="Pro-emp-row">
             <div><label>Degree</label><p>{profile?.undergraduate_name || "—"}</p></div>
             <div><label>University</label><p>{profile?.undergraduate_university || "—"}</p></div>
             <div><label>Year</label><p>{profile?.undergraduate_year_of_completion || "—"}</p></div>
             <div><label>Grade</label><p>{profile?.undergraduate_percentage_or_cgpa || "—"}</p></div>
                  </div>

                   {profile?.PostGraduate_degree_name && (
                     <>
                       <hr />
                       <h4 className="Pro-emp-section-title">Education — Postgraduate</h4>
                       <div className="Pro-emp-row">
                         <div><label>PG Degree</label><p>{profile?.PostGraduate_degree_name || "—"}</p></div>
                         <div><label>PG University</label><p>{profile?.PostGraduate_university || "—"}</p></div>
                         <div><label>PG Year</label><p>{profile?.PostGraduate_year_of_completion || "—"}</p></div>
                         <div><label>PG Grade</label><p>{profile?.PostGraduate_percentage_or_cgpa || "—"}</p></div>
                       </div>
                     </>
                   )}

                  <hr />

                  <h4 className="Pro-emp-section-title">Education — School</h4>
                  <div className="Pro-emp-row">
             <div><label>School Name</label><p>{profile?.school_name || "—"}</p></div>
             <div><label>Board</label><p>{profile?.school_board_name || "—"}</p></div>
             <div><label>Level</label><p>{profile?.school_level || "—"}</p></div>
             <div><label>Year</label><p>{profile?.school_year_of_completion || "—"}</p></div>
             <div><label>Grade</label><p>{profile?.school_percentage || "—"}</p></div>
                  </div>

                </div>
              </div>
            )}

            {/* ── ADDRESS TAB ── */}
            {activeTab === "address" && (
              <div className="Pro-emp-tab-content">
                <div className="Pro-emp-card">

                   <h4 className="Pro-emp-section-title">Communication Address</h4>
                   <div className="Pro-emp-row">
                     <div><label>Address</label><p>{profile?.temporary_address || "—"}</p></div>
                     <div><label>State</label><p>{profile?.temporary_state || "—"}</p></div>
                     <div><label>Country</label><p>{profile?.temporary_country || "—"}</p></div>
                     <div><label>Pincode</label><p>{profile?.temporary_pincode || "—"}</p></div>
                   </div>

                  <hr />

                   <h4 className="Pro-emp-section-title">Permanent Address</h4>
                   <div className="Pro-emp-row">
                     <div><label>Address</label><p>{profile?.permanent_address || "—"}</p></div>
                     <div><label>State</label><p>{profile?.permanent_state || "—"}</p></div>
                     <div><label>Country</label><p>{profile?.permanent_country || "—"}</p></div>
                     <div><label>Pincode</label><p>{profile?.permanent_pincode || "—"}</p></div>
                   </div>

                </div>
              </div>
            )}

            {/* ── EMPLOYMENT TAB ── */}
            {activeTab === "employment" && (
              <div className="Pro-emp-tab-content">
                <div className="Pro-emp-card">
                  <h4 className="Pro-emp-section-title">Employment Information</h4>
                  <div className="Pro-emp-row">
                   <div><label>Employee ID</label><p>{profile?.emp_id || "—"}</p></div>
                     <div><label>Employment Type</label><p>{profile?.employment_type || "—"}</p></div>
                     <div><label>Department</label><p>{profile?.department || "—"}</p></div>
                     <div><label>Position</label><p>{profile?.position || "—"}</p></div>
                     <div><label>Date of Join</label><p>{profile?.date_of_join || "—"}</p></div>
                     <div>
                       <label>Status</label>
                       <p style={{ color: profile?.status === "Active" ? "green" : "red", fontWeight: "bold" }}>
                         {profile?.status || "—"}
                       </p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── SALARY TAB ── */}
            {activeTab === "salary" && (
              <div className="Pro-emp-tab-content">
                <div className="Pro-emp-card">
                  <h4 className="Pro-emp-section-title">Salary Structure</h4>
                  <div className="Pro-emp-row">
                   <div><label>Basic Salary</label><p>₹{profile?.basic_salary ?? "—"}</p></div>
                     <div><label>HRA</label><p>₹{profile?.house_rent_allowance ?? "—"}</p></div>
                     <div><label>DA</label><p>₹{profile?.dearness_allowance ?? "—"}</p></div>
                     <div><label>Travel Allowance</label><p>₹{profile?.travel_allowance ?? "—"}</p></div>
                     <div><label>Other Allowances</label><p>₹{profile?.other_allowance ?? "—"}</p></div>
                  </div>

                  <hr />

                   <div className="Pro-emp-total-ctc">
                     <span>Total CTC</span>
                     <strong>₹{profile?.total_ctc ?? "—"}</strong>
                   </div>
                </div>
              </div>
            )}

            {/* ── BANK TAB ── */}
            {activeTab === "bank" && (
              <div className="Pro-emp-tab-content">
                <div className="Pro-emp-card">
                  <h4 className="Pro-emp-section-title">Bank Details</h4>
                  <div className="Pro-emp-row">
                    <div><label>Account Holder</label><p>{profile.account_holder_name || "—"}</p></div>
                    <div><label>Bank Name</label><p>{profile.bank_name || "—"}</p></div>
                    <div><label>Branch</label><p>{profile.branch_name || "—"}</p></div>
                    <div><label>IFSC</label><p>{profile.ifsc || "—"}</p></div>
                    <div><label>Account Number</label><p>{profile.account_number || "—"}</p></div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      {/* 🔥 EDIT POPUP */}
      {/* 
      {showEditPanel && (
        <div className="edit-modal">
          <div className="edit-box">

            <h3>
              Edit Profile
            </h3>

          
            <label>Email</label>
            <input
              value={editData.email}
              onChange={(e) =>
                setEditData({ ...editData, email: e.target.value })
              }
              placeholder="Enter email"
            />

            <label>Phone Number</label>
            <input
              value={editData.contact_number}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  contact_number: e.target.value,
                })
              }
              placeholder="Enter phone number"
            />

            <div className="edit-box-actions">
              <button className="edit-save-btn" onClick={handleSubmit}>
                Send Request
              </button>

              <button 
                className="edit-cancel-btn" 
                onClick={() => setShowEditPanel(false)}
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}*/}
    </EmployeeLayout>
  );
};

export default ProfilePage;