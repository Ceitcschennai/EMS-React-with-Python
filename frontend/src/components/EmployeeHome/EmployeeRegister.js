import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import "../../styles/EmployeeHome/EmployeeRegister.css";
import { useState } from "react";

const EmployeeRegister = () => {
  const [emp_id, setEmpID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "emp_id":
        if (!value.trim()) {
          error = "Employee ID is required";
        } else if (value.trim().length < 3) {
          error = "Employee ID must be at least 3 characters";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (value.length < 6) {
          error = "Password must be at least 6 characters";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleEmpIDChange = (e) => {
    const value = e.target.value;
    setEmpID(value);
    const error = validateField("emp_id", value);
    setErrors((prev) => ({ ...prev, emp_id: error }));
    if (error) setError("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const error = validateField("email", value);
    setErrors((prev) => ({ ...prev, email: error }));
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const error = validateField("password", value);
    setErrors((prev) => ({ ...prev, password: error }));
    if (error) setError("");
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const empIdError = validateField("emp_id", emp_id);
    if (empIdError) {
      newErrors.emp_id = empIdError;
      isValid = false;
    }

    const emailError = validateField("email", email);
    if (emailError) {
      newErrors.email = emailError;
      isValid = false;
    }

    const passwordError = validateField("password", password);
    if (passwordError) {
      newErrors.password = passwordError;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the errors above before submitting");
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      const _response = await axios.post("http://127.0.0.1:8000/api/dbTemporaryemployee/login", { // eslint-disable-line no-unused-vars
        emp_id,
        email,
        temporary_password: password,
      });

      // ✅ If success, redirect 
      window.alert("Registration Complete! Setting up your password…");
      setTimeout(() => navigate("/employee/password-set"), 1400);
    } catch (err) {
      console.error("Login error:", err);

      // Extract error message from backend response
      let errorMessage = "Sign up failed. Please try again.";

      if (err.response) {
        if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.status === 401) {
          errorMessage = "Invalid Employee ID, Email, or Password";
        } else if (err.response.status === 404) {
          errorMessage = "Employee not found. Please check your details.";
        } else if (err.response.status === 400) {
          errorMessage = "Invalid data provided. Please check all fields.";
        } else if (err.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  return (
      <div className="employee-signup-wrapper">
        <div className="employee-signup-box">
          <h2>Employee SignUp</h2>
           <form onSubmit={handleSubmitClick}>
            <div className="form-group">
              <input 
                placeholder=" Enter Emp ID" 
                value={emp_id} 
                onChange={handleEmpIDChange}
                className={errors.emp_id ? "input-error" : ""}
              />
              {errors.emp_id && (
                <span className="error-message">{errors.emp_id}</span>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                placeholder="Enter Email ID"
                value={email}
                onChange={handleEmailChange}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <div className="password-wrapper" style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter Given Password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={errors.password ? "input-error" : ""}
                />
<span className="password-eye-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {error && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
              <div className="confirmation-modal-overlay">
                <div className="confirmation-modal">
                  <h3>Confirm Sign Up</h3>
                  <p>Are you sure you want to sign up with these details?</p>
                  <div className="confirmation-details">
                    <p><strong>Employee ID:</strong> {emp_id}</p>
                    <p><strong>Email:</strong> {email}</p>
                  </div>
                  <div className="confirmation-buttons">
                    <button className="confirm-btn" onClick={handleConfirmSubmit}>
                      Yes, Sign Up
                    </button>
                    <button className="cancel-btn" onClick={handleCancelSubmit}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button className="SignUp-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing Up..." : "SignUp"}
            </button>
          </form>  
          <button className="back-btn" onClick={() => navigate("/employee-login")}> Back </button>
        </div>
      </div>
    );
  };

export default EmployeeRegister;
