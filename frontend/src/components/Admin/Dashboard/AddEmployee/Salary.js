import React from "react";

export default function Salary({ formData, setFormData, next, prev, errors, setErrors, validateField }) {
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
      <h2>Salary Details</h2>

      <label>Basic Salary (₹)*</label>
      <div className="form-group">
        <input
          type="number"
          name="basic_salary"
          value={formData.basic_salary}
          onChange={handleChange}
          className={errors.basic_salary ? "input-error" : ""}
        />
        {errors.basic_salary && (
          <span className="error-message">{errors.basic_salary}</span>
        )}
      </div>

      <label>House Rent Allowance (₹)*</label>
      <div className="form-group">
        <input
          type="number"
          name="house_rent_allowance"
          value={formData.house_rent_allowance}
          onChange={handleChange}
          className={errors.house_rent_allowance ? "input-error" : ""}
        />
        {errors.house_rent_allowance && (
          <span className="error-message">{errors.house_rent_allowance}</span>
        )}
      </div>

      <label>Dearness Allowance (₹)*</label>
      <div className="form-group">
        <input
          type="number"
          name="dearness_allowance"
          value={formData.dearness_allowance}
          onChange={handleChange}
          className={errors.dearness_allowance ? "input-error" : ""}
        />
        {errors.dearness_allowance && (
          <span className="error-message">{errors.dearness_allowance}</span>
        )}
      </div>

      <label>Travel Allowance (₹)*</label>
      <div className="form-group">
        <input
          type="number"
          name="travel_allowance"
          value={formData.travel_allowance}
          onChange={handleChange}
          className={errors.travel_allowance ? "input-error" : ""}
        />
        {errors.travel_allowance && (
          <span className="error-message">{errors.travel_allowance}</span>
        )}
      </div>

      <label>Other Allowances (₹)*</label>
      <div className="form-group">
        <input
          type="number"
          name="other_allowance"
          value={formData.other_allowance}
          onChange={handleChange}
          className={errors.other_allowance ? "input-error" : ""}
        />
        {errors.other_allowance && (
          <span className="error-message">{errors.other_allowance}</span>
        )}
      </div>

      <div className="form-nav">
        <button onClick={prev}>← Previous</button>
        <button onClick={next}>Next</button>
      </div>
    </>
  );
}
