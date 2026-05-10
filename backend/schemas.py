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


# Education Schemas
class EducationBase(BaseModel):
    degree: str
    institution: str
    start_date: str
    end_date: Optional[str] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    user_id: int

class EducationUpdate(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None

class EducationResponse(EducationBase):
    id: int
    user_id: int
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


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    name: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    experiences: List[ExperienceResponse] = []
    projects: List[ProjectResponse] = []
    educations: List[EducationResponse] = []
    model_config = ConfigDict(from_attributes=True)


# Match Schemas
class MatchRequest(BaseModel):
    user_id: int
    job_description: str

class ScoredExperience(ExperienceResponse):
    score: int
    model_config = ConfigDict(from_attributes=True)

class ScoredProject(ProjectResponse):
    score: int
    model_config = ConfigDict(from_attributes=True)

class MatchResponse(BaseModel):
    matched_skills: List[str]
    top_experiences: List[ScoredExperience]
    top_projects: List[ScoredProject]
    educations: List[EducationResponse] = []
    missing_skills: List[str]
