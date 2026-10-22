# 🐾 PawPal – Pet Adoption Management System

A complete, production-quality pet adoption platform built with **React + Vite + Tailwind CSS** (frontend) and **FastAPI + PyMongo + MongoDB** (backend).

---

## ✨ Features

| Area | Details |
|---|---|
| **UI** | Premium cream/forest-green theme, glassmorphism Navbar, animated hero, responsive layouts |
| **Pets** | 28 seeded pets (dogs, cats, rabbits, birds) with real Unsplash images |
| **Search** | Full-text + combined filters (species, gender, age, location, vaccination, status) |
| **Pagination** | Server-side pagination with sort controls |
| **CRUD** | Admin-protected Create / Read / Update / Delete for all pets |
| **Adoption** | Submit, track, approve, and reject applications with atomic pet-status transitions |
| **Analytics** | 7 MongoDB aggregation pipelines powering Recharts charts on the Admin Dashboard |
| **Auth** | API-key protected admin endpoints (X-Admin-Key header) |
| **Tests** | Isolated test DB (pawpal_test_db), 25+ pytest tests across pets, applications, and analytics |
| **Data** | 100% MongoDB persistent — no hardcoded arrays, survives restarts |

---

## 🗂️ Project Structure

```
Mongodb-CA/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup, routers
│   ├── database.py          # PyMongo, $jsonSchema validators, indexes
│   ├── models.py            # Pydantic v2 models
│   ├── auth.py              # X-Admin-Key dependency
│   ├── utils.py             # ObjectId helpers, doc serialisation
│   ├── seed.py              # Idempotent seeder (28 pets + 7 demo apps)
│   ├── requirements.txt
│   ├── .env.example
│   └── routers/
│       ├── pets.py          # GET/POST/PUT/DELETE /api/pets
│       ├── applications.py  # GET/POST /api/applications + approve/reject
│       └── analytics.py     # 7 aggregation endpoints
│   └── tests/
│       ├── conftest.py      # Isolated test DB fixtures
│       ├── test_pets.py
│       ├── test_applications.py
│       └── test_analytics.py
└── frontend/
    ├── vite.config.js       # Proxy /api → localhost:8000
    ├── tailwind.config.js   # Design tokens
    └── src/
        ├── api/client.js    # Axios + interceptors
        ├── App.jsx          # React Router v6 routes
        ├── components/      # Navbar, Footer, PetCard, FilterBar, StatCard, LoadingSpinner
        └── pages/           # Home, FindPet, PetDetails, AdoptionForm, MyApplications,
                             # AdminDashboard, PetManagement, ApplicationManagement
```

---

## 🚀 Setup & Running

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** running on `localhost:27017`

> **Start MongoDB (Windows):**
> ```powershell
> # If installed as a service:
> net start MongoDB
> # Or run directly:
> mongod --dbpath C:\data\db
> ```

---

### Backend

```powershell
cd backend

# 1. Copy env
copy .env.example .env    # Edit ADMIN_SECRET_KEY if desired

# 2. Install dependencies
pip install -r requirements.txt

# 3. Seed the database (idempotent – safe to re-run)
python seed.py

# 4. Start the API server
uvicorn main:app --reload --port 8000
```

**API Docs:** http://localhost:8000/docs

---

### Frontend

```powershell
cd frontend

# Install dependencies (already done during setup)
npm install

# Start dev server (proxies /api → backend)
npm run dev
```

**App URL:** http://localhost:5173

---

### Admin Login

1. Click **Admin Login** in the Navbar
2. Enter the key from your `.env` → `ADMIN_SECRET_KEY` (default: `pawpal_admin_secret_2024`)
3. Access `/admin`, `/admin/pets`, `/admin/applications`

---

## 🧪 Running Tests

```powershell
cd backend

# Tests use pawpal_test_db (isolated, auto-created and dropped)
pytest tests/ -v
```

Expected: **~25 tests**, all passing.

---

## 📊 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/pets` | Public | List + search + filter + paginate |
| GET | `/api/pets/{id}` | Public | Get single pet |
| POST | `/api/pets` | Admin | Create pet |
| PUT | `/api/pets/{id}` | Admin | Update pet |
| DELETE | `/api/pets/{id}` | Admin | Delete pet |
| POST | `/api/applications` | Public | Submit adoption application |
| GET | `/api/applications/my/{email}` | Public | Get user's applications |
| GET | `/api/applications` | Admin | List all applications |
| PUT | `/api/applications/{id}/status` | Admin | Approve / reject |
| GET | `/api/analytics/summary` | Public | Pet + application counts |
| GET | `/api/analytics/by-species` | Public | Pets per species |
| GET | `/api/analytics/applications-by-status` | Public | Apps per status |
| GET | `/api/analytics/monthly-trends` | Public | Monthly volume |
| GET | `/api/analytics/avg-age-by-species` | Public | Avg pet age |
| GET | `/api/analytics/top-applied-pets` | Public | Most-applied pets |
| GET | `/api/analytics/adoption-rate` | Public | Success rate |

---

## 🌱 Seed Script

`seed.py` is **idempotent** — re-running it is always safe:

- Pets are upserted by a `seed_key` field → never duplicated
- Real user-created pets are never modified
- Applications use the unique `(pet_id, email)` index → no duplicates

```powershell
python seed.py   # Can be run any number of times safely
```

---

## 🔒 Security Notes

- Admin key is read from environment variable only — never stored in source code
- `$jsonSchema` validators enforce data integrity at the MongoDB level
- The unique compound index `(pet_id, applicant_email)` prevents duplicate applications at the DB level
- Concurrent approval conflicts are handled with `find_one_and_update` + conditional filter
