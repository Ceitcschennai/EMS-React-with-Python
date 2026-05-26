import React, { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import EmployeeChart from "./EmployeeChart";
import RecentEmployees from "./RecentEmployees";
import "../../../styles/Admin/Dashboard/DashboardHome.css";

const DashboardHome = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/employees");
        const data = await res.json();
        setEmployees(data || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  // ---------------------------
  // New Function to Count Document Status
  // ---------------------------
  const countDocumentStatus = (employees) => {
    let verified = 0;
    let pending = 0;
    let rejected = 0;

    employees.forEach((emp) => {
      if (!emp.documents) return;

      Object.values(emp.documents).forEach((section) => {
        if (!section || typeof section !== "object") return;

        Object.values(section).forEach((doc) => {
          if (!doc || typeof doc !== "object") return;

          const status = doc.document_status;

          if (status === "verified") verified++;
          else if (status === "pending") pending++;
          else if (status === "rejected") rejected++;
        });
      });
    });

    return { verified, pending, rejected };
  };

  // Get document counts
  const { verified, pending } = countDocumentStatus(employees);

  const totalEmployees = employees.length;
  const permanentEmployees = employees.filter(
    (emp) => emp.employment_type === "Permanent"
  ).length;

  const verifiedDocs = verified;
  const pendingDocs = pending;

  // Upcoming reviews = pending documents
  const upcomingReviews = pending;

  return (
    <div className="dashboard-home-page">
      <div className="admin-info-cards">
        <InfoCard
          title="Total Employees"
          value={totalEmployees}
          subtitle="Active personnel in the system"
          icon="👥"
        />

        <InfoCard
          title="Permanent Employees"
          value={permanentEmployees}
          subtitle="Permanent staff count"
          icon="💼"
        />

        <InfoCard
          title="Documents Verified"
          value={verifiedDocs}
          subtitle={`${pendingDocs} pending verification`}
          icon="📄"
        />

        <InfoCard
          title="Upcoming Reviews"
          value={upcomingReviews}
          subtitle="Documents waiting for review"
          icon="📅"
        />
      </div>

      <div className="admin-dashboard-charts">
        <EmployeeChart employees={employees} />
        <RecentEmployees employees={employees} />
      </div>
    </div>
  );
};

export default DashboardHome;
