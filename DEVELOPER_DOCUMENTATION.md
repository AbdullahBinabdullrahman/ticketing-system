# 🎫 Ticketing System - Developer Documentation

> **Version:** 0.1.0  
> **Last Updated:** November 2025  
> **Framework:** Next.js 16.0.0 (Pages Router)  
> **Database:** PostgreSQL with Drizzle ORM

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [File Structure](#-file-structure)
4. [Getting Started](#-getting-started)
5. [Architecture](#-architecture)
6. [Database Schema](#-database-schema)
7. [API Routes](#-api-routes)
8. [Authentication & Authorization](#-authentication--authorization)
9. [User Journeys](#-user-journeys)
10. [Frontend Components](#-frontend-components)
11. [State Management](#-state-management)
12. [Internationalization (i18n)](#-internationalization-i18n)
13. [Styling System](#-styling-system)
14. [Email Notifications](#-email-notifications)
15. [Cron Jobs & Background Tasks](#-cron-jobs--background-tasks)
16. [Testing](#-testing)
17. [Deployment](#-deployment)
18. [Common Issues & Solutions](#-common-issues--solutions)
19. [Contributing](#-contributing)

---

## 🎯 Project Overview

The **Ticketing System** is a comprehensive service request management platform that connects customers with service partners. The system handles the complete lifecycle of service requests from submission to completion, with intelligent routing, SLA management, and multi-role access control.

### Key Features

- **Multi-Portal Architecture**: Separate interfaces for Admin, Partner, and Customer users
- **Intelligent Request Routing**: Geographic-based partner assignment using branch locations
- **SLA Management**: Automated deadline tracking and notifications
- **Real-time Status Updates**: Complete request lifecycle management
- **Multi-language Support**: English and Arabic (RTL) with i18n
- **Role-Based Access Control**: Granular permissions system
- **Email Notifications**: Dynamic template-based email system
- **Map Integration**: Mapbox integration for location services
- **Responsive Design**: Mobile-first, fully responsive UI

### Business Workflow

```
Customer → Submit Request → Admin Portal → Assign to Partner → Partner Confirms
→ Partner Updates Status → Completes Service → Request Closed
```

---

## 🔧 Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.0 | React framework with Pages Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling framework |
| **Framer Motion** | 12.23.24 | Animations |
| **SWR** | 2.3.6 | Data fetching & caching |
| **React Hook Form** | 7.66.0 | Form management |
| **Zod** | 4.1.12 | Schema validation |
| **react-i18next** | 16.2.3 | Internationalization |
| **Mapbox GL** | 3.16.0 | Maps & geolocation |
| **Lucide React** | 0.552.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.0.0 | Backend API layer |
| **PostgreSQL** | Latest | Primary database |
| **Drizzle ORM** | 0.44.7 | Database ORM |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 3.0.2 | Password hashing |
| **Nodemailer** | 7.0.10 | Email service |
| **node-cron** | 4.2.1 | Scheduled tasks |
| **Axios** | 1.13.1 | HTTP client |

### Development Tools

- **ESLint** - Code linting
- **Drizzle Kit** - Database migrations
- **tsx** - TypeScript execution
- **dotenv** - Environment variables

---

## 📁 File Structure

```
/ticketing-system
│
├── 📂 pages/                      # Next.js Pages Router
│   ├── _app.tsx                   # App wrapper with AuthProvider
│   ├── index.tsx                  # Landing page
│   ├── login.tsx                  # Login page
│   ├── dashboard.tsx              # Admin dashboard
│   ├── unauthorized.tsx           # Unauthorized access page
│   │
│   ├── 📂 admin/                  # Admin Portal Pages
│   │   ├── index.tsx              # Admin dashboard
│   │   ├── requests/              # Request management
│   │   │   ├── index.tsx          # All requests list
│   │   │   └── [id].tsx           # Single request detail
│   │   ├── partners/              # Partner management
│   │   │   ├── index.tsx          # Partners list
│   │   │   ├── [id].tsx           # Partner detail
│   │   │   ├── [id]/branches/
│   │   │   │   ├── index.tsx      # Branch list
│   │   │   │   └── new.tsx        # Create new branch
│   │   │   └── new.tsx            # Create new partner
│   │   ├── users/                 # User management
│   │   ├── categories/            # Category management
│   │   ├── services/              # Service management
│   │   ├── configurations/        # System settings
│   │   └── profile.tsx            # Admin profile
│   │
│   ├── 📂 partner/                # Partner Portal Pages
│   │   ├── dashboard.tsx          # Partner dashboard
│   │   ├── requests/              # Partner requests
│   │   │   ├── index.tsx          # Assigned requests
│   │   │   └── [id].tsx           # Request detail
│   │   ├── users/                 # Partner user management
│   │   ├── profile.tsx            # Partner profile
│   │   └── categories.tsx         # Partner categories
│   │
│   ├── 📂 customer/               # Customer Portal Pages
│   │   ├── dashboard.tsx          # Customer dashboard
│   │   └── requests/              # Customer requests
│   │       ├── index.tsx          # My requests
│   │       └── [id].tsx           # Request detail
│   │
│   └── 📂 api/                    # API Routes (Backend)
│       ├── 📂 auth/               # Authentication endpoints
│       │   ├── login.ts           # POST /api/auth/login
│       │   ├── logout.ts          # POST /api/auth/logout
│       │   ├── register.ts        # POST /api/auth/register
│       │   ├── me.ts              # GET /api/auth/me
│       │   ├── refresh.ts         # POST /api/auth/refresh
│       │   └── profile.ts         # PUT /api/auth/profile
│       │
│       ├── 📂 admin/              # Admin API endpoints
│       │   ├── requests.ts        # GET/POST /api/admin/requests
│       │   ├── partners.ts        # GET/POST /api/admin/partners
│       │   ├── branches.ts        # GET/POST /api/admin/branches
│       │   ├── users.ts           # GET/POST /api/admin/users
│       │   ├── categories.ts      # GET/POST /api/admin/categories
│       │   ├── services.ts        # GET/POST /api/admin/services
│       │   └── configurations.ts  # GET/PUT /api/admin/configurations
│       │
│       ├── 📂 partner/            # Partner API endpoints
│       │   ├── requests.ts        # GET /api/partner/requests
│       │   ├── profile.ts         # GET/PUT /api/partner/profile
│       │   ├── users.ts           # GET /api/partner/users
│       │   └── stats.ts           # GET /api/partner/stats
│       │
│       ├── 📂 customer/           # Customer API endpoints
│       │   └── requests.ts        # GET /api/customer/requests
│       │
│       └── 📂 cron/               # Background job endpoints
│           └── sla-check.ts       # SLA monitoring
│
├── 📂 components/                 # React Components
│   ├── 📂 guards/                 # Route protection
│   │   ├── AdminGuard.tsx         # Admin route guard
│   │   └── PartnerGuard.tsx       # Partner route guard
│   │
│   ├── 📂 layout/                 # Layout components
│   │   ├── AdminLayout.tsx        # Admin portal layout
│   │   ├── PartnerLayout.tsx      # Partner portal layout
│   │   └── CustomerLayout.tsx     # Customer portal layout
│   │
│   ├── 📂 modals/                 # Modal components
│   │   ├── AssignRequestModal.tsx # Assign request modal
│   │   └── RequestDetailsModal.tsx # Request details modal
│   │
│   ├── 📂 shared/                 # Shared components
│   │   ├── LoadingSpinner.tsx     # Loading indicator
│   │   ├── ErrorMessage.tsx       # Error display
│   │   ├── MapComponent.tsx       # Map integration
│   │   └── DataTable.tsx          # Reusable table
│   │
│   └── 📂 ui/                     # UI components (shadcn/ui)
│       ├── button.tsx             # Button component
│       ├── input.tsx              # Input component
│       ├── card.tsx               # Card component
│       └── ...                    # Other UI components
│
├── 📂 hooks/                      # Custom React Hooks
│   ├── useAdminUsers.ts           # Admin users data fetching
│   ├── useRequests.ts             # Requests data fetching
│   ├── usePartners.ts             # Partners data fetching
│   ├── useBranches.ts             # Branches data fetching
│   ├── useCategories.ts           # Categories data fetching
│   ├── useServices.ts             # Services data fetching
│   ├── useCustomerAuth.ts         # Customer authentication
│   ├── usePartnerRequests.ts      # Partner requests
│   └── useDashboardStats.ts       # Dashboard statistics
│
├── 📂 lib/                        # Core Libraries
│   ├── 📂 contexts/               # React Contexts
│   │   └── AuthContext.tsx        # Authentication context
│   │
│   ├── 📂 db/                     # Database
│   │   ├── index.ts               # DB connection
│   │   ├── schema.ts              # Drizzle schema
│   │   └── seed.ts                # Database seeding
│   │
│   ├── 📂 services/               # Business Logic Services
│   │   ├── authService.ts         # Authentication logic
│   │   ├── requestService.ts      # Request management
│   │   ├── partnerService.ts      # Partner operations
│   │   ├── branchService.ts       # Branch operations
│   │   ├── userService.ts         # User management
│   │   └── configService.ts       # Configuration
│   │
│   ├── 📂 utils/                  # Utility Functions
│   │   ├── http.ts                # Admin HTTP client
│   │   ├── partnerHttp.ts         # Partner HTTP client
│   │   ├── logger.ts              # Logging utility
│   │   ├── errorHandler.ts        # Error handling
│   │   ├── validation.ts          # Validation helpers
│   │   ├── date.ts                # Date utilities
│   │   └── sla.ts                 # SLA calculations
│   │
│   ├── 📂 middleware/             # API Middleware
│   │   └── auth.ts                # Auth middleware
│   │
│   └── utils.ts                   # General utilities
│
├── 📂 schemas/                    # Zod Validation Schemas
│   ├── auth.ts                    # Auth schemas
│   ├── requests.ts                # Request schemas
│   ├── partners.ts                # Partner schemas
│   ├── categories.ts              # Category schemas
│   └── configurations.ts          # Config schemas
│
├── 📂 services/                   # External Services
│   └── emailService.ts            # Email notification service
│
├── 📂 config/                     # Configuration
│   └── colors.ts                  # Centralized color system
│
├── 📂 styles/                     # Global Styles
│   └── globals.css                # Global CSS
│
├── 📂 public/                     # Static Assets
│   └── 📂 locales/                # Translation files
│       ├── en/
│       │   └── common.json        # English translations
│       └── ar/
│           └── common.json        # Arabic translations
│
├── 📂 database/                   # Database Files
│   └── schema.sql                 # PostgreSQL schema
│
├── 📂 drizzle/                    # Drizzle Migrations
│   └── migrations/                # Migration files
│
├── 📂 scripts/                    # Utility Scripts
│   ├── create-partner-users.ts    # Create partner users
│   ├── create-test-request.ts     # Test data creation
│   ├── verify-database.ts         # DB verification
│   └── test-data-setup.sql        # Test data SQL
│
├── 📂 cron-jobs/                  # Background Jobs
│   ├── index.js                   # Cron job scheduler
│   └── README.md                  # Cron setup guide
│
├── 📂 docs/                       # Documentation
│   ├── DYNAMIC_EMAIL_SYSTEM.md    # Email system docs
│   └── EMAIL_SYSTEM_VISUAL_GUIDE.md
│
├── middleware.ts                  # Next.js middleware
├── next.config.ts                 # Next.js config
├── tailwind.config.js             # Tailwind config
├── drizzle.config.ts              # Drizzle config
├── tsconfig.json                  # TypeScript config
├── package.json                   # Dependencies
├── .env.example                   # Environment variables template
└── README.md                      # Project README
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.x or higher
- **PostgreSQL**: v14.x or higher
- **npm** or **yarn**
- **Mapbox Account**: For map features (free tier available)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd ticketing-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**



Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/ticketing_system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here

# SLA Configuration
DEFAULT_SLA_TIMEOUT_MINUTES=15
DEFAULT_REMINDER_MINUTES=10

# External Customer Configuration
EXTERNAL_CUSTOMER_ID=1
SYSTEM_USER_ID=1

# Mapbox Configuration
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here

```

4. **Set up the database**

```bash
# Create PostgreSQL database
createdb ticketing_system

# Run schema
psql ticketing_system < database/schema.sql

# Run migrations
npm run db:migrate

# Seed initial data
npm run seed
```

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

**Admin Account:**
```
Email: admin@ticketing.com
Password: Admin123!
```

**Partner Account:**
```
Email: partner1@test.com
Password: 7&i1cmByGoHL
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Admin     │  │   Partner   │  │  Customer   │         │
│  │   Portal    │  │   Portal    │  │   Portal    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APPLICATION                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Pages Router (Frontend)                  │  │
│  │  • Admin Pages  • Partner Pages  • Customer Pages     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Authentication Layer (Guards)              │  │
│  │  • AdminGuard  • PartnerGuard  • CustomerGuard       │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Routes (Backend)                     │  │
│  │  • /api/auth/*  • /api/admin/*  • /api/partner/*     │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Service Layer                         │  │
│  │  Business logic, validations, data processing         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Drizzle ORM)               │
│  • Users  • Partners  • Branches  • Requests  • Categories  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   External Services                          │
│  • Email (Nodemailer)  • Maps (Mapbox)  • Cron Jobs         │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

```
1. User Request → 2. Route Guard → 3. API Middleware → 4. Service Layer 
→ 5. Database → 6. Response Processing → 7. Frontend Update
```

### Authentication Flow

```
Login Page → AuthContext.login() → JWT Token → Store in localStorage
→ Auto-redirect based on role → Protected Pages
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. **users** - Core user table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    user_type user_type_enum NOT NULL, -- 'admin', 'partner', 'customer'
    partner_id INTEGER REFERENCES partners(id),
    language_preference VARCHAR(5) DEFAULT 'en',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. **partners** - Service provider organizations
```sql
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status partner_status_enum DEFAULT 'active',
    logo_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. **branches** - Partner locations
```sql
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id),
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    radius_km DECIMAL(5, 2) DEFAULT 10.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. **categories** - Service categories
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. **services** - Services within categories
```sql
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    description_ar TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. **requests** - Service requests (Main table)
```sql
CREATE TABLE requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_lat DECIMAL(10, 8) NOT NULL,
    customer_lng DECIMAL(11, 8) NOT NULL,
    customer_address TEXT NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    service_id INTEGER REFERENCES services(id),
    pickup_option_id INTEGER NOT NULL,
    partner_id INTEGER REFERENCES partners(id),
    branch_id INTEGER REFERENCES branches(id),
    status request_status_enum DEFAULT 'submitted',
    sla_deadline TIMESTAMP,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    in_progress_at TIMESTAMP,
    completed_at TIMESTAMP,
    closed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### Request Status Enum

```sql
CREATE TYPE request_status_enum AS ENUM (
    'submitted',    -- Customer submits request
    'assigned',     -- Admin assigns to partner
    'confirmed',    -- Partner accepts
    'in_progress',  -- Partner working on it
    'completed',    -- Partner marks complete
    'closed',       -- Request closed
    'rejected',     -- Partner rejects
    'unassigned'    -- Admin unassigns
);
```

### Relationships

```
users → partners (many-to-one via partner_id)
partners → branches (one-to-many)
branches → branch_users (one-to-many)
categories → services (one-to-many)
partners ↔ categories (many-to-many via partner_categories)
requests → users (customer_id)
requests → partners (partner_id)
requests → branches (branch_id)
requests → categories (category_id)
requests → services (service_id)
```

### Indexes

Key indexes for performance:
- `idx_users_email` - Fast user lookup
- `idx_requests_status` - Request filtering
- `idx_requests_partner_id` - Partner requests
- `idx_branches_lat_lng` - Geographic queries
- `idx_requests_sla_deadline` - SLA monitoring

---

## 🔌 API Routes

### Navigation Guide

All API routes are in `/pages/api/` directory.

### Authentication APIs (`/api/auth/`)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/login` | POST | User login | No |
| `/api/auth/logout` | POST | User logout | Yes |
| `/api/auth/register` | POST | User registration | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/refresh` | POST | Refresh token | Yes |
| `/api/auth/profile` | GET/PUT | User profile | Yes |
| `/api/auth/profile/change-password` | PUT | Change password | Yes |

### Admin APIs (`/api/admin/`)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/admin/requests` | GET | List all requests | Admin |
| `/api/admin/requests` | POST | Create request | Admin |
| `/api/admin/requests/[id]` | GET | Get request detail | Admin |
| `/api/admin/requests/[id]/assign` | POST | Assign request | Admin |
| `/api/admin/requests/[id]/close` | POST | Close request | Admin |
| `/api/admin/partners` | GET | List partners | Admin |
| `/api/admin/partners` | POST | Create partner | Admin |
| `/api/admin/partners/[id]` | GET/PUT | Partner detail | Admin |
| `/api/admin/partners/[id]/branches` | GET | Partner branches | Admin |
| `/api/admin/branches` | POST | Create branch | Admin |
| `/api/admin/branches/nearest` | GET | Find nearest branch | Admin |
| `/api/admin/users` | GET/POST | User management | Admin |
| `/api/admin/categories` | GET/POST | Category management | Admin |
| `/api/admin/services` | GET/POST | Service management | Admin |
| `/api/admin/configurations` | GET/PUT | System settings | Admin |
| `/api/admin/dashboard/stats` | GET | Dashboard statistics | Admin |

### Partner APIs (`/api/partner/`)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/partner/requests` | GET | List assigned requests | Partner |
| `/api/partner/requests/[id]` | GET | Request detail | Partner |
| `/api/partner/requests/[id]/accept` | POST | Accept request | Partner |
| `/api/partner/requests/[id]/reject` | POST | Reject request | Partner |
| `/api/partner/requests/[id]/status` | PUT | Update status | Partner |
| `/api/partner/profile` | GET/PUT | Partner profile | Partner |
| `/api/partner/users` | GET | Partner users | Partner |
| `/api/partner/stats` | GET | Partner statistics | Partner |

### Customer APIs (`/api/customer/`)

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/customer/requests` | GET | My requests | Customer |
| `/api/customer/requests` | POST | Submit request | Customer |
| `/api/customer/requests/[id]` | GET | Request detail | Customer |

### API Request Examples

#### Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ticketing.com",
  "password": "Admin123!"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@ticketing.com",
      "userType": "admin"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### Create Request (Admin)
```typescript
POST /api/admin/requests
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 1,
  "customerName": "John Doe",
  "customerPhone": "1234567890",
  "customerLat": 24.7136,
  "customerLng": 46.6753,
  "customerAddress": "123 Main St, Riyadh",
  "categoryId": 1,
  "serviceId": 2,
  "pickupOptionId": 1
}

// Response
{
  "success": true,
  "data": {
    "id": 123,
    "requestNumber": "REQ-20251111-001",
    "status": "submitted",
    "createdAt": "2025-11-11T10:00:00Z"
  }
}
```

#### Assign Request
```typescript
POST /api/admin/requests/123/assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "partnerId": 5,
  "branchId": 12
}

// Response
{
  "success": true,
  "message": "Request assigned successfully"
}
```

---

## 🔐 Authentication & Authorization

### Overview

The system uses **JWT-based authentication** with role-based access control (RBAC).

### User Types

1. **Admin** - Full system access
2. **Partner** - Service provider access
3. **Customer** - End user access

### Authentication Flow

```
1. User submits credentials → /api/auth/login
2. Server validates credentials
3. Server generates JWT tokens (access + refresh)
4. Client stores tokens in localStorage
5. Client includes token in Authorization header
6. Middleware validates token on each request
7. Auto-refresh token every 14 minutes
```

### Token Storage

```typescript
// localStorage keys
auth_tokens       // Complete auth object
adminToken        // Admin access token
partnerToken      // Partner access token
customerToken     // Customer access token
```

### Route Guards

#### AdminGuard
Protects admin routes (`/admin/*`, `/dashboard`)

```tsx
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function MyAdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        {/* Admin-only content */}
      </AdminLayout>
    </AdminGuard>
  );
}
```

#### PartnerGuard
Protects partner routes (`/partner/*`)

```tsx
import { PartnerGuard } from '@/components/guards/PartnerGuard';

export default function MyPartnerPage() {
  return (
    <PartnerGuard>
      <PartnerLayout>
        {/* Partner-only content */}
      </PartnerLayout>
    </PartnerGuard>
  );
}
```

### HTTP Clients

#### Admin HTTP Client
```typescript
import { adminHttp } from '@/lib/utils/http';

// Automatically includes adminToken
const response = await adminHttp.get('/admin/requests');
```

#### Partner HTTP Client
```typescript
import { partnerHttp } from '@/lib/utils/partnerHttp';

// Automatically includes partnerToken
const response = await partnerHttp.get('/partner/requests');
```

### Middleware (`middleware.ts`)

```typescript
// Public routes (no auth required)
- /login
- /register
- /api/auth/login
- /api/auth/register

// Protected routes (auth required)
- All other routes
```

### Auto-Redirect Logic

```typescript
// Partner tries to access admin route
/admin/partners → redirects to → /partner/dashboard

// Admin tries to access partner route
/partner/requests → redirects to → /dashboard

// Unauthenticated user
/dashboard → redirects to → /login
```

---

## 🗺️ User Journeys

### 1. Admin Journey - Create & Assign Request

```
Step 1: Login
  URL: /login
  Credentials: admin@ticketing.com / Admin123!
  
Step 2: Navigate to Requests
  URL: /admin/requests
  Action: Click "New Request" button
  
Step 3: Fill Request Form
  URL: /admin/requests/new
  Fields:
    - Customer Name
    - Customer Phone
    - Category (dropdown)
    - Service (dropdown)
    - Pickup Option
    - Location (map or coordinates)
    - Address
  Action: Submit
  
Step 4: View Request List
  URL: /admin/requests
  Result: New request appears with status "Submitted"
  
Step 5: Assign Request
  Action: Click "Assign" button
  Modal: Select Partner & Branch
  Submit: Assignment
  
Step 6: Email Sent
  Partner receives assignment email
  Request status → "Assigned"
  SLA deadline set (15 minutes)
```

### 2. Partner Journey - Accept & Complete Request

```
Step 1: Login
  URL: /login
  Credentials: partner1@test.com / 7&i1cmByGoHL
  
Step 2: View Dashboard
  URL: /partner/dashboard
  Shows: Assigned requests, stats
  
Step 3: View Request Detail
  URL: /partner/requests/[id]
  Shows: Customer info, location, service details
  
Step 4: Accept Request
  Action: Click "Accept Request"
  Request status → "Confirmed"
  Email: Customer notified
  
Step 5: Start Service
  Action: Click "Start Service"
  Request status → "In Progress"
  Email: Customer notified
  
Step 6: Complete Service
  Action: Click "Mark Complete"
  Request status → "Completed"
  Email: Customer notified
  
Step 7: Admin Closes Request
  Admin verifies completion
  Request status → "Closed"
  Email: All parties notified
```

### 3. Admin Journey - Create New Branch

```
Step 1: Navigate to Partners
  URL: /admin/partners
  
Step 2: Select Partner
  Click on partner name
  URL: /admin/partners/[id]
  
Step 3: Click "New Branch"
  In Branches section
  URL: /admin/partners/[id]/branches/new
  
Step 4: Fill Branch Form
  Fields:
    - Branch Name
    - Latitude / Longitude (or "Use Current Location")
    - Contact Name
    - Phone
    - Address
    - Service Radius (km)
  
Step 5: Submit
  Branch created
  Redirect: /admin/partners/[id]
  Toast: Success message
```

### 4. Customer Journey - Track Request

```
Step 1: Login
  URL: /login
  Customer credentials
  
Step 2: View Dashboard
  URL: /customer/dashboard
  Shows: My requests
  
Step 3: View Request Detail
  URL: /customer/requests/[id]
  Shows:
    - Request status
    - Assigned partner
    - Service timeline
    - Map with locations
  
Step 4: Track Status
  Real-time updates:
    - Submitted
    - Assigned
    - Confirmed
    - In Progress
    - Completed
    - Closed
```

---

## 🧩 Frontend Components

### Layout Components

#### AdminLayout
```tsx
// Usage
import AdminLayout from '@/components/layout/AdminLayout';

export default function Page() {
  return (
    <AdminLayout>
      <h1>Page Content</h1>
    </AdminLayout>
  );
}

// Features:
- Sidebar navigation
- Header with user menu
- Breadcrumbs
- Responsive mobile menu
- RTL support
```

#### PartnerLayout
```tsx
// Similar to AdminLayout but with partner-specific navigation
```

### Modal Components

#### AssignRequestModal
```tsx
import AssignRequestModal from '@/components/modals/AssignRequestModal';

<AssignRequestModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  requestId={requestId}
  onSuccess={(assignment) => {
    // Handle success
  }}
/>
```

#### RequestDetailsModal
```tsx
import RequestDetailsModal from '@/components/modals/RequestDetailsModal';

<RequestDetailsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  requestId={requestId}
/>
```

### Shared Components

#### LoadingSpinner
```tsx
import LoadingSpinner from '@/components/shared/LoadingSpinner';

<LoadingSpinner size="lg" />
```

#### MapComponent
```tsx
import MapComponent from '@/components/shared/MapComponent';

<MapComponent
  center={[lat, lng]}
  markers={[
    { lat, lng, label: 'Customer' },
    { lat, lng, label: 'Branch' }
  ]}
  zoom={12}
/>
```

#### DataTable
```tsx
import DataTable from '@/components/shared/DataTable';

<DataTable
  columns={columns}
  data={data}
  onRowClick={(row) => {}}
  pagination
  searchable
/>
```

### UI Components (shadcn/ui)

Located in `/components/ui/`:

- `button.tsx` - Button component
- `input.tsx` - Input field
- `card.tsx` - Card container
- `modal.tsx` - Modal dialog
- `dropdown.tsx` - Dropdown menu
- `table.tsx` - Table component
- `badge.tsx` - Status badges
- `tooltip.tsx` - Tooltips

---

## 📊 State Management

### SWR for Data Fetching

The app uses **SWR** for data fetching, caching, and revalidation.

#### Example: Fetch Requests
```typescript
import useSWR from 'swr';
import { adminHttp } from '@/lib/utils/http';

const fetcher = (url: string) => 
  adminHttp.get(url).then(res => res.data);

export function useRequests() {
  const { data, error, mutate } = useSWR(
    '/admin/requests',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  );

  return {
    requests: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    refresh: mutate
  };
}
```

### Custom Hooks

All custom hooks are in `/hooks/` directory:

#### useAdminUsers
```typescript
import { useAdminUsers } from '@/hooks/useAdminUsers';

const { users, isLoading, error, refresh } = useAdminUsers();
```

#### useRequests
```typescript
import { useRequests } from '@/hooks/useRequests';

const { requests, isLoading, error, refresh } = useRequests(filters);
```

#### useDashboardStats
```typescript
import { useDashboardStats } from '@/hooks/useDashboardStats';

const { stats, isLoading } = useDashboardStats();
```

### AuthContext

Global authentication state managed via React Context:

```typescript
import { useAuth } from '@/lib/contexts/AuthContext';

const { 
  user, 
  tokens, 
  loading, 
  isAuthenticated,
  isAdmin,
  isPartner,
  login, 
  logout, 
  refreshToken 
} = useAuth();
```

---

## 🌍 Internationalization (i18n)

### Supported Languages

- **English (en)** - Default
- **Arabic (ar)** - RTL support

### Translation Files

```
/public/locales/
  ├── en/
  │   └── common.json
  └── ar/
      └── common.json
```

### Translation Keys Structure

```json
{
  "common": {
    "welcome": "Welcome",
    "save": "Save",
    "cancel": "Cancel"
  },
  "requests": {
    "title": "Requests",
    "createRequest": "Create Request",
    "status": {
      "submitted": "Submitted",
      "assigned": "Assigned",
      "completed": "Completed"
    }
  },
  "validation": {
    "required": "This field is required",
    "emailInvalid": "Invalid email address"
  }
}
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('requests.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Language Switching

```tsx
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    
    // Update HTML dir attribute
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };
  
  return <button onClick={toggleLanguage}>Change Language</button>;
}
```

### RTL Support

The app automatically adjusts layout for RTL languages:

```tsx
// Tailwind RTL classes
<div className="mr-4 rtl:ml-4 rtl:mr-0">
  Content
</div>

// HTML dir attribute
<html dir={language === 'ar' ? 'rtl' : 'ltr'}>
```

---

## 🎨 Styling System

### Centralized Colors

All colors are defined in `/config/colors.ts`:

```typescript
export const colors = {
  background: {
    primary: "#000000",      // Pure black
    secondary: "#0a0a0a",    // Dark gray
    card: "#1a1a1a",         // Card background
  },
  accent: {
    primary: "#FF6B35",      // Orange
    secondary: "#F7931E",    // Light orange
    tertiary: "#00D9FF",     // Cyan
  },
  text: {
    primary: "#FFFFFF",      // White
    secondary: "#E5E5E5",    // Light gray
    tertiary: "#A3A3A3",     // Medium gray
    muted: "#737373",        // Dark gray
  },
  status: {
    success: "#10B981",      // Green
    warning: "#F59E0B",      // Yellow
    error: "#EF4444",        // Red
    info: "#3B82F6",         // Blue
  }
};
```

### Tailwind Configuration

Defined in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#f97316', // Orange
        },
        // ... other colors
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        // Magic UI animations
        shimmer: 'shimmer 3s ease-in-out infinite',
      }
    }
  },
  plugins: [require('tailwindcss-rtl')],
  darkMode: 'class',
};
```

### Design System

#### Button Styles
```tsx
// Primary Button
<button className="bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white px-6 py-3 rounded-lg">
  Primary Action
</button>

// Secondary Button
<button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg">
  Secondary Action
</button>

// Danger Button
<button className="bg-red-500 text-white px-6 py-3 rounded-lg">
  Delete
</button>
```

#### Card Styles
```tsx
<div className="bg-[#1a1a1a] rounded-xl p-6 shadow-lg">
  Card Content
</div>
```

#### Input Styles
```tsx
<input
  className="w-full px-4 py-3 bg-[#0a0a0a] text-white border border-gray-700 rounded-lg focus:border-[#FF6B35] focus:outline-none"
  type="text"
/>
```

---

## 📧 Email Notifications

### Email Service

Located in `/services/emailService.ts`

### Email Templates

The system sends emails for:

1. **Request Assigned** - Partner notified
2. **Request Confirmed** - Customer notified
3. **Request Rejected** - Admin notified
4. **Request In Progress** - Customer notified
5. **Request Completed** - Customer & Admin notified
6. **Request Closed** - All parties notified
7. **SLA Timeout** - Admin notified

### Email Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@ticketing.com
```

### Sending Emails

```typescript
import { sendEmail } from '@/services/emailService';

await sendEmail({
  to: 'partner@example.com',
  subject: 'New Request Assigned',
  template: 'request-assigned',
  data: {
    partnerName: 'ABC Service',
    requestNumber: 'REQ-001',
    customerName: 'John Doe',
    categoryName: 'Plumbing',
    deadline: '2025-11-11 10:30 AM'
  }
});
```

### Email Templates Structure

```html
<!-- Email Template Example -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Request Assigned</title>
</head>
<body style="background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px;">
    <h1>Hello {{partnerName}},</h1>
    <p>A new request has been assigned to you.</p>
    <table>
      <tr>
        <td><strong>Request Number:</strong></td>
        <td>{{requestNumber}}</td>
      </tr>
      <tr>
        <td><strong>Customer:</strong></td>
        <td>{{customerName}}</td>
      </tr>
    </table>
    <a href="{{actionUrl}}" style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none;">
      View Request
    </a>
  </div>
</body>
</html>
```

---

## ⏰ Cron Jobs & Background Tasks

### SLA Monitoring

Located in `/cron-jobs/index.js`

### Purpose

- Check SLA deadlines every minute
- Auto-unassign timed-out requests
- Send reminder emails

### Setup

```bash
cd cron-jobs
npm install
node index.js
```

### Cron Schedule

```javascript
// Every minute
cron.schedule('* * * * *', async () => {
  try {
    await axios.post('http://localhost:3000/api/cron/sla-check');
  } catch (error) {
    console.error('SLA check failed:', error);
  }
});
```

### SLA Logic

```
1. Check all requests with status "assigned"
2. Compare sla_deadline with current time
3. If deadline passed:
   - Change status to "unassigned"
   - Remove partner/branch assignment
   - Send email to admin
   - Log status change
```

### Production Deployment

For production, use:
- **Vercel Cron** - Built-in cron for Vercel
- **External Cron** - Separate service calling API endpoint
- **PM2** - Process manager with cron

---

## 🧪 Testing

### Test Users

```typescript
// Admin
{
  email: 'admin@ticketing.com',
  password: 'Admin123!'
}

// Partner
{
  email: 'partner1@test.com',
  password: '7&i1cmByGoHL'
}
```

### Test Data Scripts

```bash
# Create partner users
npm run create-partner-user

# Create test request
npm run test-request

# Get auth token
npm run token:admin
npm run token:partner
```

### Manual Testing Checklist

#### Authentication
- [ ] Login with admin credentials
- [ ] Login with partner credentials
- [ ] Logout
- [ ] Token refresh
- [ ] Invalid credentials handling
- [ ] Session expiry

#### Admin Portal
- [ ] View dashboard stats
- [ ] Create new request
- [ ] Assign request to partner
- [ ] View request timeline
- [ ] Close request
- [ ] Create partner
- [ ] Create branch
- [ ] Manage users
- [ ] Manage categories
- [ ] System configurations

#### Partner Portal
- [ ] View assigned requests
- [ ] Accept request
- [ ] Reject request
- [ ] Update request status
- [ ] View partner profile
- [ ] View partner users
- [ ] Dashboard statistics

#### Responsive Design
- [ ] Mobile view (320px-768px)
- [ ] Tablet view (768px-1024px)
- [ ] Desktop view (1024px+)
- [ ] RTL layout (Arabic)

#### Email Notifications
- [ ] Assignment email sent
- [ ] Confirmation email sent
- [ ] Status update emails
- [ ] SLA timeout emails

---

## 🚀 Deployment

### Vercel Deployment

1. **Connect Repository**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

2. **Environment Variables**

Add in Vercel Dashboard → Settings → Environment Variables:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- SMTP credentials
- NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

3. **Build Settings**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Node Version: 20.x
```

4. **Domain Configuration**
```
Production: yourdomain.com
Preview: preview.yourdomain.com
```

### Database Setup (Production)

Options:
1. **Neon** - Serverless PostgreSQL
2. **Supabase** - PostgreSQL with APIs
3. **Railway** - PostgreSQL hosting
4. **AWS RDS** - Managed PostgreSQL

### Environment Setup

```bash
# Production .env
NODE_ENV=production
DATABASE_URL=<production-db-url>
NEXTAUTH_URL=https://yourdomain.com
```

### Post-Deployment

1. Run migrations
```bash
npm run db:migrate
```

2. Seed initial data
```bash
npm run seed
```

3. Test production:
- Login flows
- API endpoints
- Email delivery
- Cron jobs

---

## ⚠️ Common Issues & Solutions

### Issue 1: Database Connection Failed
```
Error: connection to server failed
```
**Solution:**
- Check DATABASE_URL in .env
- Verify PostgreSQL is running
- Check firewall rules
- Test connection: `psql <DATABASE_URL>`

### Issue 2: Token Not Found
```
Error: Bearer null
```
**Solution:**
- Check localStorage for auth_tokens
- Verify token key matches (adminToken/partnerToken)
- Clear cache and re-login
- Check token expiry

### Issue 3: CORS Errors
```
Error: CORS policy blocked
```
**Solution:**
- Check API_BASE_URL
- Verify middleware configuration
- Add allowed origins

### Issue 4: Email Not Sending
```
Error: SMTP connection failed
```
**Solution:**
- Verify SMTP credentials
- Check Gmail "Less secure apps" setting
- Use App Password instead of regular password
- Test with `/api/test-email`

### Issue 5: Map Not Loading
```
Error: Mapbox token invalid
```
**Solution:**
- Check NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
- Verify token on Mapbox dashboard
- Ensure token has correct scopes
- Clear browser cache

### Issue 6: Infinite Redirect Loop
```
Redirecting between /dashboard and /partner/dashboard
```
**Solution:**
- Check guard components
- Verify user.userType value
- Clear localStorage
- Check middleware config

### Issue 7: Drizzle Migration Failed
```
Error: migration failed
```
**Solution:**
```bash
# Check current migrations
npm run db:status

# Rollback
npm run db:rollback

# Re-run
npm run db:migrate

# Or run SQL directly
psql ticketing_system < database/schema.sql
```

### Issue 8: Build Errors
```
Error: Module not found
```
**Solution:**
- Clear .next directory: `rm -rf .next`
- Delete node_modules: `rm -rf node_modules`
- Reinstall: `npm install`
- Check TypeScript errors: `npm run type-check`

---

## 📖 Contributing

### Development Workflow

1. **Create feature branch**
```bash
git checkout -b feature/my-feature
```

2. **Make changes**
- Follow existing code patterns
- Add TypeScript types
- Update translations
- Write JSDoc comments

3. **Test locally**
```bash
npm run dev
# Test in browser
```

4. **Commit changes**
```bash
git add .
git commit -m "feat: add new feature"
```

5. **Push and create PR**
```bash
git push origin feature/my-feature
```

### Code Style Guidelines

#### TypeScript
```typescript
// ✅ Good
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export async function getUser(id: number): Promise<UserProfile> {
  // Implementation
}

// ❌ Bad
export async function getUser(id: any) {
  // No types
}
```

#### React Components
```tsx
// ✅ Good
interface MyComponentProps {
  title: string;
  onSave: () => void;
}

export default function MyComponent({ title, onSave }: MyComponentProps) {
  return <div>{title}</div>;
}

// ❌ Bad
export default function MyComponent(props: any) {
  return <div>{props.title}</div>;
}
```

#### API Routes
```typescript
// ✅ Good
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Validate request
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }
    
    // Implementation
    
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **API Routes**: kebab-case (e.g., `user-profile.ts`)
- **Variables**: camelCase (e.g., `userName`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Git Commit Messages

```
feat: add new feature
fix: bug fix
docs: documentation update
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## 📚 Additional Resources

### Documentation Files

- `AUTHENTICATION_FLOW.md` - Authentication system details
- `NEW_BRANCH_JOURNEY.md` - Branch creation flow
- `EMAIL_NOTIFICATIONS_COMPLETE.md` - Email system
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `TESTING_GUIDE.md` - Testing instructions
- `ENV_VARS_DOCUMENTATION.md` - Environment variables

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM](https://orm.drizzle.team)
- [SWR Documentation](https://swr.vercel.app)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)

### Support

For questions or issues:
1. Check this documentation
2. Review existing .md files in project
3. Check GitHub issues
4. Contact development team

---

## 📝 Summary

This ticketing system is a production-ready, full-stack Next.js application with:

✅ **Multi-portal architecture** (Admin, Partner, Customer)  
✅ **Complete authentication & authorization**  
✅ **Real-time request management**  
✅ **Geographic-based routing**  
✅ **SLA monitoring & notifications**  
✅ **Multi-language support (EN/AR)**  
✅ **Responsive, accessible UI**  
✅ **Type-safe TypeScript codebase**  
✅ **Email notification system**  
✅ **Background job processing**  
✅ **Production-ready deployment**

---

**Last Updated:** November 11, 2025  
**Version:** 0.1.0  
**Maintainers:** Development Team

