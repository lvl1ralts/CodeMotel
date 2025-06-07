import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Code, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowProfileMenu(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <Code size={24} />
          ZCoder
        </Link>
      </div>

      {isAuthenticated && (
        <>
          <ul className="navbar-nav">
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/problems">Problems</Link></li>
            <li><Link to="/rooms">Rooms</Link></li>
          </ul>

          <div className="navbar-user">
            <div className="user-profile" onClick={toggleProfileMenu}>
              <div className="user-avatar">
                {getInitials(user?.profile?.firstName + ' ' + user?.profile?.lastName)}
              </div>
              <span>{user?.username}</span>
            </div>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                  <User size={16} />
                  View Profile
                </Link>
                <Link to="/settings" onClick={() => setShowProfileMenu(false)}>
                  <Settings size={16} />
                  Settings
                </Link>
                <button onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
