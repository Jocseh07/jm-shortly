# API Documentation

Complete API reference for Shortly link shortener.

---

## 📋 Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Endpoints](#endpoints)
   - [Create Link](#post-apilinks)
   - [Get All Links](#get-apilinks)
   - [Get Link Details](#get-apilinksid)
   - [Delete Link](#delete-apilinksid)
   - [Redirect](#get-shortcode)

---

## 🌐 Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://shortly.app` (or your domain)

---

## 🔐 Authentication

**Current Version**: No authentication (anonymous links)  
**Future**: Will support user authentication with NextAuth.js

All endpoints are currently public and don't require authentication.

---

## ⚠️ Error Handling

All API endpoints return errors in a consistent format:

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or parameters |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 410 | Gone | Resource has been disabled or expired |
| 500 | Internal Server Error | Server error |

---

## 📡 Endpoints

---

### **POST /api/links**

Create a new shortened link.

#### Request

**Method**: `POST`  
**URL**: `/api/links`  
**Content-Type**: `application/json`

**Body Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `originalUrl` | string | Yes | The long URL to shorten |
| `customAlias` | string | No | Custom short code (4-20 characters) |

**Example Request**:

```bash
curl -X POST https://shortly.app/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://example.com/very/long/url/path",
    "customAlias": "my-link"
  }'
```

**JavaScript Example**:

```typescript
const response = await fetch('/api/links', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    originalUrl: 'https://example.com/very/long/url/path',
    customAlias: 'my-link' // optional
  })
});

const data = await response.json();
```

#### Response

**Success Response** (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shortCode": "my-link",
  "shortUrl": "https://shortly.app/my-link",
  "originalUrl": "https://example.com/very/long/url/path"
}
```

**Error Responses**:

**400 Bad Request** - Invalid URL:
```json
{
  "error": "Invalid URL"
}
```

**409 Conflict** - Short code already exists:
```json
{
  "error": "Short code already exists"
}
```

#### Validation Rules

- `originalUrl` must be a valid HTTP or HTTPS URL
- `customAlias` must be 4-20 characters
- `customAlias` can only contain: letters, numbers, hyphens, underscores
- `customAlias` must be unique

---

### **GET /api/links**

Get all shortened links (dashboard data).

#### Request

**Method**: `GET`  
**URL**: `/api/links`

**Query Parameters**: None (future: pagination, filtering)

**Example Request**:

```bash
curl https://shortly.app/api/links
```

**JavaScript Example**:

```typescript
const response = await fetch('/api/links');
const links = await response.json();
```

#### Response

**Success Response** (200 OK):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "shortCode": "abc123",
    "originalUrl": "https://example.com/long/url",
    "clicks": 1234,
    "isActive": true,
    "createdAt": 1699564800000,
    "updatedAt": 1699564800000,
    "userId": null,
    "expiresAt": null
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "shortCode": "xyz789",
    "originalUrl": "https://google.com",
    "clicks": 89,
    "isActive": true,
    "createdAt": 1699478400000,
    "updatedAt": 1699478400000,
    "userId": null,
    "expiresAt": null
  }
]
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (UUID) |
| `shortCode` | string | Short code for the link |
| `originalUrl` | string | Original long URL |
| `clicks` | number | Total click count |
| `isActive` | boolean | Whether link is active |
| `createdAt` | number | Creation timestamp (milliseconds) |
| `updatedAt` | number | Last update timestamp |
| `userId` | string \| null | User ID (null for anonymous) |
| `expiresAt` | number \| null | Expiration timestamp (null = never) |

---

### **GET /api/links/[id]**

Get detailed analytics for a specific link.

#### Request

**Method**: `GET`  
**URL**: `/api/links/:id`  
**URL Parameters**: `id` - Link UUID

**Example Request**:

```bash
curl https://shortly.app/api/links/550e8400-e29b-41d4-a716-446655440000
```

**JavaScript Example**:

```typescript
const linkId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`/api/links/${linkId}`);
const analytics = await response.json();
```

#### Response

**Success Response** (200 OK):

```json
{
  "link": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
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
    { "date": "2025-11-02", "clicks": 67 },
    { "date": "2025-11-03", "clicks": 52 }
  ],
  "recentClicks": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "timestamp": 1699564800000,
      "referer": "google.com",
      "deviceType": "mobile",
      "ipAddress": "203.0.113.45"
    }
  ]
}
```

**Error Response**:

**404 Not Found** - Link doesn't exist:
```json
{
  "error": "Link not found"
}
```

#### Response Structure

**`link`**: Basic link information
- `id`: Link UUID
- `shortCode`: Short code
- `originalUrl`: Original URL
- `createdAt`: Creation timestamp

**`metrics`**: Key performance indicators
- `totalClicks`: All-time click count
- `last24Hours`: Clicks in last 24 hours
- `last7Days`: Clicks in last 7 days

**`topReferrers`**: Top 5 traffic sources
- `referer`: Domain or "direct"
- `count`: Number of clicks

**`deviceBreakdown`**: Clicks by device type
- `mobile`: Mobile device clicks
- `desktop`: Desktop clicks
- `tablet`: Tablet clicks

**`clicksOverTime`**: Daily click counts (last 30 days)
- `date`: Date in YYYY-MM-DD format
- `clicks`: Number of clicks on that date

**`recentClicks`**: Last 20 clicks with details
- `id`: Click UUID
- `timestamp`: Click time
- `referer`: Referring URL
- `deviceType`: Device type
- `ipAddress`: IP address (optional)

---

### **DELETE /api/links/[id]**

Delete a shortened link and all its click data.

#### Request

**Method**: `DELETE`  
**URL**: `/api/links/:id`  
**URL Parameters**: `id` - Link UUID

**Example Request**:

```bash
curl -X DELETE https://shortly.app/api/links/550e8400-e29b-41d4-a716-446655440000
```

**JavaScript Example**:

```typescript
const linkId = '550e8400-e29b-41d4-a716-446655440000';
const response = await fetch(`/api/links/${linkId}`, {
  method: 'DELETE'
});

const result = await response.json();
```

#### Response

**Success Response** (200 OK):

```json
{
  "success": true
}
```

**Error Response**:

**404 Not Found** - Link doesn't exist:
```json
{
  "error": "Link not found"
}
```

#### Notes

- Deleting a link also deletes all associated click records (CASCADE)
- This action is **irreversible**
- Future: Add soft-delete option (mark as inactive instead)

---

### **GET /[shortCode]**

Redirect to original URL and track click.

#### Request

**Method**: `GET`  
**URL**: `/:shortCode`  
**URL Parameters**: `shortCode` - Short code identifier

**Example Request**:

```bash
curl -I https://shortly.app/abc123
```

**Browser**: Simply visit `https://shortly.app/abc123`

#### Response

**Success Response** (301 Moved Permanently):

```
HTTP/1.1 301 Moved Permanently
Location: https://example.com/long/url
```

**Error Responses**:

**404 Not Found** - Short code doesn't exist:
```html
Link not found
```

**410 Gone** - Link is disabled:
```html
This link has been disabled
```

**410 Gone** - Link has expired:
```html
This link has expired
```

#### Behavior

1. System looks up `shortCode` in database
2. If found, increments click counter (async)
3. Records click details (IP, referrer, device) (async)
4. Immediately redirects to original URL
5. User lands on destination

#### Headers Tracked

The following request headers are captured for analytics:

- `X-Forwarded-For`: IP address
- `User-Agent`: Browser/device information
- `Referer`: Referring URL

#### Performance

- Expected redirect time: **10-30ms**
- Click tracking is asynchronous (doesn't block redirect)
- If click tracking fails, redirect still succeeds

---

## 🔄 Complete User Flow Examples

### Example 1: Create and Use a Short Link

**Step 1: Create Link**
```bash
curl -X POST https://shortly.app/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com/product/12345"}'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "shortCode": "a1B2c3",
  "shortUrl": "https://shortly.app/a1B2c3",
  "originalUrl": "https://example.com/product/12345"
}
```

**Step 2: Share Link**
- Share `https://shortly.app/a1B2c3` on social media

**Step 3: Someone Clicks**
- User visits `https://shortly.app/a1B2c3`
- Gets redirected to `https://example.com/product/12345`
- Click is tracked

**Step 4: View Analytics**
```bash
curl https://shortly.app/api/links/550e8400-e29b-41d4-a716-446655440000
```

Response includes click count, referrers, device breakdown, etc.

---

### Example 2: Custom Alias Link

**Create Link with Custom Alias**
```bash
curl -X POST https://shortly.app/api/links \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://example.com/summer-sale",
    "customAlias": "summer-2025"
  }'
```

Response:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "shortCode": "summer-2025",
  "shortUrl": "https://shortly.app/summer-2025",
  "originalUrl": "https://example.com/summer-sale"
}
```

Now you have a memorable URL: `https://shortly.app/summer-2025`

---

### Example 3: Dashboard Integration

**Fetch All Links for Dashboard**
```typescript
async function fetchDashboardData() {
  const response = await fetch('/api/links');
  const links = await response.json();
  
  return links.map(link => ({
    ...link,
    shortUrl: `${window.location.origin}/${link.shortCode}`
  }));
}
```

**Delete a Link**
```typescript
async function deleteLink(linkId: string) {
  const response = await fetch(`/api/links/${linkId}`, {
    method: 'DELETE'
  });
  
  if (response.ok) {
    console.log('Link deleted successfully');
  }
}
```

---

## 🧪 Testing Examples

### Using cURL

**Create Link:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://google.com"}'
```

**Get All Links:**
```bash
curl http://localhost:3000/api/links
```

**Get Analytics:**
```bash
curl http://localhost:3000/api/links/YOUR-LINK-ID
```

**Delete Link:**
```bash
curl -X DELETE http://localhost:3000/api/links/YOUR-LINK-ID
```

**Test Redirect:**
```bash
curl -I http://localhost:3000/abc123
```

---

### Using JavaScript/Fetch

```typescript
// Create link
const createLink = async (url: string) => {
  const response = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl: url })
  });
  return response.json();
};

// Get all links
const getLinks = async () => {
  const response = await fetch('/api/links');
  return response.json();
};

// Get analytics
const getAnalytics = async (linkId: string) => {
  const response = await fetch(`/api/links/${linkId}`);
  return response.json();
};

// Delete link
const deleteLink = async (linkId: string) => {
  const response = await fetch(`/api/links/${linkId}`, {
    method: 'DELETE'
  });
  return response.json();
};
```

---

## 🔮 Future API Endpoints

### Coming Soon

**User Authentication:**
```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

**Bulk Operations:**
```
POST /api/links/bulk
GET /api/links/export
```

**QR Codes:**
```
GET /api/links/[id]/qr
```

**Link Management:**
```
PATCH /api/links/[id]  (update link)
POST /api/links/[id]/disable  (disable link)
POST /api/links/[id]/enable  (enable link)
```

**Advanced Analytics:**
```
GET /api/analytics/summary
GET /api/analytics/trends
```

---

## 📝 Rate Limiting (Future)

To prevent abuse, rate limiting will be implemented:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/links` | 10 requests | Per hour |
| `GET /api/links` | 100 requests | Per hour |
| `GET /[shortCode]` | Unlimited | - |

---

## 🔐 CORS Policy

**Current**: Same-origin only  
**Future**: Configurable CORS for API access

---

## 📊 Response Times

Expected response times (95th percentile):

| Endpoint | Expected Time |
|----------|--------------|
| `POST /api/links` | <100ms |
| `GET /api/links` | <200ms |
| `GET /api/links/[id]` | <500ms |
| `DELETE /api/links/[id]` | <100ms |
| `GET /[shortCode]` | <30ms |

---

## 🆘 Troubleshooting

### Common Issues

**1. "Invalid URL" error**
- Ensure URL starts with `http://` or `https://`
- URL must be valid according to URL spec

**2. "Short code already exists"**
- Choose a different custom alias
- Or let system auto-generate one (omit `customAlias`)

**3. "Link not found" on redirect**
- Short code doesn't exist
- Link may have been deleted
- Check for typos in short code

**4. Analytics showing 0 clicks**
- Ensure clicks are actually happening
- Check that click tracking isn't failing (see server logs)
- Analytics are real-time (no delay)

---

**API designed for: Simplicity, Performance, Developer Experience**
