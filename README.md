<div align="center">


### Video Management Platform

*Intelligent content moderation • Real-time processing • Enterprise-grade RBAC*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)](https://www.mongodb.com/)

[Quick Start](#-quick-start) • [Features](#-features) • [Architecture](#-architecture) • [Docs](#-documentation)

</div>

---

## 🌟 Overview

this is a production-ready video management platform that automatically moderates content using AI, enforces granular access control, and provides real-time collaboration features for multi-tenant organizations.

### Key Highlights

- **🤖 AI Content Moderation**: Automatic NSFW detection + profanity analysis using Hugging Face models
- **⚡ Real-Time Updates**: WebSocket-driven progress tracking and notifications
- **🔒 Enterprise RBAC**: Three-tier role system (Admin, Editor, Viewer)
- **🏢 Multi-Tenant**: Organisation-scoped data isolation
- **📊 Smart Processing**: Scene-change detection + adaptive frame sampling
- **🎯 Zero-Config ML**: Serverless AI integration — no GPU required

---

## ✨ Features

### Content Moderation
- Frame-by-frame visual analysis (NSFW detection)
- Audio transcription with profanity detection
- FFmpeg-powered scene change detection
- Weighted scoring algorithm for classification

### Security & Access
- JWT authentication with bcrypt hashing
- Role-based permissions (Admin/Editor/Viewer)
- Multi-tenant organisation isolation
- Dual-layer RBAC (frontend + backend)

### Video Management
- Drag-and-drop uploads (up to 500MB)
- HTTP range request streaming
- Auto-generated thumbnails
- Search, filter, and pagination
- Metadata management (tags, categories, visibility)

### Real-Time Features
- Live processing progress updates
- WebSocket notifications for role changes
- Room-based event broadcasting
- Non-blocking async processing

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite 7, Socket.IO |
| **Backend** | Node.js 20+, Express 5, TypeScript, Socket.IO 4 |
| **Database** | MongoDB 8 with Mongoose ODM |
| **AI/ML** | Hugging Face (Falconsai NSFW + Whisper large-v3) |
| **Media** | FFmpeg for video processing |
| **Auth** | JWT + bcrypt |
| **Deploy** | Docker (backend) + Vercel (frontend) |

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version    # v20.0.0+
npm --version     # v9.0.0+
mongod --version  # v6.0+
ffmpeg -version   # v5.0+
```

### Installation

**1. Clone repository**
```bash
git clone <repo-url>
cd pulse
```

**2. Setup backend** 
```bash
cd backend
npm install
cp .env.example .env    # Configure environment
npm run seed:demo       # Create demo users
npm run dev             # Start on port 5000
```

**3. Setup frontend** 
```bash
cd frontend
npm install
npm run dev             # Start on port 5173
```

**4. Access application**
```
Frontend: http://localhost:5173
Backend:  http://localhost:5000
```

**5. Demo credentials** (click to auto-fill on login page)
```
Admin:  admin@pulse.com  / admin123
Editor: editor@pulse.com / editor123
Viewer: viewer@pulse.com / viewer123
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│         React 19 • Socket.IO • Tailwind CSS                 │
└──────────┬────────────────────────────────┬─────────────────┘
           │ REST API                       │ WebSocket
           ▼                                ▼
┌──────────────────────────────────────────────────────────────┐
│                  BACKEND (Node/Express)                      │
│                                                              │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────┐ │
│  │   Auth   │  │   Video   │  │   User   │  │ Socket.IO │ │
│  └────┬─────┘  └─────┬─────┘  └────┬─────┘  └─────┬─────┘ │
│       │              │              │              │       │
│  ┌────▼──────────────▼──────────────▼──────────────▼─────┐ │
│  │       Middleware (JWT • RBAC • Validation)            │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                     │
│  ┌────────────────────▼──────────────────────────────────┐ │
│  │       Video Processing Pipeline (FFmpeg + AI)        │ │
│  │  • Metadata extraction  • Frame sampling             │ │
│  │  • NSFW detection       • Audio transcription        │ │
│  │  • Profanity check      • Classification             │ │
│  └────────────────────┬──────────────────────────────────┘ │
│                       │                                     │
│  ┌────────────────────▼──────────────────────────────────┐ │
│  │              MongoDB (Mongoose)                       │ │
│  │         Users • Videos • Metadata                     │ │
│  └───────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Upload** → Editor uploads video via React frontend
2. **Storage** → Multer saves file, MongoDB record created (`pending`)
3. **Processing** → Async AI pipeline:
   - FFmpeg extracts metadata & frames
   - Scene detection + interval sampling
   - Visual NSFW analysis (Falconsai)
   - Audio transcription + profanity (Whisper)
   - Classification: `safe` or `flagged`
4. **Real-Time** → Socket.IO broadcasts progress
5. **Access** → RBAC enforces org/role visibility

---

## 📖 Documentation

- **[Backend Documentation](./backend/README.md)** - API, setup, architecture
- **[Frontend Documentation](./frontend/README.md)** - Components, state, styling

### Quick Links

- [API Reference](./backend/README.md#-api-reference)
- [Environment Variables](./backend/README.md#-environment-variables)
- [Deployment Guide](./backend/README.md#-deployment)
- [Component Guide](./frontend/README.md#-components)
- [RBAC System](./frontend/README.md#-rbac-system)

---

## 📊 Project Structure

```
pulse/
├── 📄 README.md              # This file
├── 📦 backend/               # Node.js + Express API
│   ├── 📄 README.md          # Backend documentation
│   ├── 🐳 Dockerfile
│   └── 📁 src/
│       ├── controllers/      # Request handlers
│       ├── middleware/       # Auth, RBAC, validation
│       ├── models/           # MongoDB schemas
│       ├── routes/           # API endpoints
│       ├── services/         # Business logic (AI pipeline)
│       └── config/           # Configuration
│
├── 🎨 frontend/              # React SPA
│   ├── 📄 README.md          # Frontend documentation
│   ├── ⚙️ vite.config.ts
│   └── 📁 src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route pages
│       ├── context/          # State providers
│       ├── rbac/             # Permission system
│       └── services/         # API client
│
└── 📦 uploads/               # Runtime storage (gitignored)
```

---

## 🎯 Core Features Explained

### AI Processing Pipeline (5 Stages)

| Stage | Progress | Description | Time |
|-------|----------|-------------|------|
| 1️⃣ Validation | 0-10% | Verify file exists | ~1s |
| 2️⃣ Extraction | 10-30% | Metadata, frames, thumbnail | ~5-15s |
| 3️⃣ AI Analysis | 30-75% | NSFW + profanity detection | ~20-60s |
| 4️⃣ Classification | 75-90% | Weighted scoring | ~2s |
| 5️⃣ Finalization | 90-100% | Cleanup & mark ready | ~1s |

### Role Permissions

| Capability | Viewer | Editor | Admin |
|------------|:------:|:------:|:-----:|
| View videos | ✅ | ✅ | ✅ |
| Upload videos | ❌ | ✅ | ✅ |
| Edit videos | ❌ | ✅ (own) | ✅ (all) |
| Delete videos | ❌ | ✅ (own) | ✅ (all) |
| Manage users | ❌ | ❌ | ✅ |

### Video Visibility

| Level | Access | Use Case |
|-------|--------|----------|
| 🔒 Private | Uploader only | Drafts, sensitive content |
| 🏢 Organisation | Org members | Internal training |
| 🌐 Public | Everyone | Marketing materials |

---

## 🔧 Configuration

**Backend** requires:
- MongoDB connection string
- JWT secret key
- Hugging Face API token
- FFmpeg installed on system

**Frontend** (optional):
- Backend API URL (defaults to proxy)

See detailed configuration in component READMEs.

---

## 🚀 Deployment

### Production Stack

- **Frontend**: Vercel 
- **Backend**: Railway
- **Database**: MongoDB Atlas (free tier available)

### Quick Deploy

**Backend:**
```bash
cd backend
docker build -t pulse-backend .
docker run -p 5000:5000 --env-file .env pulse-backend
```

**Frontend:**
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
```

See [Backend README](./backend/README.md#-deployment) for detailed deployment guide.

---

## 💡 Key Design Decisions

**Why JWT?** Stateless auth scales horizontally without session storage

**Why MongoDB?** Flexible schema perfect for varied video metadata

**Why Hugging Face?** Serverless ML - no GPU infrastructure needed

**Why Scene Detection?** Catches brief inappropriate content missed by interval sampling

**Why Async Processing?** Non-blocking uploads with real-time progress

See detailed rationale in [Backend Documentation](./backend/README.md#-design-decisions).

---


</div>
