from pydantic import BaseModel,EmailStr
from pydantic import BaseModel,EmailStr,computed_field,Field
from typing import List, Literal, Optional
from datetime import datetime, date


class AdminRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str

class SuperAdmin(BaseModel):
    email: str
    password: str

class AdminLogin(BaseModel):
    email: str
    password: str

class ProfileRequest(BaseModel):
    email: str
    
SUPERADMIN_EMAIL = "s.v.k23105@gmail.com"
SUPERADMIN_PASSWORD = "vinay_30"

SENDER_PASSWORD = "wcik fesl oppf fabr" 
SENDER_EMAIL = "s.v.k23105@gmail.com"

class Addemployee(BaseModel):
    # Basic Info
    first_name: str
    last_name: Optional[str] = None
    initial_name: Optional[str] = None
    email: EmailStr

    # Employment Details
    employment_type: Literal["Permanent", "Contract", "Internship"]
    department: Literal["Human Resources", "Engineering", "Finance", "Marketing", "Operations", "Sales"]
    position: str
    date_of_join: str  # Format: YYYY-MM-DD

    # Salary Details
    basic_salary: float
    house_rent_allowance: float
    dearness_allowance: float
    travel_allowance: float
    other_allowance: float
    


    @computed_field
    @property
    def total_ctc(self) -> float:
        return (
            self.basic_salary +
            self.house_rent_allowance +
            self.dearness_allowance +
            self.travel_allowance +
            self.other_allowance
        )
    
class TempemployeeLogin(BaseModel):
    emp_id: str
    email: str
    temporary_password: str

class EmployeePasswordUpdate(BaseModel):
    emp_id: str
    new_password: str
    confirm_password: str
    
class EmployeeLogin(BaseModel):
    email: str
    password: str
##

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

class SendEmailRequest(BaseModel):
    emp_id: str
    subject: str
    body: str

class EmailHistoryResponse(BaseModel):
    id: int
    emp_id: str
    recipient_email: str
    subject: str
    body: str
    email_type: str
    sent_at: datetime
    sent_by: Optional[str] = None
    status: str
    error_message: Optional[str] = None

class EmailHistoryByEmployeeResponse(BaseModel):
    emp_id: str
    first_name: str
    last_name: str
    initial_name: Optional[str] = None
    email: str
    emails: List[EmailHistoryResponse]

##
class Address(BaseModel):
    address: str
    state: str
    country: str
    pincode: str

# ----------------------- EDUCATION MODELS -----------------------
class underGraduate(BaseModel):
    name: str
    university: str
    year_of_completion: str
    percentage_or_cgpa: str


class PostGraduate(BaseModel):
    degree_name: str
    university: str
    year_of_completion: str
    percentage_or_cgpa: str


class School(BaseModel):
    level: str  # "10th" or "12th"
    school_name: str
    board_name: str  # CBSE / State Board
    year_of_completion: str
    percentage: str


class Education(BaseModel):
    undergraduate: Optional[underGraduate] = None
    postgraduate: Optional[PostGraduate] = None
    school: Optional[School] = None


# ----------------------- BANK DETAILS MODEL -----------------------
class BankDetails(BaseModel):
    account_holder_name: str
    bank_name: str
    branch_name: str
    ifsc: str
    account_number: str

class emergencyContact(BaseModel):
    contact_name: str
    relationship: Literal["Friend", "Guardian", "Parent", "Sister"]
    contact_number: str
    address: str
    

# ---------------------- EMPLOYEE PERSONAL INFO ----------------------

class EmployeePersonalInfo(BaseModel):
    gender: Literal["Male", "Female"]
    dob: str
    contact_number: str
    nationality: Literal["Indian"]
    martial_status: Literal["Single", "Married"]

    temporary_address: Address | None = None
    permanent_address: Address

    education: Education = Field(default_factory=Education)
    bank_details: BankDetails
    emergency_contact: emergencyContact

    

class DocumentItem(BaseModel):
    emp_id: str
    document_type: str
    document_status: Literal["verified", "rejected"]
    comment: Optional[str] = ""


# ---------------------- IDENTITY PROOFS ----------------------
class IdentityProofs(BaseModel):
    aadhar_card: DocumentItem = Field(default_factory=DocumentItem)
    pan_card: DocumentItem = Field(default_factory=DocumentItem)
    passport: DocumentItem = Field(default_factory=DocumentItem)
    driving_license: DocumentItem = Field(default_factory=DocumentItem)


# ---------------------- EDUCATIONAL CERTIFICATES ----------------------
class EducationalCertificates(BaseModel):
    diploma_certificate: DocumentItem = Field(default_factory=DocumentItem)
    degree_certificate: DocumentItem = Field(default_factory=DocumentItem)
    postgraduate_certificate: DocumentItem = Field(default_factory=DocumentItem)
    consolidated_marksheet: DocumentItem = Field(default_factory=DocumentItem)
    provisional_certificate: DocumentItem = Field(default_factory=DocumentItem)
    transfer_certificate: DocumentItem = Field(default_factory=DocumentItem)


# ---------------------- ADDITIONAL CERTIFICATES ----------------------
class AdditionalCertificates(BaseModel):
    language_certificate: DocumentItem = Field(default_factory=DocumentItem)
    other_certificate: DocumentItem = Field(default_factory=DocumentItem)


# ---------------------- EXPERIENCE DOCUMENTS ----------------------
class ExperienceDocuments(BaseModel):
    experience_certificate_1: DocumentItem = Field(default_factory=DocumentItem)
    experience_certificate_2: DocumentItem = Field(default_factory=DocumentItem)
    experience_certificate_3: DocumentItem = Field(default_factory=DocumentItem)
    relieving_certificate: DocumentItem = Field(default_factory=DocumentItem)

    # Salary slips support multiple documents
    salary_slips: List[DocumentItem] = Field(default_factory=list)


# ---------------------- MAIN DOCUMENTS SECTION ----------------------
class Documents(BaseModel):
    profile_photo: dict = Field(default_factory=dict)
    identity_proofs: dict = Field(default_factory=dict)
    educational_certificates: dict = Field(default_factory=dict)
    additional_certificates: dict = Field(default_factory=dict)
    experience_documents: dict = Field(default_factory=dict)

documents: Documents = Field(default_factory=Documents)




class AddWorker(BaseModel):
    # Basic Info
    first_name: str
    last_name: Optional[str] = None
    initial_name: Optional[str] = None
    phone_number: str
    email: EmailStr | None = None

    # Work Details
    category: Literal["Mechanical", "Civil"]
    sub_category: Literal[
        "Fabricator",
        "Welder ARC",
        "Welder MIG FCAW",
        "Structural Fitter",
        "Grinder",
        "Gas Cutter",
        "Rigger",
        "Helper"
    ]

    work_location: str = "Pune"
    employment_type: Literal["Permanent", "Contract"] = "Contract"
    date_of_join: date
    status: Literal["Active", "Inactive"] = "Active"

    # Salary Details
    basic_salary: float
    overtime: float = 0
    bonus: float = 0
    allowance: float = 0

    @computed_field
    @property
    def total_salary(self) -> float:
        return (
            self.basic_salary +
            self.overtime +
            self.bonus +
            self.allowance
        )