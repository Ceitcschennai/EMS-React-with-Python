from fastapi import FastAPI, File, Form, HTTPException, UploadFile, Depends,  Query
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from schema import (
    SENDER_PASSWORD,
    SENDER_EMAIL,
    AdminRegister,
    SUPERADMIN_EMAIL,
    SUPERADMIN_PASSWORD,
    Documents,
    ProfileRequest,
    SuperAdmin,
    AdminLogin,
    Addemployee,
    EmployeePasswordUpdate,
    EmployeeLogin,
    EmployeePersonalInfo,
    TempemployeeLogin,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendEmailRequest,
    EmailHistoryResponse,
    EmailHistoryByEmployeeResponse,
    AddWorker,
)
import os, json, smtplib, secrets
from fastapi.middleware.cors import CORSMiddleware
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string, re
from datetime import date, datetime, timedelta
from offer_letter_generator import generate_offer_letter_pdf
from email_service import send_custom_email, send_offer_letter_email
from passlib.context import CryptContext
from xhtml2pdf import pisa

# SQL DB CHANGES
# ""
from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy import func

from Models import Admin, Employee, EmployeeDocument, EmailHistory, Worker
from database import (
    BaseAdmin,
    BaseEmployees,
    SessionEmployees,
    engine_employees,
    SessionAdmin,
    engine_admin,
)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

BaseAdmin.metadata.create_all(bind=engine_admin)
BaseEmployees.metadata.create_all(bind=engine_employees)

# ""


app = FastAPI(title="User Management API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this to your domain later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

APP_HOST = "http://localhost:8000"
DATA_FILE = "users.json"
EMPLOYEES_FILE = "employees.json"
SENT_MAILS_FILE = "sent_mails.json"


def load_json(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return []


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=4)


#####


def load_sent_mails():
    if not os.path.exists(SENT_MAILS_FILE):
        return []
    with open(SENT_MAILS_FILE, "r") as f:
        try:
            return json.load(f)
        except:
            return []


def save_sent_mails(data):
    with open(SENT_MAILS_FILE, "w") as f:
        json.dump(data, f, indent=4)


####
def generate_emp_id(employees):
    # Filter out employees missing 'emp_id'
    valid_emps = [emp for emp in employees if "emp_id" in emp]

    if not valid_emps:
        return "EMP001"

    last_emp = valid_emps[-1]
    last_id = last_emp["emp_id"]
    new_id = int(last_id.replace("EMP", "")) + 1
    return f"EMP{new_id:03d}"


def send_registration_email(receiver_email):
    subject = "Admin Registration Successful"
    body = f"""
    Hello Admin,
    
    You have successfully registered your account.
    Welcome to the system!

    Regards,
    SuperAdmin Team
    """

    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = receiver_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        print(f"✅ Registration email sent to {receiver_email}")
    except Exception as e:
        print(f"❌ Error sending email: {e}")


def load_admins():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []


def save_admins(admins):
    with open(DATA_FILE, "w") as f:
        json.dump(admins, f, indent=4)


def load_admins():
    import json

    try:
        with open("users.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def load_employees():
    if not os.path.exists("employees.json"):
        return []
    with open("employees.json", "r") as f:
        return json.load(f)


def save_employees(employees):
    with open("employees.json", "w") as f:
        json.dump(employees, f, indent=4)


def clean_string(value):
    """Convert placeholder 'string' values to empty strings."""
    return "" if value == "string" else value


def remove_string_placeholders(data):
    """Recursively remove all 'string' placeholder values in nested dict/list."""
    if isinstance(data, dict):
        return {k: remove_string_placeholders(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [remove_string_placeholders(item) for item in data]
    else:
        return clean_string(data)


def validate_password(password: str):
    # Must have at least one uppercase and one special character
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one uppercase letter",
        )
    if not re.search(r"[_!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least one special character",
        )
    if len(password) < 8:
        raise HTTPException(
            status_code=400, detail="Password must be at least 8 characters long"
        )
    if not re.search(r"[0-9]", password):
        raise HTTPException(
            status_code=400, detail="Password must contain at least one number"
        )


# SQL DB SETUP FUCNTIONS


def get_admin_db():
    db = SessionAdmin()
    try:
        yield db
    finally:
        db.close()


def get_employees_db():
    db = SessionEmployees()
    try:
        yield db
    finally:
        db.close()


def get_admin_by_email(email: str):
    db = SessionAdmin()
    try:
        return db.query(Admin).filter(Admin.email == email).first()
    finally:
        db.close()


def insert_admin(email: str, password: str):
    db = SessionAdmin()
    try:
        new_admin = Admin(email=email, password=password)
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        return new_admin
    finally:
        db.close()


def generate_emp_id(
    first_name: str, last_name: str, initial_name: str | None, db: Session
):
    """Generate Employee ID using first 3 letters + 5-digit random number"""

    name_for_id = first_name
    if initial_name:
        name_for_id = f"{first_name} {initial_name}"
    cleaned_name = name_for_id.replace(" ", "")
    first_three = cleaned_name[:3].capitalize()

    while True:
        random_number = random.randint(10000, 99999)
        emp_id = f"{first_three}{random_number}"

        # Check in database (if db is a Session object)
        if isinstance(db, Session):
            existing = db.query(Employee).filter(Employee.emp_id == emp_id).first()
            if not existing:
                return emp_id
        elif isinstance(db, list):
            if not any(emp.get("emp_id") == emp_id for emp in db):
                return emp_id


def generate_temp_password(emp_id: str, email: str) -> str:
    """Generate temporary password using emp_id, email, and random chars"""
    special_chars = "_!@#$%&*"
    random_part = "".join(random.choices(string.ascii_letters + string.digits, k=4))
    special = random.choice(special_chars)
    # Combine parts
    password = f"{emp_id[:4]}{special}{random_part}{email[0:2]}"
    return password


def generate_worker_id(first_name: str, db: Session):
    """Generate Worker ID using first 3 letters of first name + 5-digit random number with 'WRK' prefix"""
    cleaned_name = first_name.replace(" ", "")
    first_three = cleaned_name[:3].capitalize()

    while True:
        random_number = random.randint(10000, 99999)
        worker_id = f"WRK{first_three}{random_number}"

        # Check in database
        existing = db.query(Worker).filter(Worker.worker_id == worker_id).first()
        if not existing:
            return worker_id


def send_worker_offer_letter_email(
    to_email,
    First_name,
    Last_name,
    Initial_name,
    pdf_path,
    sub_category,
    employment_type,
):
    """Send offer letter email to worker"""
    msg = EmailMessage()
    msg["Subject"] = "CeiTCS - Offer Letter"

    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    msg.set_content(
        f"Dear {First_name} {Last_name} {Initial_name},\n\n"
        "Congratulations! We are pleased to offer you the position of "
        f"{sub_category} at CeiTCS under {employment_type} employment.\n\n"
        "Please find the attached offer letter which contains complete details regarding your role, "
        "responsibilities, compensation structure, and other employment terms.\n\n"
        "Kindly review the document carefully and confirm your acceptance by replying to this email.\n\n"
        "If you have any questions or require clarification, please feel free to contact our HR team.\n\n"
        "We are excited to welcome you to CeiTCS and look forward to your valuable contribution to our organization.\n\n"
        "Best Regards,\n"
        "HR Department\n"
        "Cloud Enabled Intellectual Technology and Consultancy Services (CeiTCS)"
    )

    # Attach the PDF
    with open(pdf_path, "rb") as f:
        msg.add_attachment(
            f.read(), maintype="application", subtype="pdf", filename="Offer_Letter.pdf"
        )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
        smtp.send_message(msg)


def generate_worker_offer_letter_pdf(worker):
    """
    Generate offer letter PDF for worker.
    worker_offer_letter status: 'NULL' (not sent) -> 'sent' (after sending)
    """

    # Create output folder
    folder = "offer_letters"
    os.makedirs(folder, exist_ok=True)

    # Generate unique filename based on worker details
    pdf_filename = (
        f"{worker.first_name}{worker.last_name}@{worker.worker_id}_offer_letter.pdf"
    )
    pdf_path = os.path.join(folder, pdf_filename)

    # 1️⃣ Load worker template
    template_file = "worker_offer_template.html"
    with open(template_file, "r", encoding="utf-8") as f:
        html = f.read()

    # 2️⃣ Get current date
    current_date = date.today().strftime("%Y-%m-%d")

    # 3️⃣ Get full name and first name
    First_name = worker.first_name
    Last_name = worker.last_name
    Initial_name = worker.initial_name

    # 4️⃣ Replace placeholders
    html = html.replace("{{ current_date }}", str(current_date))
    html = html.replace("{{ First_name }}", str(First_name or ""))
    html = html.replace("{{ Last_name }}", str(Last_name or ""))
    html = html.replace("{{ Initial_name }}", str(Initial_name or ""))
    html = html.replace("{{ phone_number }}", str(worker.phone_number or ""))
    html = html.replace("{{ email }}", str(worker.email or ""))
    html = html.replace("{{ category }}", str(worker.category or ""))
    html = html.replace("{{ sub_category }}", str(worker.sub_category or ""))
    html = html.replace("{{ work_location }}", str(worker.work_location or ""))
    html = html.replace("{{ employment_type }}", str(worker.employment_type or ""))
    html = html.replace("{{ date_of_join }}", str(worker.date_of_join or ""))
    html = html.replace("{{ status }}", str(worker.status or ""))
    html = html.replace("{{ basic_salary }}", str(worker.basic_salary or ""))
    html = html.replace("{{ overtime }}", str(worker.overtime or ""))
    html = html.replace("{{ bonus }}", str(worker.bonus or ""))
    html = html.replace("{{ allowance }}", str(worker.allowance or ""))
    html = html.replace("{{ total_salary }}", str(worker.total_salary or ""))

    # 5️⃣ Convert HTML → PDF
    with open(pdf_path, "wb") as result:
        pisa.CreatePDF(html, dest=result)

    return pdf_path


# routes


@app.post("/api/superadmin/login")
def login(admin: SuperAdmin):
    if admin.email == SUPERADMIN_EMAIL and admin.password == SUPERADMIN_PASSWORD:
        return {"message": "Welcome SuperAdmin!", "email": admin.email}
    raise HTTPException(status_code=401, detail="Invalid email or password")


##SQL DB Chnages
# ""
@app.post("/api/admin/dbregister")
def register_admin(admin: AdminRegister, db: Session = Depends(get_admin_db)):

    # 1️⃣ Password match
    if admin.password != admin.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # 2️⃣ Check duplicate email
    existing_admin = db.query(Admin).filter(Admin.email == admin.email).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin already exists")

    # 3️⃣ Create new admin
    new_admin = Admin(
        name=admin.name,
        email=admin.email,
        password=admin.password,  # ⚠️ Later we will hash this
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # 4️⃣ Send email notification
    send_registration_email(admin.email)

    return {"message": f"Admin {admin.email} registered successfully!"}


@app.post("/api/admin/dblogin")
def login_admin(admin: AdminLogin):

    # 1️⃣ Get admin from database
    db_admin = get_admin_by_email(admin.email)

    if not db_admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # 2️⃣ Check password (plain comparison for now)
    if db_admin.password != admin.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    # 3️⃣ Success response
    return JSONResponse(
        status_code=200, content={"message": f"Welcome back, {admin.email}!"}
    )



@app.get("/api/admin/check-email")
def check_email(
    email: str = Query(...),
    db: Session = Depends(get_employees_db)
):
    existing = db.query(Employee).filter(Employee.email == email.lower()).first()

    if existing:
        return {
            "exists": True,
            "message": "Email already exists"
        }

    return {
        "exists": False,
        "message": "Email is available"
    }

@app.post("/api/admin/dbadd_employee")
def add_employee(employee: Addemployee, db: Session = Depends(get_employees_db)):

    # Check duplicate email
    existing = db.query(Employee).filter(Employee.email == employee.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Generate Employee ID
    emp_id = generate_emp_id(
        employee.first_name, employee.last_name, employee.initial_name, db
    )

    # Generate Temporary Password
    temp_password = generate_temp_password(emp_id, employee.email)

    new_employee = Employee(
        emp_id=emp_id,
        first_name=employee.first_name,
        last_name=employee.last_name,
        initial_name=employee.initial_name,
        email=employee.email,
        employment_type=employee.employment_type,
        department=employee.department,
        position=employee.position,
        date_of_join=employee.date_of_join,
        basic_salary=employee.basic_salary,
        house_rent_allowance=employee.house_rent_allowance,
        dearness_allowance=employee.dearness_allowance,
        travel_allowance=employee.travel_allowance,
        other_allowance=employee.other_allowance,
        total_ctc=employee.total_ctc,
        status="Active",
        temporary_password=temp_password,
    )

    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)

    return {
        "message": "Employee added successfully",
        "emp_id": new_employee.emp_id,
        "temporary_password": new_employee.temporary_password,
    }


@app.post("/api/employee/dbforgot-password")
def forgot_password(
    request: ForgotPasswordRequest, db: Session = Depends(get_employees_db)
):

    # 1️⃣ Check email exists
    result = db.execute(
        text("""
            SELECT  first_name, last_name, initial_name, email
            FROM EMPLOYEES_TABLE
            WHERE email = :email
        """),
        {"email": request.email},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Email not found")

    first_name, last_name, initial_name, email = result

    # 2️⃣ Generate OTP
    otp = str(random.randint(100000, 999999))

    # 3️⃣ Set Expiry (20 Minutes)
    expiry_time = datetime.now() + timedelta(minutes=20)

    # 4️⃣ Store OTP in DB
    db.execute(
        text("""
            UPDATE EMPLOYEES_TABLE
            SET reset_otp = :otp,
                reset_otp_expiry = :expiry
            WHERE email = :email
        """),
        {"otp": otp, "expiry": expiry_time, "email": email},
    )
    db.commit()

    # 5️⃣ Send OTP Email
    try:
        msg = EmailMessage()
        msg["Subject"] = "Password Reset OTP"
        msg["From"] = "no-reply@yourcompany.com"
        msg["To"] = email
        msg.set_content(
            f"Hi {first_name} {last_name},\n\n"
            f"Your password reset OTP is:\n\n"
            f"{otp}\n\n"
            f"This OTP is valid for 20 minutes.\n"
            f"Do not share this OTP with anyone."
        )

        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login("s.v.k23105@gmail.com", "wcikfesloppffabr")
            server.send_message(msg)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {e}")

    return {"message": "OTP sent successfully (Valid for 20 minutes)"}


@app.post("/api/employee/dbreset-password")
def reset_password(
    request: ResetPasswordRequest, db: Session = Depends(get_employees_db)
):

    result = db.execute(
        text("""
            SELECT reset_otp, reset_otp_expiry
            FROM EMPLOYEES_TABLE
            WHERE email = :email
        """),
        {"email": request.email},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=400, detail="Invalid email")

    stored_otp, expiry = result

    if not stored_otp or not expiry:
        raise HTTPException(
            status_code=400, detail="OTP expired or not found. Please request again."
        )

    if stored_otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.now() > expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    # 🔐 Limit password length
    if len(request.new_password) > 20:
        raise HTTPException(
            status_code=400, detail="Password too long (max 20 characters)"
        )

    validate_password(request.new_password)

    # 🔐 Hash password
    safe_password = request.new_password[:72]
    # 🔐 Hash new password
    hashed_password = pwd_context.hash(request.new_password)

    # 🔁 Update password + Clear OTP
    db.execute(
        text("""
            UPDATE EMPLOYEES_TABLE
            SET permanent_password = :password,
                reset_otp = NULL,
                reset_otp_expiry = NULL
            WHERE email = :email
        """),
        {"password": request.new_password, "email": request.email},
    )
    db.commit()

    return {"message": "Password reset successful"}


@app.post("/api/employee/dbupdate_password")
def update_employee_password(
    data: EmployeePasswordUpdate, db: Session = Depends(get_employees_db)
):

    # 1️⃣ Password match check
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    validate_password(data.new_password)

    # 2️⃣ Check employee exists & has temporary password
    result = db.execute(
        text("""
            SELECT first_name, last_name, initial_name, temporary_password 
            FROM EMPLOYEES_TABLE 
            WHERE emp_id = :emp_id
        """),
        {"emp_id": data.emp_id},
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    first_name = result.first_name
    last_name = result.last_name
    temp_password = result.temporary_password

    if temp_password is None:
        raise HTTPException(
            status_code=400,
            detail="Password already set. Cannot change again using this method.",
        )

    # 3️⃣ Move password → permanent & remove temporary
    db.execute(
        text("""
            UPDATE EMPLOYEES_TABLE
            SET permanent_password = :new_password,
                temporary_password = NULL
            WHERE emp_id = :emp_id
        """),
        {"new_password": data.new_password, "emp_id": data.emp_id},
    )

    db.commit()

    return {
        "message": f"Permanent password set successfully for {first_name} {last_name}",
        "emp_id": data.emp_id,
        "first_name": first_name,
        "last_name": last_name,
    }


@app.post("/api/dbTemporaryemployee/login")
def employee_login(credentials: TempemployeeLogin, db=Depends(get_employees_db)):

    query = text("""
        SELECT emp_id, first_name, last_name, initial_name, email, temporary_password,
               department, position, status
        FROM EMPLOYEES_TABLE
        WHERE emp_id = :emp_id AND email = :email
    """)

    result = db.execute(
        query, {"emp_id": credentials.emp_id, "email": credentials.email}
    ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp = dict(result._mapping)

    if emp["temporary_password"] != credentials.temporary_password:
        raise HTTPException(status_code=401, detail="Invalid password")

    if emp["status"] != "Active":
        raise HTTPException(status_code=403, detail="Account not active")

    return {
        "message": f"Welcome {emp['first_name']} {emp['last_name']}!",
        "emp_id": emp["emp_id"],
        "first_name": emp["first_name"],
        "last_name": emp["last_name"],
        "email": emp["email"],
        "department": emp["department"],
        "position": emp["position"],
        "status": emp["status"],
    }


@app.post("/api/employee/dblogin")
def login_employee(data: EmployeeLogin, db: Session = Depends(get_employees_db)):

    result = db.execute(
        text("""
            SELECT emp_id, permanent_password, status, profile_completed
            FROM EMPLOYEES_TABLE
            WHERE email = :email 
        """),
        {"email": data.email},
    ).fetchone()

    # 1️⃣ Check if employee exists
    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp_id = result[0]
    permanent_password = result[1]
    status = result[2]
    profile_completed = result[3]

    # 2️⃣ Check if status is Active
    if status != "Active":
        raise HTTPException(
            status_code=403,
            detail="Employee account is not active. Please contact admin.",
        )

    # 3️⃣ Check password exists
    if permanent_password is None:
        raise HTTPException(
            status_code=403, detail="Permanent password not set. Please contact admin."
        )

    # 4️⃣ Validate password
    if permanent_password != data.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    return {
        "message": "Login successful! Welcome to the Employee Portal",
        "emp_id": emp_id,  # ✅ ADD THIS
        "profile_completed": profile_completed,  # ✅ ADD THIS
    }


@app.post("/api/admin/dbprofile")
def get_admin_profile(data: ProfileRequest, db: Session = Depends(get_admin_db)):
    # Fetch admin from SQL database
    admin = db.query(Admin).filter(Admin.email == data.email).first()

    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    return {
        "id": admin.id,  # if you have id column
        "name": admin.name,
        "email": admin.email,
    }


# ""


@app.get("/api/admin/employees")
def get_all_employees(db: Session = Depends(get_employees_db)):

    employees = db.query(Employee).all()

    return employees


@app.get("/api/admin/employees/{emp_id}")
def get_employee_by_id(emp_id: str, db: Session = Depends(get_employees_db)):
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Convert SQLAlchemy object to dict
    employee_dict = {
        c.name: getattr(employee, c.name) for c in employee.__table__.columns
    }

    return employee_dict


@app.post("/api/employee/personal_info/{emp_id}")
def add_personal_info(
    emp_id: str, info: EmployeePersonalInfo, db: Session = Depends(get_employees_db)
):

    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee ID not found")

    # -------- Personal Info --------
    employee.gender = info.gender
    employee.dob = info.dob
    employee.contact_number = info.contact_number
    employee.nationality = info.nationality
    employee.marital_status = info.martial_status

    # -------- Permanent Address --------
    employee.permanent_address = info.permanent_address.address
    employee.permanent_state = info.permanent_address.state
    employee.permanent_country = info.permanent_address.country
    employee.permanent_pincode = info.permanent_address.pincode

    # -------- Temporary Address --------
    if info.temporary_address:
        employee.temporary_address = info.temporary_address.address
        employee.temporary_state = info.temporary_address.state
        employee.temporary_country = info.temporary_address.country
        employee.temporary_pincode = info.temporary_address.pincode

    # -------- Emergency Contact --------
    employee.emergency_contact_name = info.emergency_contact.contact_name
    employee.emergency_relationship = info.emergency_contact.relationship
    employee.emergency_contact_number = info.emergency_contact.contact_number
    employee.emergency_contact_address = info.emergency_contact.address

    # -------- UnderGraduate --------
    employee.undergraduate_name = info.education.undergraduate.name
    employee.undergraduate_university = info.education.undergraduate.university
    employee.undergraduate_year_of_completion = (
        info.education.undergraduate.year_of_completion
    )
    employee.undergraduate_percentage_or_cgpa = (
        info.education.undergraduate.percentage_or_cgpa
    )

    # -------- PostGraduate (optional) --------
    if info.education.postgraduate:
        employee.PostGraduate_degree_name = info.education.postgraduate.degree_name
        employee.PostGraduate_university = info.education.postgraduate.university
        employee.PostGraduate_year_of_completion = (
            info.education.postgraduate.year_of_completion
        )
        employee.PostGraduate_percentage_or_cgpa = (
            info.education.postgraduate.percentage_or_cgpa
        )

    # -------- School --------
    employee.school_level = info.education.school.level
    employee.school_name = info.education.school.school_name
    employee.school_board_name = info.education.school.board_name
    employee.school_year_of_completion = info.education.school.year_of_completion
    employee.school_percentage = info.education.school.percentage

    # -------- Bank Details --------
    employee.account_holder_name = info.bank_details.account_holder_name
    employee.bank_name = info.bank_details.bank_name
    employee.branch_name = info.bank_details.branch_name
    employee.ifsc = info.bank_details.ifsc
    employee.account_number = info.bank_details.account_number

    # -------- Profile Status --------
    profile_complete = all(
        [
            info.gender,
            info.dob,
            info.nationality,
            info.martial_status,
            info.contact_number,
            info.permanent_address.address,
            info.permanent_address.state,
            info.permanent_address.country,
            info.permanent_address.pincode,
            info.bank_details.account_holder_name,
            info.bank_details.bank_name,
            info.bank_details.branch_name,
            info.bank_details.account_number,
            info.bank_details.ifsc,
            info.emergency_contact.contact_name,
            info.emergency_contact.contact_number,
            info.emergency_contact.address,
            info.education.undergraduate.name,
            info.education.undergraduate.university,
            info.education.undergraduate.year_of_completion,
            info.education.undergraduate.percentage_or_cgpa,
        ]
    )

    employee.profile_completed = profile_complete
    employee.profile_completed_at = datetime.now() if profile_complete else None

    db.commit()
    db.refresh(employee)

    return {
        "message": f"Profile Completed successfully, Welcome {employee.first_name} {employee.last_name}",
        "emp_id": emp_id,
    }

    ########


@app.post("/api/admin/send_custom_mail")
def send_email_to_employee(
    email_request: SendEmailRequest, db: Session = Depends(get_employees_db)
):
    """
    Send an email to an employee and store it in the email history.
    Uses SENDER_EMAIL as the from address.
    """
    # 1. Find the employee
    employee = (
        db.query(Employee).filter(Employee.emp_id == email_request.emp_id).first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    recipient_email = employee.email

    # 2. Create email message
    msg = EmailMessage()
    msg["Subject"] = email_request.subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = recipient_email
    msg.set_content(email_request.body)

    # 3. Try to send the email
    email_history = None
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
            smtp.send_message(msg)

        # 4. Create email history record (success)
        email_history = EmailHistory(
            emp_id=email_request.emp_id,
            recipient_email=recipient_email,
            subject=email_request.subject,
            body=email_request.body,
            # email_type=email_request.email_type,
            sent_by=SENDER_EMAIL,  # Admin who sent (can be enhanced with auth)
            status="sent",
        )
        db.add(email_history)
        db.commit()
        db.refresh(email_history)

        return {
            "success": True,
            "message": f"Email sent successfully to {recipient_email}",
            "email_id": email_history.id,
        }

    except Exception as e:
        # 5. Create email history record (failed)
        error_message = str(e)
        email_history = EmailHistory(
            emp_id=email_request.emp_id,
            recipient_email=recipient_email,
            subject=email_request.subject,
            body=email_request.body,
            email_type=email_request.email_type,
            sent_by=None,
            status="failed",
            error_message=error_message,
        )
        db.add(email_history)
        db.commit()
        db.refresh(email_history)

        raise HTTPException(
            status_code=500, detail=f"Failed to send email: {error_message}"
        )


@app.get("/api/admin/sent_mails")
def get_all_email_history(db: Session = Depends(get_employees_db)):
    """
    Get all email history across all employees.
    """
    emails = db.query(EmailHistory).order_by(EmailHistory.sent_at.desc()).all()

    email_list = []
    for email in emails:
        # Get employee name
        employee = db.query(Employee).filter(Employee.emp_id == email.emp_id).first()
        employee_name = (
            f"{employee.first_name} {employee.last_name}" if employee else "Unknown"
        )
        first_name = employee.first_name if employee else ""
        last_name = employee.last_name if employee else ""

        email_list.append(
            {
                "id": email.id,
                "emp_id": email.emp_id,
                "full_name": employee_name,
                "first_name": first_name,
                "last_name": last_name,
                "recipient_email": email.recipient_email,
                "subject": email.subject,
                "body": email.body,
                "email_type": None,
                "sent_at": email.sent_at.isoformat() if email.sent_at else None,
                "sent_by": email.sent_by,
                "status": email.status,
                "error_message": email.error_message,
            }
        )

    return {"total_emails": len(email_list), "emails": email_list}


@app.get("/api/admin/sent_mails/{mail_id}")
def get_email_history_by_employee(emp_id: str, db: Session = Depends(get_employees_db)):
    """
    Get email history for a specific employee.
    """
    # 1. Find the employee
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # 2. Get email history
    emails = (
        db.query(EmailHistory)
        .filter(EmailHistory.emp_id == emp_id)
        .order_by(EmailHistory.sent_at.desc())
        .all()
    )

    # 3. Build response
    email_list = []
    for email in emails:
        email_list.append(
            {
                "id": email.id,
                "emp_id": email.emp_id,
                "recipient_email": email.recipient_email,
                "subject": email.subject,
                "body": email.body,
                "email_type": None,
                "sent_at": email.sent_at.isoformat() if email.sent_at else None,
                "sent_by": email.sent_by,
                "status": email.status,
                "error_message": email.error_message,
            }
        )

    return {
        "emp_id": employee.emp_id,
        "first_name": employee.first_name,
        "last_name": employee.last_name,
        "email": employee.email,
        "emails": email_list,
    }

    #######


@app.post("/api/admin/dbsend_offer_letter/{emp_id}")
def send_offer_letter(emp_id: str, db: Session = Depends(get_employees_db)):

    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee ID not found")

    # Check if offer letter already sent
    if employee.offer_letter_status == "Sent":
        return {
            "message": f"Offer letter already sent to {employee.first_name} {employee.last_name}",
            "status": "Already Sent",
            "first_name": employee.first_name,
            "last_name": employee.last_name,
        }

    # Generate Offer Letter PDF
    pdf_path = generate_offer_letter_pdf(employee)

    # Send Email
    send_offer_letter_email(
        to_email=employee.email,
        first_name=employee.first_name,
        last_name=employee.last_name,
        initial_name=employee.initial_name,
        position=employee.position,
        employment_type=employee.employment_type,
        pdf_path=pdf_path,
    )

    # Update database
    employee.offer_letter_status = "Sent"
    employee.offer_letter_sent_at = datetime.now()

    db.commit()
    db.refresh(employee)

    return {
        "message": f"Offer letter sent successfully to {employee.first_name} {employee.last_name}",
        "status": "Sent",
        "first_name": employee.first_name,
        "last_name": employee.last_name,
    }


@app.post("/api/employee/upload_document")
async def upload_document(
    emp_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_employees_db),
):
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()
    if not employee:
        return {"error": "Employee not found"}

    if "." not in document_type:
        return {"error": "Invalid format. Use Category.SubCategory"}

    main_key, sub_key = document_type.split(".")
    main_key = main_key.strip()
    sub_key = sub_key.strip()

    allowed_categories = [
        "profile_photo",
        "identity_proofs",
        "educational_certificates",
        "additional_certificates",
        "experience_documents",
    ]

    if main_key not in allowed_categories:
        return {"error": f"Invalid document category: {main_key}"}

    # ✅ Profile photo is auto-verified — skip pending check
    is_profile_photo = main_key == "profile_photo"

    existing_doc = (
        db.query(EmployeeDocument)
        .filter(
            EmployeeDocument.emp_id == emp_id,
            EmployeeDocument.document_category == main_key,
            EmployeeDocument.document_sub_category == sub_key,
        )
        .first()
    )

    if existing_doc and not is_profile_photo:
        if existing_doc.document_status == "pending":
            return {
                "message": "Admin needs to verify your document",
                "status": "pending",
            }
        if existing_doc.document_status == "verified":
            return {
                "message": "Document already verified — no need to upload again",
                "status": "verified",
            }
        # rejected → allow re-upload (fall through)

    # Read file
    file_content = await file.read()

    mime_type = "application/octet-stream"
    if file.filename:
        ext = file.filename.lower().split(".")[-1] if "." in file.filename else ""
        mime_types = {
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "pdf": "application/pdf",
            "doc": "application/msword",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
        mime_type = mime_types.get(ext, "application/octet-stream")

    upload_dir = f"uploads/{emp_id}"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    with open(file_path, "wb") as f:
        f.write(file_content)

    # ✅ Profile photo → auto set to "verified", others → "pending"
    final_status = "verified" if is_profile_photo else "pending"

    if existing_doc:
        existing_doc.document_name = file.filename
        existing_doc.document_url = file_path
        existing_doc.document_content = file_content
        existing_doc.document_mime_type = mime_type
        existing_doc.document_status = "pending"

        # RESET old notification state
        existing_doc.employee_read = 0
        existing_doc.verified_at = None
        existing_doc.rejection_reason = None
        existing_doc.uploaded_at = datetime.now()
        # ✅ Auto-set verified_at for profile photo
        if is_profile_photo:
            existing_doc.verified_at = datetime.now()
        db.commit()
        db.refresh(existing_doc)
    else:
        new_document = EmployeeDocument(
            emp_id=emp_id,
            document_category=main_key,
            document_sub_category=sub_key,
            document_name=file.filename,
            document_url=file_path,
            document_content=file_content,
            document_mime_type=mime_type,
            document_status=final_status,
            # ✅ Auto-set verified_at for profile photo
            verified_at=datetime.now() if is_profile_photo else None,
        )
        db.add(new_document)
        db.commit()
        db.refresh(new_document)

    return {
        "message": "Profile photo saved successfully!"
        if is_profile_photo
        else "Document uploaded successfully",
        "status": final_status,
        "emp_id": emp_id,
        "category": main_key,
        "document": sub_key,
    }


@app.get("/api/admin/all_documents")
def get_all_documents(db: Session = Depends(get_employees_db)):
    documents = db.query(EmployeeDocument).all()

    result = []
    for doc in documents:
        result.append(
            {
                "emp_id": doc.emp_id,
                "document_category": doc.document_category,
                "document_sub_category": doc.document_sub_category,
                "document_name": doc.document_name,
                "document_url": doc.document_url,
                "document_status": doc.document_status,
                "uploaded_at": str(doc.uploaded_at) if doc.uploaded_at else None,
            }
        )

    return {"documents": result}


@app.post("/api/admin/verify_document")
def verify_document(
    emp_id: str = Form(...),
    document_type: str = Form(...),
    status: str = Form(...),  # verified / rejected
    remarks: str = Form(None),
    db: Session = Depends(get_employees_db),
):
    # 1️⃣ Validate document_type format
    if "." not in document_type:
        return {"error": "Invalid document_type. Use Category.SubCategory"}

    main_key, sub_key = document_type.split(".")
    main_key = main_key.strip()
    sub_key = sub_key.strip()

    # 2️⃣ Validate status
    if status not in ["verified", "rejected"]:
        return {"error": "Status must be 'verified' or 'rejected'"}

    # 3️⃣ Find document in database
    document = (
        db.query(EmployeeDocument)
        .filter(
            EmployeeDocument.emp_id == emp_id,
            EmployeeDocument.document_category == main_key,
            EmployeeDocument.document_sub_category == sub_key,
        )
        .first()
    )

    if not document:
        return {"error": "Document not found"}

    # 4️⃣ Update document status
    document.document_status = status

    # Make notification unread again for re-uploaded docs
    document.employee_read = 0

    # Refresh notification timestamp
    document.verified_at = datetime.now()

    if status == "verified":
        document.rejection_reason = None
    else:
        document.rejection_reason = remarks or ""

    db.commit()
    db.refresh(document)

    return {
        "message": "Document status updated",
        "emp_id": emp_id,
        "category": main_key,
        "document": sub_key,
        "status": status,
        "remarks": remarks,
    }


#######


@app.put("/api/admin/employees/{emp_id}/Inactive")
def deactivate_employee(emp_id: str, db: Session = Depends(get_employees_db)):
    employee = db.query(Employee).filter(Employee.emp_id == emp_id).first()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee.status = "Inactive"
    employee.deactivated_at = datetime.now()

    db.commit()
    db.refresh(employee)

    return {
        "message": f"Employee {emp_id} deactivated successfully",
        "status": "Inactive",
    }


#########

@app.get("/api/admin/check-worker-email")
def check_worker_email(
    email: str = Query(...),
    db: Session = Depends(get_employees_db)
):
    existing = (
        db.query(Worker)
        .filter(func.lower(Worker.email) == email.lower())
        .first()
    )

    return {
        "exists": existing is not None,
        "message": "Email already exists" if existing else "Email is available"
    }


@app.post("/api/admin/add_worker")
def add_worker(worker: AddWorker, db: Session = Depends(get_employees_db)):
    """Add a new worker to the database"""

    # Check duplicate phone number if provided
    if worker.phone_number:
        existing_phone = (
            db.query(Worker).filter(Worker.phone_number == worker.phone_number).first()
        )
        if existing_phone:
            raise HTTPException(status_code=400, detail="Phone number already exists")

    # Check duplicate email if provided
    if worker.email:
        existing_email = db.query(Worker).filter(Worker.email == worker.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

    # Generate Worker ID
    worker_id = generate_worker_id(worker.first_name, db)

    # Create new worker
    new_worker = Worker(
        worker_id=worker_id,
        first_name=worker.first_name,
        last_name=worker.last_name,
        initial_name=worker.initial_name,
        phone_number=worker.phone_number,
        email=worker.email,
        category=worker.category,
        sub_category=worker.sub_category,
        work_location=worker.work_location,
        employment_type=worker.employment_type,
        date_of_join=worker.date_of_join,
        status=worker.status,
        basic_salary=worker.basic_salary,
        overtime=worker.overtime,
        bonus=worker.bonus,
        allowance=worker.allowance,
        total_salary=worker.total_salary,
    )

    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)

    return {
        "message": "Worker added successfully",
        "worker_id": new_worker.worker_id,
        "worker": {
            "worker_id": new_worker.worker_id,
            "first_name": new_worker.first_name,
            "last_name": new_worker.last_name,
            "initial_name": new_worker.initial_name,
            "phone_number": new_worker.phone_number,
            "email": new_worker.email,
            "category": new_worker.category,
            "sub_category": new_worker.sub_category,
            "work_location": new_worker.work_location,
            "employment_type": new_worker.employment_type,
            "date_of_join": str(new_worker.date_of_join),
            "status": new_worker.status,
            "basic_salary": new_worker.basic_salary,
            "overtime": new_worker.overtime,
            "bonus": new_worker.bonus,
            "allowance": new_worker.allowance,
            "total_salary": new_worker.total_salary,
        },
    }


@app.get("/api/admin/workers")
def get_all_workers(db: Session = Depends(get_employees_db)):
    """Get all workers from the database"""
    workers = db.query(Worker).all()
    return {
        "workers": [
            {
                "worker_id": w.worker_id,
                "first_name": w.first_name,
                "last_name": w.last_name,
                "initial_name": w.initial_name,
                "phone_number": w.phone_number,
                "email": w.email,
                "category": w.category,
                "sub_category": w.sub_category,
                "work_location": w.work_location,
                "employment_type": w.employment_type,
                "date_of_join": str(w.date_of_join),
                "status": w.status,
                "basic_salary": w.basic_salary,
                "overtime": w.overtime,
                "bonus": w.bonus,
                "allowance": w.allowance,
                "total_salary": w.total_salary,
                "worker_offer_letter_status": w.worker_offer_letter_status,
                "worker_offer_letter_sent_at": w.worker_offer_letter_sent_at,
            }
            for w in workers
        ]
    }


@app.get("/api/admin/workers/{worker_id}")
def get_worker(worker_id: str, db: Session = Depends(get_employees_db)):
    """Get a specific worker by worker_id"""
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()

    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    return {
        "worker_id": worker.worker_id,
        "first_name": worker.first_name,
        "last_name": worker.last_name,
        "initial_name": worker.initial_name,
        "phone_number": worker.phone_number,
        "email": worker.email,
        "category": worker.category,
        "sub_category": worker.sub_category,
        "work_location": worker.work_location,
        "employment_type": worker.employment_type,
        "date_of_join": str(worker.date_of_join),
        "status": worker.status,
        "basic_salary": worker.basic_salary,
        "overtime": worker.overtime,
        "bonus": worker.bonus,
        "allowance": worker.allowance,
        "total_salary": worker.total_salary,
    }


@app.post("/api/admin/send_worker_offer_letter/{worker_id}")
def send_worker_offer_letter(worker_id: str, db: Session = Depends(get_employees_db)):
    """Send offer letter to worker"""

    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()

    if not worker:
        raise HTTPException(status_code=404, detail="Worker ID not found")

    # Check if offer letter already sent
    if worker.worker_offer_letter_status == "sent":
        return {
            "message": f"Offer letter already sent to {worker.first_name}",
            "status": "Already Sent",
        }

    # Generate Offer Letter PDF
    pdf_path = generate_worker_offer_letter_pdf(worker)

    # Send Email
    send_worker_offer_letter_email(
        to_email=worker.email,
        First_name=worker.first_name,
        Last_name=worker.last_name,
        Initial_name=worker.initial_name,
        sub_category=worker.sub_category,
        employment_type=worker.employment_type,
        pdf_path=pdf_path,
    )

    # Update database
    worker.worker_offer_letter_status = "sent"
    worker.worker_offer_letter_sent_at = datetime.now()

    db.commit()
    db.refresh(worker)

    return {
        "message": f"Offer letter sent successfully to {worker.first_name}",
        "status": "sent",
    }


@app.put("/api/admin/workers/{worker_id}/Inactive")
def deactivate_worker(worker_id: str, db: Session = Depends(get_employees_db)):
    worker = db.query(Worker).filter(Worker.worker_id == worker_id).first()

    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    worker.status = "Inactive"
    worker.deactivated_at = datetime.now()

    db.commit()
    db.refresh(worker)

    return {
        "message": f"Worker {worker_id} deactivated successfully",
        "status": "Inactive",
    }


@app.post("/api/employee/request_update")
def request_update(data: dict, db: Session = Depends(get_employees_db)):

    # -------------------------------
    # Check duplicate Email
    # -------------------------------
    if data.get("email"):
        existing = (
            db.query(Employee)
            .filter(Employee.email == data["email"])
            .first()
        )

        if existing and existing.emp_id != data["emp_id"]:
            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

    # -------------------------------
    # Check duplicate Phone
    # -------------------------------
    if data.get("phone"):
        existing = (
            db.query(Employee)
            .filter(Employee.contact_number == data["phone"])
            .first()
        )

        if existing and existing.emp_id != data["emp_id"]:
            raise HTTPException(
                status_code=400,
                detail="Phone number already exists."
            )

    # -------------------------------
    # Check existing pending request
    # -------------------------------
    pending = db.execute(
        text("""
            SELECT *
            FROM EMPLOYEE_EDIT_REQUESTS
            WHERE emp_id = :emp_id
            AND status = 'pending'
        """),
        {
            "emp_id": data["emp_id"]
        }
    ).fetchone()

    # ======================================================
    # UPDATE EXISTING PENDING REQUEST
    # ======================================================
    if pending:

        # Preserve old values if new ones are not sent
        new_email = (
            data.get("email")
            if data.get("email") is not None
            else pending.new_email
        )

        new_phone = (
            data.get("phone")
            if data.get("phone") is not None
            else pending.new_phone
        )

        db.execute(
            text("""
                UPDATE EMPLOYEE_EDIT_REQUESTS
                SET
                    new_email = :email,
                    new_phone = :phone,
                    requested_at = GETDATE()
                WHERE id = :id
            """),
            {
                "id": pending.id,
                "email": new_email,
                "phone": new_phone,
            },
        )

        db.commit()

        return {
            "message": "Existing profile update request updated successfully."
        }

    # ======================================================
    # CREATE NEW REQUEST
    # ======================================================
    db.execute(
        text("""
            INSERT INTO EMPLOYEE_EDIT_REQUESTS
            (
                emp_id,
                new_email,
                new_phone,
                status,
                requested_at,
                employee_read
            )
            VALUES
            (
                :emp_id,
                :email,
                :phone,
                'pending',
                GETDATE(),
                0
            )
        """),
        {
            "emp_id": data["emp_id"],
            "email": data.get("email"),
            "phone": data.get("phone"),
        },
    )

    db.commit()

    return {
        "message": "Profile update request sent successfully."
    }



@app.post("/api/admin/approve_update/{request_id}")
def approve_update(request_id: int, db: Session = Depends(get_employees_db)):

    req = db.execute(
        text("""
            SELECT * FROM EMPLOYEE_EDIT_REQUESTS
            WHERE id = :id
        """),
        {"id": request_id},
    ).fetchone()

    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Update email only if requested
    if req.new_email:
        db.execute(
            text("""
                UPDATE EMPLOYEES_TABLE
                SET email = :email
                WHERE emp_id = :emp_id
            """),
            {
                "email": req.new_email,
                "emp_id": req.emp_id,
            },
        )

    # Update phone only if requested
    if req.new_phone:
        db.execute(
            text("""
                UPDATE EMPLOYEES_TABLE
                SET contact_number = :phone
                WHERE emp_id = :emp_id
            """),
            {
                "phone": req.new_phone,
                "emp_id": req.emp_id,
            },
        )

    # Mark request approved
    db.execute(
        text("""
            UPDATE EMPLOYEE_EDIT_REQUESTS
            SET status = 'approved',
                reviewed_at = GETDATE()
            WHERE id = :id
        """),
        {"id": request_id},
    )

    db.commit()

    # Get updated employee details
    employee = db.query(Employee).filter(Employee.emp_id == req.emp_id).first()

    send_custom_email(
        to_email=employee.email,
        subject="Profile Update Approved",
        message="Your profile changes have been approved by admin.",
    )

    return {"message": "Approved & updated"}

@app.post("/api/admin/reject_update/{request_id}")
def reject_update(request_id: int, db: Session = Depends(get_employees_db)):

    db.execute(
        text("""
        UPDATE EMPLOYEE_EDIT_REQUESTS
        SET status = 'rejected', reviewed_at = GETDATE()
        WHERE id = :id
    """),
        {"id": request_id},
    )

    db.commit()

    return {"message": "Request rejected"}


@app.get("/api/admin/edit_notifications")
def get_notifications(db: Session = Depends(get_employees_db)):

    result = db.execute(
        text("""
            SELECT
                id,
                emp_id,
                new_email,
                new_phone,
                status,
                requested_at
            FROM EMPLOYEE_EDIT_REQUESTS
            WHERE status='pending'
            ORDER BY requested_at DESC
        """)
    ).fetchall()

    notifications = []

    for row in result:

        notifications.append({
            "id": row.id,
            "emp_id": row.emp_id,
            "new_email": row.new_email,
            "new_phone": row.new_phone,
            "status": row.status,
            "requested_at": row.requested_at.isoformat()
        })

    return notifications


@app.get("/api/admin/notification_count")
def notification_count(db: Session = Depends(get_employees_db)):

    result = db.execute(
        text("""
            SELECT COUNT(*)
            FROM EMPLOYEE_EDIT_REQUESTS
            WHERE status='pending'
        """)
    ).fetchone()

    return {
        "count": result[0]
    }


@app.get("/api/employee/unified_notifications/{emp_id}")
def get_unified_notifications(emp_id: str, db: Session = Depends(get_employees_db)):
    """
    Unified notification system combining profile edit requests and document verifications.
    Returns normalized notifications sorted by date (latest first).
    """
    # 1. Fetch approved/rejected profile edit requests
    edit_requests = db.execute(
        text("""
            SELECT id, emp_id, status, reviewed_at as notification_date
            FROM EMPLOYEE_EDIT_REQUESTS
            WHERE emp_id = :emp_id AND status IN ('approved', 'rejected')
        """),
        {"emp_id": emp_id}
    ).fetchall()

    # 2. Fetch verified/rejected documents
    documents = db.execute(
        text("""
            SELECT id, emp_id, document_status as status, verified_at as notification_date
            FROM EMPLOYEE_DOCUMENTS
            WHERE emp_id = :emp_id AND document_status IN ('verified', 'rejected')
        """),
        {"emp_id": emp_id}
    ).fetchall()

    # 3. Normalize: combine both into single notification list
    notifications = []

    for row in edit_requests:
        notifications.append({
            "id": row.id,
            "type": "profile_edit",
            "status": row.status,  # approved / rejected
            "notification_date": row.notification_date.isoformat() if row.notification_date else None,
            "message": f"Your profile update request has been {row.status}",
        })

    for row in documents:
        notifications.append({
            "id": row.id,
            "type": "document",
            "status": row.status,  # verified / rejected
            "notification_date": row.notification_date.isoformat() if row.notification_date else None,
            "message": f"Your document has been {row.status}",
        })

    # 4. Sort by notification_date descending (latest first)
    notifications.sort(
        key=lambda x: x["notification_date"] or "",
        reverse=True
    )

    return {"notifications": notifications}


@app.get("/api/employee/notifications/{emp_id}")
def get_employee_notifications(emp_id: str, db: Session = Depends(get_employees_db)):
    """
    Get unread notifications for an employee from both edit requests and documents.
    Returns unified notification format sorted by date (latest first).
    """
    # 1. Fetch unread approved/rejected profile edit requests
    edit_requests = db.execute(
        text("""
            SELECT id, status, reviewed_at as date
            FROM EMPLOYEE_EDIT_REQUESTS
            WHERE emp_id = :emp_id 
              AND status IN ('approved', 'rejected')
              AND employee_read = 0
        """),
        {"emp_id": emp_id}
    ).fetchall()

    # 2. Fetch unread verified/rejected documents
    documents = db.execute(
        text("""
            SELECT 
                id,
                document_status as status,
                document_sub_category,
                verified_at as date
            FROM EMPLOYEE_DOCUMENTS
            WHERE emp_id = :emp_id
            AND document_status IN ('verified', 'rejected')
            AND employee_read = 0
        """),
        {"emp_id": emp_id}
    ).fetchall()

    # 3. Normalize and combine
    notifications = []

    for row in edit_requests:
        notif_type = "approved" if row.status == "approved" else "rejected"
        notifications.append({
            "id": row.id,
            "table_type": "edit_request",
            "type": notif_type,
            "title": "Profile Update " + notif_type.title(),
            "message": f"Your profile update request has been {row.status}",
            "date": row.date.isoformat() if row.date else None,
        })

    for row in documents:
        notif_type = "approved" if row.status == "verified" else "rejected"

        doc_name = row.document_sub_category.replace("_", " ").title()

        notifications.append({
            "id": row.id,
            "table_type": "document",
            "type": notif_type,
            "title": f"{doc_name} {notif_type.title()}",
            "message": f"Your {doc_name} has been {row.status}",
            "date": row.date.isoformat() if row.date else None,
        })

    # 4. Sort by date descending
    notifications.sort(key=lambda x: x["date"] or "", reverse=True)

    return {"notifications": notifications}


@app.put("/api/employee/mark_notification_read")
def mark_notification_read(data: dict, db: Session = Depends(get_employees_db)):
    """
    Mark a notification as read by setting employee_read = 1.
    Expects: { "table_type": "edit_request" | "document", "id": int }
    """
    table_type = data.get("table_type")
    notif_id = data.get("id")

    if not table_type or not notif_id:
        raise HTTPException(status_code=400, detail="table_type and id are required")

    if table_type == "edit_request":
        result = db.execute(
            text("""
                UPDATE EMPLOYEE_EDIT_REQUESTS
                SET employee_read = 1
                WHERE id = :id
            """),
            {"id": notif_id}
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

    elif table_type == "document":
        result = db.execute(
            text("""
                UPDATE EMPLOYEE_DOCUMENTS
                SET employee_read = 1
                WHERE id = :id
            """),
            {"id": notif_id}
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")

    else:
        raise HTTPException(status_code=400, detail="Invalid table_type")

    db.commit()
    return {"message": "Notification marked as read"}

