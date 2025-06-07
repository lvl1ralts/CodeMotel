import React from 'react';
import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';
import { Clock, Users, Tag } from 'lucide-react';

const ProblemCard = ({ problem }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <div className="problem-card">
      <div className="problem-header">
        <div className="problem-title">
          <Link to={`/problems/${problem._id}`}>
            <h3>{problem.title}</h3>
          </Link>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
          >
            {problem.difficulty}
          </span>
        </div>
        <BookmarkButton problemId={problem._id} />
      </div>

      <p className="problem-description">
        {problem.description.substring(0, 150)}
        {problem.description.length > 150 && '...'}
      </p>

      <div className="problem-tags">
        {problem.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="tag">
            <Tag size={12} />
            {tag}
          </span>
        ))}
        {problem.tags.length > 3 && (
          <span className="tag-more">+{problem.tags.length - 3}</span>
        )}
      </div>

      <div className="problem-stats">
        <div className="stat">
          <Users size={16} />
          <span>{problem.stats.totalAttempts} attempts</span>
        </div>
        <div className="stat">
          <Clock size={16} />
          <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProblemCard;
