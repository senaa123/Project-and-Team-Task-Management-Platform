# 🚀 Project & Team Task Management Platform

A modern, full-stack project and task management application designed for teams. It features strict Role-Based Access Control (RBAC), interactive Kanban task boards, project management panels, administrative verification workflows, and automated CI/CD pipelines.

---

## 🏗️ System Architecture & Tech Stack

This repository is organized as a monorepo containing two main parts:

### 💻 Frontend (`/frontend`)
* **Framework:** Next.js (App Router)
* **Styling:** Tailwind CSS & Vanilla CSS
* **State Management:** Zustand
* **API Client:** Axios
* **Icons:** Lucide React

### ⚙️ Backend (`/backend`)
* **Framework:** NestJS (TypeScript)
* **Database ORM:** Prisma
* **Database:** PostgreSQL
* **Security:** JWT Auth & Passport

---

## 🎭 Role-Based Permissions & Rules

The system enforces strict access control across both the backend API and frontend views:

1. **Administrator (`ADMIN`):**
   * Review, verify, and assign roles to pending user registrations.
   * Create new projects and assign Project Managers.
   * View all projects, users, and tasks globally.

2. **Project Manager (`PROJECT_MANAGER`):**
   * Create, edit, and assign tasks to users **within projects they own**.
   * Add verified users as members to their own projects.
   * Read-only view of other projects.

3. **Team Member (`TEAM_MEMBER`):**
   * Change status (`TODO` ⇄ `IN_PROGRESS` ⇄ `REVIEW` ⇄ `DONE`) of tasks **assigned to them**.
   * View projects they are members of.

---

## 🛠️ Local Setup Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+ recommended)
* A PostgreSQL database instance

---

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment variables. Create a `.env` file in the `backend/` root:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/db_name?schema=public"
   JWT_SECRET="your_secret_key"
   PORT=3002
   ```
4. Generate the Prisma client & deploy migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```
   *The backend will run on `http://localhost:3002`.*

---

### 2. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env.local` file in the `frontend/` root:
   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3002"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

---

## 🚀 CI/CD & Production Deployment

### Continuous Integration (CI)
The project utilizes **GitHub Actions** to automate quality checks on every push or Pull Request to the `main` branch:
* **Backend CI (`.github/workflows/backend-ci.yml`):** Automatically compiles TypeScript (`tsc`), lints the codebase (`eslint`), runs backend unit tests, and verifies the production build.
* **Frontend CI (`.github/workflows/frontend-ci.yml`):** Lints the files (`eslint`) and runs `next build` to verify route configuration.

### Deployment (CD)
* **Frontend:** Deployed automatically to **Vercel** on every push to `main`.
* **Backend:** Deployed automatically to **Google Cloud Run** via Google Cloud Build (configured with Dockerfile triggers matching pushes to the `/backend` folder).
