# CSE485-BetterLTC
ASU CSE485 Spring 2026 Capstone Project - BetterLTC

## What you need installed
- .NET 10 SDK
- Node.js 18 or newer
- Docker Desktop, for the local PostgreSQL database (or PostgreSQL 18 installed another way)

## Run it locally
Start the database once from the repository root. It keeps running in the background and keeps its data between restarts.
```
docker compose up -d
```
If another PostgreSQL already uses port 5432, stop it or change the port in both `docker-compose.yml` and `backend/Backend/appsettings.Development.json`.

Then open two terminals.

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
Opens http://localhost:3000 in your browser. `copy .env.example .env` and `npm install` are only needed the first time.
On Mac use `cp` instead of `copy`.

## Test accounts
- Admin, local only: kim@test.com / password123, set in `backend/Backend/appsettings.Development.json`. On Azure the admin comes from the `Admin__Email` and `Admin__Password` app settings, see below.
- Volunteer and organization accounts: create one on the Sign Up page. Organization accounts must be approved by the admin before they can post listings.

## Config
- `frontend/.env` holds the backend URL (`REACT_APP_API_BASE_URL`). Never commit this file.
- `backend/Backend/appsettings.json` has `AllowedOrigins`, the list of frontend URLs the backend accepts. On Azure this is overridden by app settings, see below.
- `backend/Backend/appsettings.Development.json` has the local database connection string (`ConnectionStrings:Database`). On Azure it comes from the `ConnectionStrings__Database` app setting.
- Sign-in returns a JWT that the frontend sends as `Authorization: Bearer <token>`. `Jwt__Key` sets the signing key (at least 32 characters). Without it the backend makes a random key at startup, so everyone has to sign in again after a restart.

## Test deployment on Azure

| | URL |
|---|---|
| Site | https://betterltc-test-web.azurewebsites.net |
| API | https://betterltc-test-api.azurewebsites.net |

This is a test environment on a personal Azure for Students subscription. Everything runs on the Free (F1) tier, so it costs nothing.

Things to know before you demo it:
- The first visit after 20 minutes of no traffic takes 10 to 20 seconds while the server wakes up.
- The database is Azure Database for PostgreSQL (Flexible Server, Burstable B1ms), so accounts and listings are kept when the API restarts or is redeployed.
- Passwords are hashed with BCrypt and never returned by the API.
- The Free tier allows 60 CPU minutes per day, shared by the site and the API.

### One-time setup (already done, listed so it can be repeated on another subscription)

Install the Azure CLI and sign in. On a university account the default sign-in window can fail, so switch to browser sign-in first.

```
winget install -e --id Microsoft.AzureCLI
az config set core.enable_broker_on_windows=false
az login
```

Student subscriptions only allow a few regions. Check which ones before creating anything:

```
az policy assignment list --query "[?contains(displayName, 'egion')].parameters.listOfAllowedLocations.value" -o json
```

Create the resource group, the free Linux plan, and the two web apps. App names must be unique across all of Azure.

```
az group create --name betterltc-test-rg --location canadacentral
az appservice plan create --name betterltc-test-plan --resource-group betterltc-test-rg --location canadacentral --sku F1 --is-linux
az webapp create --name betterltc-test-api --resource-group betterltc-test-rg --plan betterltc-test-plan --runtime "DOTNETCORE:10.0"
az webapp create --name betterltc-test-web --resource-group betterltc-test-rg --plan betterltc-test-plan --runtime "NODE:22-lts"
```

Create the PostgreSQL server. `--public-access 0.0.0.0` lets other Azure services, including the API, connect. Pick your own admin password; it never goes in the repository.

```
az postgres flexible-server create --name betterltc-test-db --resource-group betterltc-test-rg --location canadacentral --tier Burstable --sku-name Standard_B1ms --storage-size 32 --version 18 --admin-user betterltcadmin --admin-password <database password> --public-access 0.0.0.0
```

Backend settings. `ConnectionStrings__Database` points the API at the server; the `betterltc` database and its tables are created on the first start. `AllowedOrigins` is the list of frontend URLs the API accepts.

```
az webapp config appsettings set --name betterltc-test-api --resource-group betterltc-test-rg --settings "ConnectionStrings__Database=Host=betterltc-test-db.postgres.database.azure.com;Database=betterltc;Username=betterltcadmin;Password=<database password>;Ssl Mode=Require" "AllowedOrigins__0=https://betterltc-test-web.azurewebsites.net" "AllowedOrigins__1=http://localhost:3000"
```

Admin account and token key. Pick your own values; they never go in the repository.

```
az webapp config appsettings set --name betterltc-test-api --resource-group betterltc-test-rg --settings "Admin__Email=<admin email>" "Admin__Password=<admin password>" "Jwt__Key=<random string of 32 or more characters>"
```

Frontend setting. The site is a folder of static files, so tell the Node container to serve them. `--spa` makes page refreshes on routes like `/about/team` work.

```
az webapp config set --name betterltc-test-web --resource-group betterltc-test-rg --startup-file "pm2 serve /home/site/wwwroot --no-daemon --spa"
```

### Deploy the backend

Run from the repository root in PowerShell. The publish folder and zip are created outside the repository so they cannot be committed by accident.

```
dotnet publish backend/Backend -c Release -o ../betterltc-publish
Compress-Archive -Path ../betterltc-publish/* -DestinationPath ../betterltc-api.zip -Force
az webapp deploy --name betterltc-test-api --resource-group betterltc-test-rg --src-path ../betterltc-api.zip --type zip
```

Check it: https://betterltc-test-api.azurewebsites.net/ should answer `Hello World!` and `/api/listings` should answer `[]`.

### Deploy the frontend

The API URL is baked in at build time, so set it in the same terminal right before building. Your local `.env` is not changed.

```
cd frontend
$env:REACT_APP_API_BASE_URL="https://betterltc-test-api.azurewebsites.net"
npm run build
Compress-Archive -Path build/* -DestinationPath ../../betterltc-web.zip -Force
az webapp deploy --name betterltc-test-web --resource-group betterltc-test-rg --src-path ../../betterltc-web.zip --type zip
```

The full build is about 85 MB because of the hero video and photos. When only code changed, upload just the code and keep the media that is already on the server:

```
cd build
Compress-Archive -Path index.html, asset-manifest.json, static -DestinationPath ../../../betterltc-web-update.zip -Force
az webapp deploy --name betterltc-test-web --resource-group betterltc-test-rg --src-path ../../../betterltc-web-update.zip --type zip --clean false
```

### After every deploy, check these by hand

1. Open the site. The homepage loads with the hero photo.
2. Sign up as a volunteer. You land on Sign In with a green success message.
3. Sign up again with the same email. The form shows "This email is already registered."
4. Sign in as that volunteer. You land on the dashboard.
5. Sign up as an organization, then sign in as the admin and approve it under Organizations.
6. Sign in as the organization. Add a listing with title, category, and location. Saving with those empty is blocked.
7. Sign out. The listing shows on Volunteer and under Recent opportunities on the homepage. Searching for a word in its title finds it.
8. Press F12, open the Network tab, reload. Every `/api/` request goes to `betterltc-test-api.azurewebsites.net`. None go to `localhost`.
9. Restart the API in the Azure portal. The volunteer from step 2 can still sign in and the listing from step 6 is still there.

### Troubleshooting

- **Pages load but lists are empty and sign up says "Unable to reach the server".** The frontend was built without `REACT_APP_API_BASE_URL`, so it is calling `localhost`. Rebuild with the variable set.
- **Browser console shows a CORS error.** The frontend URL is missing from `AllowedOrigins` on the API. The API restarts after a settings change, which takes about 30 seconds.
- **`az staticwebapp create` is refused.** Azure Static Web Apps only exists in regions the student policy blocks. That is why the frontend runs as a second App Service. On a subscription without the region policy, a Static Web App on the Free tier is the better home for the frontend.
- **The API does not start and the log says the database connection string is null.** The `ConnectionStrings__Database` app setting is missing.
- **The API log shows a timeout connecting to PostgreSQL.** In the database server's Networking page, turn on "Allow public access from any Azure service within Azure to this server".
- **Logs:** `az webapp log tail --name betterltc-test-api --resource-group betterltc-test-rg`

### Remove everything

```
az group delete --name betterltc-test-rg
```

## Contribution Guidelines
- **Branch Policy:** Do not push directly to `main`. Create a new branch for every feature.
- **Peer Review:** All code must be reviewed by at least one team member before merging.
- Do not commit `.db`, `.db-shm`, or `.db-wal` files.
