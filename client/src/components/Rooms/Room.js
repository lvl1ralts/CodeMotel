import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Chat from './Chat';
import CodeEditor from '../CodeEditor/CodeEditor';
import api from '../../utils/api';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Users, Settings, Share } from 'lucide-react';
import toast from 'react-hot-toast';

const Room = () => {
  const { roomId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('// Welcome to the collaborative room!\n// Start coding together...\n');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (token && roomId) {
      initializeRoom();
    }
  }, [roomId, token]);

  const initializeRoom = async () => {
    try {
      // Fetch room details
      await fetchRoom();
      
      // Join room via API
      await joinRoomAPI();
      
      // Connect to socket
      connectToSocket();
      
    } catch (error) {
      console.error('Error initializing room:', error);
      toast.error('Failed to join room');
      navigate('/rooms');
    }
  };

  const fetchRoom = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  };

  const joinRoomAPI = async () => {
    try {
      await api.post(`/rooms/${roomId}/join`);
      setHasJoined(true);
      toast.success('Joined room successfully!');
    } catch (error) {
      if (error.response?.status === 400) {
        // Already a participant
        setHasJoined(true);
      } else {
        console.error('Error joining room:', error);
        toast.error('Failed to join room');
        throw error;
      }
    }
  };

  const connectToSocket = () => {
    const socket = socketService.connect(token);
    
    socket.emit('join-room', roomId);
    
    socket.on('room-joined', () => {
      console.log('Socket joined room successfully');
      setLoading(false);
    });

    socket.on('user-joined', (data) => {
      setParticipants(prev => {
        const exists = prev.some(p => p.user._id === data.userId);
        if (!exists) {
          return [...prev, { user: { _id: data.userId, username: data.username } }];
        }
        return prev;
      });
      toast.success(`${data.username} joined the room`);
    });

    socket.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p.user._id !== data.userId));
      toast.info(`${data.username} left the room`);
    });

    socket.on('code-updated', (data) => {
      if (data.userId !== user.id) {
        setCode(data.code);
      }
    });

    socket.on('error', (error) => {
      toast.error(error.message);
    });

    return () => {
      socket.emit('leave-room', roomId);
      socketService.disconnect();
    };
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('code-change', {
        roomId,
        code: newCode,
        cursorPosition: 0
      });
    }
  };

  const handleShareCode = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('share-code', {
        roomId,
        code,
        language
      });
      toast.success('Code shared with participants!');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit('leave-room', roomId);
      }
      
      await api.post(`/rooms/${roomId}/leave`);
      navigate('/rooms');
      toast.info('Left the room');
    } catch (error) {
      console.error('Error leaving room:', error);
      navigate('/rooms'); // Navigate anyway
    }
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/rooms/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="room-loading">
        <div className="loading-spinner"></div>
        <p>Joining room...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="room-error">
        <h2>Room not found</h2>
        <button onClick={() => navigate('/rooms')} className="btn">
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="room-container">
      {/* Room Header */}
      <div className="room-header">
        <div className="room-info">
          <button onClick={() => navigate('/rooms')} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{room.name}</h1>
            <p>{room.description}</p>
          </div>
        </div>
        
        <div className="room-actions">
          <div className="participants-count">
            <Users size={16} />
            <span>{participants.length} participants</span>
          </div>
          
          <button onClick={copyRoomLink} className="btn btn-secondary">
            <Share size={16} />
            Share Link
          </button>
          
          <button onClick={handleLeaveRoom} className="btn btn-danger">
            Leave Room
          </button>
        </div>
      </div>

      {/* Main Room Content */}
      <div className="room-content">
        {/* Code Editor Section */}
        <div className="code-section">
          <div className="code-header">
            <h3>Collaborative Code Editor</h3>
            <div className="code-actions">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button onClick={handleShareCode} className="btn">
                Share Code
              </button>
            </div>
          </div>
          
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
          />
        </div>

        {/* Sidebar with Chat and Participants */}
        <div className="room-sidebar">
          {/* Participants List */}
          <div className="participants-section">
            <h3>Participants ({participants.length})</h3>
            <div className="participants-list">
              {participants.map((participant) => (
                <div key={participant.user._id} className="participant-item">
                  <div className="participant-avatar">
                    {participant.user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="participant-name">
                    {participant.user.username}
                    {participant.user._id === user.id && ' (You)'}
                  </span>
                  <div className="participant-status online"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Section */}
          <div className="chat-section">
            <Chat roomId={roomId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
