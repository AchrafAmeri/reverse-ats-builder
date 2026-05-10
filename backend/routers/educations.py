from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(
    prefix="/educations",
    tags=["educations"],
)

@router.post("/", response_model=schemas.EducationResponse)
def create_education(education: schemas.EducationCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.id != education.user_id:
        raise HTTPException(status_code=403, detail="Not authorized to create education for another user")

    db_user = db.query(models.User).filter(models.User.id == education.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    edu_data = education.model_dump()
    new_education = models.Education(**edu_data)

    db.add(new_education)
    db.commit()
    db.refresh(new_education)
    return new_education

@router.get("/", response_model=List[schemas.EducationResponse])
def read_educations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    educations = db.query(models.Education).filter(models.Education.user_id == current_user.id).offset(skip).limit(limit).all()
    return educations

@router.get("/{education_id}", response_model=schemas.EducationResponse)
def read_education(education_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if education is None:
        raise HTTPException(status_code=404, detail="Education not found")
    if education.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this education")
    return education

@router.put("/{education_id}", response_model=schemas.EducationResponse)
def update_education(education_id: int, education: schemas.EducationUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if db_education is None:
        raise HTTPException(status_code=404, detail="Education not found")
    if db_education.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this education")

    update_data = education.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_education, key, value)

    db.commit()
    db.refresh(db_education)
    return db_education

@router.delete("/{education_id}")
def delete_education(education_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_education = db.query(models.Education).filter(models.Education.id == education_id).first()
    if db_education is None:
        raise HTTPException(status_code=404, detail="Education not found")
    if db_education.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this education")

    db.delete(db_education)
    db.commit()
    return {"message": "Education deleted successfully"}
