# Streamify - Live Streaming Platform

A full-stack live streaming platform with subscription management, built with React/Next.js, Node.js/Express, and MongoDB.

## Features

- User authentication (JWT-based)
- Role-based access (Admin/User)
- Subscription management with 30-day cycles
- Admin approval workflow
- HLS video streaming support
- Dark mode support
- Fully responsive design

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB/Mongoose
- **Auth**: JWT, bcrypt
- **Streaming**: HLS.js

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### Default Admin Credentials
- Email: `admin@streamify.com`
- Password: `admin123`

## Deployment

### MongoDB Atlas (Database)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free M0 cluster
3. Add database user and whitelist IP (0.0.0.0/0 for all)
4. Get connection string

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Connect repository, select `backend` folder
4. Set environment variables:
   - `MONGODB_URI`: Your Atlas connection string
   - `JWT_SECRET`: Strong random string
   - `JWT_EXPIRE`: 7d
   - `NODE_ENV`: production
   - `FRONTEND_URL`: Your Vercel URL
5. Build command: `npm install`
6. Start command: `npm start`

### Frontend (Vercel)
1. Import project on [vercel.com](https://vercel.com)
2. Set root directory to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL + `/api`
4. Deploy

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/request-renewal` - Request subscription renewal

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List users (with filters)
- `PUT /api/admin/users/:id/approve` - Approve user
- `PUT /api/admin/users/:id/extend` - Extend subscription
- `PUT /api/admin/users/:id/expiry` - Set expiry date
- `PUT /api/admin/users/:id/deactivate` - Toggle user active status

### Streams
- `GET /api/streams/public/live` - Public live streams preview
- `GET /api/streams` - All streams (requires subscription)
- `GET /api/streams/:id` - Single stream
- `POST /api/streams` - Create stream (admin)
- `PUT /api/streams/:id` - Update stream (admin)
- `DELETE /api/streams/:id` - Delete stream (admin)

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers & cron jobs
│   │   └── server.js       # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages
│   │   ├── components/     # React components
│   │   ├── context/        # Auth & Theme providers
│   │   ├── lib/            # API client
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md
```

## License

MIT
