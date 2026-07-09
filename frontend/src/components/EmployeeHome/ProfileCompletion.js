import React, { useState, useRef, useEffect } from "react";
import "../../styles/EmployeeHome/ProfileCompletion.css";
import {
  FaUser,
  FaHome,
  FaPhoneAlt,
  FaGraduationCap,
  FaUniversity,
  FaStar,
  FaEdit,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const topRef = useRef(null);

  useEffect(() => {
    const status = localStorage.getItem("profile_completed");
    if (status === "true") {
      navigate("/employee/Dashboard");
    }
  }, [navigate]);

  const [activeStep, setActiveStep] = useState(1);
  const emp_id = localStorage.getItem("emp_id");

  const [formData, setFormData] = useState({
    gender: "",
    dob: "",
    contact_number: "",
    nationality: "Indian",
    martial_status: "",

    temporary_address: {
      street: "",
      city_or_town: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },

    permanent_address: {
      street: "",
      city_or_town: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },

    emergency_contact: {
      contact_name: "",
      relationship: "",
      contact_number: "",
      contact_Address: "",
    },

    education: {
      school: {
        level: "",
        school_name: "",
        board_name: "",
        year_of_completion: "",
        percentage: "",
      },
      undergraduate: {
        degree_name: "",
        university: "",
        year_of_completion: "",
        percentage_or_cgpa: "",
      },
      postgraduate: {
        degree_name: "",
        university: "",
        year_of_completion: "",
        percentage_or_cgpa: "",
      },
    },

    bank_details: {
      account_holder_name: "",
      bank_name: "",
      branch_name: "",
      ifsc: "",
      account_number: "",
    },
  });

  // ---------------------------------------------------------
  // HELPERS (NO CHANGE)
  // ---------------------------------------------------------
  const goToStep = (step) => {
    setActiveStep(step);
    setTimeout(() => {
      if (topRef.current) {
        topRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 80);
  };

  const updateNested = (path, value) => {
    const parts = path.split(".");
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const updateMain = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
  };

  const validateStep = () => {
    let valid = true;

    if (activeStep === 1) {
      if (
        !formData.gender ||
        !formData.dob ||
        !formData.marital_status ||
        !formData.contact_number
      ) valid = false;
    }

    if (!valid) {
      window.alert("Required Fields: Please fill in all required fields to continue.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const payload = {
        gender: formData.gender,
        dob: formData.dob,
        contact_number: formData.contact_number,
        nationality: formData.nationality,
        martial_status: formData.marital_status, // map here

        permanent_address: {
          address: `${formData.permanent_address.street}, ${formData.permanent_address.city_or_town}, ${formData.permanent_address.district}`,
          state: formData.permanent_address.state,
          country: formData.permanent_address.country,
          pincode: formData.permanent_address.pincode,
        },

        temporary_address: {
          address: `${formData.temporary_address.street}, ${formData.temporary_address.city_or_town}, ${formData.temporary_address.district}`,
          state: formData.temporary_address.state,
          country: formData.temporary_address.country,
          pincode: formData.temporary_address.pincode,
        },

        emergency_contact: {
          contact_name: formData.emergency_contact.contact_name,
          relationship: formData.emergency_contact.relationship,
          contact_number: formData.emergency_contact.contact_number,
          address: formData.emergency_contact.contact_Address, // fix name
        },

        education: {
          undergraduate: {
            name: formData.education.undergraduate.degree_name, // FIX
            university: formData.education.undergraduate.university,
            year_of_completion: formData.education.undergraduate.year_of_completion,
            percentage_or_cgpa: formData.education.undergraduate.percentage_or_cgpa,
          },

          postgraduate: formData.education.postgraduate.degree_name
            ? {
                degree_name: formData.education.postgraduate.degree_name,
                university: formData.education.postgraduate.university,
                year_of_completion: formData.education.postgraduate.year_of_completion,
                percentage_or_cgpa: formData.education.postgraduate.percentage_or_cgpa,
              }
            : null,

          school: {
            level: formData.education.school.level,
            school_name: formData.education.school.school_name,
            board_name: formData.education.school.board_name,
            year_of_completion: formData.education.school.year_of_completion,
            percentage: formData.education.school.percentage,
          },
        },

        bank_details: {
          account_holder_name: formData.bank_details.account_holder_name,
          bank_name: formData.bank_details.bank_name,
          branch_name: formData.bank_details.branch_name,
          ifsc: formData.bank_details.ifsc,
          account_number: formData.bank_details.account_number,
        },
      };

      const res = await fetch(
        `http://localhost:8000/api/employee/personal_info/${emp_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      const data = await res.json(); // eslint-disable-line no-unused-vars

      localStorage.setItem("profile_completed", "true");

      window.alert("Profile Complete! Your profile has been saved successfully.");
      navigate("/employee/Dashboard");

    } catch (err) {
      console.error(err);
      window.alert("Submission Failed! Something went wrong. Please try again.");
    }
  };

  const RequiredLabel = ({ children }) => (
    <label>
      {children} <span className="pro-com-required">*</span>
    </label>
  );

  const nextStep = () => {
    if (!validateStep()) return;
    goToStep(Math.min(activeStep + 1, 6));
  };

  const prevStep = () => {
    goToStep(Math.max(activeStep - 1, 1));
  };

  const show = (val) =>
    val === "" || val === null || val === undefined ? "—" : val;

  // ---------------------------------------------------------
  // STEPS
  // ---------------------------------------------------------
  const steps = [
    { id: 1, title: "Personal Info", icon: <FaUser /> },
    { id: 2, title: "Address", icon: <FaHome /> },
    { id: 3, title: "Emergency Contact", icon: <FaPhoneAlt /> },
    { id: 4, title: "Education", icon: <FaGraduationCap /> },
    { id: 5, title: "Bank Details", icon: <FaUniversity /> },
    { id: 6, title: "Complete", icon: <FaStar /> },
  ];

  return (
    <div className="pro-com-profile-container">
      <div ref={topRef} />

      <h2 className="pro-com-title">Complete Your Profile</h2>
      <p className="pro-com-subtitle">
        Welcome to <b>CeiTCS</b> – Let’s complete your employee onboarding.
      </p>

      {/* Steps Navigation */}
      <div className="pro-com-steps-box">
        {steps.map((s) => (
          <div
            key={s.id}
            className={`pro-com-step-item ${
              activeStep === s.id ? "pro-com-active" : ""
            }`}
            onClick={() => goToStep(s.id)}
          >
            <span className="pro-com-step-icon">{s.icon}</span>
            <p>{s.title}</p>
          </div>
        ))}
      </div>

      <div className="pro-com-line">
        <div
          className="pro-com-line-fill"
          style={{ width: `${((activeStep - 1) / 5) * 100}%` }}
        ></div>
      </div>

      {/* ---------------------------------------------------------
         STEP 1 — PERSONAL INFO
      ---------------------------------------------------------- */}
      <div className="pro-com-card">
        {activeStep === 1 && (
          <>
            <h3>Personal Information</h3>

            <div className="pro-com-grid">
              <div>
                <RequiredLabel>DOB</RequiredLabel>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateMain("dob", e.target.value)}
                />
              </div>

              <div>
                <RequiredLabel>Gender</RequiredLabel>
                <select
                  value={formData.gender}
                  onChange={(e) => updateMain("gender", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div>
                <RequiredLabel>Marital Status</RequiredLabel>
                <select
                  value={formData.marital_status}
                  onChange={(e) => updateMain("marital_status", e.target.value)}
                >
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                </select>
              </div>

              <div>
                <RequiredLabel>Nationality</RequiredLabel>
                <input
                  type="text"
                  value="Indian"
                  readOnly
                  style={{ background: "#eee", cursor: "not-allowed" }}
                />
              </div>

              <div className="pro-com-full">
                <RequiredLabel>Contact Number</RequiredLabel>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => updateMain("contact_number", e.target.value)}
                />
              </div>
            </div>

            <div className="pro-com-between">
              <div />
              <button className="pro-com-next" onClick={nextStep}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------
           STEP 2 — ADDRESS
        ---------------------------------------------------------- */}
        {activeStep === 2 && (
          <>
            <h3>Address Details</h3>


            <h4>< RequiredLabel>Permanent Address</RequiredLabel></h4>
            <div className="pro-com-grid">
              {["street", "city_or_town", "district", "state", "country"].map(
                (field) => (
                  <div key={field}>
                    <label>
                      {field
                        .split("_")                       // split by underscore
                        .map(word => 
                          word.charAt(0).toUpperCase() +  // uppercase first letter
                          word.slice(1).toLowerCase()     // lowercase the rest
                        )
                        .join(" ")}                        
                    </label>
                    <input
                      type="text"
                      value={formData.permanent_address[field]}
                      onChange={(e) =>
                        updateNested(`permanent_address.${field}`, e.target.value)
                      }
                    />
                  </div>
                )
              )}

              <div className="pro-com-full">
                <label>Pincode</label>
                <input
                  type="text"
                  value={formData.permanent_address.pincode}
                  onChange={(e) =>
                    updateNested("permanent_address.pincode", e.target.value)
                  }
                />
              </div>
            </div>
            
            <h4>Communication Address</h4>
            <div className="pro-com-grid">
              {["street", "city_or_town", "district", "state", "country"].map(
                (field) => (
                  <div key={field}>
                    <label>
                      {field
                        .split("_")                       // split by underscore
                        .map(word => 
                          word.charAt(0).toUpperCase() +  // uppercase first letter
                          word.slice(1).toLowerCase()     // lowercase the rest
                        )
                        .join(" ")}                        
                    </label>
                    <input
                      type="text"
                      value={formData.temporary_address[field]}
                      onChange={(e) =>
                        updateNested(`temporary_address.${field}`, e.target.value)
                      }
                    />
                  </div>
                )
              )}

              <div className="pro-com-full">
                <label>Pincode</label>
                <input
                  type="text"
                  value={formData.temporary_address.pincode}
                  onChange={(e) =>
                    updateNested("temporary_address.pincode", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="pro-com-between">
              <button className="pro-com-back" onClick={prevStep}>
                ← Back
              </button>
              <button className="pro-com-next" onClick={nextStep}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------
           STEP 3 — EMERGENCY CONTACT
        ---------------------------------------------------------- */}
        {activeStep === 3 && (
          <>
            <h3>Emergency Contact</h3>

            <div className="pro-com-grid">
              <div>
                <RequiredLabel>Contact Name</RequiredLabel>
                <input
                  type="text"
                  value={formData.emergency_contact.contact_name}
                  onChange={(e) =>
                    updateNested(
                      "emergency_contact.contact_name",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Relationship</label>
                <select
                  value={formData.emergency_contact.relationship}
                  onChange={(e) =>
                    updateNested(
                      "emergency_contact.relationship",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select</option>
                  <option>Friend</option>
                  <option>Guardian</option>
                  <option>Parent</option>
                  <option>Sister</option>
                </select>
              </div>

              <div>
                <RequiredLabel>Contact Number</RequiredLabel>
                <input
                  type="text"
                  value={formData.emergency_contact.contact_number}
                  onChange={(e) =>
                    updateNested(
                      "emergency_contact.contact_number",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="pro-com-full">
                <label>Address</label>
                <textarea
                  value={formData.emergency_contact.contact_Address}
                  onChange={(e) =>
                    updateNested(
                      "emergency_contact.contact_Address",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="pro-com-between">
              <button className="pro-com-back" onClick={prevStep}>
                ← Back
              </button>
              <button className="pro-com-next" onClick={nextStep}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------
           STEP 4 — EDUCATION
        ---------------------------------------------------------- */}
        {activeStep === 4 && (
          <>
            <h3>Education Details</h3>

            {/* School */}
            <h4><RequiredLabel>School</RequiredLabel></h4>
            <div className="pro-com-grid">
              <div>
                <label>Level</label>
                <select
                  value={formData.education.school.level}
                  onChange={(e) =>
                    updateNested("education.school.level", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  <option>10th</option>
                  <option>12th</option>
                </select>
              </div>

              <div>
                <label>School Name</label>
                <input
                  type="text"
                  value={formData.education.school.school_name}
                  onChange={(e) =>
                    updateNested(
                      "education.school.school_name",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Board</label>
                <select
                  value={formData.education.school.board_name}
                  onChange={(e) =>
                    updateNested(
                      "education.school.board_name",
                      e.target.value
                    )
                  }
                >
                  <option value="">Select</option>
                  <option>CBSE</option>
                  <option>State Board</option>
                </select>
              </div>

              <div>
                <label>Year</label>
                <input
                  type="text"
                  value={formData.education.school.year_of_completion}
                  onChange={(e) =>
                    updateNested(
                      "education.school.year_of_completion",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Percentage</label>
                <input
                  type="text"
                  value={formData.education.school.percentage}
                  onChange={(e) =>
                    updateNested(
                      "education.school.percentage",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Undergraduate */}
            <h4><RequiredLabel>Undergraduate</RequiredLabel></h4>
            <div className="pro-com-grid">
              {["degree_name", "university", "year_of_completion", "percentage_or_cgpa"].map(
                (field) => (
                  <div key={field}>
                    <label>
                      {field
                        .split("_")                       // split by underscore
                        .map(word => 
                          word.charAt(0).toUpperCase() +  // uppercase first letter
                          word.slice(1).toLowerCase()     // lowercase the rest
                        )
                        .join(" ")}                        
                    </label>

                    <input
                      type="text"
                      value={formData.education.undergraduate[field]}
                      onChange={(e) =>
                        updateNested(
                          `education.undergraduate.${field}`,
                          e.target.value
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            {/* Postgraduate */}
            <h4>Postgraduate</h4>
            <div className="pro-com-grid">
              {["degree_name", "university", "year_of_completion", "percentage_or_cgpa"].map(
                (field) => (
                  <div key={field}>
                    <label>
                      {field
                        .split("_")                       // split by underscore
                        .map(word => 
                          word.charAt(0).toUpperCase() +  // uppercase first letter
                          word.slice(1).toLowerCase()     // lowercase the rest
                        )
                        .join(" ")}                        
                    </label>
                    <input
                      type="text"
                      value={formData.education.postgraduate[field]}
                      onChange={(e) =>
                        updateNested(
                          `education.postgraduate.${field}`,
                          e.target.value
                        )
                      }
                    />
                  </div>
                )
              )}
            </div>

            <div className="pro-com-between">
              <button className="pro-com-back" onClick={prevStep}>
                ← Back
              </button>
              <button className="pro-com-next" onClick={nextStep}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------
           STEP 5 — BANK DETAILS
        ---------------------------------------------------------- */}
        {activeStep === 5 && (
          <>
            <h3><RequiredLabel>Bank Details</RequiredLabel></h3>

            <div className="pro-com-grid">
              {[
                "account_holder_name",
                "bank_name",
                "branch_name",
                "ifsc",
                "account_number",
              ].map((field) => (
                <div key={field}>
                  <label>
                    {field
                      .split("_")
                      .map((word) => {
                        if (word.toUpperCase() === "IFSC") return "IFSC"; // special case
                        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                      })
                      .join(" ")}
                  </label>

                  <input
                    type="text"
                    value={formData.bank_details[field]}
                    onChange={(e) =>
                      updateNested(`bank_details.${field}`, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>


            <div className="pro-com-between">
              <button className="pro-com-back" onClick={prevStep}>
                ← Back
              </button>
              <button className="pro-com-next" onClick={() => goToStep(6)}>
                Next →
              </button>
            </div>
          </>
        )}

        {/* ---------------------------------------------------------
           STEP 6 — REVIEW & SUBMIT
        ---------------------------------------------------------- */}
        {activeStep === 6 && (
          <>
            <h3>Review & Submit</h3>
            <p>Please review all entered data. Click <b>Edit</b> to modify.</p>

            {/* REVIEW CARDS */}
            <div className="pro-com-review-grid">
              {/* PERSONAL INFO */}
              <div className="pro-com-review-card">
                <div className="pro-com-review-header">
                  <h4>Personal Info</h4>
                  <button
                    className="pro-com-edit-btn"
                    onClick={() => goToStep(1)}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                <div className="pro-com-review-body">
                  <div className="pro-com-row">
                    <span className="pro-com-label">Gender</span>
                    <span>{show(formData.gender)}</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">DOB</span>
                    <span>{show(formData.dob)}</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">Marital Status</span>
                    <span>{show(formData.marital_status)}</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">Nationality</span>
                    <span>Indian</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">Contact Number</span>
                    <span>{show(formData.contact_number)}</span>
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="pro-com-review-card">
                <div className="pro-com-review-header">
                  <h4>Address</h4>
                  <button
                    className="pro-com-edit-btn"
                    onClick={() => goToStep(2)}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                <div className="pro-com-review-body">
                  <h5>Temporary Address</h5>
                  <div className="pro-com-full-row">
                    {show(formData.temporary_address.street)},{" "}
                    {show(formData.temporary_address.city_or_town)},{" "}
                    {show(formData.temporary_address.district)},{" "}
                    {show(formData.temporary_address.state)},{" "}
                    {show(formData.temporary_address.country)} –{" "}
                    {show(formData.temporary_address.pincode)}
                  </div>

                  <h5 style={{ marginTop: 20 }}>Permanent Address</h5>
                  <div className="pro-com-full-row">
                    {show(formData.permanent_address.street)},{" "}
                    {show(formData.permanent_address.city_or_town)},{" "}
                    {show(formData.permanent_address.district)},{" "}
                    {show(formData.permanent_address.state)},{" "}
                    {show(formData.permanent_address.country)} –{" "}
                    {show(formData.permanent_address.pincode)}
                  </div>
                </div>
              </div>

              {/* EMERGENCY CONTACT */}
              <div className="pro-com-review-card">
                <div className="pro-com-review-header">
                  <h4>Emergency Contact</h4>
                  <button
                    className="pro-com-edit-btn"
                    onClick={() => goToStep(3)}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                <div className="pro-com-review-body">
                  <div className="pro-com-row">
                    <span className="pro-com-label">Name</span>
                    <span>{show(formData.emergency_contact.contact_name)}</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">Relationship</span>
                    <span>{show(formData.emergency_contact.relationship)}</span>
                  </div>

                  <div className="pro-com-row">
                    <span className="pro-com-label">Contact Number</span>
                    <span>{show(formData.emergency_contact.contact_number)}</span>
                  </div>

                  <div className="pro-com-full-row">
                    <span>{show(formData.emergency_contact.contact_Address)}</span>
                  </div>
                </div>
              </div>

              {/* EDUCATION */}
              <div className="pro-com-review-card pro-com-large">
                <div className="pro-com-review-header">
                  <h4>Education</h4>
                  <button
                    className="pro-com-edit-btn"
                    onClick={() => goToStep(4)}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                <div className="pro-com-review-body">
                  {/* School */}
                  <h5>School</h5>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Level</span>
                    <span>{show(formData.education.school.level)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">School Name</span>
                    <span>{show(formData.education.school.school_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Board</span>
                    <span>{show(formData.education.school.board_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Year</span>
                    <span>{show(formData.education.school.year_of_completion)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Percentage</span>
                    <span>{show(formData.education.school.percentage)}</span>
                  </div>

                  {/* UG */}
                  <h5>Undergraduate</h5>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Degree</span>
                    <span>{show(formData.education.undergraduate.degree_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">University</span>
                    <span>{show(formData.education.undergraduate.university)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Year</span>
                    <span>
                      {show(formData.education.undergraduate.year_of_completion)}
                    </span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Percentage/CGPA</span>
                    <span>
                      {show(
                        formData.education.undergraduate.percentage_or_cgpa
                      )}
                    </span>
                  </div>

                  {/* PG */}
                  <h5>Postgraduate</h5>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Degree</span>
                    <span>{show(formData.education.postgraduate.degree_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">University</span>
                    <span>{show(formData.education.postgraduate.university)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Year</span>
                    <span>
                      {show(formData.education.postgraduate.year_of_completion)}
                    </span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Percentage/CGPA</span>
                    <span>
                      {show(
                        formData.education.postgraduate.percentage_or_cgpa
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* BANK DETAILS */}
              <div className="pro-com-review-card">
                <div className="pro-com-review-header">
                  <h4>Bank Details</h4>
                  <button
                    className="pro-com-edit-btn"
                    onClick={() => goToStep(5)}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>

                <div className="pro-com-review-body">
                  <div className="pro-com-row">
                    <span className="pro-com-label">Account Holder</span>
                    <span>{show(formData.bank_details.account_holder_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Bank</span>
                    <span>{show(formData.bank_details.bank_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Branch</span>
                    <span>{show(formData.bank_details.branch_name)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">IFSC</span>
                    <span>{show(formData.bank_details.ifsc)}</span>
                  </div>
                  <div className="pro-com-row">
                    <span className="pro-com-label">Account Number</span>
                    <span>{show(formData.bank_details.account_number)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pro-com-between" style={{ marginTop: 18 }}>
              <button className="pro-com-back" onClick={prevStep}>
                ← Back
              </button>

              <button className="pro-com-submit-btn" onClick={handleSubmit}>
                Submit Profile ✔
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletion;
