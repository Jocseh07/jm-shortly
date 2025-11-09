# Shortly - Link Shortener Documentation

Welcome to the Shortly documentation! Shortly is a modern URL shortening service with built-in analytics, built with Next.js 16 and Turso.

## 📚 Documentation Index

- **[Architecture](./ARCHITECTURE.md)** - System design and technical architecture
- **[Database](./DATABASE.md)** - Database schema and structure
- **[API Reference](./API.md)** - Complete API endpoints documentation
- **[Features](./FEATURES.md)** - Detailed feature specifications
- **[Development](./DEVELOPMENT.md)** - Setup and development guide

---

## 🎯 What is Shortly?

Shortly is a URL shortening service that allows users to:
- Convert long URLs into short, shareable links
- Track how many times each link has been clicked
- View detailed analytics (referrers, devices, geographic data)
- Manage all their shortened links in a dashboard

**Example:**
```
Long URL:  https://example.com/very/long/path/to/some/resource
Short URL: https://shortly.app/abc123
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Turso database account

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd jm-shortly

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Turso credentials

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

---

## 🏗️ Technology Stack

### Frontend & Backend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling

### Database
- **Turso** - SQLite-based serverless database
- **Drizzle ORM** - Type-safe database access

### Validation & Utilities
- **Zod** - Schema validation
- **nanoid** - Short code generation

### Analytics & Charts
- **Recharts** - Data visualization
- **Lucide React** - Icons

---

## 📊 Core Features

### ✅ MVP (Minimum Viable Product)
1. **Link Shortening** - Create short links from long URLs
2. **Custom Aliases** - Choose your own short code (optional)
3. **Click Tracking** - Count every click on your links
4. **Dashboard** - View all your links in one place
5. **Analytics** - See click statistics and trends
6. **Copy to Clipboard** - One-click copy functionality

### 🔮 Future Enhancements
- User authentication (NextAuth.js)
- QR code generation
- Link expiration dates
- Geographic tracking
- Custom domains
- Team collaboration
- API access

---

## 🌊 How It Works

### 1. Create a Short Link
```
User enters: https://example.com/very/long/url
System generates: abc123
Short URL: https://shortly.app/abc123
```

### 2. Someone Clicks the Link
```
User visits: https://shortly.app/abc123
System:
  1. Looks up "abc123" in database
  2. Increments click counter
  3. Records click details (IP, referrer, device)
  4. Redirects to original URL
User lands on: https://example.com/very/long/url
```

### 3. View Analytics
```
Dashboard shows:
  - Total clicks: 1,234
  - Clicks today: 45
  - Top referrers: Google, Twitter, Direct
  - Device breakdown: 60% mobile, 40% desktop
  - Clicks over time: Line chart
```

---

## 📁 Project Structure

```
jm-shortly/
├── docs/                      # 📚 Documentation
│   ├── README.md             # This file
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DATABASE.md           # Database schema
│   ├── API.md                # API endpoints
│   ├── FEATURES.md           # Feature specifications
│   └── DEVELOPMENT.md        # Development guide
│
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # Home page
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── [shortCode]/     # Redirect handler
│   │   └── api/             # API routes
│   │
│   ├── db/                   # Database
│   │   ├── schema.ts        # Drizzle schema
│   │   └── index.ts         # DB client
│   │
│   ├── lib/                  # Utilities
│   │   ├── utils.ts         # Helper functions
│   │   └── shortCode.ts     # Short code generator
│   │
│   ├── components/           # React components
│   │   ├── LinkForm.tsx
│   │   ├── LinkTable.tsx
│   │   └── AnalyticsChart.tsx
│   │
│   └── data/
│       └── env.ts            # Environment config
│
├── drizzle/                  # Database migrations
├── package.json
├── drizzle.config.ts
└── .env.local               # Environment variables
```

---

## 🎨 User Interface

### Home Page
- Clean, minimal design
- Large input field for URL
- Optional custom alias field
- "Shorten Link" button
- Success message with short URL

### Dashboard
- Table of all links
- Search and filter functionality
- Click counts for each link
- Copy, Analytics, Delete actions

### Analytics Page
- Key metrics cards (total clicks, 7-day, 24-hour)
- Line chart: Clicks over time
- Bar chart: Top referrers
- Pie chart: Device breakdown
- Recent clicks table

---

## 🔒 Security & Privacy

### Data Protection
- IP addresses are stored but not exposed in UI
- User agents logged for device analytics only
- No personal data collection
- GDPR-compliant data handling

### Link Security
- URL validation before shortening
- Active/inactive link status
- Link expiration support (future)
- Prevent malicious URLs (future)

---

## 📈 Performance

### Expected Performance
- **Redirect Speed**: 10-30ms
- **Dashboard Load**: <2 seconds
- **Analytics Load**: <3 seconds

### Scalability
- Current architecture: 100-1,000 redirects/minute
- With optimization: 10,000+ redirects/minute
- Database: Turso scales automatically

---

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting PRs.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## 📝 License

[Add your license here]

---

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions

---

## 🗺️ Roadmap

### Phase 1: MVP (Current)
- ✅ Basic link shortening
- ✅ Click tracking
- ✅ Dashboard
- ✅ Analytics

### Phase 2: Enhancements
- [ ] User authentication
- [ ] QR code generation
- [ ] Custom domains
- [ ] Link expiration

### Phase 3: Advanced
- [ ] Team collaboration
- [ ] API access
- [ ] Webhooks
- [ ] Advanced analytics

---

**Built with ❤️ using Next.js and Turso**
