import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Review({ formData, prev, isSubmitted, setIsSubmitted }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
  const totalCTC =
    Number(formData.basic_salary) +
    Number(formData.house_rent_allowance) +
    Number(formData.dearness_allowance) +
    Number(formData.travel_allowance) +
    Number(formData.other_allowance);

  const handleSubmitClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        initial_name: formData.initial_name?.trim() || "",
        email: formData.email.trim(),
        employment_type: formData.employment_type,
        department: formData.department,
        position: formData.position.trim(),
        date_of_join: formData.date_of_join,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        house_rent_allowance: parseFloat(formData.house_rent_allowance) || 0,
        dearness_allowance: parseFloat(formData.dearness_allowance) || 0,
        travel_allowance: parseFloat(formData.travel_allowance) || 0,
        other_allowance: parseFloat(formData.other_allowance) || 0,
      };

      const res = await fetch("http://localhost:8000/api/admin/dbadd_employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Employee added successfully!");
        setMessageType("success");
        setIsSubmitted(true);
      } else {
        // Extract error message from backend response
        let errorMessage = "Failed to add employee";

        if (data.detail) {
          if (typeof data.detail === "string") {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            // Handle validation errors array from Pydantic
            errorMessage = data.detail.map((err) => err.msg).join(", ");
          }
        } else if (res.status === 400) {
          errorMessage = "Invalid data provided. Please check all fields.";
        } else if (res.status === 409) {
          errorMessage = "Conflict: Employee with this information already exists.";
        } else if (res.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }

        setMessage(`❌ ${errorMessage}`);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("❌ Failed to connect to server. Please check your connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleExit = () => {
    navigate("/admin/dashboard"); // navigate to employee list page
  };

  const fullName = [
    formData.first_name?.trim(),
    formData.initial_name?.trim(),
    formData.last_name?.trim()
  ].filter(Boolean).join(" ");

  return (
    <>
      <h2>Review Details</h2>
      <div className="review-card">
        <p><b>Name:</b> {fullName}</p>
        <p><b>Email:</b> {formData.email}</p>
        <p><b>Type:</b> {formData.employment_type}</p>
        <p><b>Department:</b> {formData.department}</p>
        <p><b>Position:</b> {formData.position}</p>
        <p><b>Joining Date:</b> {formData.date_of_join}</p>
        <p><b>Total CTC:</b> ₹{totalCTC}</p>
      </div>

      {message && (
        <div className={`status-message ${messageType}`}>
          {message}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Submission</h3>
            <p>Are you sure you want to add this employee?</p>
            <div className="confirmation-details">
              <p><strong>Name:</strong> {fullName}</p>
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Department:</strong> {formData.department}</p>
              <p><strong>Position:</strong> {formData.position}</p>
              <p><strong>Total CTC:</strong> ₹{totalCTC}</p>
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={handleConfirmSubmit}>
                Yes, Add Employee
              </button>
              <button className="cancel-btn" onClick={handleCancelSubmit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-nav">
          <>
            <button className="prev-btn" onClick={prev}>Previous</button>
            <button onClick={handleSubmitClick} disabled={loading || isSubmitted}>
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button className="close-btn" onClick={handleExit}>Close</button>
          </>
      </div>
    </>
  );
}
