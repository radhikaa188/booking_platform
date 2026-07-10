import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

#connection line to postgress(phone line)
engine = create_engine(DATABASE_URL)

#call to postgress
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#treat class specially — map it to a real database table.
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()