# PulseGen — AI-Powered Video Management Platform

> A full-stack video management platform with **AI-driven content moderation**, **role-based access control (RBAC)**, **real-time processing updates via WebSockets**, and **multi-tenant organisation support**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Installation & Setup Guide](#installation--setup-guide)
4. [Environment Variables](#environment-variables)
5. [API Documentation](#api-documentation)
6. [User Manual](#user-manual)
7. [Assumptions & Design Decisions](#assumptions--design-decisions)
8. [Deployment](#deployment)
9. [Project Structure](#project-structure)
10. [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│  React 19 · React Router · Tailwind CSS · Socket.IO Client      │
└──────────┬──────────────────────────────────┬───────────────────┘
           │  REST (Axios)                    │  WebSocket
           ▼                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND  (Node / Express 5)                  │
│                                                                  │
│  ┌──────────┐  ┌────────────┐  ┌───────────────┐  ┌──────────┐ │
│  │  Auth     │  │  Video     │  │  User Mgmt    │  │ Socket.IO│ │
│  │  Routes   │  │  Routes    │  │  Routes       │  │  Server  │ │
│  └────┬─────┘  └─────┬──────┘  └──────┬────────┘  └────┬─────┘ │
│       │              │                │                 │       │
│  ┌────▼──────────────▼────────────────▼─────────────────▼─────┐ │
│  │              Middleware Layer                               │ │
│  │  JWT Auth · RBAC · Zod Validation · Multer Upload          │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │            Video Processing Pipeline                       │ │
│  │  FFmpeg (metadata, frames, thumbnails, audio extraction)   │ │
│  │  Hugging Face Inference API:                               │ │
│  │    • Falconsai/nsfw_image_detection  (visual analysis)     │ │
│  │    • openai/whisper-large-v3         (speech-to-text)      │ │
│  │  Profanity detection · Sensitivity classification          │ │
│  └────────────────────────┬───────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼───────────────────────────────────┐ │
│  │                   MongoDB (Mongoose ODM)                   │ │
│  │  Users Collection  ·  Videos Collection                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Upload** — Editor/Admin uploads a video file via the React frontend.
2. **Storage** — Multer stores the file on disk; a Video document is created in MongoDB with status `pending`.
3. **Processing Pipeline** (asynchronous, non-blocking):
   - **Metadata extraction** — FFmpeg extracts duration, resolution.
   - **Frame extraction** — Scene-change detection + fixed-interval sampling.
   - **Thumbnail generation** — First-second frame scaled to 320px width.
   - **Visual analysis** — Each frame sent to Falconsai NSFW model via Hugging Face API.
   - **Audio analysis** — Audio extracted as WAV → Whisper transcription → profanity scoring.
   - **Classification** — Weighted scoring algorithm classifies video as `safe` or `flagged`.
4. **Real-time updates** — Socket.IO emits progress events to the uploading user and anyone viewing that video.
5. **Access control** — RBAC middleware enforces role-based visibility; multi-tenant org isolation.

---

## Tech Stack

| Layer        | Technology                                                              |
| ------------ | ----------------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, React Router 7, Vite 7           |
| **Backend**  | Node.js, Express 5, TypeScript, Socket.IO 4                            |
| **Database** | MongoDB with Mongoose 8 ODM                                            |
| **AI / ML**  | Hugging Face Inference API (Falconsai NSFW, Whisper large-v3)           |
| **Media**    | FFmpeg (fluent-ffmpeg) for video processing                             |
| **Auth**     | JWT (jsonwebtoken), bcryptjs password hashing                           |
| **Validation** | Zod schema validation                                                |
| **Deployment** | Docker (backend), Vercel (frontend)                                  |

---

## Installation & Setup Guide

### Prerequisites

| Requirement          | Version  | Notes                                    |
| -------------------- | -------- | ---------------------------------------- |
| **Node.js**          | ≥ 20 LTS | Required for both frontend and backend   |
| **npm**              | ≥ 9      | Comes with Node.js                       |
| **MongoDB**          | ≥ 6.0    | Local install or MongoDB Atlas           |
| **FFmpeg**           | ≥ 5.0    | Must be on system PATH                   |
| **Hugging Face Token** | —      | Free account at https://huggingface.co   |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/pulsegen.git
cd pulsegen
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pulsegen

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=524288000          # 500 MB in bytes

# AI / Hugging Face
HUGGINGFACE_API_TOKEN=hf_your_token_here

# Processing
MAX_ANALYSIS_FRAMES=10
FRAME_INTERVAL_SECONDS=5

# CORS
CORS_ORIGIN=http://localhost:5173
```

Build and start:

```bash
npm run build
npm start
```

Or for development with rebuild:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory (optional — defaults to `/api` with Vite proxy):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The app will be available at **http://localhost:5173**.

### 4. Seed an Admin User (Optional)

```bash
cd backend
npm run seed:admin
```

### 5. Docker Deployment (Backend)

```bash
cd backend
docker build -t pulsegen-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/pulsegen \
  -e JWT_SECRET=your-secret \
  -e HUGGINGFACE_API_TOKEN=hf_your_token \
  -e CORS_ORIGIN=http://localhost:5173 \
  pulsegen-backend
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Required | Default                              | Description                              |
| ---------------------- | -------- | ------------------------------------ | ---------------------------------------- |
| `PORT`                 | No       | `5000`                               | HTTP server port                         |
| `NODE_ENV`             | No       | `development`                        | `development` or `production`            |
| `MONGODB_URI`          | Yes      | `mongodb://localhost:27017/talentpulse` | MongoDB connection string             |
| `JWT_SECRET`           | Yes      | `fallback-secret-change-me`         | Secret for signing JWTs                  |
| `JWT_EXPIRES_IN`       | No       | `7d`                                 | Token expiration duration                |
| `MAX_FILE_SIZE`        | No       | `524288000` (500 MB)                 | Max upload size in bytes                 |
| `UPLOAD_DIR`           | No       | `uploads`                            | Directory for uploaded files             |
| `HUGGINGFACE_API_TOKEN`| Yes      | —                                    | Hugging Face API token for AI models     |
| `MAX_ANALYSIS_FRAMES`  | No       | `10`                                 | Max frames for analysis                  |
| `FRAME_INTERVAL_SECONDS`| No     | `5`                                  | Seconds between sampled frames           |
| `CORS_ORIGIN`          | No       | `http://localhost:5173`              | Allowed CORS origin                      |

### Frontend (`frontend/.env`)

| Variable       | Required | Default | Description                |
| -------------- | -------- | ------- | -------------------------- |
| `VITE_API_URL` | No       | `/api`  | Backend API base URL       |

