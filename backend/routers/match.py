from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import get_db
from ..services.matching import calculate_match

router = APIRouter()

@router.post("/", response_model=schemas.MatchResponse)
def match_profile(request: schemas.MatchRequest, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .options(
            joinedload(models.User.experiences).joinedload(models.Experience.skills),
            joinedload(models.User.projects).joinedload(models.Project.skills)
        )
        .filter(models.User.id == request.user_id)
        .first()
    )
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    result = calculate_match(user, request.job_description)
    return result
