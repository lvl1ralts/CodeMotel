import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Edit, BookmarkIcon, Trophy, Code } from 'lucide-react';

const UserProfile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    problemsBookmarked: 0,
    contributionsCount: 0
  });

  useEffect(() => {
    // Calculate stats from user data
    if (user) {
      setStats({
        problemsSolved: user.solvedProblems?.length || 0,
        problemsBookmarked: user.bookmarkedProblems?.length || 0,
        contributionsCount: user.contributions?.problemsCreated || 0
      });
    }
  }, [user]);

  if (!user) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
        </div>
        <div className="profile-info">
          <h1>{user.profile?.firstName} {user.profile?.lastName}</h1>
          <p className="username">@{user.username}</p>
          <p className="email">{user.email}</p>
          {user.profile?.bio && <p className="bio">{user.profile.bio}</p>}
        </div>
        <button className="edit-profile-btn">
          <Edit size={16} />
          Edit Profile
        </button>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <Trophy size={24} />
          <div className="stat-info">
            <h3>{stats.problemsSolved}</h3>
            <p>Problems Solved</p>
          </div>
        </div>
        
        <div className="stat-card">
          <BookmarkIcon size={24} />
          <div className="stat-info">
            <h3>{stats.problemsBookmarked}</h3>
            <p>Bookmarked</p>
          </div>
        </div>
        
        <div className="stat-card">
          <Code size={24} />
          <div className="stat-info">
            <h3>{stats.contributionsCount}</h3>
            <p>Contributions</p>
          </div>
        </div>
      </div>

      <div className="profile-sections">
        <div className="section">
          <h3>Skills</h3>
          <div className="skills-list">
            {user.profile?.skills?.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            )) || <p>No skills added yet</p>}
          </div>
        </div>

        <div className="section">
          <h3>Experience Level</h3>
          <p>{user.profile?.experience || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
