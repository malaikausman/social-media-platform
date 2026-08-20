Social Media Platform

A full-stack social media platform built with the MERN stack to practice and demonstrate modern full-stack web development.

Live Demo

Frontend: https://social-media-platform-delta-ochre.vercel.app/

Backend API: https://social-media-platform-backend-oxp3.onrender.com

GitHub: https://github.com/malaikausman/social-media-platform

⸻

Features

* User registration and login
* JWT authentication and protected routes
* User profiles with profile photo and bio
* Discover and search users
* Follow and unfollow users
* Followers and following lists
* Create posts with images
* Like and comment on posts
* Notifications
* Admin functionality
* Responsive interface

⸻

Tech Stack

Frontend

* React
* React Router
* Axios
* Vite
* CSS

Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Multer

⸻

Project Structure

social-media-platform/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── vite.config.js
│
├── .gitignore
└── README.md

⸻

Environment Variables

Create a .env file inside the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Keep your .env file private and never commit secrets to GitHub.

⸻

Run Locally

1. Clone the repository

git clone https://github.com/malaikausman/social-media-platform.git
cd social-media-platform

2. Install backend dependencies

cd backend
npm install

Configure your backend/.env file, then start the server:

npm start

3. Install frontend dependencies

Open a new terminal:

cd frontend
npm install
npm run dev

The frontend will run through Vite and connect to the configured backend API.

⸻

Deployment

The project is deployed using:

* Frontend: Vercel
* Backend: Render
* Database: MongoDB Atlas

The application is currently live and available through the links above.

⸻

Project Status

Completed and deployed.

This project demonstrates practical experience with React, Node.js, Express, MongoDB, REST APIs, authentication, image uploads, and deployment.

⸻

Author

Malaika Usman

Built with React • Node.js • Express.js • MongoDB