from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    degree: str | None = None
    branch: str | None = None
    semester: int | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    degree: str | None
    branch: str | None
    semester: int | None

    class Config:
        from_attributes = True