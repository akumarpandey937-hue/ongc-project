# ONGC Enterprise Support Portal & Knowledge Hub

An elegant, premium, high-contrast operations workspace and centralized knowledge management system designed for ONGC professionals. The portal supports core exploration and processing software systems—including **GEOTOMO, OMEGA, PARADIGM, CGG, LINUX, SCUBE, and SHARP REFLECTION**—under a clean, high-contrast off-white corporate layout.

---

## 🌟 Key Features

### 📖 Centralized Knowledge Hub (`index.html`)
- **Default Guest Entry**: Accessible to public guest users by default on the root route `/` with a premium top-right **"Sign In"** call-to-action.
- **Dynamic Category Filtering**: A horizontal category bar allows users to filter solutions by software system (e.g., OMEGA, LINUX, GEOTOMO) with active tab indicators.
- **Full Text Search**: Live search index filters issues dynamically as users type.
- **Admin Authorizations**: Fully authenticated admins see an inline **"+ Publish Solution"** shortcut on the category bar.

### 📊 SLA & Workload Dashboard (`dashboard.html` / `user-dashboard.html`)
- **Live Statistics**: Real-time counters showing Total Tickets, Open Issues, and In-Progress/Resolved workloads.
- **Glassmorphic Badge Indicators**: Status levels mapped dynamically to high-contrast tinted badges.
- **Multi-parameter Search**: Search and filter support requests by ticket ID, subject, raising user, or category.
- **Interactive Details**: Admins see all portal tickets, whereas users see their own requested support list.

### 🔄 One-Click Ticket Migration
- **Ticket to Solution Promotion**: Admins can resolve a ticket and click **"Add to Knowledge Hub"** on the ticket details page.
- **Prefilled Forms**: Promotes the ticket contents into the solution form, prefilling the title, category, and formatted issue/resolution descriptions automatically.
- **Sequential ID Generation**: Automatically assigns clean, sequential integers to migrated solutions instead of timestamp-based IDs.

### ✍️ Rich-Text Editor Integration
- **Quill Rich Editor**: Integrated into **Add Solution** and **Raise Ticket** forms for formatted descriptions (bold, italic, lists, links, headers).
- **Native Placeholder Formatting**: Ghost configuration displays `"Please describe the issue in detail..."` when the editor is empty, avoiding static preloaded text.

### 👤 Interactive Profile & Account Details Modal
- **Dynamic Avatar Generation**: Auto-extracts user initials for custom topbar profile avatars.
- **System Information Drawer**: Click **"Account Details"** inside the dropdown menu to inspect active session ID, login timestamp, operating system, and browser platform details.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **HTML5 & Vanilla JS (ES6)**: Pure DOM manipulation, modular routing, and event listeners.
- **Vanilla CSS3 (Responsive Design)**: Mobile-friendly sidebar and dashboard components styled using modular variables (custom shadow vectors, layout dimensions, transitions, and hover layers).
- **Quill JS**: Rich editor container customization.

### Backend
- **Node.js & Express.js**: REST API server running on port `5000`.
- **JSON File-Database**: Persistence layer stored directly inside `backend/data/solutions.json` and `backend/data/tickets.json`.
- **Nodemon**: Auto-reloads code during active development.

---

## 🚀 Quick Start

### 1. Install Dependencies
Navigate to the backend directory and download required npm packages:
```bash
cd backend
npm install
```

### 2. Start the Server
Run the Express application locally (running nodemon):
```bash
npm run dev
```

### 3. Open in Browser
Visit the server URL:
```text
http://localhost:5000/
```
*Note: Serves the public Knowledge Hub homepage by default.*

### 🔑 Demo Logins
- **System Administrator**: `admin` / `admin123`
- **Portal Users**: `user` / `user123` | `vansh` / `vansh123`

---

## 🔌 API Reference

| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/solutions` | List all published solutions | **Public** |
| **GET** | `/api/solutions/:id` | Get details of a single solution | **Public** |
| **POST** | `/api/solutions` | Publish a new solution | **Admin Only** |
| **DELETE** | `/api/solutions/:id` | Delete a solution | **Admin Only** |
| **GET** | `/api/tickets` | List support tickets | **User / Admin** |
| **POST** | `/api/tickets` | Submit a new ticket | **User / Admin** |
| **GET** | `/api/tickets/:id` | Get details of a single ticket | **User / Admin** |
| **PATCH** | `/api/tickets/:id` | Update ticket details/replies | **Admin Only** |
| **GET** | `/api/dashboard/stats` | Retrieve overall ticket SLA stats | **Admin Only** |

---

## 📁 Project Structure

```text
ongc-support-portal/
├── backend/                  # REST API Server
│   ├── data/                 # JSON file databases
│   │   ├── solutions.json
│   │   └── tickets.json
│   ├── middleware/           # Auth middlewares
│   ├── routes/               # API routers
│   ├── server.js             # Entry server file
│   └── package.json
├── public/                   # Frontend files (Served by Express)
│   ├── assets/               # Images and icons
│   ├── css/                  # Compiled styles
│   │   ├── style.css         # Base stylesheet
│   │   ├── dashboard.css     # Stats and badges override
│   │   ├── ticket.css        # Table layouts override
│   │   └── add-solution.css  # Form structures override
│   ├── js/                   # Frontend scripts
│   │   ├── main.js           # Auth guards & sidebar control
│   │   ├── api.js            # Network requests
│   │   ├── solutions.js      # Hub filters
│   │   ├── dashboard.js      # Admin dashboard logic
│   │   └── ticket-details.js # Reply thread & migration logic
│   ├── index.html            # Default Homepage (Knowledge Hub)
│   ├── login.html            # Member Login Page
│   ├── dashboard.html        # Admin Dashboard Page
│   ├── user-dashboard.html   # User Dashboard Page
│   ├── raise-ticket.html     # Ticket Raising Form
│   ├── add-solution.html     # Solution Publishing Form
│   ├── ticket-details.html   # Ticket Details & Replies Page
│   └── view-ticket.html      # Solution Details Page
└── README.md                 # Project documentation
```
