# Task Manager Frontend

A modern task management application built with Next.js, TypeScript, and Tailwind CSS. This frontend connects to the Node.js backend API to provide a complete task management solution.

## Features

### 🔐 Authentication
- Login and signup functionality
- JWT-based authentication
- Role-based access control (Admin, Dev, User)
- Protected routes with middleware

### 📋 Task Management
- Create, edit, and delete tasks
- Task status tracking (Not Started, In Progress, Completed)
- Filter tasks by completion status
- Real-time task updates

### 👤 User Profile
- View personal information
- Task statistics and progress tracking
- Completion percentage visualization
- Motivational progress messages

### 🛡️ Admin Panel
- View all system users
- User management (role changes, deletion)
- View user profiles and task statistics
- System-wide statistics dashboard

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Authentication**: JWT with cookies

## Prerequisites

Make sure you have the following installed:
- Node.js 18+ 
- npm or yarn
- The backend server running on `http://localhost:7870`

## Installation

1. **Navigate to the Frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

## Backend Configuration

Make sure your backend server is running on `http://localhost:7870`. The frontend is configured to connect to these endpoints:

- **Authentication**: `POST /public/v1/login`, `POST /public/v1/signup`
- **User API**: `/user/v1/*`
- **Admin API**: `/admin/v1/*`

If your backend runs on a different port, update the `API_BASE_URL` in `src/lib/api.ts`.

## Demo Credentials

Based on your Postman collection, you can test with:
- **Username**: shresth23
- **Password**: redgere23

## Available Routes

### Public Routes
- `/auth` - Login and signup page

### Protected Routes (User)
- `/dashboard` - Main task management dashboard
- `/profile` - User profile and statistics

### Protected Routes (Admin/Dev)
- `/admin` - Admin panel for user management

### Root Route
- `/` - Automatically redirects based on authentication and role

## Features by Role

### Regular Users
- ✅ Task creation and management
- ✅ Personal dashboard
- ✅ Profile viewing
- ✅ Task filtering and status updates

### Developers
- ✅ All user features
- ✅ Admin panel access
- ✅ View all users and their tasks
- ✅ User role management

### Administrators
- ✅ All developer features
- ✅ Delete users
- ✅ Full system administration

## Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```
