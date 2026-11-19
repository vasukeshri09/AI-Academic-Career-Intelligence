
from sqlalchemy import String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


# -------------------------
# Users / Students
# -------------------------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    degree: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    branch: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    semester: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    skills = relationship(
        "StudentSkill",
        back_populates="user"
    )

    recommendations = relationship(
        "Recommendation",
        back_populates="user"
    )

    roadmaps = relationship(
        "Roadmap",
        back_populates="user"
    )


# -------------------------
# Skills
# -------------------------
class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    student_skills = relationship(
        "StudentSkill",
        back_populates="skill"
    )

    career_skills = relationship(
        "CareerSkill",
        back_populates="skill"
    )


# -------------------------
# Student Skills
# -------------------------
class StudentSkill(Base):
    __tablename__ = "student_skills"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        nullable=False
    )

    proficiency: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="skills"
    )

    skill = relationship(
        "Skill",
        back_populates="student_skills"
    )


# -------------------------
# Careers
# -------------------------
class Career(Base):
    __tablename__ = "careers"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    title: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    career_skills = relationship(
        "CareerSkill",
        back_populates="career"
    )

    recommendations = relationship(
        "Recommendation",
        back_populates="career"
    )


# -------------------------
# Career ↔ Skills
# -------------------------
class CareerSkill(Base):
    __tablename__ = "career_skills"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    career_id: Mapped[int] = mapped_column(
        ForeignKey("careers.id"),
        nullable=False
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        nullable=False
    )

    importance: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False
    )

    career = relationship(
        "Career",
        back_populates="career_skills"
    )

    skill = relationship(
        "Skill",
        back_populates="career_skills"
    )


# -------------------------
# Career Recommendations
# -------------------------
class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    career_id: Mapped[int] = mapped_column(
        ForeignKey("careers.id"),
        nullable=False
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    explanation: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="recommendations"
    )

    career = relationship(
        "Career",
        back_populates="recommendations"
    )


# -------------------------
# Learning Roadmap
# -------------------------
class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    duration_weeks: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="roadmaps"
    )
