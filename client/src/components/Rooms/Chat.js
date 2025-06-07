import React, { useState, useEffect, useRef } from 'react';
import { Send, Code } from 'lucide-react';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Chat = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchMessages();
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
      });

      socket.on('code-shared', (data) => {
        const codeMessage = {
          _id: Date.now(),
          user: { username: data.username },
          content: data.code,
          messageType: 'code',
          codeSnippet: {
            language: data.language,
            code: data.code
          },
          createdAt: new Date()
        };
        setMessages(prev => [...prev, codeMessage]);
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
        socket.off('code-shared');
      }
    };
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/rooms/${roomId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = socketService.getSocket();
    if (socket) {
      const messageData = {
        roomId,
        content: newMessage,
        messageType: isCodeMode ? 'code' : 'text'
      };

      if (isCodeMode) {
        messageData.codeSnippet = {
          language: 'javascript',
          code: newMessage
        };
      }

      socket.emit('chat-message', messageData);
      setNewMessage('');
      setIsCodeMode(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message._id} className="chat-message">
            <div className="message-header">
              <span className="sender">{message.user.username}</span>
              <span className="timestamp">
                {formatTimestamp(message.createdAt)}
              </span>
            </div>
            
            <div className="message-content">
              {message.messageType === 'code' ? (
                <div className="code-message">
                  <div className="code-header">
                    <Code size={14} />
                    <span>{message.codeSnippet?.language || 'code'}</span>
                  </div>
                  <pre className="code-block">
                    <code>{message.content}</code>
                  </pre>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="input-controls">
          <button
            onClick={() => setIsCodeMode(!isCodeMode)}
            className={`code-toggle ${isCodeMode ? 'active' : ''}`}
          >
            <Code size={16} />
          </button>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isCodeMode ? "Share code snippet..." : "Type a message..."}
            className={`chat-input ${isCodeMode ? 'code-mode' : ''}`}
            rows={isCodeMode ? 4 : 1}
          />
          <button onClick={handleSendMessage} className="send-button">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
