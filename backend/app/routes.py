
from typing import Literal

import httpx

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .dependencies import get_db
from .auth import get_current_user
from .models import User, Skill, StudentSkill, Career
from .schemas import (
    UserResponse,
    SkillResponse,
    StudentSkillCreate
)
from .career_engine import generate_recommendations
from .ai_service import generate_ai_response


# =====================================================
# ROUTERS
# =====================================================

router = APIRouter(prefix="/users", tags=["Users"])

skills_router = APIRouter(prefix="/skills", tags=["Skills"])


# =====================================================
# CHAT REQUEST SCHEMAS
# =====================================================

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]

    content: str = Field(
        min_length=1,
        max_length=1800
    )


class AssistantQuestion(BaseModel):
    question: str = Field(
        min_length=1,
        max_length=2000
    )

    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        max_length=6
    )


# =====================================================
# REUSABLE HELPER FUNCTIONS
# =====================================================

def get_student_or_404(user_id: int, db: Session):
    """Retrieve a student or return HTTP 404."""

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found."
        )

    return user


def verify_student_access(user_id: int, current_user: User):
    """Prevent students from accessing another student's records."""

    if current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot access another student's information."
        )


def get_student_skill_records(user_id: int, db: Session):
    """Retrieve all skills belonging to a student."""

    return (
        db.query(StudentSkill)
        .filter(StudentSkill.user_id == user_id)
        .all()
    )


def get_student_skill_map(records):
    """Create a skill ID to proficiency mapping."""

    return {
        record.skill_id: float(record.proficiency)
        for record in records
    }


def get_career_recommendations(records, db: Session):
    """Generate career recommendations using the existing engine."""

    student_skills = get_student_skill_map(records)

    careers = (
        db.query(Career)
        .all()
    )

    return generate_recommendations(
        careers,
        student_skills
    )


def build_student_context(user, records, recommendations):
    """
    Prepare verified student information for the local AI model.

    The AI receives actual database information rather than
    invented student details.
    """

    skills = [
        {
            "skill": record.skill.name,
            "proficiency": float(record.proficiency)
        }
        for record in records
    ]

    career_data = []

    for career in recommendations[:3]:

        career_data.append({
            "career": career["career_title"],
            "description": career["description"],
            "match_score": career["match_score"],
            "skills_to_improve": career["skill_gaps"],
            "skill_analysis": career["skill_analysis"]
        })

    return {
        "student": {
            "name": user.name,
            "degree": user.degree,
            "branch": user.branch,
            "semester": user.semester
        },
        "skills": skills,
        "career_recommendations": career_data
    }


# =====================================================
# USER MANAGEMENT
# =====================================================

# Registration and login are handled by auth.py at /auth/register and /auth/login.
# Do not expose a public endpoint that creates accounts without passwords,
# or a public endpoint that lists every student's personal information.


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    return get_student_or_404(user_id, db)


# =====================================================
# AVAILABLE SKILLS
# =====================================================

@skills_router.get("/", response_model=list[SkillResponse])
def get_skills(
    db: Session = Depends(get_db)
):

    return (
        db.query(Skill)
        .order_by(Skill.name)
        .all()
    )


# =====================================================
# STUDENT SKILL MANAGEMENT
# =====================================================

@router.get("/{user_id}/skills")
def get_student_skills(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    get_student_or_404(user_id, db)

    records = get_student_skill_records(user_id, db)

    return [
        {
            "id": record.id,
            "skill_id": record.skill_id,
            "skill_name": record.skill.name,
            "proficiency": float(record.proficiency)
        }
        for record in records
    ]


@router.post("/{user_id}/skills")
def add_student_skill(
    user_id: int,
    data: StudentSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    get_student_or_404(user_id, db)

    skill_name = data.skill_name.strip()

    skill = (
        db.query(Skill)
        .filter(Skill.name.ilike(skill_name))
        .first()
    )

    if skill is None:
        raise HTTPException(
            status_code=404,
            detail="Skill not found. Select an available skill."
        )

    record = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.user_id == user_id,
            StudentSkill.skill_id == skill.id
        )
        .first()
    )

    if record is None:

        record = StudentSkill(
            user_id=user_id,
            skill_id=skill.id,
            proficiency=data.proficiency
        )

        db.add(record)

    else:
        record.proficiency = data.proficiency

    try:
        db.commit()
        db.refresh(record)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Unable to save student skill."
        )

    return {
        "message": "Student skill saved successfully.",
        "id": record.id,
        "skill_id": skill.id,
        "skill_name": skill.name,
        "proficiency": float(record.proficiency)
    }


# =====================================================
# CAREER RECOMMENDATION ENGINE
# =====================================================

@router.get("/{user_id}/recommendations")
def get_recommendations(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    user = get_student_or_404(user_id, db)

    records = get_student_skill_records(user_id, db)

    recommendations = get_career_recommendations(
        records,
        db
    )

    return {
        "user_id": user_id,
        "student_name": user.name,
        "total_skills": len(records),
        "recommendations": recommendations
    }


# =====================================================
# CAREER READINESS
# =====================================================

@router.get("/{user_id}/readiness")
def get_career_readiness(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    get_student_or_404(user_id, db)

    records = get_student_skill_records(user_id, db)

    recommendations = get_career_recommendations(
        records,
        db
    )

    if not recommendations:

        return {
            "user_id": user_id,
            "readiness_score": 0,
            "target_career": None,
            "skills_assessed": 0,
            "skills_ready": 0,
            "skills_to_improve": [],
            "status": "Not assessed"
        }

    top_career = recommendations[0]

    skill_analysis = top_career["skill_analysis"]

    skills_to_improve = [
        item["skill"]
        for item in skill_analysis
        if item["needs_improvement"]
    ]

    skills_ready = (
        len(skill_analysis) - len(skills_to_improve)
    )

    score = top_career["match_score"]

    if score >= 75:
        status = "Strong Progress"

    elif score >= 60:
        status = "Good Progress"

    else:
        status = "Needs Improvement"

    return {
        "user_id": user_id,
        "readiness_score": score,
        "target_career": top_career["career_title"],
        "skills_assessed": len(skill_analysis),
        "skills_ready": skills_ready,
        "skills_to_improve": skills_to_improve,
        "status": status
    }


# =====================================================
# PERSONALIZED LEARNING ROADMAP
# =====================================================

@router.get("/{user_id}/roadmap")
def get_learning_roadmap(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)
    user = get_student_or_404(user_id, db)

    records = get_student_skill_records(user_id, db)

    skills = {
        record.skill.name.lower(): float(record.proficiency)
        for record in records
    }

    steps = [
        {
            "title": "Python & Programming Fundamentals",
            "description": "Strengthen your programming foundation.",
            "required_skill": "python",
            "target": 70
        },
        {
            "title": "Statistics & Data Analysis",
            "description": "Learn statistical methods and data analysis.",
            "required_skill": "statistics",
            "target": 60
        },
        {
            "title": "Machine Learning Fundamentals",
            "description": "Learn supervised and unsupervised learning.",
            "required_skill": "machine learning",
            "target": 60
        },
        {
            "title": "Deep Learning",
            "description": "Explore neural networks, CNNs and transformers.",
            "required_skill": "deep learning",
            "target": 60
        },
        {
            "title": "Industry Readiness & Projects",
            "description": "Build real-world projects and prepare for interviews.",
            "required_skill": "sql",
            "target": 70
        }
    ]

    completed_count = 0
    roadmap = []

    for index, step in enumerate(steps):

        proficiency = skills.get(
            step["required_skill"],
            0
        )

        completed = proficiency >= step["target"]

        if completed:
            status = "Completed"
            completed_count += 1

        elif completed_count == index:
            status = "Current"

        else:
            status = "Upcoming"

        roadmap.append({
            "id": index + 1,
            "title": step["title"],
            "description": step["description"],
            "status": status,
            "proficiency": proficiency,
            "target": step["target"]
        })

    return {
        "user_id": user_id,
        "student_name": user.name,
        "completed": completed_count,
        "total": len(roadmap),
        "progress": round(
            completed_count / len(roadmap) * 100,
            2
        ),
        "roadmap": roadmap
    }


# =====================================================
# AI CAREER ASSISTANT - LOCAL QWEN + OLLAMA
# =====================================================

@router.post("/{user_id}/assistant")
async def career_assistant(
    user_id: int,
    data: AssistantQuestion,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    verify_student_access(user_id, current_user)

    # -------------------------------------------------
    # 1. Validate student
    # -------------------------------------------------

    user = get_student_or_404(user_id, db)

    # -------------------------------------------------
    # 2. Retrieve actual student skills
    # -------------------------------------------------

    records = get_student_skill_records(user_id, db)

    # -------------------------------------------------
    # 3. Generate recommendation engine results
    # -------------------------------------------------

    recommendations = get_career_recommendations(
        records,
        db
    )

    # -------------------------------------------------
    # 4. Build personalized AI context
    # -------------------------------------------------

    student_context = build_student_context(
        user,
        records,
        recommendations
    )

    # -------------------------------------------------
    # 5. Validate and prepare conversation history
    # -------------------------------------------------

    conversation_history = [
        message.model_dump()
        for message in data.conversation_history[-6:]
    ]

    question = data.question.strip()

    if not question:
        raise HTTPException(
            status_code=422,
            detail="Please enter a valid question."
        )

    # -------------------------------------------------
    # 6. Generate response using local Qwen model
    # -------------------------------------------------

    try:

        answer = await generate_ai_response(
            question=question,
            student_context=student_context,
            conversation_history=conversation_history
        )

    except httpx.ConnectError:

        raise HTTPException(
            status_code=503,
            detail=(
                "Cannot connect to Ollama. "
                "Please ensure Ollama is running."
            )
        )

    except httpx.TimeoutException:

        raise HTTPException(
            status_code=504,
            detail=(
                "The AI model is taking too long to respond. "
                "Please try again."
            )
        )

    except httpx.HTTPStatusError:

        raise HTTPException(
            status_code=502,
            detail=(
                "Ollama returned an unsuccessful response. "
                "Check the local model service."
            )
        )

    except httpx.RequestError:

        raise HTTPException(
            status_code=502,
            detail="Unable to communicate with Ollama."
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )

    # -------------------------------------------------
    # 7. Validate generated response
    # -------------------------------------------------

    if not answer or not answer.strip():

        raise HTTPException(
            status_code=502,
            detail="The AI model returned an empty response."
        )

    # -------------------------------------------------
    # 8. Return response to React
    # -------------------------------------------------

    return {
        "student": user.name,
        "question": question,
        "answer": answer.strip(),
        "model": "qwen3.5:4b",
        "ai_powered": True
    }
