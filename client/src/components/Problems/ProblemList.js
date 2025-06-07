import React, { useState, useEffect } from 'react';
import ProblemCard from './ProblemCard';
import Loading from '../Common/Loading';
import api from '../../utils/api';
import { Search, Filter } from 'lucide-react';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProblems();
  }, [difficulty, category]);

  const fetchProblems = async () => {
    try {
      const params = new URLSearchParams();
      if (difficulty) params.append('difficulty', difficulty);
      if (category) params.append('category', category);

      const response = await api.get(`/problems?${params.toString()}`);
      setProblems(response.data.problems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem =>
    problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    problem.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Loading problems..." />;
  }

  return (
    <div className="problem-list">
      <div className="problem-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Tree">Tree</option>
            <option value="Graph">Graph</option>
          </select>
        </div>
      </div>

      <div className="problems-grid">
        {filteredProblems.map(problem => (
          <ProblemCard key={problem._id} problem={problem} />
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div className="no-problems">
          <p>No problems found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ProblemList;
