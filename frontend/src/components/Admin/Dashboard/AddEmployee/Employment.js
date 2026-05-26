import React from "react";

export default function Employment({ formData, setFormData, next, prev, errors, setErrors, validateField }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate field on change
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  return (
    <>
      <h2>Employment Details</h2>

      <label>Employee Type*</label>
      <div className="form-group">
        <select
          name="employment_type"
          value={formData.employment_type}
          onChange={handleChange}
          className={errors.employment_type ? "input-error" : ""}
        >
          <option value="">Select Type</option>
          <option value="Permanent">Permanent</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        {errors.employment_type && (
          <span className="error-message">{errors.employment_type}</span>
        )}
      </div>

      <label>Department*</label>
      <div className="form-group">
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className={errors.department ? "input-error" : ""}
        >
          <option value="">Select Department</option>
          <option value="Engineering">Engineering</option>
          <option value="Finance">Finance</option>
          <option value="Human Resources">Human Resources</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
          <option value="Sales">Sales</option>
        </select>
        {errors.department && (
          <span className="error-message">{errors.department}</span>
        )}
      </div>

      <label>Position/Title*</label>
      <div className="form-group">
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          placeholder="e.g. Software Engineer"
          className={errors.position ? "input-error" : ""}
        />
        {errors.position && (
          <span className="error-message">{errors.position}</span>
        )}
      </div>

      <label>Date of Join*</label>
      <div className="form-group">
        <input
          type="date"
          name="date_of_join"
          value={formData.date_of_join}
          onChange={handleChange}
          className={errors.date_of_join ? "input-error" : ""}
        />
        {errors.date_of_join && (
          <span className="error-message">{errors.date_of_join}</span>
        )}
      </div>

      <div className="form-nav">
        <button onClick={prev}>← Previous</button>
        <button onClick={next}>Next</button>
      </div>
    </>
  );
}
