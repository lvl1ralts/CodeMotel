import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, Users, BookmarkIcon, Zap } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to ZCoder</h1>
          <p className="hero-subtitle">
            A collaborative coding platform that enhances learning through interaction and personalization
          </p>
          <p className="hero-description">
            Create profiles, bookmark coding problems with solutions, and engage with others through 
            comments and feedback. Practice coding with our live editor and collaborate in real-time!
          </p>
          
          {!isAuthenticated ? (
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/login" className="btn btn-secondary">Sign In</Link>
            </div>
          ) : (
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
              <Link to="/problems" className="btn btn-secondary">Browse Problems</Link>
            </div>
          )}
        </div>
      </section>

      <section className="features-section">
        <div className="container">
          <h2>Platform Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Personalized Profiles</h3>
              <p>Build your unique coding identity and connect with peers</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <BookmarkIcon size={32} />
              </div>
              <h3>Code Bookmarking</h3>
              <p>Save and organize coding problems with tags and topics</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Code size={32} />
              </div>
              <h3>Live Code Editor</h3>
              <p>Integrated editor with real-time output for hands-on practice</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Interactive Rooms</h3>
              <p>Real-time chat spaces for peer discussion and collaboration</p>
            </div>
          </div>
        </div>
      </section>

      <section className="tech-stack-section">
        <div className="container">
          <h2>Built With Modern Technology</h2>
          <div className="tech-grid">
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>HTML+CSS</li>
                <li>React.js</li>
                <li>Next.js</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Backend</h3>
              <ul>
                <li>Node.js</li>
                <li>Express.js</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Database</h3>
              <ul>
                <li>MongoDB</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Real-time</h3>
              <ul>
                <li>Web Sockets</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
