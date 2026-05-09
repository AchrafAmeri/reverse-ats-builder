from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
import database
from database import get_db
import services
from services.matching import calculate_match
from routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.MatchResponse)
def match_user_to_job(request: schemas.MatchRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    match_result = calculate_match(user, request.job_description)
    return match_result
