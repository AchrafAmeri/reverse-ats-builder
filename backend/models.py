from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from database import Base

experience_skills = Table(
    "experience_skills",
    Base.metadata,
    Column("experience_id", Integer, ForeignKey("experiences.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

project_skills = Table(
    "project_skills",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    linkedin_url = Column(String)

    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, index=True)


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    company = Column(String, index=True)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    description = Column(Text)

    user = relationship("User", back_populates="experiences")
    skills = relationship("Skill", secondary=experience_skills)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    description = Column(Text)
    url = Column(String)

    user = relationship("User", back_populates="projects")
    skills = relationship("Skill", secondary=project_skills)
