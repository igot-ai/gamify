# Sunstudio Config Portal - Frontend

Modern, premium React application for managing game configurations with Firebase Remote Config integration.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + TailwindCSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **Authentication**: Firebase Auth
- **API Client**: Axios

## Features

- 🔐 **Authentication**: Firebase Auth with Email/Password and Google OAuth
- 🎨 **Premium UI**: Dark mode with vibrant gradients and smooth animations
- 📱 **Responsive**: Mobile-first design
- ⚡ **Fast**: Optimized with Vite and TanStack Query caching
- 🔄 **Real-time**: Auto-sync with backend API
- 🎯 **Type-safe**: Full TypeScript coverage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Auth enabled

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Firebase credentials
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components (Button, Card, Input)
│   ├── layout/         # Layout components (Header, Layout)
│   └── config/         # Config-specific components (StatusBadge)
├── pages/              # Page components
│   ├── LoginPage.tsx
│   └── DashboardPage.tsx
├── hooks/              # Custom React hooks
│   ├── useGames.ts
│   └── useConfigs.ts
├── lib/                # Utilities
│   ├── api.ts          # Axios instance
│   ├── firebase.ts     # Firebase config
│   ├── utils.ts        # Helper functions
│   └── queryClient.ts  # TanStack Query config
├── types/              # TypeScript types
│   ├── api.ts          # API response types
│   └── user.ts         # User types
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Design System

### Colors

- **Primary**: Purple gradient (#8B5CF6)
- **Accent**: Electric Blue (#3B82F6)
- **Background**: Dark mode (#0A0E1A)
- **Foreground**: Light text (#E2E8F0)

### Typography

- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700

## API Integration

The frontend communicates with the backend API documented in `../BACKEND.md`.

### Key Endpoints

- `GET /games` - List all games
- `GET /configs` - List configs with filters
- `POST /configs` - Create config draft
- `POST /configs/{id}/submit-review` - Submit for review
- `POST /configs/{id}/approve` - Approve config
- `POST /configs/{id}/deploy` - Deploy to Firebase

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

**Last Updated**: 2025-11-25  
**Version**: 1.0.0
