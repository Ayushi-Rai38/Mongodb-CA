"""
main.py – FastAPI application entry point.
"""

import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from database import init_db
from routers import pets, applications, analytics

load_dotenv()

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app = FastAPI(
    title="PawPal API",
    description="Pet Adoption Management System – FastAPI + PyMongo",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Startup ──────────────────────────────────
@app.on_event("startup")
def on_startup():
    init_db()


# ── Global error handler ─────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


# ── Routers ───────────────────────────────────
app.include_router(pets.router)
app.include_router(applications.router)
app.include_router(analytics.router)


# ── Health check ──────────────────────────────
@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "PawPal API"}


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to PawPal API. Visit /docs for documentation."}
