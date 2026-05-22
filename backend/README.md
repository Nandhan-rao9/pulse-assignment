# Pulse Backend

Node.js + Express API with AI-powered video processing

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Design Decisions](#-design-decisions)
- [Deployment](#-deployment)

---

## ✨ Features

- **JWT Authentication** with bcrypt password hashing
- **Role-Based Access Control** (Admin, Editor, Viewer)
- **Video Processing Pipeline** with FFmpeg + AI
- **Real-Time Updates** via Socket.IO
- **Multi-Tenant Support** with organisation isolation
- **File Upload** with Multer (500MB limit)
- **Video Streaming** with HTTP range request support

---

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express 5
- **Language**: TypeScript
- **Database**: MongoDB 8 with Mongoose
- **WebSocket**: Socket.IO 4
- **AI**: Hugging Face Inference API
- **Media**: FFmpeg (fluent-ffmpeg)
- **Validation**: Zod schemas
- **Auth**: JWT + bcrypt

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version    # v20.0.0+
mongod --version  # v6.0+
ffmpeg -version   # v5.0+
```

### Installation

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
# Edit .env with your values
```

**3. Start development server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Scripts

```bash
npm run dev       # Development with auto-reload
npm run build     # Compile TypeScript to dist/
npm start         # Production mode
npm run seed:admin # Create admin user
```

---

## ⚙️ Environment Variables

Create `.env` file in backend root:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pulse

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=524288000  # 500 MB in bytes

# AI / Hugging Face
HUGGINGFACE_API_TOKEN=hf_your_token_here

# Processing
MAX_ANALYSIS_FRAMES=10
FRAME_INTERVAL_SECONDS=5

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Configuration Details

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `5000` | HTTP server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `JWT_SECRET` | **Yes** | — | JWT signing secret (⚠️ change in prod!) |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration (e.g., `7d`, `24h`) |
| `MAX_FILE_SIZE` | No | `524288000` | Max upload size (bytes) |
| `UPLOAD_DIR` | No | `uploads` | Upload directory path |
| `HUGGINGFACE_API_TOKEN` | **Yes** | — | [Get token](https://huggingface.co/settings/tokens) |
| `MAX_ANALYSIS_FRAMES` | No | `10` | Max frames to analyze |
| `FRAME_INTERVAL_SECONDS` | No | `5` | Frame sampling interval |
| `CORS_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |

---

## 📡 API Reference

**Base URL**: `/api`

**Response Format**:
```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Authentication**: Bearer token in header
```http
Authorization: Bearer <jwt_token>
```

---

### 🔐 Authentication

#### `POST /api/auth/register`
Register new user

**Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organisation": "Acme Corp"  // optional
}
```

**Response** `201`:
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "viewer" },
    "token": "eyJhbG..."
  }
}
```

#### `POST /api/auth/login`
Authenticate user

**Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** `200`: Same as register

#### `GET /api/auth/me`
Get current user profile

**Auth**: Required

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "..." }
  }
}
```

---

### 🎬 Videos

#### `GET /api/videos`
List videos with filters

**Auth**: All roles

**Query Params**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `status` (string): `pending`, `processing`, `completed`, `failed`
- `sensitivity` (string): `safe`, `flagged`, `unprocessed`
- `category` (string): Filter by category
- `search` (string): Search by title
- `sortBy` (string): Sort field (default: `createdAt`)
- `sortOrder` (string): `asc` or `desc` (default: `desc`)

**Response** `200`:
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "pagination": { "page": 1, "limit": 12, "total": 42, "pages": 4 }
  }
}
```

#### `POST /api/videos/upload`
Upload video file

**Auth**: Editor, Admin

**Content-Type**: `multipart/form-data`

**Form Fields**:
- `video` (file): Video file (max 500MB)
- `title` (string): Video title (optional)
- `description` (string): Description (optional, max 2000 chars)
- `tags` (string): Comma-separated tags
- `category` (string): Category name
- `visibility` (string): `private`, `organisation`, `public`

**Supported Formats**: MP4, MPEG, MOV, AVI, WebM, MKV

**Response** `201`:
```json
{
  "success": true,
  "message": "Video uploaded successfully. Processing started.",
  "data": { "video": { ... } }
}
```

#### `GET /api/videos/:id`
Get single video details

**Auth**: All roles (org/visibility filtered)

#### `GET /api/videos/:id/stream`
Stream video with range support

**Auth**: All roles  
**Query**: `?token=<jwt>` for embedded players

#### `GET /api/videos/:id/thumbnail`
Get video thumbnail

**Auth**: All roles

#### `PUT /api/videos/:id`
Update video metadata

**Auth**: Editor (own), Admin (all)

**Body**:
```json
{
  "title": "New title",
  "description": "New description",
  "tags": ["tag1", "tag2"],
  "category": "category",
  "visibility": "organisation"
}
```

#### `DELETE /api/videos/:id`
Delete video and files

**Auth**: Editor (own), Admin (all)

#### `POST /api/videos/:id/reprocess`
Re-trigger AI processing

**Auth**: Editor, Admin

---

### 👥 User Management

#### `GET /api/users`
List organisation users

**Auth**: Admin only

**Query Params**:
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role

#### `PUT /api/users/:id/role`
Change user role

**Auth**: Admin only

**Body**:
```json
{
  "role": "editor"  // viewer, editor, admin
}
```

**Constraints**: Cannot change own role

#### `PATCH /api/users/:id/status`
Toggle user active status

**Auth**: Admin only

---

### 📡 WebSocket Events

**Connection**:
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

#### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:video` | `videoId` | Join video progress room |
| `unsubscribe:video` | `videoId` | Leave video room |

#### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `video:progress` | `{ videoId, progress, status, message }` | Processing update |
| `video:complete` | `{ videoId, status, sensitivityClassification, ... }` | Processing done |
| `video:error` | `{ videoId, error }` | Processing failed |
| `role:updated` | `{ role, name, email, _id }` | Role changed by admin |
| `status:updated` | `{ isActive, name, email, _id }` | Status toggled |

---

## 🏗 Architecture

### Directory Structure

```
backend/src/
├── app.ts                    # Express app setup
├── server.ts                 # HTTP + Socket.IO server
├── socket.ts                 # WebSocket handlers
│
├── config/
│   ├── index.ts              # Environment config
│   └── db.ts                 # MongoDB connection
│
├── controllers/
│   ├── auth.controller.ts    # Auth logic
│   ├── user.controller.ts    # User management
│   └── video.controller.ts   # Video CRUD
│
├── middleware/
│   ├── auth.ts               # JWT verification
│   ├── rbac.ts               # Role checks
│   ├── upload.ts             # File upload (Multer)
│   └── validate.ts           # Zod validation
│
├── models/
│   ├── user.ts               # User schema
│   └── video.ts              # Video schema
│
├── routes/
│   ├── auth.routes.ts        # /api/auth
│   ├── user.routes.ts        # /api/users
│   └── video.routes.ts       # /api/videos
│
├── services/
│   └── videoProcessor.ts     # AI pipeline
│
└── types/
    └── index.ts              # TypeScript types
```

### Video Processing Pipeline

**Flow**: Upload → Validate → Extract → Analyze → Classify → Finalize

**Stages**:
1. **Validation** (0-10%): Verify file on disk
2. **Extraction** (10-30%): 
   - FFmpeg metadata (duration, resolution)
   - Frame sampling (scene detection + intervals)
   - Thumbnail generation (320px width)
3. **Analysis** (30-75%):
   - Visual: Falconsai NSFW model (batch of 4)
   - Audio: Whisper transcription → profanity check
4. **Classification** (75-90%):
   - Visual: 60% max + 25% top-5 avg + 15% overall
   - Flagged if: score > 0.4, any frame > 0.7, or ≥2 frames > 0.4
   - Audio: (profane words / total) × 3, flagged if > 0.15
5. **Finalization** (90-100%): Cleanup temp files

**Progress Updates**: Real-time via Socket.IO

---

## 💡 Design Decisions

### JWT vs Sessions
- ✅ **Stateless**: No server-side storage
- ✅ **Scalable**: Horizontal scaling without session sync
- ✅ **Simple**: No Redis/distributed cache needed

### Async Processing
- ✅ **Non-blocking**: Immediate upload response
- ✅ **UX**: Real-time progress via WebSocket
- ✅ **Resilient**: Continues on partial failures

### Scene Detection + Intervals
- ✅ **Comprehensive**: Catches brief inappropriate content
- ✅ **Adaptive**: Frame density based on video length
- ✅ **Efficient**: Combines two sampling strategies

### Batch Processing
- ✅ **Performance**: 4 concurrent API calls
- ✅ **Rate Limits**: Respects Hugging Face limits
- ✅ **Resilient**: Graceful degradation on failures

### Application-Layer Multi-Tenancy
- ✅ **Simple**: Single database, query filters
- ✅ **Maintainable**: Easier backups & migrations
- ⚠️ **Trade-off**: No physical isolation (adequate for most cases)

---

## 🚀 Deployment

### Docker

**Build**:
```bash
docker build -t pulse-backend .
```

**Run**:
```bash
docker run -d \
  -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/pulse \
  -e JWT_SECRET=your-secret \
  -e HUGGINGFACE_API_TOKEN=hf_token \
  --name pulse-backend \
  pulse-backend
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/pulse
      - JWT_SECRET=${JWT_SECRET}
      - HUGGINGFACE_API_TOKEN=${HUGGINGFACE_API_TOKEN}
      - CORS_ORIGIN=https://your-frontend.vercel.app
    depends_on:
      - mongo

  mongo:
    image: mongo:8
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

volumes:
  mongo-data:
```

### Production Platforms

| Platform | Difficulty | Cost | Notes |
|----------|------------|------|-------|
| Railway | ⭐ Easy | ~$5/mo | Auto-deploy from Git |
| Render | ⭐ Easy | ~$7/mo | Free tier available |
| Fly.io | ⭐⭐ Medium | ~$5/mo | Edge deployment |
| AWS ECS | ⭐⭐⭐ Hard | Variable | Full control |

### Checklist

- [ ] Set production `JWT_SECRET`
- [ ] Use MongoDB Atlas connection string
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to frontend URL
- [ ] Verify FFmpeg in Docker image
- [ ] Set up monitoring (logs, errors)
- [ ] Configure backups for MongoDB
- [ ] Set up SSL/TLS certificates

---

## 🔧 Development

### Database Schema

**User**:
```typescript
{
  name: string
  email: string (unique)
  password: string (hashed)
  role: 'viewer' | 'editor' | 'admin'
  organisation: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Video**:
```typescript
{
  title: string
  description: string
  originalName: string
  filename: string (unique)
  filepath: string
  mimeType: string
  size: number
  duration: number
  resolution: { width, height }
  
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed'
  processingProgress: number (0-100)
  processingError: string | null
  
  sensitivityClassification: 'safe' | 'flagged' | 'unprocessed'
  sensitivityScore: number (0-1)
  sensitivityDetails: { adult: number, language: number }
  
  uploadedBy: ObjectId (User)
  organisation: string
  visibility: 'private' | 'organisation' | 'public'
  
  tags: string[]
  category: string
  thumbnailPath: string
  isStreamReady: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

### Testing

```bash
# Manual API testing
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Socket.IO testing
npm install -g wscat
wscat -c ws://localhost:5000 --auth token=your-jwt-token
```

---

## 📄 License

Educational use only.

[⬆ Back to Top](#pulse-backend)
