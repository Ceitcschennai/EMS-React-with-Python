import React from "react";

export default function BasicInfo({ formData, setFormData, next, errors, setErrors, validateField }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert email to lowercase
    const processedValue = name === "email" ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: processedValue });

    // Validate field on change
    const error = validateField(name, processedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  return (
    <>
      <label>Name</label>
      <div className="form-row">
        <div className="form-group" style={{ flex: 1 }}>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="First Name*"
            className={errors.first_name ? "input-error" : ""}
          />
          {errors.first_name && (
            <span className="error-message">{errors.first_name}</span>
          )}
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="Last Name"
            className={errors.last_name ? "input-error" : ""}
          />
          {errors.last_name && (
            <span className="error-message">{errors.last_name}</span>
          )}
        </div>
      </div>

      <label>Email Address*</label>
      <div className="form-group">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="employee@example.com"
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      <div className="form-nav">
        <button onClick={next}>Next</button>
      </div>
    </>
  );
}
