import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from '../components/Profile/UserProfile';
import api from '../utils/api';
import { BookmarkIcon, Trophy, Code, Users, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    recentProblems: [],
    bookmarkedProblems: [],
    activeRooms: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent problems
      const problemsResponse = await api.get('/problems?limit=5');
      
      // Fetch user's bookmarked problems
      const bookmarksResponse = await api.get('/users/bookmarks');
      
      // Fetch active rooms
      const roomsResponse = await api.get('/rooms?limit=3');

      setStats({
        recentProblems: problemsResponse.data.problems || [],
        bookmarkedProblems: bookmarksResponse.data || [],
        activeRooms: roomsResponse.data.rooms || [],
        achievements: calculateAchievements(user)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (user) => {
    const achievements = [];
    const solvedCount = user?.solvedProblems?.length || 0;
    const bookmarkCount = user?.bookmarkedProblems?.length || 0;
    const contributionCount = user?.contributions?.problemsCreated || 0;

    if (solvedCount >= 1) achievements.push({ name: 'First Solution', icon: '🎯' });
    if (solvedCount >= 10) achievements.push({ name: 'Problem Solver', icon: '🏆' });
    if (bookmarkCount >= 5) achievements.push({ name: 'Collector', icon: '📚' });
    if (contributionCount >= 1) achievements.push({ name: 'Contributor', icon: '✨' });

    return achievements;
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.profile?.firstName || user?.username}!</h1>
        <p>Here's what's happening in your coding journey</p>
      </div>

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="dashboard-section stats-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <Trophy size={20} />
              <div>
                <span className="stat-number">{user?.solvedProblems?.length || 0}</span>
                <span className="stat-label">Problems Solved</span>
              </div>
            </div>
            <div className="stat-item">
              <BookmarkIcon size={20} />
              <div>
                <span className="stat-number">{user?.bookmarkedProblems?.length || 0}</span>
                <span className="stat-label">Bookmarked</span>
              </div>
            </div>
            <div className="stat-item">
              <Code size={20} />
              <div>
                <span className="stat-number">{user?.contributions?.problemsCreated || 0}</span>
                <span className="stat-label">Contributions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Problems */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Problems</h2>
            <Link to="/problems" className="view-all-link">View All</Link>
          </div>
          <div className="problem-list">
            {stats.recentProblems.slice(0, 3).map(problem => (
              <div key={problem._id} className="problem-item">
                <Link to={`/problems/${problem._id}`}>
                  <h4>{problem.title}</h4>
                  <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarked Problems */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Bookmarks</h2>
            <Link to="/bookmarks" className="view-all-link">View All</Link>
          </div>
          <div className="bookmark-list">
            {stats.bookmarkedProblems.slice(0, 3).map(bookmark => (
              <div key={bookmark._id} className="bookmark-item">
                <Link to={`/problems/${bookmark.problem._id}`}>
                  <h4>{bookmark.problem.title}</h4>
                  <small>Bookmarked {new Date(bookmark.dateBookmarked).toLocaleDateString()}</small>
                </Link>
              </div>
            ))}
            {stats.bookmarkedProblems.length === 0 && (
              <p className="empty-state">No bookmarks yet. Start exploring problems!</p>
            )}
          </div>
        </div>

        {/* Active Rooms */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Active Rooms</h2>
            <Link to="/rooms" className="view-all-link">View All</Link>
          </div>
          <div className="room-list">
            {stats.activeRooms.map(room => (
              <div key={room._id} className="room-item">
                <Link to={`/rooms/${room._id}`}>
                  <h4>{room.name}</h4>
                  <div className="room-info">
                    <Users size={14} />
                    <span>{room.participants.length} participants</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="dashboard-section">
          <h2>Achievements</h2>
          <div className="achievements-list">
            {stats.achievements.map((achievement, index) => (
              <div key={index} className="achievement-item">
                <span className="achievement-icon">{achievement.icon}</span>
                <span className="achievement-name">{achievement.name}</span>
              </div>
            ))}
            {stats.achievements.length === 0 && (
              <p className="empty-state">Complete challenges to unlock achievements!</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/problems" className="action-btn">
              <Code size={20} />
              Solve Problems
            </Link>
            <Link to="/rooms/create" className="action-btn">
              <Users size={20} />
              Create Room
            </Link>
            <Link to="/profile" className="action-btn">
              <TrendingUp size={20} />
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
