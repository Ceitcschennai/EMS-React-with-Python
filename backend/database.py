from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
BaseAdmin = declarative_base()
BaseEmployees = declarative_base()


# # ADMIN DB
# DATABASE_URL_ADMIN = (
#     r"mssql+pyodbc://@localhost\SQLEXPRESS/Admin_db?"
#     "driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
# )

# engine_admin = create_engine(DATABASE_URL_ADMIN)
# SessionAdmin = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine_admin
# )

# # EMPLOYEES DB
# DATABASE_URL_EMPLOYEES = (
#     r"mssql+pyodbc://@localhost\SQLEXPRESS/Employees_db?"
#     "driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
# )


# engine_employees = create_engine(DATABASE_URL_EMPLOYEES)
# SessionEmployees = sessionmaker(
#     autocommit=False,
#     autoflush=False,
#     bind=engine_employees
# )


# ADMIN DB
DATABASE_URL_ADMIN = (
    r"mssql+pyodbc://@localhost\SQLEXPRESS/CEITCS_ERP?"
    "driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
)

engine_admin = create_engine(DATABASE_URL_ADMIN)
SessionAdmin = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_admin
)

# EMPLOYEES DB
DATABASE_URL_EMPLOYEES = (
    r"mssql+pyodbc://@localhost\SQLEXPRESS/CEITCS_ERP?"
    "driver=ODBC+Driver+17+for+SQL+Server&trusted_connection=yes"
)

engine_employees = create_engine(DATABASE_URL_EMPLOYEES)
SessionEmployees = sessionmaker(
    autocommit=False,
    autoflush=False,
    
    bind=engine_employees
)