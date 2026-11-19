
from sqlalchemy import text

from .database import engine


def test_database_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))

            print("Database connected successfully!")
            print("PostgreSQL version:", result.scalar())

    except Exception as error:
        print("Database connection failed!")
        print(error)
        raise


if __name__ == "__main__":
    test_database_connection()
