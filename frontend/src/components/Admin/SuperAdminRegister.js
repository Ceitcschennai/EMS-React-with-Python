import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/sharedlogin.css"; 

const SuperAdminRegister = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email); // ✅ Basic Email Validation
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/admin/dbregister",
        {
          name,
          email,
          password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      window.alert(response.data.message || "Registration successful.");
      setSuccess("Registration successful!");
      navigate("/admin-login");

    } catch (err) {
      console.error("Registration error:", err);

      if (err.response && err.response.data) {
        const backendError =
          err.response.data.detail ||
          err.response.data.message ||
          "Registration failed";

        setError(backendError);
      } else if (err.request) {
        setError("Network Error. Please try again.");
      } else {
        setError("Something went wrong while sending the request.Please try again later");
      }
    }
  };


  return (
    <div className="login-page-wrapper">
      <div className="login-box">
        <h2>Admin Register</h2>
        <form onSubmit={handleRegister}>
          {/* ✅ Email Input */}
          <input
            type="Name"
            placeholder="Enter your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ✅ New Password */}
          <div className="password-wrapper">
            <input
              type={showNewPass ? "text" : "password"}
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <span
              className="password-eye-icon"
              onClick={() => setShowNewPass(!showNewPass)}
            >
              {showNewPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* ✅ Confirm Password */}
          <div className="password-wrapper">
            <input
              type={showConfirmPass ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-eye-icon"
              onClick={() => setShowConfirmPass(!showConfirmPass)}
            >
              {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* ✅ Error + Success Message */}
          {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
          {success && <p style={{ color: "#69db7c" }}>{success}</p>}

          <button type="submit">Register</button>
        </form>

        <button className="back-btn" onClick={() => navigate("/admin-login")}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default SuperAdminRegister;
