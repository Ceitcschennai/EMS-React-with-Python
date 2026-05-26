import React, { useMemo } from "react";
import "../../../styles/Admin/Dashboard/EmployeeChart.css";
import { BarChart3 } from "lucide-react";

const EmployeeChart = ({ employees = [] }) => {

  // Count types dynamically from backend
  const data = useMemo(() => {
    return [
      {
        label: "Permanent",
        count: employees.filter((e) => e.employment_type === "Permanent").length,
        color: "#3c67e7", // Royal Blue
      },
      {
        label: "Contract",
        count: employees.filter((e) => e.employment_type === "Contract").length,
        color: "#F59E0B", // Amber/Orange
      },
      {
        label: "Internship",
        count: employees.filter((e) => e.employment_type === "Internship").length,
        color: "#13ca1c", // Violet/Purple
      },
    ];
  }, [employees]);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  const getPercentage = (count) =>
    total === 0 ? 0 : ((count / total) * 100).toFixed(0);

  return (
    <div className="employee-chart-section">
      <h2 className="ec-title">Employee Distribution</h2>
      <p className="ec-subtitle">Breakdown by employment type</p>

      <div className="ec-legend">
        {data.map((d, i) => (
          <div key={i} className="ec-legend-item">
            <span
              className="ec-legend-color"
              style={{ backgroundColor: d.color }}
            ></span>
            {d.label} ({d.count})
          </div>
        ))}
      </div>

      <div className="ec-chart-icon">
        <BarChart3 size={22} color="#667eea" />
      </div>

      <div className="ec-bars">
        {data.map((d, i) => (
          <div key={i} className="ec-bar-item">
            <div className="ec-bar-label">{d.label}</div>

            <div className="ec-bar">
              <div
                className="ec-bar-fill"
                style={{
                  width: `${getPercentage(d.count)}%`,
                  backgroundColor: d.color,
                }}
              ></div>
            </div>

            <div className="ec-bar-percent">{getPercentage(d.count)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeChart;
