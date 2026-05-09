from typing import Dict, Any, List
from ..models import User

def calculate_match(user: User, job_description: str) -> Dict[str, Any]:
    jd_lower = job_description.lower()

    unique_skills = set()
    for exp in user.experiences:
        for skill in exp.skills:
            unique_skills.add(skill.name)

    for proj in user.projects:
        for skill in proj.skills:
            unique_skills.add(skill.name)

    matched_skills = []
    for skill_name in unique_skills:
        if skill_name.lower() in jd_lower:
            matched_skills.append(skill_name)

    scored_experiences = []
    for exp in user.experiences:
        score = 0
        for skill in exp.skills:
            if skill.name in matched_skills:
                score += 1

        # We'll use the dict representation for easy Pydantic conversion later,
        # but since we are modifying instances to add 'score', we can just attach it
        # or return dictionaries. Let's return dictionaries matching the expected schemas.
        # But actually, the simplest way is to return the ORM object and just add score to it temporarily,
        # or create dicts. Pydantic can parse from dicts.
        exp_dict = {c.name: getattr(exp, c.name) for c in exp.__table__.columns}
        exp_dict["skills"] = exp.skills
        exp_dict["score"] = score
        scored_experiences.append(exp_dict)

    scored_projects = []
    for proj in user.projects:
        score = 0
        for skill in proj.skills:
            if skill.name in matched_skills:
                score += 1

        proj_dict = {c.name: getattr(proj, c.name) for c in proj.__table__.columns}
        proj_dict["skills"] = proj.skills
        proj_dict["score"] = score
        scored_projects.append(proj_dict)

    scored_experiences.sort(key=lambda x: x["score"], reverse=True)
    scored_projects.sort(key=lambda x: x["score"], reverse=True)

    return {
        "matched_skills": matched_skills,
        "top_experiences": scored_experiences,
        "top_projects": scored_projects
    }
