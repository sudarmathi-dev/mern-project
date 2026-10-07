# Threadline — Full-Stack Social Media App (MERN)

A production-oriented social media app: posts, likes, comments, follow system, real-time DM, and real-time notifications.

## Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT auth
- **Frontend:** React (Vite), React Router, Axios, Socket.io-client

## Project structure
```
social-media-app/
├── backend/
│   ├── config/         # DB connection
│   ├── controllers/     # Route handlers (auth, posts, users, messages, notifications)
│   ├── middleware/       # Auth guard, error handler
│   ├── models/           # User, Post, Message, Notification
│   ├── routes/            # Express routers
│   ├── utils/              # JWT helpers, socket manager, notification helper
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # Axios instance + endpoint wrappers
        ├── components/     # Reusable UI (PostCard, NavBar, FollowButton, etc.)
        ├── context/         # Auth + Socket React contexts
        ├── pages/            # Login, Signup, Feed, Profile, Inbox, ChatWindow
        └── App.jsx

```

## Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI (MongoDB Atlas) and JWT secrets
npm run dev             # starts on http://localhost:5000
```

## Frontend setup
```bash
cd frontend
npm install
cp .env.example .env   # points to backend API, defaults to localhost:5000
npm run dev             # starts on http://localhost:5173
```

## Features implemented
- **Auth** — signup/login, JWT access (15min) + refresh (7d) tokens in httpOnly cookies, auto-refresh on 401
- **Posts** — create, feed (paginated + infinite scroll), edit, like/unlike, comment, delete
- **Follow system** — follow/unfollow, profile pages with follower/following counts
- **Real-time DM** — Socket.io powered chat, inbox with unread counts, online status
- **Notifications** — real-time push for likes, comments, follows, and messages
- **Image uploads** — Cloudinary-backed uploads for post images and stories (no more URL pasting)
- **Search** — combined people + posts search with debounce
- **Dark mode** — toggle in navbar, persisted to localStorage, respects system preference on first load
- **Stories** — 24-hour auto-expiring stories (MongoDB TTL index), story ring bar, full-screen viewer with progress bars
- **Responsive design** — mobile breakpoints across navbar, feed, profile, chat, inbox, search, and auth pages

## Cloudinary setup
1. Create a free account at cloudinary.com
2. Grab your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to `backend/.env`

## Production notes / next steps
- Add Redis for session/cache and feed performance at scale
- Add rate limiting to more routes beyond auth
- Add environment-specific CORS/cookie settings for deployment
- Deploy: backend → Render/Railway, frontend → Vercel, DB → MongoDB Atlas, images → Cloudinary (already integrated)
