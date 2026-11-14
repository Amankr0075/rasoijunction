# 🧠 Rasoi Junction — Project Brain (`brain.md`)

> **CRITICAL DIRECTIVE FOR ALL DEVELOPERS & AI AGENTS**:
> **ALWAYS READ AND ANALYZE THIS FILE FIRST** before making any code modifications, designing new features, refactoring components, or altering configuration in this repository.
> 
> Whenever an update, bug fix, architectural adjustment, or schema change is made to the codebase, **this document MUST be updated simultaneously** to preserve absolute documentation parity and maintain the integrity of the project knowledge base.

---

## 📋 Table of Contents
1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Mandatory Protocol for Code Modifications](#2-mandatory-protocol-for-code-modifications)
3. [Technology Stack & Architecture](#3-technology-stack--architecture)
4. [Directory & File Structure](#4-directory--file-structure)
5. [Role-Based Access Control (RBAC) & Security](#5-role-based-access-control-rbac--security)
6. [Data Models & Schema Reference](#6-data-models--schema-reference)
7. [Core Workflows & Real-Time Lifecycle](#7-core-workflows--real-time-lifecycle)
8. [API Route Catalog](#8-api-route-catalog)
9. [Environment Variables & Configuration](#9-environment-variables--configuration)
10. [Development, Seeding & Deployment Runbook](#10-development-seeding--deployment-runbook)
11. [Design System & UI Standards](#11-design-system--ui-standards)
12. [Change Log & Evolution History](#12-change-log--evolution-history)

---

## 1. Executive Summary & Vision

**Rasoi Junction** is a production-grade, enterprise-ready Restaurant Management System (RMS) engineered using the MERN stack (MongoDB, Express, React, Node.js) with real-time WebSocket capabilities, automated email intelligence, AI text summarization, and responsive interfaces.

### Core Ecosystem Pillars:
- **Customer Portal**: Dynamic catalog browsing, dietary filtering, cart orchestration, table booking, Razorpay checkout, live order tracking, reviews, and feedback.
- **Kitchen Display System (KDS)**: Real-time ticket queue for chefs with preparation status timers and bi-directional event broadcast.
- **Rider & Delivery Console**: Dedicated view for delivery personnel to claim orders, update delivery progress, and capture drop-off statuses.
- **Staff Operations Console**: Internal terminal for floor managers and serving staff to monitor active tables, attendance, and customer service.
- **Admin Command Center**: Executive cockpit providing multi-dimensional revenue analytics, inventory control, coupon engines, staff management, customer sentiment reviews, and global system maintenance toggles.
- **Automated Communication & AI**: 2-way IMAP email listener with automated auto-responder, Groq-powered generative text summarizer, and Nodemailer transactional alerts.

---

## 2. Mandatory Protocol for Code Modifications

Before starting any task in this repository, execute the following protocol:

```
┌────────────────────────────────────────────────────────┐
│ 1. Read & Analyze brain.md                             │
│    - Understand affected models, routes & UI features  │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. Trace Dependencies & Cross-Module Impact            │
│    - Check server routes, socket events & client state │
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. Execute Code Changes                                │
│    - Adhere strictly to existing patterns and standards│
└──────────────────────────┬─────────────────────────────┘
                           ▼
┌────────────────────────────────────────────────────────┐
│ 4. Update brain.md & Log Changes                       │
│    - Record updated schemas, endpoints, or workflows   │
└────────────────────────────────────────────────────────┘
```

### Golden Rules:
1. **Zero Regressions**: Never break existing socket rooms, auth guards, or role permissions when introducing changes.
2. **ES Modules Only**: The backend uses ECMAScript modules (`"type": "module"`). Always use `import` / `export` syntax; never use `require()`.
3. **Environment Parity**: Always update `.env.example` if a new environment variable is introduced.
4. **Resilient Error Handling**: Backend controllers must use unified error handlers and consistent `{ success: boolean, message: string, data?: any }` JSON payloads.

---

## 3. Technology Stack & Architecture

### 3.1 Client Architecture
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3, Custom CSS Variables, PostCSS, Autoprefixer
- **State & Context**:
  - `AuthContext`: Authentication token, session persistence, user profile, logout
  - `ThemeContext`: Dark/Light theme switching with CSS root variable bindings
  - `CartContext`: Local-storage backed shopping cart, item quantities, pricing totals
- **Routing**: `react-router-dom` v7 with `PrivateRoute` and `RoleRoute` guards
- **Animation & Visuals**: Framer Motion, Lottie-React, React Icons
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Networking & Real-Time**: Axios (with base URL, interceptors, ngrok headers), Socket.io-client
- **Exporting & Utilities**: jsPDF, jsPDF-autotable, html2canvas, ExcelJS, file-saver, react-hook-form, react-hot-toast

### 3.2 Server Architecture
- **Runtime & Framework**: Node.js 18+ & Express 4
- **Database**: MongoDB via Mongoose 8/9 ORM
- **Real-Time Communication**: Socket.IO 4.8+ attached to Node HTTP server with room routing
- **Authentication**: JWT (Access Token + Refresh Token flow), `bcryptjs` password hashing, `cookie-parser`
- **Security**: Helmet, CORS (configured for credentials and multi-origin tunnels), Express-rate-limit
- **AI & Automation**:
  - `groq-sdk`: High-speed LLM summarization of customer feedback and tickets
  - `imapflow` & `mailparser`: Asynchronous 2-way IMAP listener that continuously reads customer emails and triggers auto-replies
  - `nodemailer`: Transactional order confirmations, reset passwords, and receipts
- **Payments**: Razorpay Node SDK (Order creation, signature verification, simulated checkout fallback)
- **Document Generation**: Puppeteer for PDF invoice generation

---

## 4. Directory & File Structure

```
Rasoi_Junction/
├── brain.md                         # 🧠 Single Source of Truth / Project Brain
├── README.md                        # Public Documentation & Quick Start
├── package.json                     # Monorepo root scripts (concurrently dev runner)
│
├── client/                          # React + Vite Frontend
│   ├── .env                         # Client environment (API endpoints & Sockets)
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.js           # Tailwind configuration
│   └── src/
│       ├── App.jsx                  # Root routes & role protection tree
│       ├── main.jsx                 # Application DOM bootstrap
│       ├── index.css                # Global styles, variables & utility classes
│       ├── components/              # Shared reusable components
│       │   ├── common/              # Navbar, Footer, Buttons, Modal, Error Pages, Guards
│       │   └── layout/              # CustomerLayout, AdminLayout, DashboardLayout
│       ├── context/                 # AuthContext, CartContext, ThemeContext
│       ├── services/                # api.js (Axios instance), socketService.js
│       ├── utils/                   # Helpers, formatters, currency, date utilities
│       └── features/                # Domain-Driven Feature Modules
│           ├── admin/               # AdminDashboard, Management Console, Payments, Analytics
│           ├── auth/                # Login, Register, ForgotPassword, ResetPassword
│           ├── cart/                # CartPage, PaymentSimulationPage
│           ├── customer/            # HomePage, CustomerDashboard, Reviews, Wishlist, Settings
│           ├── delivery/            # DeliveryDashboard (Rider dispatch and tracking)
│           ├── kitchen/             # KitchenDashboard (KDS live queue)
│           ├── maintenance/         # MaintenancePage (gated screen when system is locked)
│           ├── menu/                # MenuPage, MenuCard, AdminMenuManagement
│           ├── orders/              # OrderTrackingPage, InvoicePage, AdminOrderManagement
│           ├── public/              # About, Contact, FAQ, Terms, Privacy, Refund
│           ├── reservations/        # ReservationPage, AdminReservations
│           └── staff/               # StaffDashboard (Floor operations & attendance)
│
└── server/                          # Express + Node Backend
    ├── .env                         # Backend environment variables
    ├── .env.example                 # Environment template
    ├── package.json                 # Backend dependencies & scripts
    └── src/
        ├── app.js                   # Express app instance, middleware & route bindings
        ├── server.js                # Server entrypoint, HTTP server, DB connection & Socket.io init
        ├── config/                  # Configuration files
        │   ├── db.js                # MongoDB connection handler
        │   └── env.js               # Validated environment variable wrapper
        ├── middleware/              # Express middlewares
        │   ├── auth.js              # protect, authorize, optionalAuth
        │   ├── errorHandler.js      # Global error handler
        │   ├── maintenance.js       # Global maintenance interceptor
        │   ├── rateLimiter.js       # API rate limiters
        │   └── upload.js            # Multer file upload handler
        ├── socket/                  # WebSocket setup
        │   └── socket.js            # Socket.io connection, room join/leave logic
        ├── services/                # External integration services
        │   └── groqService.js       # Groq AI LLM summarization wrapper
        ├── utils/                   # Server utilities
        │   ├── autoResponder.js     # IMAP inbox polling & automated email responder
        │   ├── emailTemplates.js    # HTML email templates
        │   ├── sendEmail.js         # Nodemailer transport handler
        │   └── seed.js              # Database seed script for dummy data & users
        ├── routes/                  # General helper routes
        │   └── summarize.routes.js  # /api/summarize endpoint
        └── modules/                 # Modular Business Domain Architecture
            ├── auth/                # Controller, Model, Routes, Validators
            ├── contact/             # Contact inquiry handling & ticket tracking
            ├── coupons/             # Discount codes, validation, usage limits
            ├── feedback/            # Structured feedback & dining survey ratings
            ├── menu/                # Menu item CRUD, categories, diet tags, stock
            ├── notifications/       # User & system in-app notifications
            ├── orders/              # Order lifecycle, status updates, history
            ├── payments/            # Razorpay order generation & verification
            ├── reservations/        # Table booking, slot checks, approvals
            ├── reviews/             # Public dish & restaurant reviews
            └── system/              # System config (Maintenance mode, Email logs)
```

---

## 5. Role-Based Access Control (RBAC) & Security

### 5.1 Roles Definition
The system supports six distinct roles:

| Role | Target Persona | Primary Responsibilities & Permissions |
|---|---|---|
| **`customer`** | Guests / Diners | Browse menu, order food, simulate/pay via Razorpay, reserve tables, track orders, post reviews. |
| **`chef`** | Kitchen Cooks | Access Kitchen Display System (KDS). View live queue, advance item status (`preparing` -> `ready`). |
| **`delivery`** | Couriers / Riders | Access Delivery Console. View assigned orders, update transit state (`out_for_delivery` -> `delivered`). |
| **`staff`** | Floor Staff / Waiters | View active dining tables, check reservations, update customer service records, view attendance. |
| **`manager`** | Floor / Shift Managers | Oversee orders, handle reservations, monitor floor operations, manage basic inventory. |
| **`admin`** | Executive Owners | Full system mastery: Revenue analytics, user administration, system maintenance mode, coupon creation, salary/staff settings. |

### 5.2 Middleware Enforcement Flow
1. **`protect`**: Verifies Bearer JWT token from `Authorization` header or HTTP-only cookie. Injects `req.user`.
2. **`authorize(...roles)`**: Restricts access strictly to authorized role sets. Emits `403 Forbidden` on mismatch.
3. **`optionalAuth`**: Extracts credentials if present, allowing guest users to pass through while tagging authenticated users for maintenance exceptions.
4. **`maintenanceMiddleware`**: Blocks all non-admin traffic with `503 Service Unavailable` if `isMaintenanceMode` is activated in System settings.

### 5.3 Real-Time WebSocket Rooms
When a client connects to Socket.IO, it issues a `join` event:
- **User Room**: `socket.join(data.userId)` — delivers direct customer alerts (e.g., "Your order is ready!").
- **Role Room**: `socket.join(data.role)` — broadcasts operational signals:
  - `chef`: receives `order:created` for new kitchen tickets.
  - `delivery`: receives `order:ready_for_pickup` signals.
  - `admin`: receives live revenue alerts and critical operational notifications.

---

## 6. Data Models & Schema Reference

### 6.1 User (`server/src/modules/auth/auth.model.js`)
- `name` (String, required)
- `email` (String, unique, required)
- `password` (String, hashed via bcrypt, hidden via `select: false`)
- `phone` (String, 10-digit validation)
- `role` (Enum: `customer`, `admin`, `manager`, `staff`, `chef`, `delivery`; default: `customer`)
- `avatar` (String URL)
- `address` (`{ street, city, state, pincode, landmark }`)
- `employeeId` (String, unique, sparse)
- `staffDetails` (`{ salary, rating, attendance: [{ date, status }], customersServed }`)
- `passwordResetToken`, `passwordResetExpire`

### 6.2 Order (`server/src/modules/orders/order.model.js`)
- `orderNumber` (String, auto-generated unique ID, e.g., `RJ-2026-XXXX`)
- `user` (ObjectId ref User)
- `items`: Array of `{ menu: ObjectId ref MenuItem, name, price, quantity, specialInstructions }`
- `orderType`: Enum (`dine-in`, `takeaway`, `delivery`)
- `tableNumber`: Number (for `dine-in`)
- `deliveryAddress`: Sub-schema (for `delivery`)
- `pricing`: `{ subtotal, tax, deliveryFee, discount, tip, total }`
- `status`: Enum (`placed`, `confirmed`, `preparing`, `ready`, `out_for_delivery`, `delivered`, `completed`, `cancelled`)
- `paymentStatus`: Enum (`pending`, `completed`, `failed`, `refunded`)
- `paymentMethod`: Enum (`razorpay`, `cash`, `card`, `simulation`)
- `rider`: ObjectId ref User (role `delivery`)
- `timeline`: Array of `{ status, timestamp, note }`

### 6.3 Menu Item (`server/src/modules/menu/menu.model.js`)
- `name` (String, required)
- `description` (String)
- `price` (Number, required)
- `category` (Enum: `Starters`, `Main Course`, `Breads`, `Rice & Biryani`, `Desserts`, `Beverages`, `Combos`)
- `dietary`: `{ isVeg: Boolean, isVegan: Boolean, isGlutenFree: Boolean, isSpicy: Boolean }`
- `image` (String URL)
- `isAvailable` (Boolean, default: `true`)
- `prepTime` (Number, minutes)
- `calories` (Number)
- `rating`: `{ average: Number, count: Number }`

### 6.4 Reservation (`server/src/modules/reservations/reservation.model.js`)
- `user`: ObjectId ref User
- `name`, `email`, `phone`: Contact details
- `guests`: Number
- `date`: Date
- `timeSlot`: String (e.g., `19:30`)
- `tableNumber`: Number (optional)
- `specialRequests`: String
- `status`: Enum (`pending`, `confirmed`, `seated`, `completed`, `cancelled`)

### 6.5 Payment (`server/src/modules/payments/payment.model.js`)
- `order`: ObjectId ref Order
- `user`: ObjectId ref User
- `razorpayOrderId`: String
- `razorpayPaymentId`: String
- `razorpaySignature`: String
- `amount`: Number
- `currency`: String (`INR`)
- `status`: Enum (`created`, `authorized`, `captured`, `failed`, `refunded`)

### 6.6 Coupon (`server/src/modules/coupons/coupon.model.js`)
- `code` (String, uppercase, unique)
- `discountType`: Enum (`percentage`, `flat`)
- `discountValue`: Number
- `minOrderValue`: Number
- `maxDiscount`: Number
- `validFrom`, `validUntil`: Dates
- `usageLimit`, `usedCount`: Numbers
- `isActive`: Boolean

### 6.7 Feedback & Review (`server/src/modules/feedback/`, `server/src/modules/reviews/`)
- `Feedback`: Rating (Food, Service, Ambiance), comments, survey answers.
- `Review`: Star rating (1-5), item-level or restaurant-level review, verified dining tags.

### 6.8 System Settings & Email Logs (`server/src/modules/system/`)
- `SystemConfig`: `isMaintenanceMode` (Boolean), `maintenanceMessage`, `contactEmail`, `storeHours`.
- `EmailLog`: Track auto-responder messages, inbound emails, responses delivered, and status.

---

## 7. Core Workflows & Real-Time Lifecycle

### 7.1 Order Lifecycle & WebSocket Pipeline

```
[Customer] Places Order
      │
      ▼ (POST /api/orders)
[Server] Creates Order (status: 'placed')
      │ ──► Emits 'order:created' to 'chef' and 'admin' rooms
      ▼
[Kitchen / Chef] Accepts Order (status: 'preparing')
      │ ──► Emits 'order:status_updated' to customer room (userId)
      ▼
[Kitchen / Chef] Completes Preparation (status: 'ready')
      │ ──► Emits 'order:ready_for_pickup' to 'delivery' room
      ▼
[Delivery / Rider] Claims & Dispatches (status: 'out_for_delivery')
      │ ──► Emits 'order:status_updated' to customer room with rider info
      ▼
[Delivery / Rider] Arrives & Delivers (status: 'delivered')
      │ ──► Emits 'order:status_updated'
      ▼
[Customer] Prompts for Review & Feedback
```

### 7.2 Two-Way IMAP Auto-Responder & Groq AI Pipeline
1. **Startup**: When `server.js` boots, `startAutoResponder()` initiates an `ImapFlow` client targeting `EMAIL_IMAP_HOST` (e.g., `imap.gmail.com:993`).
2. **Listener**: Binds to `client.on('exists')` inside the `INBOX` mailbox lock.
3. **Loop Protection**: Inspects `auto-submitted` headers and sender email to reject messages originating from self or auto-reply loops.
4. **Response**: Parses incoming inquiries using `mailparser`, logs the interaction into `EmailLog`, and formats a branded HTML reply using `Nodemailer`. Note: For Gmail, Google requires an active 16-character App Password (with 2FA enabled on the account).
5. **AI Summarization**: Inbound customer reviews or inquiries can be summarized via `POST /api/summarize` leveraging Groq LLM API.

---

## 8. API Route Catalog

All endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
- `POST /register` — Create new user account
- `POST /login` — Authenticate user and issue JWT
- `GET /me` — Retrieve current authenticated session
- `POST /forgot-password` — Request password reset email
- `PUT /reset-password/:token` — Reset password using token
- `PUT /updatedetails` — Update profile information
- `PUT /updatepassword` — Update user password
- `GET /staff` — Fetch staff directory (Admin only)
- `POST /staff` — Create staff account with role & salary (Admin only)

### Menu Management (`/api/menu`)
- `GET /` — Fetch full menu (supports category, search, dietary filtering)
- `GET /:id` — Get single item details
- `POST /` — Create menu item (Admin only)
- `PUT /:id` — Update menu item (Admin only)
- `DELETE /:id` — Soft/Hard delete menu item (Admin only)

### Orders (`/api/orders`)
- `POST /` — Place new order
- `GET /my-orders` — Customer order history
- `GET /` — All orders (Staff, Chef, Delivery, Admin)
- `GET /:id` — Detailed order view
- `PATCH /:id/status` — Advance order status (Chef, Delivery, Admin)
- `PATCH /:id/assign-rider` — Assign delivery partner

### Reservations (`/api/reservations`)
- `POST /` — Submit table reservation request
- `GET /my-reservations` — Customer table bookings
- `GET /` — View all reservations (Staff, Admin)
- `PATCH /:id/status` — Confirm, seat, or cancel reservation

### Payments (`/api/payments`)
- `POST /create-order` — Create Razorpay order instance
- `POST /verify` — Verify cryptographic signature & finalize order
- `POST /simulate` — Offline/development simulated payment

### Coupons, Reviews & Feedback
- `GET /api/coupons` — List available promotions
- `POST /api/coupons/validate` — Validate code and compute discount
- `GET /api/reviews` & `POST /api/reviews` — Public restaurant reviews
- `POST /api/feedbacks` — Customer dining feedback
- `POST /api/contacts` — Contact form submissions

### System & Intelligence
- `GET /api/system/config` — Public system status & maintenance state
- `PATCH /api/system/maintenance` — Toggle maintenance mode (Admin only)
- `GET /api/system/email-logs` — Audit log of emails handled
- `POST /api/summarize` — Groq AI text summarizer

---

## 9. Environment Variables & Configuration

### Server Configuration (`server/.env`)
| Variable | Required | Default | Purpose |
|---|:---:|---|---|
| `PORT` | No | `5000` | HTTP port for backend server |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `MONGO_URI` | **Yes** | — | MongoDB connection string (Atlas or Local) |
| `JWT_SECRET` | **Yes** | — | Secret key for signing Access Tokens |
| `JWT_REFRESH_SECRET` | **Yes** | — | Secret key for Refresh Tokens |
| `JWT_EXPIRE` | No | `15m` | Lifetime of Access Tokens |
| `JWT_REFRESH_EXPIRE` | No | `7d` | Lifetime of Refresh Tokens |
| `COOKIE_EXPIRE` | No | `7` | Cookie expiry in days |
| `CLIENT_URL` | No | `http://localhost:5173` | Allowed frontend origin for CORS |
| `GROQ_API_KEY` | **Yes** | — | API Key for Groq LLM summarization |
| `EMAIL_HOST` | No | `smtp.gmail.com` | SMTP host for Nodemailer |
| `EMAIL_PORT` | No | `587` | SMTP port |
| `EMAIL_USER` | No | — | Email address for SMTP & IMAP |
| `EMAIL_PASS` | No | — | App Password for email account |
| `EMAIL_IMAP_HOST` | No | `imap.gmail.com` | IMAP host for incoming listener |
| `ENABLE_AUTO_RESPONDER`| No | `true` | Toggle for IMAP auto-responder service |
| `RAZORPAY_KEY_ID` | Optional | — | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Optional | — | Razorpay secret key |

### Client Configuration (`client/.env`)
| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Primary backend API URL (e.g., `https://rasoijunction.up.railway.app/api` or `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | WebSocket server URL |
| `VITE_FALLBACK_API_URL` | Fallback tunnel API URL if cloud server is sleeping/offline |
| `VITE_FALLBACK_SOCKET_URL` | Fallback WebSocket server URL |

---

## 10. Development, Seeding & Deployment Runbook

### 10.1 Running Locally
From the workspace root:

```bash
# 1. Install all dependencies across root, server, and client
npm run install-all    # Or run npm install in /, /client, and /server

# 2. Run both server and client concurrently
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`

### 10.2 Database Seeding
To populate MongoDB with starter menu categories, dishes, demo customers, staff, and admin accounts:

```bash
npm run seed --prefix server
```

### 10.3 Production Build
```bash
# Build Vite production assets
npm run build --prefix client

# Run Node.js production server
npm run start --prefix server
```

---

## 11. Design System & UI Standards

1. **Aesthetic Philosophy**:
   - Modern, warm, culinary-inspired color palette.
   - Deep slate backgrounds for dark mode, crisp clean whites with warm amber/orange accents for light mode.
   - Micro-interactions powered by Framer Motion on cards, buttons, modals, and status transitions.
2. **Typography**:
   - Clean sans-serif hierarchy (Inter/system-ui) with prominent numeric styling for prices and invoice totals.
3. **Component Reusability**:
   - Use standard buttons, badges, modals, and cards from `components/common`.
   - Never write redundant inline CSS; leverage Tailwind tokens and configured theme variables.

---

## 12. Change Log & Evolution History

| Date (YYYY-MM-DD) | Change Category | Description | Author / Agent |
|---|---|---|---|
| **2026-11-14** | Email Reliability & Diagnostics | Fixed relative logo attachment ENOENT pathing bug in `sendEmail.js`, added Gmail service auto-detection, auto-trimmed password spaces, improved EAUTH/535 diagnostic reporting, enhanced `testEmail.js`, and added dev-mode OTP fallback logging. | Antigravity AI |
| **2026-10-13** | Initial Architecture | Created comprehensive `brain.md` project brain establishing system architecture, protocols, RBAC, schema definitions, and workflows. | Antigravity AI |

> **REMINDER**: Whenever you implement changes to Rasoi Junction, add a new row above this line documenting your change, and update the corresponding sections of `brain.md` accordingly!
