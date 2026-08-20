# Social Media Platform

A full-stack social media platform built with the MERN stack for learning and practicing modern web application development.

## Features

* User registration and login
* JWT-based authentication
* User profiles
* Profile photo upload
* Edit name and bio
* Discover other users
* Follow and unfollow users
* Followers and following lists
* Create posts
* Like and unlike posts
* Comment on posts
* Notifications
* Protected routes
* Admin functionality
* Responsive frontend interface

## Tech Stack

### Frontend

* React
* React Router
* Axios
* Vite
* CSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT authentication
* Multer for image uploads

## Project Structure

```text
social-media-platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Environment Variables

The backend uses environment variables for sensitive configuration.

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Never commit your real `.env` file or expose database credentials and secret keys publicly.

## Running Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd social-media-platform
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend environment variables

Create:

```text
backend/.env
```

and add your MongoDB connection string and JWT secret.

### 4. Start the backend

```bash
npm start
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start the frontend

```bash
npm run dev
```

The frontend and backend can then communicate through the configured API URL.

## Security

Sensitive environment variables are excluded from Git using `.gitignore`.

Do not publish:

* MongoDB credentials
* JWT secrets
* Production API keys
* Private environment configuration

## Project Status

This project was built as a full-stack learning and practice project and is being prepared for deployment and portfolio use.

## Author

Built as a full-stack development project using React, Node.js, Express, and MongoDB.
