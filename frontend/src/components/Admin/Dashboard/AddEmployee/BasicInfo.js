import React, { useState } from "react";

export default function BasicInfo({ formData, setFormData, next, errors, setErrors, validateField }) {

  const handleChange = (e) => {
    const { name, value } = e.target;

    const processedValue =
      name === "email" ? value.toLowerCase() : value;

    setFormData({
      ...formData,
      [name]: processedValue,
    });

    const error = validateField(name, processedValue);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const [checkingEmail, setCheckingEmail] = useState(false);


    const checkEmailExists = async (email) => {
      try {
        setCheckingEmail(true);

        const res = await fetch(
          `http://localhost:8000/api/admin/check-email?email=${encodeURIComponent(email)}`
        );

        if (!res.ok) {
          throw new Error("Failed to check email");
        }

        const data = await res.json();

        if (data.exists) {
          setErrors((prev) => ({
            ...prev,
            email: "Email already exists",
          }));
          return true;
        }

        setErrors((prev) => ({
          ...prev,
          email: "",
        }));

        return false;
      } catch (error) {
        console.error(error);

        setErrors((prev) => ({
          ...prev,
          email: "Unable to verify email. Please try again.",
        }));

        return true;
      } finally {
        setCheckingEmail(false);
      }
    };


    const handleNext = async () => {
      // Run frontend validation first
      const emailError = validateField("email", formData.email);

      if (emailError) {
        setErrors((prev) => ({
          ...prev,
          email: emailError,
        }));
        return;
      }

      if (checkingEmail) return;

      const exists = await checkEmailExists(formData.email);

      if (exists) return;

      next();
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

          {checkingEmail && (
              <span className="checking-message">
                  Checking email...
              </span>
          )}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => {
            const emailError = validateField("email", formData.email);

            if (!emailError && formData.email) {
              checkEmailExists(formData.email);
            }
          }}
          placeholder="employee@example.com"
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      <div className="form-nav">
        <button
          onClick={handleNext}
          disabled={checkingEmail}
        >
          {checkingEmail ? "Checking..." : "Next"}
        </button>
      </div>
    </>
  );
}
