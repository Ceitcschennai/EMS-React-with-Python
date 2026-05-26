import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../../styles/EmployeeHome/EmpPassword.css";
import { useNavigate } from "react-router-dom";


const EmpForgotPassword = () => {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  // 🔹 SEND OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/employee/dbforgot-password",
        { email }
      );

      setSuccess(response.data.message);
      setStep(2);

    } catch (err) {
      const detail = err.response?.data?.detail;

      if (detail === "Email not found") {
        setError("Email not registered.");
      } else {
        setError("Failed to send OTP. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 RESET PASSWORD
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/employee/dbreset-password",
        {
          email,
          otp,
          new_password: newPassword,
        }
      );

      setSuccess("Password reset successful!");
      window.alert("Password Updated! Your new password is now active.");
      setTimeout(() => navigate("/employee/profile-completion"), 1300);
       

    } 
    catch (err) {
    const detail = err.response?.data?.detail;

    if (detail === "Invalid OTP") {
        setError("Invalid OTP.");
    } else if (detail === "OTP expired") {
        setError("OTP expired. Please request again.");
    } else {
        // 🔥 Show backend validation message
        setError(detail || "Something went wrong.");
    }
    } finally {
        setLoading(false);
        }
    };

  return (
    <div className="login-page-wrapper">
      <div className="emp-password-box">
        <h2>Forgot Password</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <input
              type="email"
              placeholder="Enter your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

<div className="password-wrapper">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span
                  className="password-eye-icon"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Messages */}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "lime" }}>{success}</p>}
      </div>
    </div>
  );
};

export default EmpForgotPassword;