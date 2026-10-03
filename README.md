# VoiceBooks: Authentication, Accounts & Onboarding

React + Vite frontend, Node.js (Express) API, SQLite database.

## Run it

Requires Node.js 20.19+ (22 recommended).

```bash
npm run install:all
cp server/.env.example server/.env   # then set JWT_SECRET (32+ random chars)
npm run dev
```

- App: http://localhost:5173 (Vite proxies `/api` to the API)
- API: http://localhost:4000
- The SQLite file and tables are created automatically on first start (`server/data/`).

## Structure

```
server/src
  config.js            env + safe defaults
  db/                  schema.sql (roles, users, business_profiles, password_reset_tokens) + seed
  models/accounts.js   all SQL queries
  controllers/         register, login, forgot/reset password, profile, logout
  middleware/          authenticate (JWT), requireRole (RBAC), validate (zod), errorHandler
  routes/              auth, onboarding, admin
  validators/          zod schemas
  utils/security.js    bcrypt, JWT, cookie, reset-token helpers
client/src
  pages/               Login, Signup, RoleSelection, BusinessSetup, ForgotPassword, ResetPassword,
                       Onboarding, SageConnection, OnboardingSuccess, Dashboard (per role)
  components/          AuthLayout, FormField, Button, Alert, Stepper, PasswordRules, RouteGuards
  context/             AuthContext (session), SignupContext (3-step sign-up draft)
  hooks/useForm.js     validation, loading and error handling for every form
  api/client.js        fetch wrapper
```

## Endpoints

| Method | Path | Access |
| --- | --- | --- |
| POST | /api/auth/register | public (creates user + business profile, signs in) |
| POST | /api/auth/login | public |
| POST | /api/auth/forgot-password | public |
| POST | /api/auth/reset-password | public (single-use token) |
| POST | /api/auth/logout | public |
| GET | /api/auth/profile | signed in |
| PUT | /api/onboarding/sage | signed in |
| POST | /api/onboarding/complete | signed in |
| GET | /api/admin/users | admin only |

## Security notes

- Passwords are hashed with bcrypt (cost 12). Plain text is never stored or logged.
- JWT is sent in an httpOnly, SameSite=Lax cookie (a `Bearer` header is also accepted for API tools).
  The user and role are re-loaded from the database on every request.
- All input is validated with zod on the server (client checks are for feedback only).
- `admin` cannot be chosen at sign-up; promote a user in the database.
- Reset tokens: 32 random bytes, only the SHA-256 hash is stored, 30-minute expiry, single use.
  The forgot-password response is identical whether or not the email exists.
- helmet, CORS limited to `CLIENT_ORIGIN`, 10kb body limit, rate limiting on auth routes.
- In production set `NODE_ENV=production`, a strong `JWT_SECRET` and serve over HTTPS.

## To finish later

1. Email: `forgotPassword` in `auth.controller.js` logs the link; send it with your email provider.
2. Sage: `PUT /api/onboarding/sage` records status `pending`. Replace the TODO with Sage's OAuth 2.0 flow
   and set `connected` after the callback.

Make a user an admin:

```bash
sqlite3 server/data/voicebooks.db "UPDATE users SET role_id=(SELECT id FROM roles WHERE name='admin') WHERE email='you@example.com';"
```
