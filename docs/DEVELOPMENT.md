# Development Guide

Complete guide for setting up, developing, and deploying Shortly.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Available Scripts](#available-scripts)
8. [Code Style](#code-style)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Node.js**: Version 18.x or higher
  ```bash
  node --version  # Should be v18.0.0 or higher
  ```

- **pnpm**: Recommended package manager (or npm/yarn)
  ```bash
  npm install -g pnpm
  pnpm --version
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Recommended

- **VS Code**: With the following extensions
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd jm-shortly
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install:
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- And all other dependencies

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

**Note:** The app automatically detects the base URL from request headers, so you don't need to set `NEXT_PUBLIC_APP_URL`. This works seamlessly in both development and production.

**Getting Turso Credentials:**

1. Sign up at [turso.tech](https://turso.tech)
2. Install Turso CLI:
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   ```
3. Login:
   ```bash
   turso auth login
   ```
4. Create a database:
   ```bash
   turso db create shortly
   ```
5. Get credentials:
   ```bash
   turso db show shortly --url
   turso db tokens create shortly
   ```

### 4. Set Up Database

Generate and run migrations:

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
jm-shortly/
├── docs/                          # 📚 Documentation
│   ├── README.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── API.md
│   ├── FEATURES.md
│   └── DEVELOPMENT.md            # ← You are here
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx              # Home page (create links)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   │
│   │   ├── dashboard/            # Dashboard pages
│   │   │   ├── page.tsx          # All links
│   │   │   └── [linkId]/
│   │   │       └── page.tsx      # Analytics
│   │   │
│   │   ├── [shortCode]/          # Redirect handler
│   │   │   └── route.ts          # GET handler
│   │   │
│   │   └── api/                  # API routes
│   │       └── links/
│   │           ├── route.ts      # GET (all), POST (create)
│   │           └── [id]/
│   │               └── route.ts  # GET (one), DELETE
│   │
│   ├── db/                        # Database
│   │   ├── schema.ts             # Drizzle schema definitions
│   │   └── index.ts              # Database client
│   │
│   ├── lib/                       # Utilities
│   │   ├── utils.ts              # Helper functions
│   │   └── shortCode.ts          # Short code generator
│   │
│   ├── components/                # React components
│   │   ├── ui/                   # Reusable UI components
│   │   ├── LinkForm.tsx          # Create link form
│   │   ├── LinkTable.tsx         # Dashboard table
│   │   ├── AnalyticsChart.tsx    # Charts
│   │   └── CopyButton.tsx        # Copy to clipboard
│   │
│   └── data/
│       └── env.ts                # Environment validation
│
├── drizzle/                       # Database migrations
│   └── 0000_initial.sql
│
├── public/                        # Static assets
│   └── favicon.ico
│
├── .env.local                     # Environment variables (gitignored)
├── .env.example                   # Example env file
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                  # TypeScript config
├── next.config.ts                 # Next.js config
├── drizzle.config.ts              # Drizzle config
├── tailwind.config.ts             # Tailwind config
├── postcss.config.mjs             # PostCSS config
└── eslint.config.mjs              # ESLint config
```

---

## 🔄 Development Workflow

### Creating a New Feature

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add tests (future)
   - Update documentation

3. **Test locally**
   ```bash
   pnpm dev
   # Test in browser
   pnpm lint
   pnpm build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add custom alias validation
fix: redirect not working for expired links
docs: update API documentation
refactor: extract click tracking to separate function
```

---

## 🗄️ Database Setup

### Schema Definition

Located in `src/db/schema.ts`:

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  shortCode: text('short_code').notNull().unique(),
  originalUrl: text('original_url').notNull(),
  // ... more fields
});

export const clicks = sqliteTable('clicks', {
  id: text('id').primaryKey(),
  linkId: text('link_id').notNull().references(() => links.id),
  // ... more fields
});
```

### Creating Migrations

When you modify the schema:

```bash
# 1. Update schema in src/db/schema.ts
# 2. Generate migration
pnpm db:generate

# This creates a migration file in drizzle/
# e.g., drizzle/0001_add_expires_at.sql
```

### Applying Migrations

```bash
# Apply all pending migrations
pnpm db:migrate
```

### Database Studio

Drizzle Studio provides a GUI for your database:

```bash
pnpm db:studio
```

Opens at [https://local.drizzle.studio](https://local.drizzle.studio)

---

## 🔐 Environment Variables

### Required Variables

**`.env.local`** (local development):

```env
# Database (Turso)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=eyJhbGc...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Note:** The base URL for short links is automatically detected from request headers.

### Validation

Environment variables are validated using Zod in `src/data/env.ts`:

```typescript
import { z } from "zod";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.url(),
  TURSO_AUTH_TOKEN: z.string(),
});

export const env = envSchema.parse(process.env);
```

If variables are missing or invalid, the app will crash with a clear error message.

---

## 📜 Available Scripts

### Development

```bash
# Start development server
pnpm dev

# Start on different port
PORT=3001 pnpm dev
```

### Building

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix
```

### Database

```bash
# Generate migrations from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

### Type Checking

```bash
# Check TypeScript types
npx tsc --noEmit
```

---

## 🎨 Code Style

### TypeScript

- Use TypeScript for all files
- Avoid `any` types
- Define interfaces for complex objects
- Use type inference where possible

**Good:**
```typescript
interface Link {
  id: string;
  shortCode: string;
  originalUrl: string;
}

const getLink = async (id: string): Promise<Link | null> => {
  // ...
};
```

**Bad:**
```typescript
const getLink = async (id: any): Promise<any> => {
  // ...
};
```

### React Components

- Use functional components
- Prefer server components (default in Next.js)
- Use client components only when needed (interactivity)
- Extract reusable logic to custom hooks

**Server Component:**
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const links = await getLinks(); // Direct DB query
  return <LinkTable links={links} />;
}
```

**Client Component:**
```typescript
// components/CopyButton.tsx
'use client';

export function CopyButton({ text }: { text: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };
  
  return <button onClick={handleCopy}>Copy</button>;
}
```

### File Naming

- Components: PascalCase (`LinkTable.tsx`)
- Utilities: camelCase (`shortCode.ts`)
- Routes: lowercase (`route.ts`, `page.tsx`)

### Import Order

```typescript
// 1. External packages
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// 2. Internal absolute imports
import { db } from '@/db';
import { links } from '@/db/schema';

// 3. Relative imports
import { LinkTable } from './LinkTable';

// 4. Types
import type { Link } from '@/db/schema';
```

---

## 🧪 Testing

### Manual Testing Checklist

**Create Link:**
- [ ] Can create link with valid URL
- [ ] Error shown for invalid URL
- [ ] Can create link with custom alias
- [ ] Error shown if alias is taken
- [ ] Short URL is copyable

**Dashboard:**
- [ ] All links are displayed
- [ ] Click counts are accurate
- [ ] Search filters correctly
- [ ] Sort works (date, clicks)
- [ ] Delete removes link

**Redirect:**
- [ ] Short URL redirects correctly
- [ ] Click is counted
- [ ] 404 shown for non-existent link
- [ ] 410 shown for inactive link

**Analytics:**
- [ ] Metrics are accurate
- [ ] Charts render correctly
- [ ] Referrer data is captured
- [ ] Device breakdown is correct

### Unit Tests (Future)

```typescript
// lib/__tests__/shortCode.test.ts
import { generateShortCode, isValidShortCode } from '../shortCode';

describe('generateShortCode', () => {
  it('generates a 6-character code', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(6);
  });
});

describe('isValidShortCode', () => {
  it('accepts valid codes', () => {
    expect(isValidShortCode('abc123')).toBe(true);
  });
  
  it('rejects invalid codes', () => {
    expect(isValidShortCode('ab')).toBe(false); // too short
    expect(isValidShortCode('invalid@code')).toBe(false); // special chars
  });
});
```

---

## 🚀 Deployment

### Vercel (Recommended)

**Prerequisites:**
- Vercel account
- GitHub repository

**Steps:**

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add:
     - `TURSO_DATABASE_URL`
     - `TURSO_AUTH_TOKEN`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`

   **Note:** No need to set `NEXT_PUBLIC_APP_URL` - the app automatically uses the deployment URL.

4. **Deploy**
   - Vercel automatically deploys on push to `main`
   - Preview deployments for PRs

**Custom Domain:**
- Go to Project Settings → Domains
- Add your domain (e.g., `shortly.app`)
- Update DNS records as instructed

### Self-Hosting

**Build:**
```bash
pnpm build
```

**Run:**
```bash
PORT=3000 pnpm start
```

**Environment:**
- Set environment variables in your hosting platform
- Ensure Node.js 18+ is available
- Database connection must be accessible

**Docker (Optional):**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔍 Debugging

### Enable Debug Logging

```typescript
// lib/logger.ts
export const DEBUG = process.env.NODE_ENV === 'development';

export const log = (...args: any[]) => {
  if (DEBUG) console.log('[DEBUG]', ...args);
};
```

### Database Queries

Use Drizzle's built-in logging:

```typescript
import { drizzle } from 'drizzle-orm/libsql';

export const db = drizzle(client, { 
  schema,
  logger: true // Logs all SQL queries
});
```

### Next.js Debugging

```bash
# Enable verbose output
NODE_OPTIONS='--inspect' pnpm dev

# Then attach Chrome DevTools
# chrome://inspect
```

---

## 🆘 Troubleshooting

### Common Issues

**1. "Module not found" errors**

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**2. Database connection fails**

- Check `TURSO_DATABASE_URL` is correct
- Verify `TURSO_AUTH_TOKEN` is valid
- Test connection:
  ```bash
  turso db shell your-database
  ```

**3. Port already in use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

**4. TypeScript errors**

```bash
# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Or check types manually
npx tsc --noEmit
```

**5. Drizzle migrations fail**

```bash
# Reset database (WARNING: deletes all data)
turso db destroy your-database
turso db create your-database

# Regenerate migrations
pnpm db:generate
pnpm db:migrate
```

**6. Build fails**

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Turso Docs](https://docs.turso.tech/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools
- [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Turso Dashboard](https://turso.tech/app)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Drizzle Discord](https://discord.gg/drizzle)

---

## 🎯 Best Practices

### Performance

- Use server components by default
- Add `loading.tsx` for streaming
- Optimize images with `next/image`
- Enable React Compiler (already configured)

### Security

- Validate all user input
- Use parameterized queries (Drizzle does this)
- Never log sensitive data
- Set up CORS properly for API

### Database

- Always use indexes for queries
- Limit result sets
- Use transactions for multi-step operations
- Monitor query performance

### Code Quality

- Run lint before committing
- Write descriptive commit messages
- Add comments for complex logic
- Keep functions small and focused

---

## 🚦 Getting Help

**Found a bug?**
- Open an issue on GitHub
- Include: Steps to reproduce, expected vs actual behavior, screenshots

**Have a question?**
- Check existing documentation
- Search closed issues
- Ask in Discussions

**Want to contribute?**
- Read CONTRIBUTING.md
- Pick an issue labeled "good first issue"
- Submit a PR

---

**Happy coding! 🚀**
