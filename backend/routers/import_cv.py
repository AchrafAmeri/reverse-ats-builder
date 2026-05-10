from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import models
from database import get_db
from routers.auth import get_current_user
from services.cv_parser import parse_cv_pdf

router = APIRouter(
    prefix="/import",
    tags=["import"],
)

@router.post("/cv")
async def import_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error reading file")

    try:
        parsed_data = parse_cv_pdf(content, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

    matched_skill_names = parsed_data.get("skills", [])
    extracted_experiences = parsed_data.get("experiences", [])

    # Process skills: get existing or create new ones
    db_skills = []
    for skill_name in matched_skill_names:
        skill = db.query(models.Skill).filter(models.Skill.name.ilike(skill_name)).first()
        if not skill:
            skill = models.Skill(name=skill_name)
            db.add(skill)
            db.commit() # Commit to get ID
            db.refresh(skill)
        db_skills.append(skill)

    # Store experiences and link skills
    experiences_added = 0
    for exp_data in extracted_experiences:
        new_experience = models.Experience(
            user_id=current_user.id,
            title=exp_data["title"],
            company=exp_data["company"],
            start_date=exp_data["start_date"],
            end_date=exp_data["end_date"],
            description=exp_data["description"]
        )

        # Link skills to the new experience
        if db_skills:
            # According to the instructions, we can link them all or check presence.
            # We'll just add the db_skills that are actually in this specific experience's text
            # to be more accurate, or all if we interpret "link it to the user" as just attaching to experiences.
            text_to_search = f"{exp_data['title']} {exp_data['description']}".lower()
            exp_skills = []
            for skill in db_skills:
                if skill.name.lower() in text_to_search:
                    exp_skills.append(skill)

            # If no specific match, maybe add them all or leave empty?
            # We will add those matched locally.
            new_experience.skills = exp_skills

        db.add(new_experience)
        experiences_added += 1

    db.commit()

    return {
        "message": f"Imported {experiences_added} experiences and matched {len(db_skills)} skills.",
        "experiences_added": experiences_added,
        "skills_matched": len(db_skills)
    }
