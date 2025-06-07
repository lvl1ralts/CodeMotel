import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Common/Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div>Loading ZCoder...</div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
