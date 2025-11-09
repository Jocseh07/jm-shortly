# Database Documentation

This document describes the database schema, structure, and operations for Shortly.

---

## 🗄️ Database Technology

**Database**: Turso (SQLite-based, serverless)  
**ORM**: Drizzle ORM  
**Language**: TypeScript

---

## 📊 Schema Overview

Shortly uses two main tables:

1. **`links`** - Stores shortened links
2. **`clicks`** - Stores click events for analytics

### Entity Relationship Diagram

```
┌──────────────────────────┐
│         links            │
│──────────────────────────│
│ id (PK)                  │
│ short_code (UNIQUE)      │
│ original_url             │
│ user_id                  │
│ clicks                   │
│ created_at               │
│ updated_at               │
│ is_active                │
│ expires_at               │
└──────────────────────────┘
            │
            │ 1
            │
            │ has many
            │
            │ *
            ▼
┌──────────────────────────┐
│        clicks            │
│──────────────────────────│
│ id (PK)                  │
│ link_id (FK)             │
│ timestamp                │
│ ip_address               │
│ user_agent               │
│ referer                  │
│ country                  │
│ city                     │
│ device_type              │
└──────────────────────────┘
```

---

## 📋 Table: `links`

Stores all shortened links created by users.

### Schema Definition (SQL)

```sql
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  short_code TEXT NOT NULL UNIQUE,
  original_url TEXT NOT NULL,
  user_id TEXT,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  expires_at INTEGER
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_links_short_code ON links(short_code);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_created_at ON links(created_at);
CREATE INDEX idx_links_clicks ON links(clicks);
```

### Schema Definition (Drizzle ORM)

```typescript
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const links = sqliteTable('links', {
  id: text('id').primaryKey(),
  shortCode: text('short_code').notNull().unique(),
  originalUrl: text('original_url').notNull(),
  userId: text('user_id'),
  clicks: integer('clicks').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  expiresAt: integer('expires_at', { mode: 'timestamp' })
}, (table) => ({
  shortCodeIdx: index('short_code_idx').on(table.shortCode),
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  clicksIdx: index('clicks_idx').on(table.clicks)
}));

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;
```

### Column Descriptions

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| `id` | TEXT | No | UUID primary key | `550e8400-e29b-41d4-a716-446655440000` |
| `short_code` | TEXT | No | Unique short code for URL | `abc123` |
| `original_url` | TEXT | No | The original long URL | `https://example.com/long/path` |
| `user_id` | TEXT | Yes | User who created link (null for anonymous) | `user_123` |
| `clicks` | INTEGER | No | Total click count | `1234` |
| `created_at` | INTEGER | No | Unix timestamp (milliseconds) | `1699564800000` |
| `updated_at` | INTEGER | No | Unix timestamp (milliseconds) | `1699564800000` |
| `is_active` | INTEGER | No | 1 = active, 0 = inactive | `1` |
| `expires_at` | INTEGER | Yes | Unix timestamp for expiration (null = never) | `1699651200000` |

### Indexes

1. **`short_code` (UNIQUE)**: For fast lookups during redirect
2. **`user_id`**: For filtering user's links in dashboard
3. **`created_at`**: For sorting by creation date
4. **`clicks`**: For sorting by popularity

### Example Data

```sql
INSERT INTO links VALUES (
  '550e8400-e29b-41d4-a716-446655440000',  -- id
  'abc123',                                 -- short_code
  'https://example.com/very/long/url',     -- original_url
  NULL,                                     -- user_id
  1234,                                     -- clicks
  1699564800000,                            -- created_at
  1699564800000,                            -- updated_at
  1,                                        -- is_active
  NULL                                      -- expires_at
);
```

---

## 📋 Table: `clicks`

Stores detailed information about each click for analytics.

### Schema Definition (SQL)

```sql
CREATE TABLE clicks (
  id TEXT PRIMARY KEY,
  link_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Indexes for analytics queries
CREATE INDEX idx_clicks_link_id ON clicks(link_id);
CREATE INDEX idx_clicks_timestamp ON clicks(timestamp);
```

### Schema Definition (Drizzle ORM)

```typescript
export const clicks = sqliteTable('clicks', {
  id: text('id').primaryKey(),
  linkId: text('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referer: text('referer'),
  country: text('country'),
  city: text('city'),
  deviceType: text('device_type')
}, (table) => ({
  linkIdIdx: index('link_id_idx').on(table.linkId),
  timestampIdx: index('timestamp_idx').on(table.timestamp)
}));

export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
```

### Column Descriptions

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| `id` | TEXT | No | UUID primary key | `660e8400-e29b-41d4-a716-446655440001` |
| `link_id` | TEXT | No | Foreign key to links.id | `550e8400-e29b-41d4-a716-446655440000` |
| `timestamp` | INTEGER | No | Unix timestamp (milliseconds) | `1699564800000` |
| `ip_address` | TEXT | Yes | IP address of visitor | `203.0.113.45` |
| `user_agent` | TEXT | Yes | Browser/device user agent | `Mozilla/5.0 (iPhone...)` |
| `referer` | TEXT | Yes | Referring URL | `https://twitter.com` or `direct` |
| `country` | TEXT | Yes | Country code (future feature) | `US` |
| `city` | TEXT | Yes | City name (future feature) | `New York` |
| `device_type` | TEXT | Yes | Device type | `mobile`, `desktop`, `tablet` |

### Foreign Key Constraints

- `link_id` references `links.id` with **CASCADE DELETE**
  - When a link is deleted, all its clicks are automatically deleted

### Indexes

1. **`link_id`**: For filtering clicks by link (analytics queries)
2. **`timestamp`**: For time-based filtering and sorting

### Example Data

```sql
INSERT INTO clicks VALUES (
  '660e8400-e29b-41d4-a716-446655440001',  -- id
  '550e8400-e29b-41d4-a716-446655440000',  -- link_id
  1699564800000,                            -- timestamp
  '203.0.113.45',                          -- ip_address
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',  -- user_agent
  'https://twitter.com',                   -- referer
  NULL,                                     -- country
  NULL,                                     -- city
  'mobile'                                  -- device_type
);
```

---

## 🔍 Common Queries

### Create a New Link

```typescript
import { db } from '@/db';
import { links } from '@/db/schema';

const newLink = await db.insert(links).values({
  id: crypto.randomUUID(),
  shortCode: 'abc123',
  originalUrl: 'https://example.com/long/url',
  clicks: 0,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}).returning();
```

**SQL:**
```sql
INSERT INTO links (id, short_code, original_url, clicks, is_active, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'abc123',
  'https://example.com/long/url',
  0,
  1,
  1699564800000,
  1699564800000
);
```

---

### Find Link by Short Code

```typescript
import { eq } from 'drizzle-orm';

const link = await db.query.links.findFirst({
  where: eq(links.shortCode, 'abc123')
});
```

**SQL:**
```sql
SELECT * FROM links
WHERE short_code = 'abc123'
LIMIT 1;
```

---

### Increment Click Counter

```typescript
import { sql } from 'drizzle-orm';

await db.update(links)
  .set({ 
    clicks: sql`${links.clicks} + 1`,
    updatedAt: new Date()
  })
  .where(eq(links.shortCode, 'abc123'));
```

**SQL:**
```sql
UPDATE links
SET clicks = clicks + 1,
    updated_at = 1699564800000
WHERE short_code = 'abc123';
```

---

### Insert Click Record

```typescript
await db.insert(clicks).values({
  id: crypto.randomUUID(),
  linkId: '550e8400-e29b-41d4-a716-446655440000',
  timestamp: new Date(),
  ipAddress: '203.0.113.45',
  userAgent: 'Mozilla/5.0...',
  referer: 'https://twitter.com',
  deviceType: 'mobile'
});
```

**SQL:**
```sql
INSERT INTO clicks (id, link_id, timestamp, ip_address, user_agent, referer, device_type)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  1699564800000,
  '203.0.113.45',
  'Mozilla/5.0...',
  'https://twitter.com',
  'mobile'
);
```

---

### Get All Links (Dashboard)

```typescript
import { desc } from 'drizzle-orm';

const allLinks = await db.query.links.findMany({
  orderBy: desc(links.createdAt),
  limit: 100
});
```

**SQL:**
```sql
SELECT * FROM links
ORDER BY created_at DESC
LIMIT 100;
```

---

### Get Analytics for a Link

```typescript
const link = await db.query.links.findFirst({
  where: eq(links.id, linkId),
  with: {
    clicks: {
      orderBy: desc(clicks.timestamp),
      limit: 1000
    }
  }
});
```

**SQL:**
```sql
-- Get link
SELECT * FROM links WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Get clicks
SELECT * FROM clicks
WHERE link_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY timestamp DESC
LIMIT 1000;
```

---

### Count Clicks in Last 24 Hours

```typescript
const yesterday = Date.now() - 24 * 60 * 60 * 1000;

const recentClicks = await db.query.clicks.findMany({
  where: and(
    eq(clicks.linkId, linkId),
    gte(clicks.timestamp, new Date(yesterday))
  )
});

const count = recentClicks.length;
```

**SQL:**
```sql
SELECT COUNT(*) FROM clicks
WHERE link_id = '550e8400-e29b-41d4-a716-446655440000'
  AND timestamp >= 1699478400000;
```

---

### Top Referrers for a Link

```typescript
const allClicks = await db.query.clicks.findMany({
  where: eq(clicks.linkId, linkId)
});

// Group by referer in memory
const referrerCounts = allClicks.reduce((acc, click) => {
  const ref = click.referer || 'direct';
  acc[ref] = (acc[ref] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

const topReferrers = Object.entries(referrerCounts)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
```

**SQL:**
```sql
SELECT referer, COUNT(*) as count
FROM clicks
WHERE link_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY referer
ORDER BY count DESC
LIMIT 5;
```

---

### Device Breakdown

```typescript
const allClicks = await db.query.clicks.findMany({
  where: eq(clicks.linkId, linkId)
});

const deviceCounts = allClicks.reduce((acc, click) => {
  const device = click.deviceType || 'unknown';
  acc[device] = (acc[device] || 0) + 1;
  return acc;
}, {} as Record<string, number>);
```

**SQL:**
```sql
SELECT device_type, COUNT(*) as count
FROM clicks
WHERE link_id = '550e8400-e29b-41d4-a716-446655440000'
GROUP BY device_type;
```

---

### Delete Link (Cascade Deletes Clicks)

```typescript
await db.delete(links).where(eq(links.id, linkId));
```

**SQL:**
```sql
-- This automatically deletes all clicks due to CASCADE
DELETE FROM links WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## 🚀 Database Migrations

### Initial Migration

```bash
# Generate migration files
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

### Migration File Example

```sql
-- Migration: 0000_initial_schema.sql

CREATE TABLE `links` (
  `id` text PRIMARY KEY NOT NULL,
  `short_code` text NOT NULL,
  `original_url` text NOT NULL,
  `user_id` text,
  `clicks` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `is_active` integer DEFAULT 1 NOT NULL,
  `expires_at` integer
);

CREATE UNIQUE INDEX `short_code_idx` ON `links` (`short_code`);
CREATE INDEX `user_id_idx` ON `links` (`user_id`);
CREATE INDEX `created_at_idx` ON `links` (`created_at`);
CREATE INDEX `clicks_idx` ON `links` (`clicks`);

CREATE TABLE `clicks` (
  `id` text PRIMARY KEY NOT NULL,
  `link_id` text NOT NULL,
  `timestamp` integer NOT NULL,
  `ip_address` text,
  `user_agent` text,
  `referer` text,
  `country` text,
  `city` text,
  `device_type` text,
  FOREIGN KEY (`link_id`) REFERENCES `links`(`id`) ON UPDATE no action ON DELETE cascade
);

CREATE INDEX `link_id_idx` ON `clicks` (`link_id`);
CREATE INDEX `timestamp_idx` ON `clicks` (`timestamp`);
```

---

## 🔧 Database Configuration

### Drizzle Config File

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';
import { env } from './src/data/env';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN
  }
} satisfies Config;
```

### Database Client

```typescript
// src/db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '@/data/env';
import * as schema from './schema';

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
```

---

## 📈 Performance Optimization

### Index Usage

**Good: Uses index**
```typescript
// Fast: Uses short_code index
db.query.links.findFirst({
  where: eq(links.shortCode, 'abc123')
});
```

**Bad: Full table scan**
```typescript
// Slow: No index on original_url
db.query.links.findFirst({
  where: eq(links.originalUrl, 'https://...')
});
```

### Query Limits

Always use limits to prevent fetching too much data:

```typescript
// Good: Limited
db.query.links.findMany({ limit: 100 });

// Bad: Unlimited
db.query.links.findMany(); // Could return millions
```

### Connection Pooling

Turso automatically manages connections. No configuration needed!

---

## 🔒 Data Privacy & Security

### PII (Personally Identifiable Information)

**Data Collected:**
- IP addresses (for analytics)
- User agents (for device detection)

**NOT Collected:**
- Names
- Email addresses
- Payment information
- Personal messages

### GDPR Compliance

**User Rights:**
- Right to access: Users can export their click data
- Right to deletion: Delete link also deletes all click records (CASCADE)
- Right to rectification: Update link URLs

**Data Retention:**
- Links: Kept indefinitely (unless user deletes)
- Clicks: Kept indefinitely for analytics
- Future: Add automatic data retention policy (e.g., delete clicks older than 2 years)

---

## 🧹 Data Cleanup

### Delete Expired Links

```typescript
const now = Date.now();

await db.delete(links).where(
  and(
    isNotNull(links.expiresAt),
    lte(links.expiresAt, new Date(now))
  )
);
```

### Archive Old Clicks (Future)

```typescript
// Move clicks older than 2 years to archive table
const twoYearsAgo = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;

await db.delete(clicks).where(
  lte(clicks.timestamp, new Date(twoYearsAgo))
);
```

---

## 📊 Database Statistics

### Table Sizes (Estimates)

**Links Table:**
- 100 links ≈ 10 KB
- 1,000 links ≈ 100 KB
- 10,000 links ≈ 1 MB
- 100,000 links ≈ 10 MB

**Clicks Table:**
- 1,000 clicks ≈ 100 KB
- 10,000 clicks ≈ 1 MB
- 100,000 clicks ≈ 10 MB
- 1,000,000 clicks ≈ 100 MB

### Growth Projections

If you average 100 links/day with 1,000 clicks/day:
- After 1 month: ~3,000 links, ~30,000 clicks ≈ 3.3 MB
- After 1 year: ~36,500 links, ~365,000 clicks ≈ 40 MB
- After 5 years: ~182,500 links, ~1,825,000 clicks ≈ 200 MB

SQLite (Turso) handles databases up to **terabytes** easily!

---

## 🆘 Troubleshooting

### Common Issues

**1. "Table doesn't exist"**
```bash
# Run migrations
pnpm db:migrate
```

**2. "UNIQUE constraint failed"**
- Short code already exists
- Generate a new short code or check for conflicts

**3. "Foreign key constraint failed"**
- Trying to insert click with invalid link_id
- Ensure link exists before inserting click

**4. Slow queries**
- Check if indexes exist: `PRAGMA index_list('links');`
- Use `EXPLAIN QUERY PLAN` to debug

---

**Database optimized for: Fast reads, Efficient writes, Analytics queries**
