# CSE485-BetterLTC
ASU CSE485 Spring 2026 Capstone Project - BetterLTC

## What you need installed
- .NET 10 SDK
- Node.js 18 or newer

## Run it locally
Open two terminals.

**Terminal 1 - backend**
```
cd backend/Backend
dotnet run
```
Runs at http://localhost:5184. The database files are created automatically on first run.

**Terminal 2 - frontend**
```
cd frontend
copy .env.example .env
npm install
npm start
```
Opens http://localhost:3000 in your browser. `copy .env.example .env` and `npm install` are only needed the first time.
On Mac use `cp` instead of `copy`.

## Test accounts
- Admin: kim@test.com / password123
- Volunteer and organization accounts: create one on the Sign Up page. Organization accounts must be approved by the admin before they can post listings.

## Config
- `frontend/.env` holds the backend URL (`REACT_APP_API_BASE_URL`). Never commit this file.
- `backend/Backend/appsettings.json` has `AllowedOrigins`, the list of frontend URLs the backend accepts. Add the deployed frontend URL here when we go live.

## Contribution Guidelines
- **Branch Policy:** Do not push directly to `main`. Create a new branch for every feature.
- **Peer Review:** All code must be reviewed by at least one team member before merging.
- Do not commit `.db`, `.db-shm`, or `.db-wal` files.
