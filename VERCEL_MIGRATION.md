# Vercel Migration Guide

## Recommended Approach

Use two Vercel projects from this same monorepo:

- `planet-mini-api`: backend project, Root Directory `server`
- `planet-mini-client`: frontend project, Root Directory `client`

This keeps deployments, environment variables, logs, rollbacks, and domains separated. The root package/build can stay for local legacy checks, but Vercel should not deploy from the repo root.

## Final Folder Ownership

```txt
planet-mini/
├── client/              # Vercel frontend project
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.js
│   ├── vercel.json
│   └── .env.example
├── server/              # Vercel backend project
│   ├── api/index.ts
│   ├── routes/
│   ├── models/
│   ├── lib/
│   ├── index.ts
│   ├── db.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json
│   └── .env.example
├── shared/              # Shared route constants, schemas, stock helpers
├── package.json         # Local/legacy root build only, not Vercel
└── .env.example         # Local/legacy reference
```

Do not deploy the root directory to Vercel. The old root `vercel.json` and root `api/` function were removed.

## Shared Code Rule

`shared/` is kept at the repo root because both frontend and backend use it. Keep shared files browser-safe:

- OK: types, Zod schemas, route constants, pure stock helpers
- Avoid: `process.env`, filesystem, database clients, server secrets, Node-only APIs

The frontend uses `@shared/*` through `client/vite.config.ts`. The backend imports shared files by relative path for safer Vercel function bundling.

## Vercel Dashboard Settings

Backend:

```txt
Project name: planet-mini-api
Root Directory: server
Framework Preset: Other
Build Command: empty
Output Directory: empty
Install Command: npm install
```

Frontend:

```txt
Project name: planet-mini-client
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Backend Environment Variables

Set these on `planet-mini-api`:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
DATABASE_URL=mongodb+srv://...
JWT_SECRET=...
SESSION_SECRET=...
FRONTEND_URL=https://planet-mini-client.vercel.app
CLIENT_URL=https://planet-mini-client.vercel.app
BACKEND_URL=https://planet-mini-api.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

## Frontend Environment Variables

Set these on `planet-mini-client`:

```env
VITE_API_URL=https://planet-mini-api.vercel.app
VITE_RAZORPAY_KEY_ID=rzp_live_...
```

Only `VITE_*` variables are safe for the frontend.

## Deployment Order

1. Deploy `planet-mini-api` first.
2. Test `https://planet-mini-api.vercel.app/api/health`.
3. Add the backend URL to the frontend project as `VITE_API_URL`.
4. Deploy `planet-mini-client`.
5. Test product listing, auth, cart/profile/order APIs, admin flows, and uploads.
6. Add custom domains after both projects work:
   - `api.yourdomain.com` -> backend
   - `www.yourdomain.com` or `yourdomain.com` -> frontend
7. Update `FRONTEND_URL`, `CLIENT_URL`, `BACKEND_URL`, `VITE_API_URL`, and Google OAuth redirect URIs to the custom domains.

## Uploads

Do not store uploads on Vercel disk. Current multer upload uses memory storage and is limited to 4 MB. For larger product images, prefer:

1. Frontend requests `/api/upload/signature`.
2. Frontend uploads directly to Cloudinary.
3. Backend stores the returned Cloudinary URL/public ID in MongoDB.

## Bundle Warning

The frontend currently has a large JS chunk warning. Do not block deployment on it. Practical follow-ups:

- Lazy-load admin pages.
- Lazy-load product detail heavy UI.
- Split animation/payment libraries with dynamic imports.
- Review unused UI libraries later.
