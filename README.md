# Superteam Malaysia CMS

A modern content management system and admin dashboard for managing Superteam Malaysia community website content, built with Next.js and Supabase.

## 📋 Project Overview

Superteam Malaysia CMS is a comprehensive admin platform for:
- **Homepage Content Management**: Edit hero section, mission highlights, stats, events, members, partners, testimonials, FAQs, and CTAs
- **Event Management**: Create and manage community events with dates, locations, and Luma integration
- **User Management**: Manage community members with profiles and spotlights
- **Partner Management**: Handle partner logos and ecosystem information
- **Announcements**: Create floating notifications for important updates
- **Image Uploads**: Upload and manage images via Supabase Storage

All homepage content is dynamically fetched from the database and displayed in real-time.

## 🛠 Tech Stack

**Frontend:**
- Next.js 16.1+ (App Router, Server Components)
- React 19
- TypeScript
- Tailwind CSS v4
- Shadcn/UI components
- Framer Motion (animations)
- React Tweet (social media embedding)

**Backend:**
- Supabase (PostgreSQL database + Auth + Storage)
- Next.js Server Actions
- Route Handlers for API endpoints

**Development:**
- Zod (schema validation)
- Vitest (unit testing)
- ESLint (code quality)

**Deployment:**
- Netlify (recommended) or Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account (free tier works)
- GitHub account (for version control)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mudennn/stmy_website.git
   cd stmy_website
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables** (see section below)
   ```bash
   cp .env.example .env.local
   ```

4. **Initialize Supabase**
   ```bash
   supabase start
   ```

5. **Run migrations**
   ```bash
   supabase migration up
   ```

6. **Create first admin user** (see Admin Setup section)

7. **Start development server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-side only (NEVER expose these to client)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ADMIN_PASSWORD=your_admin_password_here

# Optional: for image uploads
NEXT_PUBLIC_BUCKET_NAME=cms-images
```

### Where to find these keys:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API → Project URL and Keys
4. Copy `URL` and `anon public key` for `NEXT_PUBLIC_` variables
5. Copy `service_role secret` for `SUPABASE_SERVICE_ROLE_KEY`

### Security Rules
- ✅ DO commit: `NEXT_PUBLIC_*` variables (prefixed variables are safe for client)
- ❌ NEVER commit: Service role key, admin password, or anything without `NEXT_PUBLIC_` prefix
- ✅ Always use `.env.local` for sensitive keys (add to `.gitignore`)

## 🚀 Local Development

### Development Server
```bash
pnpm dev
```
The app runs on http://localhost:3000

### Database
- Access Supabase Studio: Open `http://localhost:54323` after running `supabase start`
- Or use [Supabase Web Dashboard](https://supabase.com/dashboard)

### Run Tests
```bash
pnpm test           # Run tests
pnpm test:ui        # Interactive test UI
pnpm test:coverage  # Coverage report
```

### Linting
```bash
pnpm lint
```

## 👤 Admin Setup

### Creating the First Admin User

1. **Direct Database Insert** (Recommended for local dev):

   ```sql
   -- In Supabase SQL Editor, run:
   INSERT INTO admin_users (user_email, created_at)
   VALUES ('your-email@example.com', now())
   ON CONFLICT (user_email) DO NOTHING;
   ```

2. **Via Dashboard** (After first admin exists):
   - Go to `/dashboard/users/invite`
   - Enter admin email
   - Send invitation
   - New admin receives login credentials

### Admin Table Structure

The system uses a simple admin verification table:

```sql
-- Created by migration 001_initial_schema.sql
CREATE TABLE admin_users (
  user_email TEXT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

**Location:** `supabase/migrations/001_initial_schema.sql`

**Why this table?**
- Allows non-technical admins to invite other admins without database access
- Row-Level Security (RLS) policies protect sensitive operations
- Service role key (server-only) checks this table during login
- One email per row = one admin account

### How to Add New Admins

**Option 1: SQL Insert (Direct)**
```sql
INSERT INTO admin_users (user_email)
VALUES ('neadmin@example.com')
ON CONFLICT (user_email) DO NOTHING;
```

**Option 2: Dashboard Invite**
1. Login to `/dashboard` as existing admin
2. Go to `/dashboard/users/invite`
3. Enter new admin's email
4. They'll receive login credentials via email

### Authentication Flow

1. User visits `/login`
2. Enters email + password
3. POST to `/api/auth/login` (Route Handler)
4. Route Handler:
   - Validates credentials with Supabase Auth
   - Checks if email exists in `admin_users` table (using service role key)
   - Sets secure cookie
   - Returns `401` if not admin (generic error for security)
5. User redirected to `/dashboard` if successful
6. Middleware refreshes session on every request

**Security Notes:**
- Service role key only used server-side (Route Handlers, Server Actions)
- Client sees generic "Invalid credentials" for all failures (prevents email enumeration)
- Rate limiting on login (5 attempts per IP)
- Passwords hashed by Supabase Auth

## 📚 Project Structure

```
stmy_website/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Homepage (server component)
│   ├── login/                   # Login page
│   └── dashboard/               # Admin dashboard (protected)
│       ├── content/             # CMS content editor
│       ├── events/              # Event management
│       ├── members/             # Member management
│       ├── partners/            # Partner management
│       ├── announcements/       # Announcement management
│       └── users/               # User invitation
├── components/                   # React components
│   ├── home/                    # Homepage sections (hero, stats, events, etc.)
│   ├── content/                 # Content form components
│   ├── events/                  # Event form & table
│   ├── members/                 # Member form & table
│   ├── partners/                # Partner form & table
│   ├── announcements/           # Announcement form & table
│   └── ui/                      # Shadcn/UI components
├── lib/
│   ├── actions/                 # Server Actions (content, events, auth, etc.)
│   ├── data/                    # Data fetching functions for homepage
│   ├── schemas/                 # Zod validation schemas
│   ├── supabase/                # Supabase client setup
│   ├── storage/                 # Image upload utilities
│   └── security/                # Rate limiting, IP extraction, sanitization
├── types/                        # TypeScript type definitions
├── supabase/
│   └── migrations/              # SQL migrations (001-018)
└── middleware.ts                # Session refresh middleware
```

## 🗂 Database Schema Overview

### Key Tables

**cms_content** - Homepage sections content
```sql
id, section (enum), title, subtitle, body, metadata (JSON), sort_order, is_published, created_at, updated_at
```

**events** - Community events
```sql
id, title, event_date, location, image_url, luma_url, is_active, created_at, updated_at
```

**members** - Community members
```sql
id, name, role, bio, image_url, is_highlighted, created_at, updated_at
```

**partners** - Partner ecosystem
```sql
id, name, logo_url, website_url, is_active, sort_order, created_at, updated_at
```

**announcements** - Floating notifications
```sql
id, message, is_active, starts_at, ends_at, created_at, updated_at
```

**admin_users** - Admin access control ⭐
```sql
user_email (PRIMARY KEY), created_at, updated_at
```

See `supabase/migrations/` for complete schema.

## 🔄 CMS Sections & Data Structure

Each homepage section can be edited in `/dashboard/content`:

| Section | Editable Fields | Data Stored |
|---------|-----------------|-------------|
| **Hero** | Primary & Secondary Button URLs | Metadata (JSON) |
| **Mission/Highlights** | Title, Description, Image per item | Metadata array |
| **Stats** | Counter values (4 numbers) | Metadata array |
| **Events** | N/A (uses `events` table) | — |
| **Members** | N/A (uses `members` table) | — |
| **Partners** | N/A (uses `partners` table) | — |
| **Community Wall** | Testimonials (text, author, avatar, tweet URL) | Metadata array |
| **FAQ** | Question & Answer pairs | Metadata array |
| **Join CTA** | Social media links | Metadata array |
| **Footer** | Social media links, contact info | Metadata array |

## 🚢 Deployment

### Deploy to Netlify

1. **Connect GitHub Repository**
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub repo `stmy_website`

2. **Set Build Settings**
   - Build command: `pnpm build`
   - Publish directory: `.next`
   - Node version: 18.x or higher

3. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY (server-side only)
     SUPABASE_ADMIN_PASSWORD (server-side only)
     ```

4. **Deploy**
   - Push to `main` or `cms-phase3` branch
   - Netlify automatically builds and deploys

### Deploy to Vercel

```bash
pnpm install -g vercel
vercel
```

Follow prompts to connect GitHub and deploy.

### Production Supabase Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Copy project URL and keys
4. Run migrations in production:
   ```bash
   # Using Supabase CLI
   supabase db push --project-ref your_project_id
   ```
5. Set up Storage buckets for images (see Storage section)

## 💾 Database Migrations

Migrations are SQL files in `supabase/migrations/`:

**Run all migrations:**
```bash
supabase migration up
```

**Run specific migration:**
```bash
supabase migration up --version 001
```

**Create new migration:**
```bash
supabase migration new migration_name
```

### Migration Files
- `001-007`: Core schema (auth, content, events, members, partners)
- `008`: Column-level security & view ownership
- `009-012`: Announcements, members/partners enhancements
- `013`: Seed homepage content
- `014`: Storage policies
- `015-016`: Partner RLS policies
- `017`: Drop unused event columns
- `018`: Drop cms_content.image_url

## 📸 Image Uploads

Images are uploaded to Supabase Storage in buckets:
- `cms-images/hero` - Hero section images
- `cms-images/mission-highlights` - Mission/highlights images
- `cms-images/testimonial-avatars` - Community wall avatars
- `cms-images/member-avatars` - Member profile pictures
- `cms-images/partner-logos` - Partner logos
- `cms-images/event-images` - Event thumbnails

**Upload flow:**
1. User selects file in form
2. Client sends to `/api/upload` (Route Handler)
3. Server validates MIME type (prevents .exe disguised as .jpg)
4. Server uploads to Supabase Storage
5. Returns public URL

**Supported formats:**
- JPEG, PNG, WebP, GIF, AVIF
- SVG files are NOT supported (XSS protection)

## 🔒 Security Features

- ✅ **Row-Level Security (RLS)** - Database-level access control
- ✅ **Rate Limiting** - 5 login attempts per IP
- ✅ **Content Sanitization** - DOMPurify for user input
- ✅ **MIME Type Validation** - Prevent file upload spoofing
- ✅ **HSTS Header** - Enforce HTTPS
- ✅ **CSP (Content Security Policy)** - Prevent XSS attacks
- ✅ **Timezone Handling** - Explicit UTC+8 for Malaysia events
- ✅ **DoS Protection** - Limit pageSize to max 100 per CRUD template

See `/docs/SECURITY_AUDIT_LOG.md` for 30+ security fixes and details.

## 📖 Documentation

Additional documentation available in `/docs/`:
- `AUTH_IMPLEMENTATION.md` - Complete auth architecture
- `RATE_LIMIT_SECURITY.md` - IP extraction & rate limiting
- `SECURITY_AUDIT_LOG.md` - All security fixes (30+ issues)
- `EVENTS_CRUD_LESSONS.md` - CRUD form patterns
- `PHASES_5_6_LEARNINGS.md` - XSS, DoS, validation patterns
- `CRUD_TEMPLATE_GUIDE.md` - Standard CRUD implementation patterns

## 🐛 Troubleshooting

**"Failed to run sql query" during migration:**
- Ensure Supabase is running: `supabase status`
- Check migration syntax
- Use `supabase db reset` to clear and re-run all migrations

**Login not working:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check admin email exists in `admin_users` table
- Ensure `.env.local` is not committed to git

**Images not showing on homepage:**
- Check Storage RLS policies are correct
- Verify image URL is public and accessible
- Check browser console for CSP errors

**Rate limit on login:**
- Wait 15 minutes or restart server
- Use different IP address in development

## 📝 License

Private project for Superteam Malaysia.

## 👥 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Feat: description"`
3. Push branch: `git push origin feature/your-feature`
4. Open Pull Request to `main`

## 📞 Support

For issues or questions:
- Check `/docs/` folder for detailed documentation
- Review migration files for schema changes
- Check `/lib/schemas/` for validation rules

---

**Last Updated:** March 2026

