# Sunstudio Config Portal - Frontend

Modern configuration management portal built with **Next.js 15 App Router** and **Radix UI**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
http://localhost:3000
```

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🛠️ Tech Stack

### Core
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **React**: 19.1.0

### UI & Styling
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/)

### State Management
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Authentication
- **Auth**: JWT (httpOnly cookies) with Zustand

### Testing
- **Unit**: [Vitest](https://vitest.dev/)

## 📁 Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── layout.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── layout.tsx
│   │   └── (routes)/
│   │       ├── dashboard/        # Main dashboard
│   │       ├── games/            # Games management
│   │       ├── users/            # User management (admin only)
│   │       └── sections/         # Section config management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Root page
│   ├── providers.tsx             # Client providers
│   └── not-found.tsx             # 404 page
├── middleware.ts                 # Route middleware
├── public/                       # Static assets
└── src/                          # Shared source code
    ├── components/               # React components
    │   ├── config/               # Config-specific components
    │   ├── layout/               # Layout components
    │   └── ui/                   # UI primitives (Radix)
    ├── contexts/                 # React contexts
    ├── hooks/                    # Custom hooks
    ├── lib/                      # Utilities
    │   ├── api.ts                # Axios API client
    │   ├── queryClient.ts        # React Query client
    │   └── validations/          # Zod schemas
    ├── stores/                   # Zustand stores
    │   └── authStore.ts          # Authentication state
    └── types/                    # TypeScript types
```

## 📜 Available Scripts

### Development
```bash
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
```

### Code Quality
```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking
```

### Testing
```bash
npm run test             # Run unit tests
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

## 🏗️ Architecture

### Next.js App Router

This project uses the **Next.js 15 App Router** with:

- **File-based routing**: Routes defined by folder structure
- **Server Components**: Default rendering on server
- **Client Components**: Marked with `'use client'` directive
- **Route Groups**: `(auth)` and `(dashboard)` for organization
- **Dynamic Routes**: `[gameId]` and `[configId]` for parameters
- **Loading States**: Automatic with `loading.tsx` files
- **Error Boundaries**: Per-route with `error.tsx` files

### Route Groups

#### `(auth)` - Authentication
- Centered layout design
- No authentication required
- Routes: `/login`

#### `(dashboard)` - Protected Dashboard
- Header + Sidebar layout
- Authentication required
- Routes: `/dashboard`, `/games`, `/configs`

### Component Strategy

```tsx
// Server Component (default) - Static content
export default function Page() {
  return <div>Static content</div>;
}

// Client Component - Interactive
'use client';
export default function Page() {
  const [state, setState] = useState();
  return <div>Interactive content</div>;
}
```

## 🔧 Development

### Environment Variables

Create `.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Adding a New Page

1. Create route folder in appropriate group:
```bash
mkdir -p app/(dashboard)/(routes)/new-page
```

2. Create page file:
```tsx
// app/(dashboard)/(routes)/new-page/page.tsx
'use client';

export default function NewPage() {
  return <div>New Page Content</div>;
}
```

3. Add loading state (optional):
```tsx
// app/(dashboard)/(routes)/new-page/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

4. Add error boundary (optional):
```tsx
// app/(dashboard)/(routes)/new-page/error.tsx
'use client';

export default function Error({ error, reset }) {
  return <div>Error: {error.message}</div>;
}
```

### Adding a UI Component

Using Radix UI patterns:

```tsx
// src/components/ui/new-component.tsx
'use client';

import * as React from 'react';
import * as NewPrimitive from '@radix-ui/react-new';
import { cn } from '@/lib/utils';

export const NewComponent = React.forwardRef<
  React.ElementRef<typeof NewPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NewPrimitive.Root>
>(({ className, ...props }, ref) => (
  <NewPrimitive.Root
    ref={ref}
    className={cn('base-styles', className)}
    {...props}
  />
));
NewComponent.displayName = 'NewComponent';
```

## 🧪 Testing

### Unit Tests (Vitest)

```tsx
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```


## 🚢 Deployment

### Build

```bash
npm run build
```

Output will be in `.next/` directory.

### Environment Variables

Ensure all required environment variables are set in your deployment platform.

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t config-portal-frontend .

# Run container
docker run -p 3000:3000 config-portal-frontend
```

## 📚 Key Documentation

- [NEXTJS_ARCHITECTURE.md](../NEXTJS_ARCHITECTURE.md) - Complete architecture guide
- [FRONTEND_MIGRATION_GUIDE.md](../FRONTEND_MIGRATION_GUIDE.md) - Migration from Vite
- [FRONTEND_REFACTORING_COMPLETE.md](../FRONTEND_REFACTORING_COMPLETE.md) - Refactoring summary

## 🎨 UI Components

All UI components are built with Radix UI for:
- ✅ Accessibility (ARIA compliant)
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support

Available components:
- `Button`, `Card`, `Dialog`, `Input`, `Select`
- `Table`, `Tabs`, `Form`, `Checkbox`
- `Dropdown Menu`, `Popover`, `Tooltip`
- And more...

## 🔒 Authentication

JWT-based authentication with:
- Email/Password login
- httpOnly cookie storage
- Protected routes via middleware
- Role-based access control (admin, game_operator)

## 📊 State Management

### React Query (TanStack Query)

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['games'],
  queryFn: fetchGames,
});

// Mutate data
const mutation = useMutation({
  mutationFn: createGame,
  onSuccess: () => {
    queryClient.invalidateQueries(['games']);
  },
});
```

### Forms with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const form = useForm({
  resolver: zodResolver(schema),
});
```

## 🐛 Troubleshooting

### Hydration Errors
Ensure server and client render the same initial content. Check for browser-only APIs in server components.

### "useRouter is not a function"
Import from `'next/navigation'`, not `'next/router'`.

### Module Not Found: @/
Check `tsconfig.json` has proper path mapping.

### Build Errors
Run `npm run type-check` to identify TypeScript issues.

## 🤝 Contributing

1. Create a new branch
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Build to verify: `npm run build`
6. Create a pull request

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js recommended config
- **Prettier**: Consistent formatting
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: kebab-case for files, PascalCase for component files

## 🎯 Performance

- **Server Components**: Reduced JavaScript bundle
- **Code Splitting**: Automatic per-route
- **Loading States**: Instant feedback
- **Error Boundaries**: Graceful error handling
- **Image Optimization**: Next.js Image (when used)

## 📱 Responsive Design

- **Mobile-first**: Tailwind CSS approach
- **Breakpoints**: sm, md, lg, xl, 2xl
- **Mobile menu**: Sidebar drawer on mobile
- **Touch-friendly**: Proper touch targets

## ♿ Accessibility

- **Radix UI**: ARIA-compliant primitives
- **Keyboard Navigation**: Full support
- **Focus Management**: Proper focus trapping
- **Screen Readers**: Semantic HTML

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## 📄 License

[Your License Here]

---

**Built with** ❤️ **using Next.js 15 and Radix UI**
