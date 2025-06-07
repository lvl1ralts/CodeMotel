import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomList from '../components/Rooms/RoomList';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const Rooms = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxParticipants: 10,
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const roomData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await api.post('/rooms', roomData);
      toast.success('Room created successfully!');
      setShowCreateModal(false);
      navigate(`/rooms/${response.data.room._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isPrivate: false,
      maxParticipants: 10,
      tags: ''
    });
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  return (
    <div className="rooms-page">
      <div className="page-header">
        <h1>Collaboration Rooms</h1>
        <p>Join or create rooms for real-time coding collaboration</p>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn"
        >
          <Plus size={16} />
          Create Room
        </button>
      </div>

      <RoomList />

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Room</h2>
              <button onClick={handleCloseModal} className="close-button">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Room Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter room name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your room purpose..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="maxParticipants">Max Participants</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min={2}
                    max={50}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleInputChange}
                    />
                    Private Room
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="javascript, algorithms, beginner"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn">
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
