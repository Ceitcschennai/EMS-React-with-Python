from sqlalchemy import Column,func, Integer, String, Float, Date, Boolean, DateTime, LargeBinary, ForeignKey
from datetime import datetime
from database import BaseAdmin, BaseEmployees


class Admin(BaseAdmin):
    __tablename__ = "ADMIN_TABLE"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    name = Column(String(255))


class Employee(BaseEmployees):
    __tablename__ = "EMPLOYEES_TABLE"

    emp_id = Column(String(20), primary_key=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    initial_name = Column(String(10), nullable=True)
    email = Column(String(100), unique=True, index=True)

    employment_type = Column(String(50))
    department = Column(String(50))
    position = Column(String(100))
    date_of_join = Column(Date)

    basic_salary = Column(Float)
    house_rent_allowance = Column(Float)
    dearness_allowance = Column(Float)
    travel_allowance = Column(Float)
    other_allowance = Column(Float)
    total_ctc = Column(Float)

    status = Column(String(20))
    temporary_password = Column(String(100))
    permanent_password = Column(String(255))
    gender = Column(String(10))
    dob = Column(Date)
    contact_number = Column(String(15))
    nationality = Column(String(20))
    marital_status = Column(String(20))

    # ---------------- Permanent Address ----------------
    permanent_address = Column(String(500))
    permanent_state = Column(String(100))
    permanent_country = Column(String(100))
    permanent_pincode = Column(String(10))

    # ---------------- Temporary Address ----------------
    temporary_address = Column(String(500))
    temporary_state = Column(String(100))
    temporary_country = Column(String(100))
    temporary_pincode = Column(String(10))

    # ---------------- Emergency Contact ----------------
    emergency_contact_name = Column(String(100))
    emergency_relationship = Column(String(20))
    emergency_contact_number = Column(String(15))
    emergency_contact_address = Column(String(200))

    # ---------------- Education ----------------
    undergraduate_name = Column(String(200))
    undergraduate_university = Column(String(200))
    undergraduate_year_of_completion = Column(String(10))
    undergraduate_percentage_or_cgpa = Column(String(20))

    PostGraduate_degree_name = Column(String(200))
    PostGraduate_university = Column(String(200))
    PostGraduate_year_of_completion = Column(String(10))
    PostGraduate_percentage_or_cgpa = Column(String(20))

    school_level = Column(String(20))
    school_name = Column(String(200))
    school_board_name = Column(String(100))
    school_year_of_completion = Column(String(10))
    school_percentage = Column(String(20))

    # ---------------- Bank Details ----------------
    account_holder_name = Column(String(100))
    bank_name = Column(String(100))
    branch_name = Column(String(100))
    ifsc = Column(String(20))
    account_number = Column(String(30))
    profile_completed = Column(Boolean, default=False)
    profile_completed_at = Column(Date)
    deactivated_at = Column(Date)

    offer_letter_status = Column(String(20), nullable=True)
    offer_letter_sent_at = Column(DateTime, nullable=True)


class EmployeeDocument(BaseEmployees):
    """Model for storing employee documents in SQL Server"""

    __tablename__ = "EMPLOYEE_DOCUMENTS"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emp_id = Column(String(20), nullable=False, index=True)
    document_category = Column(
        String(50), nullable=False
    )  # main_key (e.g., profile_photo, identity_proofs)
    document_sub_category = Column(
        String(50), nullable=False
    )  # sub_key (e.g., aadhar_card, pan_card)
    document_name = Column(String(255), nullable=False)
    document_url = Column(String(500), nullable=False)
    document_content = Column(
        LargeBinary, nullable=True
    )  # BLOB for storing actual file content
    document_mime_type = Column(
        String(100), nullable=True
    )  # MIME type (e.g., image/png, application/pdf)
    document_status = Column(
        String(20), default="pending"
    )  # pending, verified, rejected
    uploaded_at = Column(DateTime,server_default=func.now(),onupdate=func.now())
    verified_at = Column(DateTime, nullable=True, onupdate=func.now())
    verified_by = Column(String(100), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    employee_read = Column(Boolean, default=False)


class EmailHistory(BaseEmployees):
    """Model for storing email history for each employee"""

    __tablename__ = "EMAIL_HISTORY"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    emp_id = Column(String(20), nullable=False, index=True)
    recipient_email = Column(String(100), nullable=False)
    subject = Column(String(500), nullable=False)
    body = Column(String, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    sent_by = Column(String(100), nullable=True)
    status = Column(String(20), default="sent")
    error_message = Column(String(500), nullable=True)


class Worker(BaseEmployees):
    """Model for storing worker information"""

    __tablename__ = "WORKERS_TABLE"

    worker_id = Column(String(20), primary_key=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    initial_name = Column(String(10), nullable=True)
    phone_number = Column(String(15))
    email = Column(String(100), nullable=True, index=True)

    category = Column(String(50))
    sub_category = Column(String(50))
    work_location = Column(String(100), default="Pune")
    employment_type = Column(String(50), default="Contract")
    date_of_join = Column(Date)
    status = Column(String(20), default="Active")

    basic_salary = Column(Float)
    overtime = Column(Float, default=0)
    bonus = Column(Float, default=0)
    allowance = Column(Float, default=0)
    total_salary = Column(Float)

    worker_offer_letter_status = Column(String(20), nullable=True)
    worker_offer_letter_sent_at = Column(DateTime, nullable=True)


class EmployeeEditRequest(BaseEmployees):
    __tablename__ = "EMPLOYEE_EDIT_REQUESTS"

    id = Column(Integer, primary_key=True, index=True)

    emp_id = Column(String(20), ForeignKey("EMPLOYEES_TABLE.emp_id"))

    new_first_name = Column(String(50))
    new_last_name = Column(String(50))
    new_email = Column(String(100))
    new_phone = Column(String(20))

    status = Column(String(20), default="pending")
    requested_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    employee_read = Column(Boolean, default=False)

