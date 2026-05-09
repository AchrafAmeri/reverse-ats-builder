from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
import database
from database import get_db

router = APIRouter(
    prefix="/skills",
    tags=["skills"],
)

@router.post("/", response_model=schemas.SkillResponse)
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.name == skill.name).first()
    if db_skill:
        raise HTTPException(status_code=400, detail="Skill already exists")

    new_skill = models.Skill(**skill.model_dump())
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.get("/", response_model=List[schemas.SkillResponse])
def read_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    skills = db.query(models.Skill).offset(skip).limit(limit).all()
    return skills

@router.get("/{skill_id}", response_model=schemas.SkillResponse)
def read_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill

@router.put("/{skill_id}", response_model=schemas.SkillResponse)
def update_skill(skill_id: int, skill: schemas.SkillUpdate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if db_skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")

    update_data = skill.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_skill, key, value)

    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if db_skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(db_skill)
    db.commit()
    return {"message": "Skill deleted successfully"}
