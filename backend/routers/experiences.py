from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
import database
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/experiences",
    tags=["experiences"],
)

@router.post("/", response_model=schemas.ExperienceResponse)
def create_experience(experience: schemas.ExperienceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_user = db.query(models.User).filter(models.User.id == experience.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    exp_data = experience.model_dump(exclude={"skill_ids"})
    new_experience = models.Experience(**exp_data)

    if experience.skill_ids:
        skills = db.query(models.Skill).filter(models.Skill.id.in_(experience.skill_ids)).all()
        new_experience.skills = skills

    db.add(new_experience)
    db.commit()
    db.refresh(new_experience)
    return new_experience

@router.get("/", response_model=List[schemas.ExperienceResponse])
def read_experiences(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    experiences = db.query(models.Experience).offset(skip).limit(limit).all()
    return experiences

@router.get("/{experience_id}", response_model=schemas.ExperienceResponse)
def read_experience(experience_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")
    return experience

@router.put("/{experience_id}", response_model=schemas.ExperienceResponse)
def update_experience(experience_id: int, experience: schemas.ExperienceUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if db_experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")

    update_data = experience.model_dump(exclude_unset=True, exclude={"skill_ids"})
    for key, value in update_data.items():
        setattr(db_experience, key, value)

    if experience.skill_ids is not None:
        skills = db.query(models.Skill).filter(models.Skill.id.in_(experience.skill_ids)).all()
        db_experience.skills = skills

    db.commit()
    db.refresh(db_experience)
    return db_experience

@router.delete("/{experience_id}")
def delete_experience(experience_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_experience = db.query(models.Experience).filter(models.Experience.id == experience_id).first()
    if db_experience is None:
        raise HTTPException(status_code=404, detail="Experience not found")

    db.delete(db_experience)
    db.commit()
    return {"message": "Experience deleted successfully"}
