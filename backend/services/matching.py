from typing import Dict, Any, List
from ..models import User

def calculate_match(user: User, job_description: str) -> Dict[str, Any]:
    job_desc_lower = job_description.lower()

    # B. Get all unique Skill names associated with the user
    user_skills = set()
    for exp in user.experiences:
        for skill in exp.skills:
            user_skills.add(skill.name)

    for proj in user.projects:
        for skill in proj.skills:
            user_skills.add(skill.name)

    # C. Find "Matched Skills"
    matched_skills = []
    for skill_name in user_skills:
        if skill_name.lower() in job_desc_lower:
            matched_skills.append(skill_name)

    matched_skills_set = set(matched_skills)

    # D. Score Experiences
    scored_experiences = []
    for exp in user.experiences:
        score = 0
        for skill in exp.skills:
            if skill.name in matched_skills_set:
                score += 1

        # We need to construct a dict representing ScoredExperience
        exp_dict = {
            "id": exp.id,
            "title": exp.title,
            "company": exp.company,
            "start_date": exp.start_date,
            "end_date": exp.end_date,
            "description": exp.description,
            "user_id": exp.user_id,
            "skills": [{"id": s.id, "name": s.name, "category": s.category} for s in exp.skills],
            "score": score
        }
        scored_experiences.append(exp_dict)

    # E. Score Projects
    scored_projects = []
    for proj in user.projects:
        score = 0
        for skill in proj.skills:
            if skill.name in matched_skills_set:
                score += 1

        proj_dict = {
            "id": proj.id,
            "name": proj.name,
            "description": proj.description,
            "url": proj.url,
            "user_id": proj.user_id,
            "skills": [{"id": s.id, "name": s.name, "category": s.category} for s in proj.skills],
            "score": score
        }
        scored_projects.append(proj_dict)

    # F. Sort both Experiences and Projects by their score in descending order
    scored_experiences.sort(key=lambda x: x["score"], reverse=True)
    scored_projects.sort(key=lambda x: x["score"], reverse=True)

    return {
        "matched_skills": matched_skills,
        "top_experiences": scored_experiences,
        "top_projects": scored_projects
    }
