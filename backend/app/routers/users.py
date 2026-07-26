from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import hash_password
from app.auth import require_admin
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/users", tags=["users"])
limiter = Limiter(key_func=get_remote_address, storage_uri=os.getenv("REDIS_URL"))

@router.get("/", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return db.query(models.User).all()

@router.post("/", response_model=schemas.UserOut)
@limiter.limit("3/minute")
def create_user(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    try:
        hashed = hash_password(user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user