import smtplib
from email.message import EmailMessage

SENDER_EMAIL = "s.v.k23105@gmail.com"
APP_PASSWORD = "wcik fesl oppf fabr"

def send_offer_letter_email(to_email, first_name, last_name, initial_name, pdf_path, position, employment_type):
    full_name = first_name
    if initial_name:
        full_name = f"{first_name} {initial_name}"
    full_name = f"{full_name} {last_name}"
    
    msg = EmailMessage()
    msg["Subject"] = "CeiTCS - Offer Letter"
    
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    msg.set_content(

        f"Dear {full_name},\n\n"
        "Congratulations! We are pleased to offer you the position of "
        f"{position} at CeiTCS under {employment_type} employment.\n\n"
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
        msg.add_attachment(f.read(), maintype="application", subtype="pdf", filename="Offer_Letter.pdf")

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER_EMAIL, APP_PASSWORD)
        smtp.send_message(msg)
        

def send_custom_email(to_email: str, subject: str, message: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = SENDER_EMAIL
    msg["To"] = to_email

    msg.set_content(message)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER_EMAIL, APP_PASSWORD)
        smtp.send_message(msg)
