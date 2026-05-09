# 🚀 Reverse ATS - Project Conventions & Rules

Welcome to the Reverse ATS repository. This document serves as the absolute source of truth for the project's architecture, tech stack, and coding standards. 
**To any AI Agent (like Google Jules) reading this:** You MUST strictly adhere to these rules before proposing or committing any code.

## 1. 🛑 CORE PHILOSOPHY: THE "NO AI" RULE
- **Absolute Constraint:** This project relies entirely on **deterministic algorithms**. 
- **NO LLMs:** Do NOT use, import, or suggest any external AI APIs (OpenAI, Gemini, Anthropic, etc.) for the core business logic.
- **Matching Logic:** The matching between a User Profile and a Job Description must be done using standard algorithms (keyword extraction, tag crossing, weight-based scoring, exact/fuzzy string matching).

## 2. 🏗️ ARCHITECTURE & TECH STACK
This project uses a **Monorepo** structure.
- **`/backend`**: Python 3.10+, FastAPI, Uvicorn.
- **`/frontend`**: React (initialized via Vite), TypeScript (Strict Mode), Tailwind CSS.
- **Database**: SQLite (local file `reverse_ats.db` ignored in `.gitignore`).

## 3. 🐍 BACKEND CONVENTIONS (FastAPI)
- **Typing:** Use strict Python type hints (`->`, `Optional`, `List`, `Dict`) for ALL functions.
- **Validation:** Use **Pydantic V2** for all data validation (schemas). Schemas must be separated from Database Models.
- **ORM:** Use **SQLAlchemy** for database interactions. Avoid raw SQL strings.
- **Structure:**
  - `main.py`: App entry point and CORS configuration.
  - `database.py`: Engine and SessionLocal configuration.
  - `models.py`: SQLAlchemy database models.
  - `schemas.py`: Pydantic models (Input/Output).
  - `routers/`: Modular API endpoints (e.g., `routers/users.py`, `routers/experiences.py`).
  - `services/`: Business logic and matching algorithms (Keep routes clean).
- **Dependency Injection:** Always use FastAPI's `Depends()` for database sessions (e.g., `db: Session = Depends(get_db)`).

## 4. ⚛️ FRONTEND CONVENTIONS (React)
- **TypeScript Only:** All frontend code must be written in TypeScript (`.ts`, `.tsx`). No vanilla JavaScript (`.js`, `.jsx`).
- **Components:** Use functional components and React Hooks. No Class components.
- **Styling:** Use **Tailwind CSS** utility classes. Avoid custom `.css` files unless absolutely necessary.
- **API Calls:** Centralize all `fetch` or `axios` calls in a dedicated `frontend/src/api/` or `frontend/src/services/` folder. Do not write raw fetch calls directly inside React components.
- **State Management:** Keep it simple. Use `useState` and `useEffect` for local state, and React Context only if global state is required.

## 5. 🗄️ DATA MODELING (Core Entities)
Data must be highly structured to allow deterministic matching:
- **Tags/Skills:** Everything must be taggable. Experiences and Projects must have Many-to-Many relationships with a `Skill` or `Tag` entity.
- Avoid large unstructured text blocks where possible. Break down experiences into actionable bullet points.

## 6. 🐙 GIT & WORKFLOW (For AI Agents)
- **Atomic Commits:** Make small, focused commits. Do not bundle frontend design changes with database schema changes in a single commit.
- **Commit Messages:** Follow the Conventional Commits format:
  - `feat: [description]` for new features.
  - `fix: [description]` for bug fixes.
  - `refactor: [description]` for code restructuring.
  - `docs: [description]` for documentation updates.

---
**Agent Instruction:** Acknowledge you have read and understood these conventions before executing your first task.
