# ONGC Support Portal

IT support portal with a knowledge base (solutions), ticket dashboard, and REST API backend.

## Quick start

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Start the server:

```bash
npm start
```

3. Open in your browser:

```
http://localhost:5000/login.html
```

**Demo login:** `admin` / `admin123`

## Features

- **Login** — session stored in browser localStorage
- **Solution Repository** — browse and search knowledge base articles
- **Ticket Dashboard** — live stats, filters, and ticket list from API
- **Raise Ticket** — submit new support requests
- **Add Solution** — publish new knowledge base articles
- **Solution Details** — view full article from repository

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Ticket statistics |
| GET/POST | `/api/tickets` | List or create tickets |
| GET/PATCH/DELETE | `/api/tickets/:id` | Single ticket operations |
| GET/POST | `/api/solutions` | List or create solutions |
| GET/DELETE | `/api/solutions/:id` | Single solution operations |

Data is stored in `backend/data/tickets.json` and `backend/data/solutions.json`.

## Project structure

```
ongc-support-portal/
├── backend/          # Express API + static file server
├── css/              # Stylesheets
├── js/               # Frontend scripts
├── assets/           # Images
├── login.html
├── index.html        # Knowledge base
├── dashboard.html    # Ticket dashboard
├── raise-ticket.html
├── add-solution.html
└── view-ticket.html  # Solution detail view
```
