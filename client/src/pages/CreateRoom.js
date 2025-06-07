import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Lock, Tag } from 'lucide-react';

const CreateRoom = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false,
        maxParticipants: 10,
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isAuthenticated) {
            toast.error('Please login to create a room');
            navigate('/login');
            return;
        }

        if (!formData.name.trim()) {
            toast.error('Room name is required');
            return;
        }

        setLoading(true);

        try {
            const roomData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            const response = await api.post('/rooms', roomData);
            toast.success('Room created successfully!');
            navigate(`/rooms/${response.data.room._id}`);
        } catch (error) {
            console.error('Create room error:', error);
            toast.error(error.response?.data?.message || 'Failed to create room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-room-page">
            <div className="page-header">
                <button onClick={() => navigate('/rooms')} className="back-button">
                    <ArrowLeft size={20} />
                    Back to Rooms
                </button>
                <h1>Create New Room</h1>
                <p>Set up a collaborative coding space</p>
            </div>

            <div className="create-room-container">
                <form onSubmit={handleSubmit} className="create-room-form">
                    <div className="form-group">
                        <label htmlFor="name">
                            <Users size={16} />
                            Room Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter room name (e.g., JavaScript Study Group)"
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe the purpose of this room..."
                            rows={4}
                            maxLength={500}
                        />
                        <small>{formData.description.length}/500 characters</small>
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
                                max={100}
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
                                <Lock size={16} />
                                Private Room
                            </label>
                            <small>Private rooms require an invitation to join</small>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="tags">
                            <Tag size={16} />
                            Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleInputChange}
                            placeholder="javascript, algorithms, beginners, react"
                        />
                        <small>Add tags to help others find your room</small>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/rooms')} 
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !formData.name.trim()} 
                            className="btn btn-primary"
                        >
                            {loading ? 'Creating...' : 'Create Room'}
                        </button>
                    </div>
                </form>

                <div className="room-preview">
                    <h3>Preview</h3>
                    <div className="room-card preview">
                        <div className="room-info">
                            <div className="room-title">
                                <h4>{formData.name || 'Room Name'}</h4>
                                {formData.isPrivate && <Lock size={16} />}
                            </div>
                            <p>{formData.description || 'Room description will appear here...'}</p>
                            
                            <div className="room-stats">
                                <div className="participants">
                                    <Users size={16} />
                                    <span>0/{formData.maxParticipants}</span>
                                </div>
                            </div>

                            {formData.tags && (
                                <div className="room-tags">
                                    {formData.tags.split(',').map((tag, index) => 
                                        tag.trim() && (
                                            <span key={index} className="tag">
                                                {tag.trim()}
                                            </span>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRoom;
