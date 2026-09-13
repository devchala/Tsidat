# EcoTrack Admin Dashboard

This is the production-ready frontend for the EcoTrack Admin Dashboard. It's built with React, Tailwind CSS, and Vite.

## 🚀 Getting Started

To run the application locally:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

The application will be accessible at `http://localhost:5173`. 
Use the following credentials to test the authentication flow:
- **Email**: admin@ecotrack.local
- **Password**: admin

## 📁 Project Structure

```text
src/
├── components/     # Reusable UI components (Buttons, Badges, etc.)
├── context/        # React Context providers (Auth context)
├── layouts/        # Application layouts (Main sidebar + header wrapper)
├── mock/           # Mock data used for frontend testing
├── pages/          # Individual route pages (Dashboard, Reports, Workers, etc.)
├── services/       # API abstraction layer (Replace mock calls with real fetch/axios here)
├── utils/          # Helper functions (e.g., Tailwind class merger)
├── App.jsx         # Main router and route definitions
└── main.jsx        # React entry point
```

## 🔌 Connecting to the Backend

This application is completely API-ready. It currently uses simulated delays and mock data located in `src/mock/data.js`.

To connect the real Node.js/Express backend, follow these steps:

1. Open `src/services/api.js`.
2. Replace the simulated `async/await delay()` functions with actual HTTP calls using `fetch` or `axios`.
3. Example integration:

```javascript
// Change this:
async getReports() {
  await delay();
  return mockReports;
}

// To this:
async getReports() {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/reports`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('ecotrack_token')}` }
  });
  return response.data;
}
```

### Expected API Endpoints

The frontend is designed around these logical endpoints:

- `POST /api/auth/login` (Authentication)
- `GET /api/admin/dashboard` (Dashboard stats)
- `GET /api/admin/reports` (List all reports)
- `GET /api/admin/reports/:id` (Get report details)
- `PATCH /api/admin/reports/:id/status` (Update report status)
- `GET /api/admin/workers` (List workers)
- `PATCH /api/admin/workers/:id/approve` (Approve worker)
- `GET /api/admin/assignments` (Task tracking)

### Environment Variables

When deploying, create a `.env` file at the root:

```env
VITE_API_BASE_URL=https://api.ecotrack-app.com/api
```

## 🔐 Authentication & Security

- JWT token is expected upon successful login.
- It is currently stored in `localStorage` as `ecotrack_token`.
- `AuthContext.jsx` handles providing user context and protected routes wrapper (`<ProtectedRoute>`).
- If an API returns `401 Unauthorized`, the interceptor (to be added in `api.js`) should automatically call `logout()` and redirect to `/login`.
