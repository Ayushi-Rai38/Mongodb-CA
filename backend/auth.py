"""
auth.py – Simple API-key based admin authentication.
The admin key is set via ADMIN_SECRET_KEY env var (never stored plain-text in code).
"""

import os
from fastapi import Header, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "changeme")


def require_admin(x_admin_key: str = Header(..., alias="X-Admin-Key")) -> str:
    """
    Dependency that validates the X-Admin-Key header.
    Raise 401 if missing or wrong.
    """
    if x_admin_key != ADMIN_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin key. Provide X-Admin-Key header.",
        )
    return x_admin_key
