import regex as re
from typing import Dict, Any, List
from collections import Counter
from datetime import date
from rapidfuzz import fuzz

from models import User
from utils.synonyms import SYNONYMS

COMPILED_SYNONYMS = [
    (re.compile(r'\b' + re.escape(syn_key) + r'\b'), syn_val)
    for syn_key, syn_val in SYNONYMS.items()
]

STOP_WORDS = {
    "the", "and", "we", "looking", "for", "a", "with", "also", "not", "average", "developer",
    "to", "in", "of", "on", "is", "are", "as", "it", "at", "an", "be", "this", "or", "by",
    "you", "your", "our", "will", "can", "that", "have", "has", "about", "from", "but", "all"
}

def calculate_match(user: User, job_description: str) -> Dict[str, Any]:
    jd_lower = job_description.lower()
    for pattern, syn_val in COMPILED_SYNONYMS:
        jd_lower = pattern.sub(syn_val, jd_lower)

    unique_skills = set()
    for exp in user.experiences:
        for skill in exp.skills:
            unique_skills.add(skill.name)

    for proj in user.projects:
        for skill in proj.skills:
            unique_skills.add(skill.name)

    matched_skills_set = set()
    matched_skills = []

    for skill_name in unique_skills:
        skill_lower = skill_name.lower()
        skill_norm = skill_lower
        for syn_key, syn_val in SYNONYMS.items():
            if skill_norm == syn_key:
                skill_norm = syn_val
                break

        pattern = r'\b' + re.escape(skill_norm) + r'\b'
        if re.search(pattern, jd_lower):
            matched_skills_set.add(skill_name)
            matched_skills.append(skill_name)
        else:
            score = fuzz.token_set_ratio(skill_norm, jd_lower)
            if score > 88:
                matched_skills_set.add(skill_name)
                matched_skills.append(skill_name)

    today = date.today()
    try:
        two_years_ago = today.replace(year=today.year - 2)
    except ValueError:
        two_years_ago = today.replace(year=today.year - 2, day=28)

    scored_experiences = []
    for exp in user.experiences:
        score = 0
        for skill in exp.skills:
            if skill.name in matched_skills_set:
                score += 10

        if exp.end_date:
            if exp.end_date >= two_years_ago:
                score = int(score * 1.2)
        else:
            score = int(score * 1.2)

        exp_dict = {c.name: getattr(exp, c.name) for c in exp.__table__.columns}
        exp_dict["skills"] = exp.skills
        exp_dict["score"] = score
        scored_experiences.append(exp_dict)

    scored_projects = []
    for proj in user.projects:
        score = 0
        for skill in proj.skills:
            if skill.name in matched_skills_set:
                score += 10

        proj_dict = {c.name: getattr(proj, c.name) for c in proj.__table__.columns}
        proj_dict["skills"] = proj.skills
        proj_dict["score"] = score
        scored_projects.append(proj_dict)

    scored_experiences.sort(key=lambda x: x["score"], reverse=True)
    scored_projects.sort(key=lambda x: x["score"], reverse=True)

    raw_words = job_description.split()
    extracted_missing = []

    for w in raw_words:
        clean_word = w.strip('.,!?;:()[]{}""\'\n\t')
        if not clean_word:
            continue

        if 2 <= len(clean_word) <= 5 and clean_word.isupper():
            extracted_missing.append(clean_word)
        elif clean_word.istitle() and clean_word.lower() not in STOP_WORDS:
            extracted_missing.append(clean_word)

    matched_skills_normalized = set()
    for m in matched_skills:
        m_lower = m.lower()
        m_norm = m_lower
        for syn_key, syn_val in SYNONYMS.items():
            if m_norm == syn_key:
                m_norm = syn_val
                break
        matched_skills_normalized.add(m_norm)
        matched_skills_normalized.add(m_lower)

    final_extracted = []
    for w in extracted_missing:
        w_lower = w.lower()
        w_norm = w_lower
        for syn_key, syn_val in SYNONYMS.items():
            if w_norm == syn_key:
                w_norm = syn_val
                break

        if w_norm not in matched_skills_normalized and w_lower not in matched_skills_normalized:
            final_extracted.append(w)

    counter = Counter(final_extracted)
    missing_skills = [word for word, count in counter.most_common(10)]

    educations = []
    for edu in user.educations:
        edu_dict = {c.name: getattr(edu, c.name) for c in edu.__table__.columns}
        educations.append(edu_dict)

    # Sort educations by date descending (using string comparison for start_date which is a String)
    educations.sort(key=lambda x: x.get("start_date") or "", reverse=True)

    return {
        "matched_skills": matched_skills,
        "top_experiences": scored_experiences,
        "top_projects": scored_projects,
        "educations": educations,
        "missing_skills": missing_skills
    }
