from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from app.models.user_model import UserRole, UserStatus


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole


class VerifyEmailRequest(BaseModel):
    token: str = Field(..., min_length=10)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class AdminCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., min_length=20)


class AuthUserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: UserRole
    user_status: UserStatus
    is_email_verified: bool
    created_at: datetime


class RegisterResponse(BaseModel):
    message: str
    user: AuthUserResponse
    verification_email_sent: bool
    verification_token: Optional[str] = None


class VerifyEmailResponse(BaseModel):
    message: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUserResponse


class LogoutResponse(BaseModel):
    message: str
