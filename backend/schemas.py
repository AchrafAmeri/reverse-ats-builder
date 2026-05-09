from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import date

# Skill Schemas
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Experience Schemas
class ExperienceBase(BaseModel):
    title: str
    company: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    user_id: int
    skill_ids: Optional[List[int]] = []

class ExperienceUpdate(ExperienceBase):
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[date] = None
    skill_ids: Optional[List[int]] = None

class ExperienceResponse(ExperienceBase):
    id: int
    user_id: int
    skills: List[SkillResponse] = []
    model_config = ConfigDict(from_attributes=True)


# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None

class ProjectCreate(ProjectBase):
    user_id: int
    skill_ids: Optional[List[int]] = []

class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    skill_ids: Optional[List[int]] = None

class ProjectResponse(ProjectBase):
    id: int
    user_id: int
    skills: List[SkillResponse] = []
    model_config = ConfigDict(from_attributes=True)


# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(UserBase):
    name: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    model_config = ConfigDict(from_attributes=True)


# Match Schemas
class MatchRequest(BaseModel):
    user_id: int
    job_description: str

class ScoredExperience(ExperienceResponse):
    score: int

class ScoredProject(ProjectResponse):
    score: int

class MatchResponse(BaseModel):
    matched_skills: List[str]
    top_experiences: List[ScoredExperience]
    top_projects: List[ScoredProject]
