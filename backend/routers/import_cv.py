from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import models
import database
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
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail="Error reading file")

    try:
        parsed_data = parse_cv_pdf(content, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing PDF: {str(e)}")

    matched_skills = parsed_data.get("skills", [])
    extracted_experiences = parsed_data.get("experiences", [])

    # Store skills and experiences
    skills_added = 0
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

        # In a real app we might attempt to only map skills present in the experience's description
        # but the prompt heuristic asked to find all skills and return them, then link the extracted skill
        # records to the user. Since skills don't have a direct M:N with User, but with Experience/Projects,
        # we'll link matched skills to the newly created experiences.
        if matched_skills:
            # Check which skills actually appear in this experience's description/title
            text_to_search = f"{exp_data['title']} {exp_data['description']}".lower()
            exp_skills = []
            for skill in matched_skills:
                if skill.name.lower() in text_to_search:
                    exp_skills.append(skill)

            new_experience.skills = exp_skills

        db.add(new_experience)
        experiences_added += 1

    skills_added = len(matched_skills)

    db.commit()

    return {
        "message": f"Imported {experiences_added} experiences and matched {skills_added} skills.",
        "experiences_added": experiences_added,
        "skills_matched": skills_added
    }
