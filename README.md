# VoiceBooks
VoiceBooks is a voice-enabled accounting system developed for the INSY7315 Work Integrated Learning project.

## Team
CodeSyndicate

## Task
POE Task 2 - Code and Implementation

## Authentication, user accounts and onboarding (feature-login)

Screens: Login, Create account (3 steps: details, account type, business), Forgot password,
Reset password, Sage connection, Onboarding success.

### Run it

You need Node.js 20.19+ (22 recommended). Use two terminals.

```bash
# Terminal 1: backend (http://localhost:3715)
cd backend
npm install
cp .env.example .env        # Windows: copy .env.example .env
# open .env and set JWT_SECRET to a random string of 32+ characters
npm run dev

# Terminal 2: frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend forwards `/api` requests to the backend (see `frontend/vite.config.js`).
The SQLite database is created automatically in `backend/data/` on the first start.

### Backend (`backend/src`)

| Path | Responsibility |
| --- | --- |
| `server.js` | Entry point, starts the API |
| `app.js` | Express setup: security headers, CORS, JSON, routes |
| `config.js` | Reads `.env` and sets safe defaults |
| `db/` | `schema.sql` (roles, users, business_profiles, password_reset_tokens) and database setup |
| `models/accounts.js` | All database queries |
| `validators/auth.schemas.js` | Input rules (zod) |
| `middleware/` | `authenticate` (JWT), `requireRole` (RBAC), `validate`, `errorHandler` |
| `controllers/auth.controller.js` | Register, login, forgot/reset password, profile, logout |
| `routes/` | `auth`, `onboarding`, `admin` routes |
| `utils/` | Password hashing and JWT (`security.js`), email (`mailer.js`, `emailTemplates.js`) |

The backend uses CommonJS (`require`), like the rest of the backend.

### Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | /api/auth/register | public (creates user and business profile, signs in) |
| POST | /api/auth/login | public |
| POST | /api/auth/forgot-password | public |
| POST | /api/auth/verify-reset-token | public |
| POST | /api/auth/reset-password | public (single-use token) |
| POST | /api/auth/logout | public |
| GET | /api/auth/profile | signed in |
| PUT | /api/onboarding/sage | signed in |
| POST | /api/onboarding/complete | signed in |
| GET | /api/admin/users | admin only |

### Frontend (`frontend/src`)

| Path | Responsibility |
| --- | --- |
| `App.jsx`, `main.jsx` | Routes and app providers |
| `pages/` | One file per screen |
| `components/` | Shared UI: layout, form field, button, alert, route guards |
| `context/`, `hooks/` | Session state (`useAuth`), sign-up draft (`useSignup`), form handling (`useForm`) |
| `api/client.js` | Every call to the backend |
| `utils/` | Browser-side validation and option lists |
| `styles/app.css` | Styling for these screens (`index.css` is unchanged) |

### Security

- Passwords are hashed with bcrypt and never stored or logged in plain text.
- The JWT is stored in an httpOnly cookie. The user and role are re-read from the database on every request.
- Input is validated on the server with zod. `admin` cannot be chosen at sign-up.
- Password reset: random 32-byte token, only its SHA-256 hash is stored, single use, expires after 30 minutes.
- helmet, CORS limited to `CLIENT_ORIGIN`, small body limit, and rate limiting on the auth routes.

### Password reset emails

Without SMTP settings nothing is emailed: the reset link is printed in the backend terminal and shown on the
"Check your email" screen. To send real emails, fill in the `SMTP_*` and `MAIL_FROM` values in `backend/.env`
(see `.env.example`; for Gmail use an app password).

### Still to do

- Sage: `PUT /api/onboarding/sage` records the status `pending`. Replace the TODO in `routes/onboarding.routes.js` with Sage's OAuth 2.0 flow.
- Make a user an admin: `UPDATE users SET role_id = (SELECT id FROM roles WHERE name = 'admin') WHERE email = '...';`
