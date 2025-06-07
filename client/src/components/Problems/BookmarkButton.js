import React, { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BookmarkButton = ({ problemId, initialBookmarked = false }) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark problems');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/problems/${problemId}/bookmark`);
      setIsBookmarked(response.data.isBookmarked);
      toast.success(response.data.message);
    } catch (error) {
      toast.error('Failed to update bookmark');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBookmark}
      disabled={loading}
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
    >
      <Bookmark 
        size={16} 
        fill={isBookmarked ? '#4CAF50' : 'none'}
        color={isBookmarked ? '#4CAF50' : 'currentColor'}
      />
    </button>
  );
};

export default BookmarkButton;
