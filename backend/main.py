from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, skills, experiences, projects, match

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reverse ATS API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(experiences.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(match.router, prefix="/api/v1/match", tags=["Matching"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Reverse ATS API"}
