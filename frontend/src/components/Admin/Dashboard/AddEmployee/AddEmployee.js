// AddEmployee.js
import React, { useState } from "react";
import BasicInfo from "./BasicInfo";
import Employment from "./Employment";
import Salary from "./Salary";
import Review from "./Review";
import "../../../../styles/Admin/Dashboard/AddEmployee/AddEmployee.css";

export default function AddEmployee() {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    initial_name: "",
    email: "",
    employment_type: "",
    department: "",
    position: "",
    date_of_join: "",
    basic_salary: "",
    house_rent_allowance: "",
    dearness_allowance: "",
    travel_allowance: "",
    other_allowance: "",
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "first_name":
        if (!value.trim()) {
          error = "First name is required";
        } else if (value.trim().length < 1) {
          error = "First name must be at least 1 character";
        } else if (!/^[a-zA-Z]+$/.test(value)) {
          error = "First name can only contain letters";
        }
        break;

      case "last_name":
        if (value && !/^[a-zA-Z]+$/.test(value)) {
          error = "Last name can only contain letters";
        }
        break;

      case "initial_name":
        if (value && !/^[a-zA-Z]*$/.test(value)) {
          error = "Initial can only contain letters";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      case "employment_type":
        if (!value) {
          error = "Employment type is required";
        }
        break;

      case "department":
        if (!value) {
          error = "Department is required";
        }
        break;

      case "position":
        if (!value.trim()) {
          error = "Position is required";
        }
        break;

      case "date_of_join":
        if (!value) {
          error = "Date of joining is required";
        }
        break;

      case "basic_salary":
        if (!value || parseFloat(value) <= 0) {
          error = "Basic salary must be greater than 0";
        } else if (parseFloat(value) < 0) {
          error = "Basic salary cannot be negative";
        }
        break;

      case "house_rent_allowance":
        if (value && parseFloat(value) < 0) {
          error = "House rent allowance cannot be negative";
        }
        break;

      case "dearness_allowance":
        if (value && parseFloat(value) < 0) {
          error = "Dearness allowance cannot be negative";
        }
        break;

      case "travel_allowance":
        if (value && parseFloat(value) < 0) {
          error = "Travel allowance cannot be negative";
        }
        break;

      case "other_allowance":
        if (value && parseFloat(value) < 0) {
          error = "Other allowance cannot be negative";
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateStep = () => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      const fieldsToValidate = ["first_name", "last_name", "email"];
      fieldsToValidate.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    } else if (step === 2) {
      const fieldsToValidate = ["employment_type", "department", "position", "date_of_join"];
      fieldsToValidate.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    } else if (step === 3) {
      const fieldsToValidate = ["basic_salary", "house_rent_allowance", "dearness_allowance", "travel_allowance", "other_allowance"];
      fieldsToValidate.forEach((field) => {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);

    if (isValid) {
      nextStep();
    }
  };

  return (
    // Root wrapper to scope CSS only to this page
    <div className="add-employee-page">
       <div className="form-container">
         <div className="step-indicator">
           <div className={`step ${step >= 1 ? "active" : ""}`}>Basic Info</div>
           <div className={`step ${step >= 2 ? "active" : ""}`}>Employment</div>
           <div className={`step ${step >= 3 ? "active" : ""}`}>Salary</div>
           <div className={`step ${step >= 4 ? "active" : ""}`}>Review</div>
         </div>

        {step === 1 && (
          <BasicInfo
            formData={formData}
            setFormData={setFormData}
            next={validateStep}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        )}
        {step === 2 && (
          <Employment
            formData={formData}
            setFormData={setFormData}
            next={validateStep}
            prev={prevStep}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        )}
        {step === 3 && (
          <Salary
            formData={formData}
            setFormData={setFormData}
            next={validateStep}
            prev={prevStep}
            errors={errors}
            setErrors={setErrors}
            validateField={validateField}
          />
        )}
        {step === 4 && (
          <Review
            formData={formData}
            prev={prevStep}
            isSubmitted={isSubmitted}
            setIsSubmitted={setIsSubmitted}
          />
        )}
      </div>
    </div>
  );
}
