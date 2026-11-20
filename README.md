# VolunteerConnect Saskatchewan

A bilingual (English and French) website that connects volunteers with community organizations across Saskatchewan. Built by Team BetterLTC (ASU CSE485 capstone) for Golden Health Care.

| | |
|---|---|
| Website | https://volunteerconnect-sk-web-hqdwbeaxe0g0fndk.canadaeast-01.azurewebsites.net |
| Website (custom domain, after the registration is complete) | https://saskvolunteerhub.ca |
| API | https://volunteerconnect-sk-api-bgdrfge9ehg3hua4.canadaeast-01.azurewebsites.net |

## Handover checklist

- [x] [Summary and intended use](#summary-and-intended-use)
- [x] [Installation instructions](#run-it-locally) and [technical documentation](#technical-documentation)
- [x] [Library and tool versions](#versions)
- [x] [User guide](#user-guide)
- [x] [Hosting and deployment](#hosting-and-deployment)
- [x] [Maintenance notes](#maintenance-notes) and [support contacts](#support-contacts)

## Summary and intended use

Volunteers use the site to find local organizations by area of focus and city, read their profiles, and send an Express Interest message for a volunteer role. Organizations create a profile, list the roles they need, and are reviewed by an admin before they appear publicly. The admin (Golden Health Care) approves organizations and manages the site content.

## Technical documentation

```
React frontend  <->  ASP.NET Core API  <->  PostgreSQL database
                          |
                          +-> Azure Communication Services (email)
```

All parts run in Golden Health Care's Microsoft Azure account. GitHub Actions builds every change and deploys it when it is merged into `main`.

| Folder or file | What is inside |
|---|---|
| `backend/Backend/Program.cs` | Starts the API: reads settings, updates the database, creates the first admin account |
| `backend/Backend/Controllers` | API endpoints, one file per area (Auth, Volunteer, Organization, Interest, Resource, Faq, Testimonial, TeamMember, OurWork, Statistics) |
| `backend/Backend/Models` | Data structures and the database context (`AppDbContext.cs`) |
| `backend/Backend/Migrations` | Database changes, applied automatically when the API starts |
| `backend/Backend/Security` | Password hashing, sign-in tokens, email verification, password reset |
| `backend/Backend/Email` | Email sending and the English/French email texts |
| `backend/Backend/Files` | Upload checks, and the starter resources and FAQs for a new database |
| `frontend/src` | Pages and components |
| `frontend/src/locales` | All website text in English (`en`) and French (`fr`) |
| `frontend/src/hiddenPages.js` | Pages hidden until they have content (Our Work, Our History) |
| `.github/workflows` | `backend.yml` and `frontend.yml`: build, test and deploy |
| `docker-compose.yml` | Local PostgreSQL database for development |

## Versions

| Tool | Version |
|---|---|
| .NET SDK | 10.0 |
| Node.js | 20 or newer (24 LTS runs on Azure) |
| PostgreSQL | 18 |

| Library | Version | Used for |
|---|---|---|
| react, react-dom | 19.2.4 | Pages |
| react-router-dom | 6.8.0 | Page addresses |
| react-scripts | 5.0.1 | Build and tests |
| i18next, react-i18next | 23.16.8, 15.0.0 | English and French text |
| @tiptap | 3.22.3 | Text editor for admin content |
| swiper | 12.1.3 | Slideshows |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 | Database access |
| Microsoft.EntityFrameworkCore.Design | 10.0.5 | Database migrations |
| Microsoft.AspNetCore.Authentication.JwtBearer | 10.0.5 | Sign-in tokens |
| BCrypt.Net-Next | 4.0.3 | Password hashing |
| Azure.Communication.Email | 1.1.0 | Sending email |

Frontend versions are minimums from `frontend/package.json`; the exact installed versions are locked in `frontend/package-lock.json`.

## Run it locally

You need the .NET 10 SDK, Node.js 20 or newer, and Docker Desktop (or PostgreSQL 18 installed another way).

Start the database once from the repository root. It keeps running in the background and keeps its data between restarts.
```
docker compose up -d
```
If another PostgreSQL already uses port 5432, stop it or change the port in both `docker-compose.yml` and `backend/Backend/appsettings.Development.json`.

**Terminal 1 - backend**
```
cd backend/Backend
dotnet run
```
Runs at http://localhost:5184. The database and its tables are created automatically on first run.

**Terminal 2 - frontend**
```
cd frontend
copy .env.example .env
npm install
npm start
```
Opens http://localhost:3000. `copy .env.example .env` and `npm install` are only needed the first time. On Mac use `cp` instead of `copy`.

**Tests**
```
cd frontend
npm test
```

**Local test accounts**
- Admin, local only: kim@test.com / password123, set in `backend/Backend/appsettings.Development.json`. When the database has no admin yet, the backend creates the first one from these settings on startup.
- Volunteer and organization accounts: create one on the Sign Up page. New accounts must confirm their email, but locally no email service is set up, so emails are skipped. To sign in with a local test account, mark it as confirmed:
```
docker compose exec db psql -U postgres -d betterltc -c "UPDATE \"Volunteers\" SET \"EmailVerified\" = true; UPDATE \"Organizations\" SET \"EmailVerified\" = true;"
```

## Hosting and deployment

Everything is in the resource group `volunteerconnect-rg` in Golden Health Care's Azure account.

| Azure resource | What it is | Region | Size |
|---|---|---|---|
| `volunteerconnect-plan` | App Service plan for both web apps | Canada East | Basic B1, Linux |
| `volunteerconnect-sk-web` | Frontend web app (Node 24) | Canada East | Uses the plan |
| `volunteerconnect-sk-api` | API web app (.NET 10) | Canada East | Uses the plan |
| `volunteerconnect-sk-db` | Azure Database for PostgreSQL flexible server (PostgreSQL 18) | Canada Central | Burstable B1ms, 32 GiB |
| `volunteerconnect-sk-comm` | Communication Service that sends email | Data in Canada | - |
| `volunteerconnect-sk-email` | Email Communication Service with an Azure managed sending domain | Data in Canada | - |

**Deploying a change:** merge a pull request into `main`. GitHub Actions builds and deploys the backend and frontend automatically. It uses the repository secrets `AZURE_API_PUBLISH_PROFILE` and `AZURE_WEB_PUBLISH_PROFILE` (each web app's publish profile, downloaded from its Overview page).

**API settings** (`volunteerconnect-sk-api` → Settings → Environment variables). Values are secret and never go in the repository.

| Setting | Purpose |
|---|---|
| `ConnectionStrings__Database` | `Host=volunteerconnect-sk-db.postgres.database.azure.com;Database=betterltc;Username=vcadmin;Password=<password>;Ssl Mode=Require` |
| `AllowedOrigins__0`, `__1`, ... | Website addresses allowed to use the API. Links in emails use these too. Add `https://saskvolunteerhub.ca` and `https://www.saskvolunteerhub.ca` when the domain is connected. |
| `Email__ConnectionString` | Connection string from `volunteerconnect-sk-comm` → Keys |
| `Email__Sender` | `DoNotReply@<azure managed domain>.azurecomm.net` |
| `Admin__Email`, `Admin__Password`, `Admin__FirstName` | Used once, to create the first admin when the database is empty |
| `Jwt__Key` | Sign-in token key, 32 or more characters. Changing it signs everyone out. |

**Frontend setting:** `volunteerconnect-sk-web` → Configuration → Stack settings → Startup command `pm2 serve /home/site/wwwroot --no-daemon --spa`. The API address is built into the frontend by `REACT_APP_API_BASE_URL` in `.github/workflows/frontend.yml`.

**Custom domain:** `saskvolunteerhub.ca` is registered at Canadian Web Hosting. To connect it, add the A, TXT (`asuid`), CNAME (`www`) and TXT (`asuid.www`) records shown in `volunteerconnect-sk-web` → Custom domains → Add custom domain, then validate and add it there with an App Service Managed Certificate.

**Database password:** if it changes (`volunteerconnect-sk-db` → Reset password), put the same password in `ConnectionStrings__Database`. If they do not match, the API cannot start.

## User guide

**Volunteers**
- Browse the organization directory and filter by area of focus, city, or intergenerational roles.
- Open an organization's profile to read about it and see the volunteer roles it offers.
- Send an Express Interest message; the organization gets an email with the volunteer's contact details.

**Organizations**
- Sign up and confirm the email address (the link works for 24 hours).
- Fill in the profile form, with an optional charity or nonprofit registration number, and list volunteer roles.
- Appear in the public directory after the admin approves the profile. If it is rejected, the reason is shown after signing in.

**Admin**
- Approve, reject or revoke organizations, and open Details to see every profile answer.
- Manage resources, FAQs, testimonials, team members and Our Work posts, and see site statistics.

**Everyone**
- Switch between English and French at the top of any page.
- Use Display to make text larger or change the contrast.
- Use Forgot password to get a reset link (it works for 1 hour).

## Maintenance notes

- Microsoft retires Azure Communication Services Email on September 30, 2028. Move email sending in `backend/Backend/Email` to another service before then.
- .NET 10 is supported until November 2028.
- `.github/workflows/frontend.yml` builds with Node.js 20, which is no longer supported. Change `node-version` to 24 at the next update.
- Azure backs up the database daily and keeps 7 days of backups (`volunteerconnect-sk-db` → Backup and restore).
- Errors from the API show in `volunteerconnect-sk-api` → Monitoring → Log stream.

## Support contacts

| Name | Role | Email |
|---|---|---|
| Kimberly Quam | Sponsor, Golden Health Care | kimberlyquam@goldenhealthcare.ca |
| Neha Dhanvanthry | Sponsor's technical contact | ndhanvanthry@uwaterloo.ca |
| Jooho Kim | BetterLTC developer, until December 31, 2026 | joohokim@asu.edu |
