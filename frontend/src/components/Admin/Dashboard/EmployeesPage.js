import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/Admin/Dashboard/EmployeesPage.css";

const API = "http://localhost:8000";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const navigate = useNavigate();
  const [isRefreshing] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Fetch Employees
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API}/api/admin/employees`);
      let data = await res.json();

      // Sort alphabetically
      data = data.sort((a, b) => {
        const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim().toLowerCase();
        const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setEmployees(data);
      setFilteredEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

const [profilePhotos, setProfilePhotos] = useState({});


  // Fetch profile photo for a specific employee
  const fetchProfilePhoto = useCallback(async (empId) => {
      if (profilePhotos[empId]) return;

      try {
          const res = await fetch(`${API}/api/employee/profile-photo/${empId}`);
          const data = await res.json();

          if (data.profile_photo?.document_url) {
              const url = `${API}/${data.profile_photo.document_url.replace(/\\/g, "/")}`;

              setProfilePhotos(prev => ({
                  ...prev,
                  [empId]: url,
              }));
          }

      } catch (err) {
          console.error(err);
      }

  }, [profilePhotos]);

  useEffect(() => {
      if (!employees.length) return;

      employees.forEach(emp => {
          fetchProfilePhoto(emp.emp_id);
      });

  }, [employees, fetchProfilePhoto]);

  // Inactive Function
  const handleInactive = async (empId, empName) => {
    const confirmed = window.confirm(`Mark ${empName} as Inactive? This action can be reversed.`);
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${API}/api/admin/employees/${empId}/Inactive`,
        { method: "PUT" }
      );

      if (!res.ok) {
        window.alert("Update Failed: Could not update the employee status. Please try again.");
        return;
      }

      // Update UI instantly
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.emp_id === empId ? { ...emp, status: "Inactive" } : emp
        )
      );

      window.alert(`${empName} has been marked as Inactive.`);
    } catch (err) {
      console.error("Error deactivating:", err);
      window.alert("Error: An error occurred while deactivating the employee.");
    }
  };

  // Filtering Logic
  useEffect(() => {
    let result = employees;

    // Filter by status (default: Active)
    result = result.filter((emp) => {
      if (statusFilter === "All") return true;
      return emp.status === statusFilter;
    });

    if (searchTerm) {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      result = result.filter((emp) => {
        const fullName = `${emp.first_name || ""} ${emp.initial_name || ""} ${emp.last_name || ""}`
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ");
        const email = (emp.email || "").toLowerCase().trim();
        const empId = String(emp.emp_id || "").toLowerCase().trim();
        return (
          fullName.includes(normalizedSearch) ||
          email.includes(normalizedSearch) ||
          empId.includes(normalizedSearch)
        );
      });
    }

    if (typeFilter) {
      result = result.filter((emp) => emp.employment_type === typeFilter);
    }

    if (deptFilter) {
      result = result.filter((emp) => emp.department === deptFilter);
    }

    setFilteredEmployees(result);
  }, [searchTerm, typeFilter, deptFilter, statusFilter, employees]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.eps-actions-dropdown')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  return (
    <div className="employees-page-section">
      <div className="page-header">
        <h2 className="page-title">Employee Directory</h2>
        <p className="page-subtitle">View, search, and manage all employees</p>
      </div>

      <div className="eps-filters">
        <input
          type="text"
          placeholder="Search employees by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="eps-search-input"
        />

        <select
          onChange={(e) => setTypeFilter(e.target.value)}
          className="eps-filter-select"
        >
          <option value="">Filter by type</option>
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        <select
          onChange={(e) => setDeptFilter(e.target.value)}
          className="eps-filter-select"
        >
          <option value="">Filter by department</option>
          <option value="Engineering">Engineering</option>
          <option value="Finance">Finance</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Sales">Sales</option>
          <option value="Operations">Operations</option>
        </select>

        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="eps-filter-select"
          value={statusFilter}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="All">All</option>
        </select>
      </div>

      <div className="eps-table-container">
        <table className="eps-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>ID</th>
              <th>Type</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp, index) => {
                const profilePhotoUrl = profilePhotos[emp.emp_id];

                return (
                  <tr
                    key={index}
                    className="eps-emp-row"
                    onClick={() => navigate(`/admin/dashboard/employee/${emp.emp_id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div className="eps-emp-info">
                        <div className="eps-avatar">
                          {profilePhotoUrl ? (
                            <img
                              src={profilePhotoUrl}
                              alt="Profile"
                              className="eps-avatar-img"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="eps-avatar-text">
                              {emp.first_name?.charAt(0)?.toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="eps-name">{emp.first_name} {emp.initial_name ? emp.initial_name + "." : ""} {emp.last_name}</p>
                          <p className="eps-email">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{emp.emp_id}</strong>
                    </td>

                    <td>
                      <span
                        className={`eps-type ${emp.employment_type.toLowerCase()}`}
                      >
                        {emp.employment_type}
                      </span>
                    </td>

                    <td>{emp.department}</td>
                    <td>{emp.position}</td>

                    {/* Dynamic Status */}
                    <td>
                      <span
                        className={`eps-status ${
                          emp.status === "Inactive" ? "inactive" : "active"
                        }`}
                      >
                        {emp.status === "Inactive" ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td className={`eps-actions-column ${openDropdownId === emp.emp_id ? 'active' : ''}`}>
                      <div className="eps-actions-dropdown">
                        <button
                          className="eps-actions-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === emp.emp_id ? null : emp.emp_id);
                          }}
                        >
                          ⋮
                        </button>

                        <div className="eps-actions-menu">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/dashboard/employee/${emp.emp_id}`);
                            }}
                          >
                            👤 View Profile
                          </button>

                          {/* <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/employee/${emp.emp_id}/documents`);
                            }}
                          >
                            📄 Documents
                          </button> */}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              navigate("/admin/dashboard/communicationpage", {
                                state: {
                                  employee: {
                                    id: emp.emp_id,
                                    name: `${emp.first_name} ${emp.last_name}`,
                                    email: emp.email
                                  }
                                }
                              });
                            }}
                          >
                            📧 Send Email
                          </button>

                          {/* Inactive Button */}
                          <button
                            className="eps-delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              const empName = `${emp.first_name} ${emp.last_name}`.trim();
                              handleInactive(emp.emp_id, empName);
                            }}
                          >
                            🗑️ Inactive
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "14px" }}>
                  No employees found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="eps-footer">
        <button
          className="eps-refresh-btn"
          onClick={() => window.location.reload()}
        >
          {isRefreshing ? "⏳ Refreshing..." : "↻ Refresh Employee Data"}
        </button>
      </div>
    </div>
  );
};

export default Employees;
