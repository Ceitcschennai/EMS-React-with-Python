import React, { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import EmployeeChart from "./EmployeeChart";
import RecentEmployees from "./RecentEmployees";
import "../../../styles/Admin/Dashboard/DashboardHome.css";

const DashboardHome = () => {
  const [employees, setEmployees] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);

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

  useEffect(() => {
    fetchEmployees();
    fetchDocuments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/employees");
      const data = await res.json();
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/admin/all_documents");
      const data = await res.json();

      setAllDocuments(data.documents || []);
    } catch (err) {
      console.error(err);
    }
  };


  const totalEmployees = employees.length;
  const permanentEmployees = employees.filter(
    (emp) => emp.employment_type === "Permanent"
  ).length;

  const verifiedDocs = allDocuments.filter(
      doc =>
          doc.document_status === "verified" &&
          doc.document_category !== "profile_photo"
  ).length;

  const pendingDocs = allDocuments.filter(
      doc =>
          doc.document_status === "pending" &&
          doc.document_category !== "profile_photo"
  ).length;


  const upcomingReviews = pendingDocs;
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
