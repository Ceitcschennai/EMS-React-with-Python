import os
from xhtml2pdf import pisa
from datetime import date

def generate_offer_letter_pdf(employee):

    # Create output folder
    folder = "offer_letters"
    os.makedirs(folder, exist_ok=True)

    pdf_path = os.path.join(folder, f"{employee.emp_id}_offer_letter.pdf")

    # 1️⃣ Select template based on employment type
    if employee.employment_type.lower() == "permanent":
        template_file = "template.html"
    elif employee.employment_type.lower() == "contract":
        template_file = "contract_template.html"
    else:
        raise ValueError("Invalid employment type! Must be 'Permanent' or 'Contract'.")

    # 2️⃣ Load template
    with open(template_file, "r", encoding="utf-8") as f:
        html = f.read()

    # 3️⃣ Replace placeholders
    # full_name = ""
    # if employee.first_name:
    #     full_name = employee.first_name
    #     if employee.initial_name:
    #         full_name = f"{employee.first_name} {employee.initial_name}"
    #     if employee.last_name:
    #         full_name = f"{full_name} {employee.last_name}"
    # html = html.replace("{{ full_name }}", str(full_name or ""))
    html = html.replace("{{ first_name }}", str(employee.first_name or ""))
    html = html.replace("{{ last_name }}", str(employee.last_name or ""))
    html = html.replace("{{ initial_name }}", str(employee.initial_name or ""))
    html = html.replace("{{ position }}", str(employee.position or ""))
    html = html.replace("{{ total_ctc }}", str(employee.total_ctc or ""))
    html = html.replace("{{ date_of_join }}", str(employee.date_of_join or ""))
    html = html.replace("{{ employment_type }}", str(employee.employment_type or ""))

    # 4️⃣ Convert HTML → PDF
    with open(pdf_path, "wb") as result:
        pisa.CreatePDF(html, dest=result)

    return pdf_path