"""
models.py – Pydantic v2 models for Pets and Adoption Applications.
"""

from __future__ import annotations
from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr
from enum import Enum


# ──────────────────────────────────────────────
# Enums
# ──────────────────────────────────────────────

class Species(str, Enum):
    dog    = "dog"
    cat    = "cat"
    rabbit = "rabbit"
    bird   = "bird"


class Gender(str, Enum):
    male   = "male"
    female = "female"


class PetStatus(str, Enum):
    available = "available"
    pending   = "pending"
    adopted   = "adopted"


class HomeType(str, Enum):
    apartment = "apartment"
    house     = "house"
    condo     = "condo"
    farm      = "farm"
    other     = "other"


class ApplicationStatus(str, Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


# ──────────────────────────────────────────────
# Pet models
# ──────────────────────────────────────────────

class PetCreate(BaseModel):
    name:        str            = Field(..., min_length=1, max_length=100)
    species:     Species
    breed:       str            = Field(..., min_length=1, max_length=100)
    age:         float          = Field(..., ge=0, le=30)
    gender:      Gender
    vaccinated:  bool           = False
    status:      PetStatus      = PetStatus.available
    location:    str            = Field(..., min_length=1, max_length=150)
    description: str            = Field("", max_length=2000)
    image_url:   str            = Field("", max_length=500)
    weight_kg:   Optional[float] = Field(None, ge=0, le=200)
    color:       Optional[str]  = Field(None, max_length=80)
    good_with_kids: bool        = True
    good_with_pets: bool        = True


class PetUpdate(BaseModel):
    name:        Optional[str]       = None
    species:     Optional[Species]   = None
    breed:       Optional[str]       = None
    age:         Optional[float]     = None
    gender:      Optional[Gender]    = None
    vaccinated:  Optional[bool]      = None
    status:      Optional[PetStatus] = None
    location:    Optional[str]       = None
    description: Optional[str]       = None
    image_url:   Optional[str]       = None
    weight_kg:   Optional[float]     = None
    color:       Optional[str]       = None
    good_with_kids: Optional[bool]   = None
    good_with_pets: Optional[bool]   = None


class PetResponse(BaseModel):
    id:          str
    name:        str
    species:     str
    breed:       str
    age:         float
    gender:      str
    vaccinated:  bool
    status:      str
    location:    str
    description: str
    image_url:   str
    weight_kg:   Optional[float] = None
    color:       Optional[str]   = None
    good_with_kids: bool         = True
    good_with_pets: bool         = True
    created_at:  Optional[datetime] = None
    updated_at:  Optional[datetime] = None


# ──────────────────────────────────────────────
# Application models
# ──────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    pet_id:          str   = Field(..., min_length=24, max_length=24)
    applicant_name:  str   = Field(..., min_length=1, max_length=150)
    applicant_email: str   = Field(..., min_length=5)
    applicant_phone: str   = Field(..., min_length=7, max_length=20)
    home_type:       HomeType
    has_yard:        bool  = False
    other_pets:      str   = Field("", max_length=500)
    experience:      str   = Field("", max_length=1000)
    message:         str   = Field("", max_length=2000)

    @field_validator("pet_id")
    @classmethod
    def validate_object_id(cls, v: str) -> str:
        import re
        if not re.match(r"^[a-f\d]{24}$", v, re.IGNORECASE):
            raise ValueError("pet_id must be a valid 24-char hex ObjectId")
        return v


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    admin_note: Optional[str] = Field(None, max_length=500)


class ApplicationResponse(BaseModel):
    id:              str
    pet_id:          str
    pet_name:        Optional[str] = None
    pet_image:       Optional[str] = None
    applicant_name:  str
    applicant_email: str
    applicant_phone: str
    home_type:       str
    has_yard:        bool
    other_pets:      str
    experience:      str
    message:         str
    status:          str
    admin_note:      Optional[str] = None
    applied_at:      Optional[datetime] = None
    updated_at:      Optional[datetime] = None


# ──────────────────────────────────────────────
# Generic responses
# ──────────────────────────────────────────────

class PaginatedPets(BaseModel):
    total:    int
    page:     int
    per_page: int
    pages:    int
    data:     List[PetResponse]


class MessageResponse(BaseModel):
    message: str
    detail:  Optional[Any] = None
