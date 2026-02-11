# Production Folder Structure

## Overview

This project follows a **feature-based architecture** suitable for production, with clear separation of concerns.

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/               # API routes
│   ├── builder/           # Resume builder page
│   ├── generate/          # AI generate page
│   ├── login/             # Auth pages
│   ├── signup/
│   ├── templates/
│   └── page.tsx           # Landing page
│
├── components/            # Shared components (UI primitives in ui/)
│   ├── ui/               # Design system (Button, Card, Input, etc.)
│   ├── ThemeProvider.tsx
│   ├── ResumeForm.tsx     # Resume builder components
│   ├── ResumePreview.tsx
│   └── ...
│
├── features/              # Feature modules (domain logic + components)
│   ├── landing/          # Landing page feature
│   │   ├── LandingHeader.tsx
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── Features.tsx
│   │   ├── FAQ.tsx
│   │   └── index.ts
│   └── resume/           # Resume builder feature (barrel)
│       └── index.ts
│
├── services/              # External API & data services
│   ├── groq.ts           # AI resume generation
│   ├── ats.ts            # ATS analysis
│   ├── mongodb.ts        # Database client
│   └── index.ts
│
├── config/                # App configuration
│   └── index.ts
│
├── types/                 # TypeScript type definitions
│   └── index.ts
│
├── lib/                   # Utilities, auth, business logic
│   ├── auth/             # JWT, cookies, validation, blacklist
│   ├── utils.ts          # Helpers, resume load/save
│   ├── change-tracker.ts
│   ├── resume-parser.ts
│   ├── templates.ts
│   ├── defaults.ts
│   └── ...
│
├── contexts/              # React context providers
│   └── AuthContext.tsx
│
├── hooks/                 # Shared React hooks
│   └── useResumePagination.ts
│
└── middleware.ts          # Next.js middleware
```

## Import Conventions

| Import from | Use for |
|-------------|---------|
| `@/components/ui/*` | UI primitives (Button, Card, Input) |
| `@/features/landing` | Landing page sections |
| `@/features/resume` | Resume builder components |
| `@/services/*` | API clients, DB, external services |
| `@/config` | App configuration |
| `@/types` | TypeScript types |
| `@/lib/*` | Utilities, auth, helpers |

## Notes

- **app/** = Pages + Routes (Next.js App Router combines these)
- **components/** = Reusable UI only (no page/feature logic)
- **features/** = Domain features with their components
- **services/** = External integrations (AI, DB, etc.)
- **lib/** = Internal utilities and business logic
