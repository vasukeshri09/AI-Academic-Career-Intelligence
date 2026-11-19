
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# -------------------------
# User Registration
# -------------------------
class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    degree: str | None = None
    branch: str | None = None
    semester: int | None = Field(default=None, ge=1, le=12)


# -------------------------
# User Login
# -------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


# -------------------------
# User Response
# -------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    degree: str | None = None
    branch: str | None = None
    semester: int | None = None

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Authentication Response
# -------------------------
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# -------------------------
# Skills
# -------------------------
class SkillResponse(BaseModel):
    id: int
    name: str
    category: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StudentSkillCreate(BaseModel):
    skill_name: str = Field(min_length=1, max_length=100)
    proficiency: float = Field(ge=0, le=100)


class StudentSkillResponse(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    proficiency: float

    model_config = ConfigDict(from_attributes=True)
