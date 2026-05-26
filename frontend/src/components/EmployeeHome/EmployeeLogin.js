import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/sharedlogin.css";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const Link = ({ children, onClick, className }) => (
    <span
      className={className}
      onClick={onClick}
      style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline" }}
    >
      {children}
    </span>
  );

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the errors above before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/employee/dblogin", {
        email,
        password,
      });

      const emp_id = res.data.emp_id;

      if (!emp_id) {
        setError("Employee ID missing in response from server");
        return;
      }

      // Store employee info
      localStorage.setItem("emp_id", emp_id);
      localStorage.setItem("email", email);
      localStorage.setItem("profile_completed", res.data.profile_completed);

      window.alert("Login Successful! Redirecting to your dashboard…");

      setTimeout(() => {
        if (res.data.profile_completed) {
          navigate("/employee/Dashboard");
        } else {
          navigate("/employee/profile-completion");
        }
      }, 1400);

    } catch (err) {
      console.error(err);

      // Extract error message from backend response
      let errorMessage = "Login failed. Please try again.";

      if (err.response) {
        if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.status === 401) {
          errorMessage = "Invalid email or password";
        } else if (err.response.status === 403) {
          errorMessage = "Access Denied: Your account is inactive. Please contact admin.";
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

  return (
    <div className="login-page-wrapper">
      <div className="login-box">
        <h2>Employee Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter email"
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
                placeholder="Enter password"
                value={password}
                onChange={handlePasswordChange}
                className={errors.password ? "input-error" : ""}
              />

              <span
                className="password-eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <button className="forgot-link" onClick={() => navigate("/employee/Forgotpassword")}>Forgot Password</button>
        <button className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>

        <Link className="sign-btn" onClick={() => navigate("/employee-register")}>
          SignUp
        </Link>
      </div>
    </div>
  );
};

export default EmployeeLogin;
