# Architecture Documentation

This document describes the technical architecture of Shortly, a link shortening service built with Next.js and Turso.

---

## 🏗️ System Architecture

Shortly uses a **simplified database-only architecture** for the MVP. This approach prioritizes simplicity and reliability over maximum performance.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  NEXT.JS APPLICATION                    │
│                    (Vercel / Self-hosted)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           APP ROUTER (PAGES)                    │   │
│  │  • / (Home)                                     │   │
│  │  • /dashboard (All Links)                       │   │
│  │  • /dashboard/[id] (Analytics)                  │   │
│  │  • /[shortCode] (Redirect Handler)              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           API ROUTES                            │   │
│  │  • POST /api/links (Create)                     │   │
│  │  • GET /api/links (List)                        │   │
│  │  • GET /api/links/[id] (Analytics)              │   │
│  │  • DELETE /api/links/[id] (Delete)              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         DRIZZLE ORM LAYER                       │   │
│  │  • Type-safe queries                            │   │
│  │  • Schema definitions                           │   │
│  │  • Migrations                                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│              TURSO DATABASE (SQLite)                    │
│                                                         │
│  Tables:                                                │
│  • links (short codes, URLs, click counts)              │
│  • clicks (detailed click events)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Flow 1: Create Short Link

```
User → Home Page
  ↓
  User enters URL: "https://example.com/long/url"
  ↓
  Click "Shorten Link" button
  ↓
POST /api/links
  ↓
  1. Validate URL format
  2. Generate short code: "abc123"
  3. Check if short code exists (uniqueness)
  4. INSERT INTO links (shortCode, originalUrl, ...)
  5. Return short URL: "https://shortly.app/abc123"
  ↓
Display success message + short URL
```

---

### Flow 2: Redirect & Track Click (CRITICAL PATH)

```
User clicks: https://shortly.app/abc123
  ↓
GET /abc123 (app/[shortCode]/route.ts)
  ↓
  1. Query database:
     SELECT * FROM links WHERE shortCode = 'abc123'
  ↓
  2. Check if link exists
     - Not found → Return 404
     - Inactive → Return 410
     - Expired → Return 410
  ↓
  3. Get originalUrl from result
  ↓
  4. Track click (ASYNC - don't wait):
     a. UPDATE links SET clicks = clicks + 1
     b. INSERT INTO clicks (timestamp, ip, userAgent, referer)
  ↓
  5. Return HTTP 301 redirect to originalUrl
  ↓
User lands on destination website
```

**Key Points:**
- Database query happens FIRST (10-20ms with Turso)
- Click tracking is ASYNC (fire-and-forget)
- Redirect happens immediately after getting URL
- If click tracking fails, redirect still succeeds

---

### Flow 3: View Analytics

```
User → Dashboard → Click "Analytics" on a link
  ↓
Navigate to /dashboard/[linkId]
  ↓
GET /api/links/[id]
  ↓
  1. Query: SELECT * FROM links WHERE id = [id]
  2. Query: SELECT * FROM clicks WHERE linkId = [id]
  3. Calculate metrics:
     - Total clicks
     - Last 24 hours
     - Last 7 days
     - Top referrers (GROUP BY referer)
     - Device breakdown (GROUP BY deviceType)
     - Clicks over time (GROUP BY date)
  4. Return JSON with all analytics data
  ↓
Page renders charts and tables
```

---

## 💾 Database Architecture

### Why Turso?

**Turso** is a serverless SQLite database with the following benefits:

✅ **Fast**: SQLite is one of the fastest databases  
✅ **Serverless**: No server management  
✅ **Global**: Edge replication for low latency  
✅ **Cost-effective**: Free tier available  
✅ **Developer-friendly**: Standard SQL, easy migrations

### Database Schema Overview

```sql
-- Links table: Stores short URLs
CREATE TABLE links (
  id TEXT PRIMARY KEY,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  user_id TEXT,
  clicks INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  expires_at INTEGER
);

-- Clicks table: Stores click events
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
```

**Indexes for Performance:**
- `links.short_code` (UNIQUE) - Fast lookups on redirect
- `links.user_id` - Filter links by user
- `clicks.link_id` - Fast analytics queries
- `clicks.timestamp` - Time-based filtering

---

## 🚀 Request/Response Flow

### 1. Create Link API

**Request:**
```http
POST /api/links
Content-Type: application/json

{
  "originalUrl": "https://example.com/long/url",
  "customAlias": "my-link" // optional
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shortCode": "my-link",
  "shortUrl": "https://shortly.app/my-link",
  "originalUrl": "https://example.com/long/url"
}
```

**Database Operations:**
1. `SELECT * FROM links WHERE short_code = 'my-link'` (check existence)
2. `INSERT INTO links (id, short_code, original_url, ...) VALUES (...)`

---

### 2. Redirect Handler

**Request:**
```http
GET /abc123
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)
Referer: https://twitter.com
X-Forwarded-For: 203.0.113.45
```

**Response:**
```http
HTTP/1.1 301 Moved Permanently
Location: https://example.com/long/url
```

**Database Operations:**
1. `SELECT * FROM links WHERE short_code = 'abc123'`
2. `UPDATE links SET clicks = clicks + 1 WHERE short_code = 'abc123'` (async)
3. `INSERT INTO clicks (link_id, timestamp, ip_address, ...) VALUES (...)` (async)

---

### 3. Get Analytics API

**Request:**
```http
GET /api/links/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "link": {
    "shortCode": "abc123",
    "originalUrl": "https://example.com/long/url",
    "createdAt": 1699564800000
  },
  "metrics": {
    "totalClicks": 1234,
    "last24Hours": 45,
    "last7Days": 234
  },
  "topReferrers": [
    { "referer": "google.com", "count": 556 },
    { "referer": "twitter.com", "count": 342 },
    { "referer": "direct", "count": 336 }
  ],
  "deviceBreakdown": {
    "mobile": 740,
    "desktop": 444,
    "tablet": 50
  },
  "clicksOverTime": [
    { "date": "2025-11-01", "clicks": 45 },
    { "date": "2025-11-02", "clicks": 67 }
  ],
  "recentClicks": [
    {
      "timestamp": 1699564800000,
      "referer": "google.com",
      "deviceType": "mobile"
    }
  ]
}
```

**Database Operations:**
1. `SELECT * FROM links WHERE id = '...'`
2. `SELECT * FROM clicks WHERE link_id = '...' ORDER BY timestamp DESC`
3. Aggregate queries for analytics (in-memory processing)

---

## ⚡ Performance Considerations

### Query Optimization

**1. Use Indexes**
```typescript
// Fast: Uses index on short_code
const link = await db.query.links.findFirst({
  where: eq(links.shortCode, 'abc123')
});

// Slow: Full table scan
const link = await db.query.links.findFirst({
  where: eq(links.originalUrl, 'https://...')
});
```

**2. Limit Results**
```typescript
// Good: Only fetch what you need
const recentLinks = await db.query.links.findMany({
  limit: 50,
  orderBy: desc(links.createdAt)
});

// Bad: Fetches everything
const allLinks = await db.query.links.findMany();
```

**3. Async Click Tracking**
```typescript
// Redirect happens immediately
const originalUrl = link.originalUrl;

// Track click in background (don't await)
trackClick(link.id, request).catch(console.error);

return Response.redirect(originalUrl, 301);
```

**4. Batch Operations**
```typescript
// Update counter and insert click in parallel
await Promise.all([
  db.update(links).set({ clicks: sql`${links.clicks} + 1` }),
  db.insert(clicks).values({ ... })
]);
```

---

### Expected Performance Metrics

| Operation | Expected Time | Notes |
|-----------|--------------|-------|
| Database Query (SELECT) | 5-20ms | Turso is edge-replicated |
| Redirect Total | 10-30ms | Including DB query |
| Click Tracking | 10-30ms | Async, doesn't block |
| Dashboard Load | <2 seconds | With 100+ links |
| Analytics Load | <3 seconds | Including charts |

---

## 🔒 Security Architecture

### Input Validation

**URL Validation:**
```typescript
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
```

**Short Code Validation:**
```typescript
function isValidShortCode(code: string): boolean {
  // Only alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9_-]{4,20}$/.test(code);
}
```

### Rate Limiting (Future)

```typescript
// Limit link creation per IP
// 10 links per hour per IP address
// Prevents abuse and spam
```

### SQL Injection Prevention

**Drizzle ORM** automatically prevents SQL injection:
```typescript
// Safe: Parameterized query
db.query.links.findFirst({
  where: eq(links.shortCode, userInput)
});

// Unsafe: Don't use raw SQL with user input
// db.execute(sql`SELECT * FROM links WHERE short_code = '${userInput}'`);
```

---

## 📊 Scalability Considerations

### Current Architecture Limits

**Database-Only Approach:**
- ✅ Simple and reliable
- ✅ Good for 100-1,000 redirects/minute
- ✅ No cache invalidation issues
- ❌ Database becomes bottleneck at high scale

### Future Optimizations

When you need to scale beyond 10,000 redirects/minute:

**1. Add Redis Caching**
```typescript
// Check cache first
let url = await redis.get(`link:${shortCode}`);

// Cache miss - query DB
if (!url) {
  const link = await db.query.links.findFirst(...);
  url = link.originalUrl;
  
  // Cache for 24 hours
  await redis.set(`link:${shortCode}`, url, { ex: 86400 });
}
```

**2. Separate Read/Write Databases**
- Write to primary database
- Read from replicas
- Turso supports this natively

**3. CDN for Static Assets**
- Dashboard UI served from CDN
- Reduces server load
- Faster page loads globally

**4. Background Job Processing**
- Use BullMQ or similar
- Queue click tracking jobs
- Process in batches
- Reduces database writes

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Test short code generation
test('generateShortCode creates 6-character code', () => {
  const code = generateShortCode();
  expect(code).toHaveLength(6);
});

// Test URL validation
test('isValidUrl accepts https URLs', () => {
  expect(isValidUrl('https://example.com')).toBe(true);
  expect(isValidUrl('javascript:alert(1)')).toBe(false);
});
```

### Integration Tests
```typescript
// Test link creation flow
test('POST /api/links creates short link', async () => {
  const response = await fetch('/api/links', {
    method: 'POST',
    body: JSON.stringify({ originalUrl: 'https://example.com' })
  });
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.shortCode).toBeDefined();
});

// Test redirect flow
test('GET /[shortCode] redirects to original URL', async () => {
  // Create link first
  const link = await createLink('https://example.com');
  
  // Test redirect
  const response = await fetch(`/${link.shortCode}`, {
    redirect: 'manual'
  });
  
  expect(response.status).toBe(301);
  expect(response.headers.get('location')).toBe('https://example.com');
});
```

### Performance Tests
```typescript
// Test redirect speed
test('redirect completes in under 50ms', async () => {
  const start = Date.now();
  await fetch(`/${shortCode}`);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(50);
});
```

---

## 🚀 Deployment Architecture

### Vercel Deployment (Recommended)

```
┌─────────────────────────────────────┐
│        Vercel Edge Network          │
│  • Global CDN                       │
│  • Automatic SSL                    │
│  • Edge functions                   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│     Next.js Serverless Functions    │
│  • /[shortCode] (redirect)          │
│  • /api/* (API routes)              │
│  • Pages (SSR/SSG)                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│          Turso Database             │
│  • Edge-replicated globally         │
│  • Auto-scaling                     │
└─────────────────────────────────────┘
```

### Environment Variables

Required for deployment:
```bash
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-token-here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Note:** The application automatically detects the base URL from request headers (using `x-forwarded-proto` and `host` headers), so you don't need to configure `NEXT_PUBLIC_APP_URL`. This ensures short links work correctly across all environments (development, staging, production) without manual configuration.

---

## 📈 Monitoring & Observability

### Metrics to Track

**Performance Metrics:**
- Average redirect time
- Database query time
- API response time
- Error rate

**Business Metrics:**
- Links created per day
- Total clicks per day
- Most popular links
- User retention

**Infrastructure Metrics:**
- Database connection pool usage
- Memory usage
- CPU usage
- Network bandwidth

### Logging

```typescript
// Log important events
console.log('Link created:', { shortCode, userId, timestamp });
console.log('Click tracked:', { shortCode, referer, device });
console.error('Redirect failed:', { shortCode, error });
```

### Error Tracking (Future)

Integrate with **Sentry** or similar:
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // ... code
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

---

## 🔮 Future Architecture Improvements

### Phase 1: Add Caching
- Implement Redis for hot links
- Cache link mappings
- Reduce database load by 80%

### Phase 2: Add Authentication
- NextAuth.js integration
- User accounts and sessions
- Multi-user support

### Phase 3: Advanced Analytics
- Real-time analytics dashboard
- WebSocket updates
- Advanced filtering and segmentation

### Phase 4: Horizontal Scaling
- Multiple app server instances
- Load balancer
- Database read replicas

---

**Architecture optimized for: Simplicity, Reliability, Developer Experience**
