# Production deployment

## Project layout

- Frontend root: `frontend/` (React, Vite, TypeScript)
- Backend root: `Backend/` (Express 5, ES modules, Mongoose)
- Frontend build: `npm run build`, output `dist/`
- Local backend entry: `Backend/server.js`
- MongoDB connection: `Backend/src/db/db.js`
- Express app and API mounts: `Backend/src/temp.js`
- Product, auth, order, notification, and admin routes are mounted under `/api`.
- Image upload uses `Backend/services/storage.service.js` and ImageKit's private key.

The Express app is exported for Vercel and also starts a normal listener for local or persistent-server deployments. There is no Socket.IO dependency; admin notifications poll the API. MongoDB connections are reused within warm function instances and the serverless connection attempt is bounded.

## Create two Vercel projects

Import the same GitHub repository twice. Deploy the frontend and backend as separate Vercel projects so they can have separate build roots and environment variables.

### Frontend project

1. Select **Root Directory** `frontend`.
2. Select Vite if Vercel asks for a framework.
3. Use build command `npm run build` and output directory `dist`.
4. Add `VITE_API_URL` with the full backend API base URL, for example `https://your-backend.vercel.app/api`.
5. Deploy. `frontend/vercel.json` contains the build/output settings and an SPA fallback for React Router routes.

`VITE_API_URL` is embedded during the Vite build. Redeploy after changing it. The application already reads this variable in `frontend/src/api/client.ts`; it does not fall back to a localhost API.

### Backend project

1. Create a second Vercel project from the same repository.
2. Select **Root Directory** `Backend`.
3. Use Node.js 22.x. `Backend/server.js` exports the Express app for Vercel. The existing Express routes preserve their `/api/...` paths.
4. Add the backend environment variables listed below to Production and Preview as appropriate.
5. Deploy. Verify `https://your-backend.vercel.app/api/health` returns `{"status":"ok"}`.

The backend uses serverless-compatible request handling, MongoDB Atlas, and outbound ImageKit requests. It does not keep a listening socket or use Socket.IO. Atlas supports the replica-set transactions used when placing and cancelling orders.

## Environment variables

Set these in the backend Vercel project's Settings → Environment Variables. Do not put secret values in GitHub or in `VITE_` variables.

| Variable | Required | Purpose |
|---|---:|---|
| `MONGO_URI` | Yes | MongoDB Atlas connection string for the production database. URL-encode special characters in credentials. |
| `JWT_SECRET` | Yes | Long, random secret used to sign and verify auth tokens. |
| `FRONTEND_URL` | Yes | Exact frontend origin, such as `https://your-shop.vercel.app`; comma-separate additional production/custom origins. |
| `IMAGEKIT_PRIVATE_KEY` | For image uploads | Server-side ImageKit private key. Never expose this to the browser. |
| `PORT` | No | Used by the local server; Vercel supplies its own runtime. |
| `NODE_ENV` | No | Vercel sets this for deployments. Production CORS requires `FRONTEND_URL`. |

Set `VITE_API_URL` only in the frontend project, using the backend URL with `/api` appended. The current backend upload code needs `IMAGEKIT_PRIVATE_KEY`; it does not consume an ImageKit public key or URL endpoint. Those are only needed if you later add a browser-side ImageKit SDK flow. Product images already saved as ImageKit URLs require no additional frontend ImageKit variables.

For Vercel Preview deployments, set a Preview `FRONTEND_URL` that matches the preview origin being tested. CORS checks the origin exactly. If you have a custom domain, include it as another comma-separated origin.

For local development, copy `Backend/.env.example` to `Backend/.env` and `frontend/.env.example` to `frontend/.env`. Replace sample values locally; the ignore rules exclude the resulting `.env` files.

## MongoDB Atlas network access

1. In Atlas, create a database user with only the permissions the app needs and use a strong unique password.
2. Add the database to `MONGO_URI` as a MongoDB SRV URI and include the production database name.
3. In Atlas Network Access, allow the backend's outbound address. Vercel Static IP egress (Pro/Enterprise) can be used to add stable IPs to the Atlas allowlist. Without a stable egress IP, Vercel function addresses can change; avoid leaving `0.0.0.0/0` enabled unless you explicitly accept that broader exposure. Consider a backend host with supported fixed egress if the current plan cannot provide it.
4. Confirm the Atlas cluster is running and the database user has access to the selected database.

The deployment uses a MongoDB connection pool with a bounded serverless selection timeout. A successful local Atlas connection does not prove that the Vercel deployment can reach Atlas; validate from the deployed backend and its runtime logs.

## GitHub and secrets

The repository root `.gitignore` excludes `.env` files, dependencies, build output, and `.vercel` metadata while allowing `.env.example` templates. Before pushing, run `git status` and confirm no real `.env` file or credentials are staged. If a secret was ever committed, rotate it even after removing the file from the latest revision.

## Post-deployment smoke test

Use the deployed URLs and test both roles:

1. Load the home page and switch themes; refresh a nested route such as `/products` to confirm SPA fallback.
2. Confirm products load and ImageKit URLs display.
3. Sign up and log in; confirm the browser sends requests to the deployed API and no CORS error appears.
4. Add a product as a guest and as a signed-in customer; check the admin Notifications page for merged cart activity.
5. Place an order and confirm its total uses current database prices.
6. As an admin, check the order and new-order notification, then change its status.
7. As the customer, open **My orders** and confirm the status updates.
8. As an admin, upload a product image and verify it appears from its ImageKit URL.
9. Refresh admin order, notification, and customer order routes directly; none should return a frontend 404.

The source can be built and linted locally, and Atlas connectivity can be tested locally, but deployed CORS, Vercel egress, live authentication, and browser behavior must be checked after both Vercel projects are deployed.
