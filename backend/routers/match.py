from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.matching import calculate_match

router = APIRouter()

@router.post("/", response_model=schemas.MatchResponse)
def match_user_to_job(request: schemas.MatchRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    match_result = calculate_match(user, request.job_description)
    return match_result
