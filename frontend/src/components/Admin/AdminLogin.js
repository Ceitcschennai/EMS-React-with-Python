import React, { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; 
import { useNavigate } from "react-router-dom";
import "../../styles/sharedlogin.css";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/admin/dblogin", {
        email,
        password,
      });

      window.alert(response.data.message || "Login successful.");
      localStorage.setItem("email", email);

      navigate("/admin/dashboard");

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Admin not found.");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-box">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

<span
           className="password-eye-icon"
           onClick={() => setShowPassword(!showPassword)}
         >
           {showPassword ? <FaEyeSlash /> : <FaEye />}
         </span>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit">Login</button>
        </form>

        <button className="back-btn" onClick={() => navigate("/")}>
          Back
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
