
from getpass import getpass

from dotenv import load_dotenv

load_dotenv()

from pwdlib import PasswordHash

from .database import SessionLocal
from .models import User


password_hasher = PasswordHash.recommended()

db = SessionLocal()

try:
    email = input("Enter existing student email: ").strip().lower()

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:
        print("Student account not found.")
    else:
        password = getpass("Enter new password: ")
        confirm = getpass("Confirm password: ")

        if len(password) < 8 or len(password) > 128:
            print("Password must contain 8–128 characters.")

        elif password != confirm:
            print("Passwords do not match.")

        else:
            user.password_hash = password_hasher.hash(password)
            db.commit()

            print("Password successfully configured.")
            print(f"Account activated for: {user.email}")

finally:
    db.close()
