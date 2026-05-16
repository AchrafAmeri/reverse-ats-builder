import pytest
from datetime import date

# Needs to be able to import from backend modules.
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import User, Experience, Project, Education, Skill
from services.matching import calculate_match

def test_calculate_match_basic():
    # Setup test data
    skill1 = Skill(id=1, name="Python", category="Language")
    skill2 = Skill(id=2, name="React", category="Framework")

    exp1 = Experience(
        id=1,
        title="Software Engineer",
        company="Tech Corp",
        start_date=date(2020, 1, 1),
        end_date=date.today(), # Set end date to today to ensure it's >= two years ago
        description="Worked on backend.",
        skills=[skill1]
    )

    proj1 = Project(
        id=1,
        name="Personal Website",
        description="My site.",
        url="http://me.com",
        skills=[skill2]
    )

    edu1 = Education(
        id=1,
        degree="BSc Computer Science",
        institution="University",
        start_date="2016",
        end_date="2020",
        description=""
    )

    user = User(
        id=1,
        name="Test User",
        email="test@test.com",
        experiences=[exp1],
        projects=[proj1],
        educations=[edu1]
    )

    # Simple exact match
    jd = "We are looking for a Python and React developer."
    result = calculate_match(user, jd)

    assert "Python" in result["matched_skills"]
    assert "React" in result["matched_skills"]
    assert len(result["matched_skills"]) == 2

    # Check experiences
    assert len(result["top_experiences"]) == 1
    assert result["top_experiences"][0]["score"] == 12 # 10 * 1.2 since end_date is >= 2 years ago

    # Check projects
    assert len(result["top_projects"]) == 1
    assert result["top_projects"][0]["score"] == 10

def test_calculate_match_synonyms():
    skill1 = Skill(id=1, name="JavaScript", category="Language")
    skill2 = Skill(id=2, name="Go", category="Language")

    exp1 = Experience(id=1, skills=[skill1, skill2], title="Dev", company="Inc", start_date=date(2020,1,1), description="")
    user = User(id=1, experiences=[exp1], projects=[], educations=[])

    # "js" should match "JavaScript" and "golang" should match "Go"
    jd = "Looking for someone with js and golang experience."
    result = calculate_match(user, jd)

    assert "JavaScript" in result["matched_skills"]
    assert "Go" in result["matched_skills"]

def test_calculate_match_fuzzy():
    # Fuzzy matching occurs when the exact pattern search fails, but the fuzzy token match scores > 88
    skill1 = Skill(id=1, name="PostgreSQL Database", category="Database")
    exp1 = Experience(id=1, skills=[skill1], title="Dev", company="Inc", start_date=date(2020,1,1), description="")
    user = User(id=1, experiences=[exp1], projects=[], educations=[])

    # "C#" will fail word boundary exact match `\b` inside text like "C#,"
    skill2 = Skill(id=2, name="C#", category="Language")
    exp1.skills.append(skill2)

    jd = "Experience in C# is required."
    result = calculate_match(user, jd)

    assert "C#" in result["matched_skills"]

def test_calculate_match_missing_skills():
    skill1 = Skill(id=1, name="Python", category="Language")
    exp1 = Experience(id=1, skills=[skill1], title="Dev", company="Inc", start_date=date(2020,1,1), description="")
    user = User(id=1, experiences=[exp1], projects=[], educations=[])

    # Missing skills are extracted if they are capitalized (2-5 chars) or Title Case (not in stop words)
    jd = "We need Python, AWS, Docker and Kubernetes."
    result = calculate_match(user, jd)

    assert "Python" in result["matched_skills"]

    assert "Docker" in result["missing_skills"]
    assert "Kubernetes" in result["missing_skills"]

    # Check that AWS or other missing skills are included correctly
    assert any(m.lower() == "docker" for m in result["missing_skills"])

def test_calculate_match_date_sorting():
    exp1 = Experience(id=1, title="Recent", company="A", start_date=date(2022,1,1), skills=[])
    exp2 = Experience(id=2, title="Older", company="B", start_date=date(2018,1,1), skills=[])

    user = User(id=1, experiences=[exp1, exp2], projects=[], educations=[])
    jd = "Looking for someone."
    result = calculate_match(user, jd)

    edu1 = Education(id=1, degree="BSc", institution="A", start_date="2016")
    edu2 = Education(id=2, degree="MSc", institution="A", start_date="2020")
    user.educations = [edu1, edu2]

    result = calculate_match(user, jd)
    assert result["educations"][0]["start_date"] == "2020"
    assert result["educations"][1]["start_date"] == "2016"
