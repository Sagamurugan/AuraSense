# AuraSense

AuraSense is a privacy-first, real-time focus, fatigue, posture, and attention monitoring platform built with React, Vite, Tailwind CSS, MediaPipe Face Mesh, and a lightweight local Node server. The app is designed to be final-year-project ready: it has a modular SaaS-style UI, live webcam analytics, historical reporting, JWT-based local authentication, and optional Gemini coaching.

## Project positioning

Suggested title for your final-year project:

**AuraSense: A Privacy-First Real-Time Focus and Fatigue Monitoring Platform Using Facial Landmark Analytics**

Suggested one-line summary:

**AuraSense uses on-device computer vision and intelligent analytics to monitor focus, fatigue, posture, attention, and drowsiness in real time without relying on paid APIs or cloud-based vision inference.**

## Core features

- Real-time MediaPipe Face Mesh monitoring
- Blink detection with adaptive scoring improvements
- Focus score, fatigue score, posture score, and attention score
- Face-away detection, distraction events, and confidence-aware telemetry
- Predictive signals:
  - head stability
  - gaze drift
  - eye-closure risk
  - yawn events
  - drowsiness risk
- Session timer and session history
- Dashboard charts and historical summaries
- Exportable analytics and printable reporting
- Floating AI support widget
- Optional Gemini-powered live coaching
- JWT-based local login/register flow
- Responsive multi-view dashboard shell

## Tech stack

- Frontend: React 19, Vite, Tailwind CSS 4
- Realtime analysis: MediaPipe Face Mesh
- Charts: Chart.js + react-chartjs-2
- Backend: local Node HTTP server
- Auth: local JWT implementation
- Storage:
  - browser session/history storage
  - local user file for auth: `server/users.json`

## Folder structure

```text
server/
  geminiServer.js
src/
  App.jsx
  main.jsx
  index.css
  components/
    AssistantPanel.jsx
    AuthScreen.jsx
    CameraPanel.jsx
    Dashboard.jsx
    DebugPanel.jsx
    ErrorBoundary.jsx
    ExportPanel.jsx
    HomeOverview.jsx
    InsightsPanel.jsx
    Navbar.jsx
    SessionHistory.jsx
    SessionReportModal.jsx
    SettingsPanel.jsx
    Sidebar.jsx
    StatsPanel.jsx
  hooks/
    useAuth.js
    useFaceMesh.js
    useGeminiCoach.js
    useSessionAnalytics.js
    useSessionStorage.js
    useUserSettings.js
  utils/
    analytics.js
    assistant.js
    export.js
    scoring.js
    sessionSchema.js
    storage.js
```

## Run modes

### 1. Development mode

Use this while actively editing the UI.

```bash
npm install
npm run server
npm run dev
```

Open:

- Frontend app: `http://localhost:5173`
- Local API server: `http://localhost:8787`

### 2. Showcase / final demo mode

Use this when you want the built frontend and backend to run as one service.

```bash
npm install
npm run build
npm run start
```

Then open:

- `http://localhost:8787`

In this mode, the Node server serves the built frontend from `dist/` and also handles:

- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me`
- `/api/coach`
- `/api/health`

## Environment setup

Create a local `.env` from `.env.example`.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_PORT=8787
JWT_SECRET=replace_with_a_long_local_secret
FRONTEND_ORIGIN=http://localhost:5173
REGISTRATION_ENABLED=true
DEMO_AUTH_ENABLED=false
DEMO_USER_NAME=AuraSense Demo
DEMO_USER_EMAIL=demo@aurasense.app
DEMO_USER_PASSWORD=Demo@123
VITE_API_BASE_URL=
```

Notes:

- `JWT_SECRET` should be set for any real showcase/demo use.
- `VITE_API_BASE_URL` can stay blank for local same-origin usage.
- `FRONTEND_ORIGIN` should be your Vercel frontend URL when deploying the backend on Render.
- For public demo deployment, prefer `REGISTRATION_ENABLED=false` and `DEMO_AUTH_ENABLED=true`.
- Gemini is optional; the app still works without it using the local fallback assistant.

## Deployment notes

For your final-year showcase, the safest and easiest path is:

1. build the frontend
2. run the Node server
3. demo the whole app from one URL

Recommended local showcase command flow:

```bash
npm run build
npm run start
```

The local server now:

- serves the built frontend if `dist/` exists
- provides a helpful root page if the frontend is not built yet
- protects Gemini coaching behind JWT auth
- applies simple request throttling to auth and coach endpoints
- adds basic security headers for demo readiness

## Recommended deployment split

For your final-year showcase, the best split is:

- **Frontend:** Vercel
- **Backend:** Render

Why:

- Vercel is excellent for React/Vite frontend hosting and gives you a polished public URL.
- Render is simple for the Node backend that handles auth and Gemini.
- This separation looks more professional in a portfolio and keeps the Gemini key off the frontend.

### Vercel frontend setup

Files added:

- `vercel.json`

Set this environment variable in Vercel:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

Deploy the frontend with:

```bash
npm run build
```

### Render backend setup

Files added:

- `render.yaml`

Set these environment variables in Render:

```env
GEMINI_API_KEY=your_real_key
JWT_SECRET=your_long_secret
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
REGISTRATION_ENABLED=false
DEMO_AUTH_ENABLED=true
DEMO_USER_NAME=AuraSense Demo
DEMO_USER_EMAIL=demo@aurasense.app
DEMO_USER_PASSWORD=your_demo_password
```

Recommended Render mode for demo:

- disable registration
- enable one demo account

That avoids relying on `server/users.json` persistence in a free deployment.

## Security and privacy model

What is local:

- webcam processing
- MediaPipe face landmark analysis
- session analytics
- session history
- local auth user file

What can be external:

- Gemini coaching requests only, if `GEMINI_API_KEY` is configured

Important privacy statement for your report/demo:

**AuraSense performs facial landmark analysis locally in the browser. Optional LLM coaching sends only summarized analytics context to Gemini, not raw webcam frames.**

## Final-year-project demo checklist

Before demo day, verify:

1. camera permissions are allowed in the browser
2. `npm run build` completes successfully
3. `npm run start` launches the built app on `http://localhost:8787`
4. login/register works
5. live webcam tracking starts after login
6. one session can be recorded end to end
7. dashboard charts and history update after session stop
8. export flow works
9. Gemini coach works if your API key is present
10. fallback assistant still works if Gemini is unavailable

## Suggested report sections

For your project report, you can use:

1. Problem statement
2. Motivation
3. Existing system limitations
4. Proposed system
5. System architecture
6. Technologies used
7. Realtime prediction methodology
8. Authentication and privacy design
9. Dashboard and reporting workflow
10. Experimental observations
11. Limitations
12. Future scope

## Suggested resume bullets

- Built a privacy-first real-time focus and fatigue monitoring platform using React, Vite, Tailwind CSS, MediaPipe Face Mesh, and a local Node server.
- Designed a responsive SaaS-style analytics dashboard with live webcam telemetry, session history, predictive signals, and exportable reports.
- Implemented JWT-based local authentication and secure Gemini-assisted coaching without exposing API keys to the frontend.
- Engineered adaptive scoring for blink, fatigue, posture, attention, drowsiness, and distraction monitoring in the browser.

## Important notes

- The app is strong for final-year project submission and demo use.
- It is not yet a medically validated fatigue system.
- The JWT/auth layer is appropriate for local showcase use, not enterprise production.
- If you pasted your Gemini key into chat or shared screenshots of it, rotate that key before public deployment.

## Verification

Use these commands before submission:

```bash
npm run lint
npm run build
```

## Main files to explain in viva

- `src/App.jsx`: application shell, navigation, search, auth-gated workspace composition
- `src/hooks/useFaceMesh.js`: camera loop and realtime landmark processing
- `src/utils/scoring.js`: predictive scoring logic
- `src/hooks/useSessionAnalytics.js`: session lifecycle and trend capture
- `server/geminiServer.js`: auth, local API, Gemini proxy, built-app serving
- `src/hooks/useAuth.js`: local JWT auth handling

## Future scope

- installable PWA mode
- IndexedDB-backed long-term history
- stronger gesture or head-orientation modeling
- full command palette search
- cloud database and multi-user accounts
- automated test coverage
