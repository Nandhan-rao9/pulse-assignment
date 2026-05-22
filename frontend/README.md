# Pulse Frontend

React 19 SPA with real-time video management

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Components](#-components)
- [RBAC System](#-rbac-system)
- [State Management](#-state-management)
- [Styling](#-styling)
- [Deployment](#-deployment)

---

## ✨ Features

- **Authentication UI** with login/register forms
- **Role-Based UI** with permission guards
- **Video Library** with search, filters, pagination
- **Drag-and-Drop Upload** with real-time progress
- **Video Player** with streaming support
- **Admin Panel** for user management
- **Real-Time Updates** via Socket.IO
- **Responsive Design** with Tailwind CSS 4

---

## 🛠 Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Build Tool**: Vite 7
- **HTTP Client**: Axios
- **WebSocket**: Socket.IO Client
- **UI Components**: Custom with Tailwind
- **Notifications**: React Hot Toast
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites

```bash
node --version    # v20.0.0+
npm --version     # v9.0.0+
```

### Installation

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment (optional)**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

**3. Start development server**
```bash
npm run dev
```

App runs on `http://localhost:5173`

### Scripts

```bash
npm run dev       # Development server with HMR
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 📁 Project Structure

```
src/
├── App.tsx                    # Routes + protected route wrapper
├── main.tsx                   # Entry point + providers
├── types.ts                   # Shared TypeScript types
│
├── components/
│   ├── Layout.tsx             # App shell (sidebar, header)
│   ├── ProgressTracker.tsx    # Real-time upload progress
│   ├── UploadDropzone.tsx     # Drag-and-drop file upload
│   └── VideoCard.tsx          # Video thumbnail card
│
├── context/
│   ├── AuthContext.tsx        # Auth state + login/logout
│   └── SocketContext.tsx      # Socket.IO connection
│
├── pages/
│   ├── LoginPage.tsx          # Login form
│   ├── RegisterPage.tsx       # Registration form
│   ├── DashboardPage.tsx      # Home dashboard
│   ├── UploadPage.tsx         # Video upload interface
│   ├── VideoLibraryPage.tsx   # Video grid with filters
│   ├── VideoPlayerPage.tsx    # Video player + metadata
│   ├── AdminPage.tsx          # User management (admin)
│   └── UnauthorizedPage.tsx   # 403 error page
│
├── rbac/
│   ├── permissions.ts         # Role-permission mappings
│   ├── RoleGuard.tsx          # Permission-based wrapper
│   ├── usePermissions.ts      # Permission hooks
│   └── index.ts               # Exports
│
└── services/
    └── api.ts                 # Axios client + interceptors
```

---

## 🧩 Components

### Layout
App shell with sidebar navigation and header

**Features**: Responsive sidebar • User dropdown • Role-based nav • Active route highlighting

---

### VideoCard
Video thumbnail card with metadata

**Props**:
```typescript
{
  video: Video
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}
```

**Features**: Thumbnail • Status badge • Sensitivity indicator • Duration/size • Actions

---

### UploadDropzone
Drag-and-drop file upload

**Props**:
```typescript
{
  onUpload: (file: File) => void
  maxSize?: number
  accept?: string
}
```

**Features**: Drag & drop • Click to browse • Validation • Visual feedback

---

### ProgressTracker
Real-time processing progress

**Props**:
```typescript
{
  videoId: string
  onComplete?: () => void
}
```

**Features**: Live updates • Stage breakdown • Error display • Success notification

---

## 🔐 RBAC System

### Using Permissions

**Hook**:
```tsx
import { usePermissions } from './rbac';

const { can, isAnyRole } = usePermissions();

if (can('video:upload')) {
  return <UploadButton />;
}
```

**Component Guard**:
```tsx
import { RoleGuard } from './rbac';

<RoleGuard permission="video:upload">
  <UploadButton />
</RoleGuard>
```

**Route Guard**:
```tsx
<ProtectedRoute permission="video:upload">
  <UploadPage />
</ProtectedRoute>
```

### Role Permissions

| Permission | Viewer | Editor | Admin |
|------------|:------:|:------:|:-----:|
| video:view | ✅ | ✅ | ✅ |
| video:upload | ❌ | ✅ | ✅ |
| video:edit | ❌ | ✅ | ✅ |
| video:delete | ❌ | ✅ | ✅ |
| admin:access | ❌ | ❌ | ✅ |

---

## 🌐 State Management

### Auth Context

**Usage**:
```tsx
import { useAuth } from './context/AuthContext';

const { user, login, logout } = useAuth();
```

**API**:
- `user`: Current user or null
- `loading`: Auth loading state
- `login(email, password)`: Login
- `register(...)`: Register
- `logout()`: Clear state
- `updateUser(partial)`: Update

---

### Socket Context

**Usage**:
```tsx
import { useSocket } from './context/SocketContext';

const socket = useSocket();

useEffect(() => {
  socket?.emit('subscribe:video', videoId);
  socket?.on('video:progress', handleProgress);
  
  return () => {
    socket?.off('video:progress');
  };
}, [socket]);
```

**Events**:
- `subscribe:video` / `unsubscribe:video`
- `video:progress` / `video:complete` / `video:error`
- `role:updated` / `status:updated`

---

## 🎨 Styling

### Tailwind CSS 4

Configured via `@tailwindcss/vite` plugin in `vite.config.ts`

**Common Patterns**:

```tsx
// Button
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Input
<input className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## 🌐 API Client

### Axios Setup

```typescript
import { authAPI, videoAPI, userAPI } from './services/api';

// Auth
await authAPI.login({ email, password });
await authAPI.register({ name, email, password });

// Videos
await videoAPI.list({ page: 1, limit: 12 });
await videoAPI.upload(formData);
await videoAPI.update(id, { title });

// Users
await userAPI.list();
await userAPI.updateRole(id, role);
```

**Features**:
- Auto JWT injection
- 401/403 error handling
- Auto-redirect on auth error

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
vercel --prod
```

Set environment variable: `VITE_API_URL=https://your-backend.com/api`

### Manual Deploy

Build:
```bash
npm run build  # Output: dist/
```

Deploy `dist/` to:
- Netlify (drag & drop)
- Cloudflare Pages
- AWS S3 + CloudFront

**Important**: Configure SPA rewrites (see `vercel.json`)

---

## 🔧 Development

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

Access: `import.meta.env.VITE_API_URL`

### Vite Proxy

Dev proxy forwards `/api` → backend (no CORS issues)

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:5000'
  }
}
```

---

## 📄 License

Educational use only.

[⬆ Back to Main README](../README.md)
