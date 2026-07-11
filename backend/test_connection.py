from app.database import engine, Base
from app import models

print("Tables SQLAlchemy knows about:")
for table_name in Base.metadata.tables.keys():
    print(" -", table_name)