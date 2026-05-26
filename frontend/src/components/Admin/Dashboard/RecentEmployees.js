import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/Admin/Dashboard/RecentEmployees.css";

const RecentEmployees = ({ employees }) => {
  const navigate = useNavigate();

const recent = [...employees]
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // latest first
  .slice(0, 3);



  return (
    <div className="re-card">
      <h2>Recent Employees</h2>

      {recent.length === 0 ? (
        <p>No recent employees found.</p>
      ) : (
        <ul className="re-list">
          {recent.map((emp) => (
            <li
              key={emp.emp_id}
              className="re-item"
              onClick={() => navigate(`/admin/dashboard/employee/${emp.emp_id}`)}
            >
              <div>
                <strong>{emp.first_name} {emp.last_name}</strong>
                <p className={`re-type ${emp.employment_type.toLowerCase()}`}>
                  {emp.employment_type}
                </p>
              </div>

              <span className="re-arrow">→</span>
            </li>
          ))}
        </ul>
      )}

      {employees.length > 3 && (
        <button
          className="re-show-btn"
          onClick={() => navigate("/admin/dashboard/employees")}
        >
          Show More →
        </button>
      )}
    </div>
  );
};

export default RecentEmployees;
