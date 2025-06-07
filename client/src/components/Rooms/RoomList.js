import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../Common/Loading';
import api from '../../utils/api';
import { Users, Plus, Lock } from 'lucide-react';

const RoomList = () => {
  const [rooms, setRooms] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      // Make sure we set an array, even if the API returns something unexpected
      setRooms(response.data?.rooms || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms');
      setRooms([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading rooms..." />;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchRooms} className="btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="room-list">
      <div className="room-header">
        <h2>Coding Rooms</h2>
        <Link to="/rooms/create" className="btn">
          <Plus size={16} />
          Create Room
        </Link>
      </div>

      <div className="rooms-grid">
        {/* Safe check before mapping */}
        {Array.isArray(rooms) && rooms.length > 0 ? (
          rooms.map(room => (
            <div key={room._id} className="room-card">
              <div className="room-info">
                <div className="room-title">
                  <h3>
                    <Link to={`/rooms/${room._id}`}>{room.name}</Link>
                  </h3>
                  {room.isPrivate && <Lock size={16} />}
                </div>
                <p>{room.description}</p>
                
                <div className="room-stats">
                  <div className="participants">
                    <Users size={16} />
                    <span>{room.participants?.length || 0}/{room.maxParticipants || 10}</span>
                  </div>
                  <span className="created-by">
                    by {room.createdBy?.username || 'Unknown'}
                  </span>
                </div>

                {room.tags && room.tags.length > 0 && (
                  <div className="room-tags">
                    {room.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <Link to={`/rooms/${room._id}`} className="btn btn-secondary">
                Join Room
              </Link>
            </div>
          ))
        ) : (
          <div className="no-rooms">
            <p>No rooms available. Create the first one!</p>
            <Link to="/rooms/create" className="btn">
              <Plus size={16} />
              Create Room
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList;
