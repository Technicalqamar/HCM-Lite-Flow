# HCM Lite

HCM Lite is a React/Vite frontend backed by a single Express API and MongoDB database.

## Project layout

```text
frontend/  React application, Vite configuration, frontend tests
backend/   Express API, MongoDB models/configuration, services, middleware, backend tests
README.md  Setup and operational instructions
package.json  Root-level commands for both applications
```

## Configuration

Copy `backend/.env.example` to `backend/.env` and provide the MongoDB Atlas URI and strong JWT secrets. The backend loads this file by its location, regardless of the shell's working directory. It does not fall back to a local or in-memory database.

The database name is read from the path component of `MONGODB_URI`. The current configured URI points to `hcm_lite`. If `MONGODB_DATABASE` is set, it must match that URI database name; startup fails if the settings disagree. Connection logs include the effective database name but never the URI.

Face attendance requires a separate `FACE_ENCRYPTION_KEY`: generate 32 random bytes and encode them as 64 hexadecimal characters. Keep this key stable and private; losing or rotating it makes existing face templates unreadable and requires re-enrollment. `FACE_MATCH_THRESHOLD` controls the face-descriptor distance (default `0.48`; supported range `0.35`–`0.6`).

`frontend/.env.example` sets the development API base URL to `/api`. Vite proxies that path to `http://localhost:5000`. For a separately hosted production frontend, set `VITE_API_BASE_URL` at build time to the deployed API's base URL (including `/api`).

## Run locally

Install dependencies in each application folder:

```powershell
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
```

Start each process from the project root in a separate terminal:

```powershell
npm.cmd run dev:backend
npm.cmd run dev:frontend
```

The API listens on port `5000`; the frontend listens on port `3000`. The frontend uses the Vite `/api` proxy during development.

For production, build the frontend and start the backend:

```powershell
npm.cmd run build
npm.cmd start
```

Deploy the frontend build as static files and configure its `VITE_API_BASE_URL` to the API URL. The backend does not serve a second frontend or start a Vite server.

## Tests

Run the focused automated suites from the root:

```powershell
npm.cmd test
```

Without `MONGODB_TEST_URI`, backend route/business tests use an isolated, memory-only test adapter and do not connect to MongoDB or modify existing database records. A successful run without this variable does not verify Atlas availability or persistence.

To run the full backend end-to-end and persistence suite against MongoDB safely, set `MONGODB_TEST_URI` to an Atlas/local cluster connection string with permission to create a database and delete its test records, then run `npm.cmd --prefix backend test`. The test preloader generates a new, uniquely named `hcm_test_<id>` database (under MongoDB's database-name length limit) for each test worker. It exercises API workflows and verifies CRUD data remains after reconnecting, then removes test records. It never uses the `MONGODB_URI` application database for test writes.

## Security and data

- Keep `backend/.env` out of version control and replace the example JWT values with independently generated secrets.
- Use a MongoDB account with least-privilege access and a network allowlist.
- Admin-only source archive downloads exclude `.env` files, local test data, build output, and dependencies.
- MongoDB is the sole production persistence layer. The in-memory model adapter is enabled only for automated tests.

## Face registration and attendance

Admin and HR users can register an employee from the Employees Directory after the employee has received the notice and consented. Registration takes three clear camera captures and stores only an encrypted face embedding in MongoDB's `face_templates` collection; it does not upload or retain camera images/video. An explicit **Re-enroll** action replaces the template, and **Delete face template** removes it. Both are available to Admin/HR users in the directory.

Employees can choose face-verified check-in/check-out in Attendance. The browser runs the pinned `@vladmandic/face-api` detector and recognition model locally; its model weights are copied from the installed dependency to the ignored `frontend/public/models/` directory by the frontend `predev` and `prebuild` scripts. Face check-in requires a real camera capture, location permission, the configured office geofence, and a server-side match against the employee linked to the authenticated account. The API never trusts a client-supplied `faceVerified` flag. Existing manual web attendance remains available.

Camera and geolocation use require HTTPS outside localhost and explicit browser permission. Face recognition alone does not provide liveness/anti-spoof detection; do not treat it as a standalone authentication factor or deploy it as a high-assurance control without an independently assessed liveness solution and applicable biometric/privacy review.
