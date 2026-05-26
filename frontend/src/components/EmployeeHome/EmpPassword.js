import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/EmployeeHome/EmpPassword.css";

const EmpPasswordset = () => {
  const [emp_id, setEmpID] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/employee/dbupdate_password",
        {
          emp_id,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      window.alert(response.data.message || "Your password has been set successfully.");
      setSuccess("Password Changed successful!");

      // ✅ Store both emp_id and profile_completed in localStorage
      localStorage.setItem("profile_completed", "false");
      localStorage.setItem("emp_id", emp_id);

      setTimeout(() => navigate("/employee/profile-completion"), 1300);

    } catch (err) {
      console.error("process error:", err);

      // ✅ Read the actual backend error detail
      const detail = err.response?.data?.detail;

      if (detail === "Password already set. Cannot change again using this method.") {
        setError("User already exists. Please login.");
      } else if (detail === "Passwords do not match") {
        setError("Passwords do not match.");
      } else if (detail === "Employee not found") {
        setError("Employee ID not found. Please check and try again.");
      } else {
        setError("Password must contain alphabet letters, special characters, and numbers.");
      }
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="emp-password-box">
        <h2>Employee Password Register</h2>
        <form onSubmit={handleRegister}>

          {/* Employee ID Input */}
          <input
            type="text"
            placeholder="Enter your Emp_ID"
            value={emp_id}
            onChange={(e) => setEmpID(e.target.value)}
            required
          />

           {/* New Password Input */}
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

           {/* Confirm Password Input */}
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

          {/* Error and Success Messages */}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "lime" }}>{success}</p>}

          <button type="submit">Register</button>

        </form>
      </div>
    </div>
  );
};

export default EmpPasswordset;