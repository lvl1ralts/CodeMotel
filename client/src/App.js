import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import Rooms from './pages/Rooms';
import CreateProblem from './pages/CreateProblem';
import CreateRoom from './pages/CreateRoom';
import Room from './components/Rooms/Room'; // IMPORTANT: Add this
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/Profile/UserProfile';
import './styles/global.css';
import './styles/components.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="problems" element={<Problems />} />
              <Route path="problems/create" element={<CreateProblem />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="rooms/create" element={<CreateRoom />} />
              <Route path="rooms/:roomId" element={<Room />} /> {/* ADD THIS ROUTE */}
              <Route path="profile" element={<UserProfile />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
