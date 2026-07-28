# ShopSphere — Full Stack E-Commerce

A complete Flipkart/Amazon-style e-commerce platform built with **React + Express + Prisma + PostgreSQL + Swagger**.

> **Stack**: React 18 (Vite) • Express 4 • Prisma 5 • PostgreSQL • Swagger UI • JWT Auth • Nodemailer SMTP • Razorpay + COD payments • Dynamic Product Specifications

---

## Project Structure

```
shopsphere/                     # (was en3fashions-clone)
├── backend/                    # Express + Prisma + Swagger API
│   ├── prisma/
│   │   ├── schema.prisma       # 16 models including ProductSpecification, PasswordReset
│   │   └── seed.js             # Seed with 7 products across 6 categories with specs
│   ├── src/
│   │   ├── server.js
│   │   ├── config/db.js
│   │   ├── services/
│   │   │   └── mailer.js       # Nodemailer SMTP service
│   │   ├── controllers/        # 11 controllers (auth, products, specs, orders, cart, ...)
│   │   ├── routes/             # 11 routers
│   │   ├── middleware/         # auth, validation, error handling
│   │   └── docs/swagger.js     # OpenAPI 3.0 spec
│   └── package.json
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/         # Header, Footer, ProductCard, SpecificationsView, SpecificationsEditor, AdminLayout, AdminRoute
│   │   ├── pages/              # Home, Category, ProductDetail, Cart, Checkout, Login, Register, ForgotPassword, ResetPassword, ...
│   │   │   └── admin/          # AdminDashboard, AdminProducts, AdminOrders, AdminCategories, AdminUsers
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── styles/global.css
│   │   ├── utils/api.js        # Axios with JWT interceptor
│   │   └── App.jsx
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 12

---

## Setup

### 1. Database (PostgreSQL)

```bash
psql -U postgres
CREATE DATABASE shopsphere;
CREATE USER ssuser WITH PASSWORD 'sspass';
GRANT ALL PRIVILEGES ON DATABASE shopsphere TO ssuser;
\q
```

Or via Docker:
```bash
docker run --name ss-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=shopsphere -p 5432:5432 -d postgres:16
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL and SMTP_* vars (for forgot password emails)

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

npm run dev     # http://localhost:5000
```

Verify:
- Health: http://localhost:5000/health
- Swagger: http://localhost:5000/api/docs

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
```

---

## Demo Credentials

| Role     | Email                     | Password      |
|----------|---------------------------|---------------|
| Admin    | admin@shopsphere.com      | admin123      |
| Customer | customer@example.com      | customer123   |

**Sample coupon**: `WELCOME10` (10% off, min ₹500)

---

## Features

### Frontend
- ✅ Rebranded as **ShopSphere** (multi-category marketplace)
- ✅ Live search dropdown — type "m" → instantly shows matching products with thumbnail, price, category
- ✅ Categories mega-menu in header (hover dropdown with images)
- ✅ Login with **show/hide password** toggle + **Forgot password?** link
- ✅ Forgot password flow (enter email → SMTP email with reset link → reset password page)
- ✅ Reset password page with token verification + show/hide new password fields
- ✅ **Registration with OTP verification** — choose Email / SMS / WhatsApp channel
- ✅ OTP page with 6-box input, auto-advance, paste support, 30s resend cooldown
- ✅ **Home page banner carousel** — admin uploads banners, they auto-rotate every 5s on home page
- ✅ Product detail page with **Specifications** section (Flipkart/Amazon style, grouped by section)
- ✅ **Review submission form** on product detail page (star rating + title + comment)
- ✅ Checkout with **Cash on Delivery** + **Razorpay** payment options
- ✅ Order history shows payment method (COD / Razorpay) badge
- ✅ Full admin panel at `/admin` (Dashboard, Products, Orders, Categories, **Banners**, Users)
- ✅ **Admin Banner manager** — upload photo, set title/subtitle/link, position, schedule, toggle active
- ✅ Admin product form includes **Specifications Editor** + **Multi-select Sizes** (checkbox grid auto-generates variants)
- ✅ Admin category form supports **photo upload** (file upload via /uploads endpoint) or URL
- ✅ Responsive (mobile menu, mobile filter drawer)

### Backend
- ✅ 18 Prisma models: User, Address, Category, Subcategory, Product, ProductImage, ProductVariant, **ProductSpecification**, Cart, CartItem, Order, OrderItem, WishlistItem, Review, Newsletter, Coupon, **PasswordReset**, **Otp**, **Banner**
- ✅ JWT authentication + role-based admin guard
- ✅ **OTP system** — send/verify/resend with Email + Twilio SMS + Twilio WhatsApp channels
- ✅ Registration requires OTP verification (configurable via `OTP_REQUIRE_FOR_REGISTER`)
- ✅ **Banner CRUD** — admin uploads/edits/schedules banners; public API lists active banners
- ✅ **Product Specifications** CRUD — flexible key/value/section for ANY product type
- ✅ **Review system** — submit/rate/delete reviews, aggregate rating auto-updates
- ✅ Product detail API includes specifications + reviews
- ✅ **Forgot/Reset password** with Nodemailer SMTP (works without config — logs to console)
- ✅ **Cash on Delivery** + **Razorpay** order support (COD limited to ₹5000 for safety)
- ✅ Admin endpoints for orders, products, users, banners
- ✅ Category CRUD (create/update/delete — admin)
- ✅ File uploads via multer (admin only, for product/category/banner images)
- ✅ Helmet + CORS + rate limiting + morgan logging
- ✅ Zod request validation
- ✅ Swagger UI at `/api/docs`

---

## Product Specifications System (Flipkart/Amazon Style)

The system is **completely flexible** — no hardcoded fields like RAM, Battery, Processor, Material, etc.

### Data Model
```prisma
model ProductSpecification {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(...)
  section   String   // "Display", "Performance", "Battery", "General", "Material", etc.
  key       String   // "Size", "RAM", "Capacity", "Age Group", etc.
  value     String   // "6.7 inch", "8 GB", "5000 mAh", "3+ Years", etc.
  position  Int      @default(0)
  createdAt DateTime @default(now())
}
```

### API Endpoints
| Method | Endpoint                                  | Description                          | Auth |
|--------|-------------------------------------------|--------------------------------------|------|
| GET    | `/api/products/:id/specifications`        | List specs for a product             | -    |
| POST   | `/api/products/:id/specifications`        | Replace all specs (admin)            | 🔑   |
| PUT    | `/api/products/specifications/:id`        | Update a single spec (admin)         | 🔑   |
| DELETE | `/api/products/specifications/:id`        | Delete a single spec (admin)         | 🔑   |

### Example: Phone specifications
```
Display
--------------------
Size            6.7 inch
Type            AMOLED
Resolution      1080 x 2400 px

Performance
--------------------
RAM             8 GB
Storage         256 GB
Processor       Octa-core 2.4 GHz

Battery
--------------------
Capacity        5000 mAh
Charging        65W Fast Charging
```

### Example: Toy specifications (different product type, same component)
```
General
--------------------
Brand           PlayMax
Age Group       3+ Years
Number of Pieces 200

Material
--------------------
Material        Non-toxic ABS Plastic
Color           Multi-color
```

The **same React component** (`SpecificationsView`) renders both correctly — it just reads whatever sections/keys are stored in the database.

### Admin UI (`SpecificationsEditor`)
Inside the admin product form:
- Add unlimited specifications with section/key/value inputs
- Section input has autocomplete (datalist) for existing sections
- Remove any specification with trash icon
- Live preview shows grouped layout as user types

---

## API Overview

| Method | Endpoint                          | Description                  | Auth |
|--------|-----------------------------------|------------------------------|------|
| GET    | `/api/products`                   | List with filters            | -    |
| GET    | `/api/products/:slug`             | Product detail + specs       | -    |
| POST   | `/api/products`                   | Create (admin)               | 🔑   |
| PUT    | `/api/products/:id`               | Update (admin)               | 🔑   |
| DELETE | `/api/products/:id`               | Delete (admin)               | 🔑   |
| GET    | `/api/products/:id/specifications`| List specs                   | -    |
| POST   | `/api/products/:id/specifications`| Replace specs (admin)        | 🔑   |
| PUT    | `/api/products/specifications/:id`| Update one spec (admin)      | 🔑   |
| DELETE | `/api/products/specifications/:id`| Delete one spec (admin)      | 🔑   |
| GET    | `/api/categories`                 | List categories              | -    |
| POST   | `/api/categories`                 | Create (admin)               | 🔑   |
| PUT    | `/api/categories/:id`             | Update (admin)               | 🔑   |
| DELETE | `/api/categories/:id`             | Delete (admin)               | 🔑   |
| POST   | `/api/auth/register`              | Register                     | -    |
| POST   | `/api/auth/login`                 | Login (returns JWT)          | -    |
| GET    | `/api/auth/me`                    | Current user                 | 🔒   |
| POST   | `/api/auth/forgot-password`       | Request reset email          | -    |
| POST   | `/api/auth/reset-password`        | Reset with token             | -    |
| GET    | `/api/auth/verify-reset-token`    | Verify token validity        | -    |
| POST   | `/api/auth/change-password`       | Change password (logged in)  | 🔒   |
| POST   | `/api/otp/send`                   | Send OTP (EMAIL/SMS/WhatsApp)| -    |
| POST   | `/api/otp/verify`                 | Verify OTP code              | -    |
| POST   | `/api/otp/resend`                 | Resend OTP (rate-limited)    | -    |
| GET    | `/api/banners`                    | List active banners (public) | -    |
| POST   | `/api/banners`                    | Create banner (admin)        | 🔑   |
| PUT    | `/api/banners/:id`                | Update banner (admin)        | 🔑   |
| PATCH  | `/api/banners/:id/toggle`         | Toggle banner (admin)        | 🔑   |
| DELETE | `/api/banners/:id`                | Delete banner (admin)        | 🔑   |
| GET    | `/api/reviews/:productId`         | List reviews                 | -    |
| POST   | `/api/reviews/:productId`         | Add/update review            | 🔒   |
| DELETE | `/api/reviews/:id`                | Delete review                | 🔒   |
| GET    | `/api/auth/addresses`             | List addresses               | 🔒   |
| POST   | `/api/auth/addresses`             | Add address                  | 🔒   |
| GET    | `/api/cart`                       | Get cart                     | 🔒   |
| POST   | `/api/cart/items`                 | Add to cart                  | 🔒   |
| PUT    | `/api/cart/items/:id`             | Update qty                   | 🔒   |
| DELETE | `/api/cart/items/:id`             | Remove item                  | 🔒   |
| POST   | `/api/orders`                     | Create order (COD/RAZORPAY)  | 🔒   |
| GET    | `/api/orders`                     | List user's orders           | 🔒   |
| POST   | `/api/orders/:id/pay`             | Mark Razorpay paid           | 🔒   |
| POST   | `/api/orders/:id/cancel`          | Cancel order                 | 🔒   |
| GET    | `/api/orders/admin/all`           | (Admin) List all orders      | 🔑   |
| PUT    | `/api/orders/admin/:id/status`    | (Admin) Update status        | 🔑   |
| GET    | `/api/products/admin/all`         | (Admin) List products        | 🔑   |
| GET    | `/api/auth/admin/users`           | (Admin) List users           | 🔑   |
| PUT    | `/api/auth/admin/users/:id/role`  | (Admin) Update user role     | 🔑   |
| POST   | `/api/uploads`                    | Upload image (admin)         | 🔑   |

> 🔒 = JWT required · 🔑 = JWT + ADMIN role

Full interactive docs: **http://localhost:5000/api/docs**

---

## SMTP Configuration (for Forgot Password emails)

The forgot password flow uses Nodemailer. Configure in `backend/.env`:

```env
SMTP_HOST=smtp.mailtrap.io      # or smtp.gmail.com, smtp.office365.com
SMTP_PORT=2525                  # 587 for Gmail/Outlook
SMTP_USER=your_username
SMTP_PASS=your_password
SMTP_FROM=ShopSphere <noreply@shopsphere.com>
SMTP_SECURE=false               # true for port 465
APP_URL=http://localhost:5173   # Frontend URL for reset links
```

**If SMTP is not configured**, emails are logged to the backend console (with the reset link visible) — useful for development without an email account.

### Using Gmail
1. Enable 2FA on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Set:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

### Using Mailtrap (recommended for dev)
1. Sign up at https://mailtrap.io
2. Create an inbox, copy SMTP credentials
3. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from Mailtrap

---

## OTP Verification (Registration)

When a user registers, they must verify an OTP code before their account is activated. Three delivery channels are supported:

| Channel  | Setup required                | Notes                                                |
|----------|-------------------------------|------------------------------------------------------|
| EMAIL    | SMTP_* env vars               | Default. Works with any SMTP provider.               |
| SMS      | TWILIO_* env vars             | Uses Twilio Programmable SMS.                        |
| WHATSAPP | TWILIO_* + TWILIO_WHATSAPP_FROM | Uses Twilio WhatsApp Business API (sandbox or prod). |

### Configuration

```env
# Optional - if not set, SMS/WhatsApp fallback to EMAIL automatically
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890           # for SMS
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886  # Twilio sandbox number

OTP_TTL_MINUTES=10                        # OTP expiry
OTP_CHANNEL=EMAIL                          # default channel
OTP_REQUIRE_FOR_REGISTER=true              # set false to skip OTP at registration
```

### Registration Flow

1. User fills in name, email, phone, password
2. User selects delivery channel (Email / SMS / WhatsApp)
3. Backend generates 6-digit OTP, sends via chosen channel, stores in `Otp` table with 10-min TTL
4. User enters OTP on the verify page (6-box input with auto-advance + paste support)
5. Backend verifies OTP → marks as verified
6. User submits final registration with `otpVerified: true` flag → account created with `isEmailVerified: true`

### Dev mode (no SMTP/Twilio configured)
- OTP codes are logged to the **backend console** like: `[OTP] REGISTER OTP for x@y.com via EMAIL: 123456`
- Copy the code from the console to complete verification
- The frontend Register page also shows a "Dev mode" hint pointing you to the console

### Resend
- 30-second cooldown between resends (rate-limited at API + UI level)
- Max 5 failed verification attempts per OTP, then it's invalidated

---

## Banner Management

Admin-managed home page carousel.

### Admin → Banners (`/admin/banners`)
- **Add Banner** button → modal with:
  - Title (required), Subtitle (optional)
  - Image upload (file picker) **or** image URL
  - Link URL (internal path like `/category/mobiles` or external `https://...`)
  - Position (lower = appears first), Active toggle
  - Optional Start/End datetime (for scheduled banners)
- Each banner row shows: thumbnail with status dot, title/subtitle, position, link, schedule
- Quick actions: Toggle visibility (eye icon), Edit, Delete

### Home Page Carousel
- Public endpoint `GET /api/banners` returns only active banners (respecting start/end schedule)
- `BannerCarousel` React component:
  - Auto-rotates every 5 seconds
  - Left/right nav arrows
  - Dot indicators (click to jump)
  - Click anywhere on banner → navigates to linkUrl
  - Cross-fade transitions
  - Falls back to static hero section if no banners exist

---

## Review System

Users can submit and view product reviews.

- **Submit**: On any product detail page, scroll to "Customer Reviews" → fill in star rating (1-5) + optional title + comment → submit
- **Display**: Reviews appear at the top of the section, newest first
- **Aggregation**: Product's `rating` and `numReviews` fields auto-update when a review is added/edited
- **One review per user per product**: Submitting again updates the existing review
- **Auth required**: Must be logged in to write a review (form is disabled for guests with a "Please login" hint)

---

## Admin Panel

Access at http://localhost:5173/admin (login as `admin@shopsphere.com` / `admin123`).

**Features:**
- Dashboard with revenue stats, recent orders, recent products
- Product manager with full CRUD, multi-image upload, variant editor, **specifications editor**
- Order manager with status updates, search/filter, detail drawer
- Category manager with photo upload (file or URL)
- User manager with role toggle

---

## Design Tokens

| Token        | Value      | Use                         |
|--------------|------------|-----------------------------|
| Background   | `#FFFFFF`  | Page background             |
| Text         | `#2E2E2E`  | Primary text & footer bg    |
| Accent       | `#F43336`  | Buttons, price, links hover |
| Border       | `#E5E5E5`  | Card & input borders        |
| Light gray   | `#F7F7F7`  | Search bar, secondary bg    |
| Font         | Poppins    | Headings + body             |

---

## Useful Commands

```bash
# Backend
cd backend
npm run dev
npm run db:migrate   # Run pending migrations
npm run db:seed      # Re-seed demo data
npm run db:studio    # Prisma Studio GUI at localhost:5555

# Frontend
cd frontend
npm run dev
npm run build
```

---

## License

MIT — built for educational/demo purposes.
