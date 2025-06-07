# CodeMotel-Collaborative-Platform

A full-stack collaborative coding platform for real-time problem solving, code sharing, and peer learning. CodeMotel enables users to create profiles, bookmark and import coding problems (from sources like Codeforces, LeetCode, CodeChef, etc.), join interactive rooms, chat, and collaborate on code in real time.

---

## 🚀 Features

- *User Authentication:* Register, login, and manage your profile securely with JWT.
- *Problem Management:*
  - Create original problems or import from external links (Codeforces, LeetCode, CodeChef, etc.).
  - Add problem details, tags, input/output, constraints, and starter code.
  - Bookmark problems for future practice.
- *Interactive Rooms:*
  - Create and join rooms for collaborative coding sessions.
  - Real-time chat and code sharing with Socket.IO.
  - Participant management and room privacy settings.
- *Live Code Editor:*
  - Syntax-highlighted editor (Monaco).
  - Multi-language starter code.
  - Real-time code updates and sharing.
- *Real-Time Chat:*
  - Message participants in a room.
  - Share code snippets directly in chat.
- *Responsive UI:*
  - Modern, mobile-friendly interface.
- *Import Problems:*
  - Quickly add problems from popular platforms by pasting a link.

---

## 🛠 Tech Stack

- *Frontend:* React.js, React Router, Monaco Editor, Socket.IO client, Axios
- *Backend:* Node.js, Express.js, MongoDB (Mongoose), Socket.IO server, JWT
- *Deployment:* Vercel (frontend \& backend), MongoDB Atlas

---

## 📦 Project Structure


CodeMotel-Collaborative-Platform/
├── client/          # React frontend
├── server/          # Node.js backend
├── README.md
└── .env.example     # Environment variable templates


---

## ⚡ Getting Started

### 1. *Clone the Repository*

bash
git clone https://github.com/yourusername/CodeMotel-Collaborative-Platform.git
cd CodeMotel-Collaborative-Platform


### 2. *Setup Environment Variables*

- Copy .env.example to .env in both client/ and server/ folders.
- Fill in your MongoDB URI, JWT secret, and API URLs.

### 3. *Install Dependencies*

*Backend:*

bash
cd server
npm install


*Frontend:*

bash
cd ../client
npm install


### 4. *Run Locally*

*Start MongoDB* (if using local DB) and both servers:

bash
# In server/
npm run dev

# In client/
npm start


- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## 🌐 Deployment (Vercel)

1. *Push your code to GitHub (do NOT push .env files).*
2. *Deploy backend and frontend separately on Vercel:*
   - Set environment variables in the Vercel dashboard for each project.
   - Use your backend’s Vercel URL as the API base in the frontend’s .env.

---

## 📝 Example Environment Variables

*server/.env*


MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app


*client/.env*


REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_SERVER_URL=https://your-backend.vercel.app


---

## 📚 Usage

- *Register/Login* to access all features.
- *Create or import problems* from external sites.
- *Join or create rooms* for real-time collaboration.
- *Chat and code together* with other users.
- *Bookmark problems* for later practice.

---

## 🛡 Security

- Passwords are hashed using bcrypt.
- JWT tokens are used for authentication.
- CORS is configured for secure cross-origin requests.
- Sensitive information is stored in environment variables (never pushed to GitHub).

---

*CodeMotel* — Level up your coding skills together!
