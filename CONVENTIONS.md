# 🏗️ Project Conventions & Rules: Reverse ATS

Welcome to the Reverse ATS project. This repository contains a "Reverse Applicant Tracking System" designed to generate highly targeted CVs/Resumes by filtering a user's master database of experiences against specific job descriptions.

**AI AGENT DIRECTIVE:** Read these rules carefully before suggesting or writing any code. Any deviation from these rules will be rejected.

---

## 🛑 1. THE GOLDEN RULE: NO AI FOR CORE LOGIC
- **Zero LLM Dependency:** The core matching engine, filtering, and scoring systems must be **100% deterministic**. 
- **No External APIs:** Do NOT use OpenAI, Gemini, Claude, or any other external NLP/AI API to parse job descriptions or match skills.
- **Algorithmic Approach:** All matching must be done using classical algorithms: exact keyword matching, tag intersections, regex, and mathematical scoring systems.

## 🛠️ 2. TECH STACK
- **Architecture:** Monorepo.
- **Backend:** Python 3.10+, FastAPI, Uvicorn.
- **Database:** SQLite (local file) using SQLAlchemy (ORM).
- **Validation:** Pydantic (Strict typing required).
- **Frontend:** React.js (Functional components, Hooks).

## 📁 3. REPOSITORY STRUCTURE
The project must strictly follow this monorepo architecture:
```text
/
├── backend/            # FastAPI application
│   ├── main.py         # App entry point & CORS configuration
│   ├── database.py     # SQLite connection & session maker
│   ├── models.py       # SQLAlchemy DB models
│   ├── schemas.py      # Pydantic validation schemas
│   ├── routers/        # API endpoints (e.g., users.py, experiences.py)
│   ├── services/       # Core business logic (The matching algorithm)
│   └── requirements.txt
├── frontend/           # React application
│   ├── src/
│   ├── package.json
│   └── ...
└── CONVENTIONS.md      # This file
