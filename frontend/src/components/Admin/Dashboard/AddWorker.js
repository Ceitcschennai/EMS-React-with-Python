import React, { useState } from "react";
import axios from "axios";
import "../../../styles/Admin/Dashboard/AddWorker.css";

const AddWorker = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    initial_name: "",
    phone_number: "",
    email: "",
    category: "Mechanical",
    sub_category: "Fabricator",
    work_location: "Pune",
    employment_type: "Contract",
    date_of_join: "",
    status: "Active",
    basic_salary: 0,
    overtime: 0,
    bonus: 0,
    allowance: 0,
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
        if (!value.trim()) {
          error = "First name is required";
        } else if (value.trim().length < 2) {
          error = "First name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = "First name can only contain letters and spaces";
        }
        break;

      case "last_name":
        if (value && !/^[a-zA-Z\s]+$/.test(value)) {
          error = "Last name can only contain letters and spaces";
        }
        break;

      case "initial_name":
        if (value && !/^[a-zA-Z.]+$/.test(value)) {
          error = "Initial name can only contain letters and dots";
        }
        break;

      case "phone_number":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) {
          error = "Phone number must be exactly 10 digits";
        }
        break;

      case "email":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "date_of_join":
        if (!value) {
          error = "Date of joining is required";
        }
        break;

      case "basic_salary":
        if (!value || parseFloat(value) <= 0) {
          error = "Basic salary must be greater than 0";
        } else if (parseFloat(value) < 0) {
          error = "Basic salary cannot be negative";
        }
        break;

      case "overtime":
        if (value && parseFloat(value) < 0) {
          error = "Overtime cannot be negative";
        }
        break;

      case "bonus":
        if (value && parseFloat(value) < 0) {
          error = "Bonus cannot be negative";
        }
        break;

      case "allowance":
        if (value && parseFloat(value) < 0) {
          error = "Allowance cannot be negative";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field on change
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError("");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate all fields
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const totalSalary =
    Number(formData.basic_salary) +
    Number(formData.overtime) +
    Number(formData.bonus) +
    Number(formData.allowance);

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setSubmitError("");

    // Validate form before showing confirmation
    if (!validateForm()) {
      setSubmitError("Please fix the errors above before submitting");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      // Format data properly for backend
      const submitData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        initial_name: formData.initial_name.trim() || null,
        phone_number: formData.phone_number.replace(/\D/g, ""), // Remove non-digits
        email: formData.email.trim() || null, // Send null if empty
        category: formData.category,
        sub_category: formData.sub_category,
        work_location: formData.work_location.trim(),
        employment_type: formData.employment_type,
        date_of_join: formData.date_of_join, // Already in YYYY-MM-DD format from date input
        status: formData.status,
        basic_salary: parseFloat(formData.basic_salary) || 0,
        overtime: parseFloat(formData.overtime) || 0,
        bonus: parseFloat(formData.bonus) || 0,
        allowance: parseFloat(formData.allowance) || 0,
      };

      await axios.post("http://localhost:8000/api/admin/add_worker", submitData);
      window.alert("Worker Added! The worker has been added successfully.");
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        initial_name: "",
        phone_number: "",
        email: "",
        category: "Mechanical",
        sub_category: "Fabricator",
        work_location: "Pune",
        employment_type: "Contract",
        date_of_join: "",
        status: "Active",
        basic_salary: 0,
        overtime: 0,
        bonus: 0,
        allowance: 0,
      });
      setErrors({});
    } catch (error) {
      console.error(error);

      // Extract error message from backend response
      let errorMessage = "Error adding worker. Please try again.";

      if (error.response) {
        // Server responded with error
        if (error.response.data && error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 400) {
          errorMessage = "Invalid data provided. Please check all fields.";
        } else if (error.response.status === 409) {
          errorMessage = "Conflict: Worker with this information already exists.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        // Request made but no response received
        errorMessage = "Network error. Please check your connection.";
      }

      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="add-worker-container">
      <h2>Add Worker</h2>

      {submitError && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          {submitError}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Submission</h3>
            <p>Are you sure you want to add this worker?</p>
            <div className="confirmation-details">
              <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
              <p><strong>Phone:</strong> {formData.phone_number}</p>
              <p><strong>Email:</strong> {formData.email || "N/A"}</p>
              <p><strong>Category:</strong> {formData.category}</p>
              <p><strong>Total Salary:</strong> ₹{totalSalary}</p>
            </div>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={handleConfirmSubmit}>
                Yes, Add Worker
              </button>
              <button className="cancel-btn" onClick={handleCancelSubmit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitClick}>
        {/* BASIC INFO */}
        <h3>Basic Info</h3>

        <div className="form-group">
          <input
            name="first_name"
            placeholder="Enter first name*"
            value={formData.first_name}
            onChange={handleChange}
            className={errors.first_name ? "input-error" : ""}
          />
          {errors.first_name && (
            <span className="error-message">{errors.first_name}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="last_name"
            placeholder="Enter last name"
            value={formData.last_name}
            onChange={handleChange}
            className={errors.last_name ? "input-error" : ""}
          />
          {errors.last_name && (
            <span className="error-message">{errors.last_name}</span>
          )}
        </div>


        <div className="form-group">
          <input
            name="phone_number"
            placeholder="Enter phone number*"
            value={formData.phone_number}
            onChange={handleChange}
            className={errors.phone_number ? "input-error" : ""}
          />
          {errors.phone_number && (
            <span className="error-message">{errors.phone_number}</span>
          )}
        </div>

        <div className="form-group">
          <input
            name="email"
            placeholder="Enter email address*"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>

        {/* WORK DETAILS */}
        <h3>Work Details*</h3>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option>Mechanical</option>
            <option>Civil</option>
          </select>
        </div>

        <div className="form-group">
          <label>Sub Category</label>
          <select name="sub_category" value={formData.sub_category} onChange={handleChange}>
            <option>Fabricator</option>
            <option>Welder ARC</option>
            <option>Welder MIG FCAW</option>
            <option>Structural Fitter</option>
            <option>Grinder</option>
            <option>Gas Cutter</option>
            <option>Rigger</option>
            <option>Helper</option>
          </select>
        </div>

        <div className="form-group">
          <label>Work Location</label>
          <input
            name="work_location"
            value={formData.work_location}
            onChange={handleChange}
            placeholder="Enter work location"
          />
        </div>

        <div className="form-group">
          <label>Employment Type</label>
          <select name="employment_type" value={formData.employment_type} onChange={handleChange}>
            <option>Permanent</option>
            <option>Contract</option>
          </select>
        </div>

        <div className="form-group">
          <label>Date of Joining *</label>
          <input
            type="date"
            name="date_of_join"
            value={formData.date_of_join}
            onChange={handleChange}
            className={errors.date_of_join ? "input-error" : ""}
          />
          {errors.date_of_join && (
            <span className="error-message">{errors.date_of_join}</span>
          )}
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* SALARY */}
        <h3>Salary Details*</h3>

        <div className="form-group">
          <label>Basic Salary</label>
          <input
            type="number"
            name="basic_salary"
            placeholder="Enter basic salary"
            value={formData.basic_salary}
            onChange={handleChange}
            className={errors.basic_salary ? "input-error" : ""}
          />
          {errors.basic_salary && (
            <span className="error-message">{errors.basic_salary}</span>
          )}
        </div>

        <div className="form-group">
          <label>Overtime</label>
          <input
            type="number"
            name="overtime"
            placeholder="Enter overtime amount"
            value={formData.overtime}
            onChange={handleChange}
            className={errors.overtime ? "input-error" : ""}
          />
          {errors.overtime && (
            <span className="error-message">{errors.overtime}</span>
          )}
        </div>

        <div className="form-group">
          <label>Bonus</label>
          <input
            type="number"
            name="bonus"
            placeholder="Enter bonus amount"
            value={formData.bonus}
            onChange={handleChange}
            className={errors.bonus ? "input-error" : ""}
          />
          {errors.bonus && (
            <span className="error-message">{errors.bonus}</span>
          )}
        </div>

        <div className="form-group">
          <label>Allowance</label>
          <input
            type="number"
            name="allowance"
            placeholder="Enter allowance amount"
            value={formData.allowance}
            onChange={handleChange}
            className={errors.allowance ? "input-error" : ""}
          />
          {errors.allowance && (
            <span className="error-message">{errors.allowance}</span>
          )}
        </div>

        <div className="total-salary">Total Salary: ₹ {totalSalary}</div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding Worker..." : "Add Worker"}
        </button>
      </form>
    </div>
  );
};

export default AddWorker;
