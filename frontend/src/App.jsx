import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Crown, Sparkles, PanelRightClose, PanelRightOpen, RotateCcw, Moon, Sun } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import WeddingStatePanel from './components/WeddingStatePanel';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import axios from 'axios';

function MainApp({ theme, toggleTheme }) {
  const [sessionId, setSessionId] = useState(null);
  const [state, setState] = useState(null);
  const [panelVisible, setPanelVisible] = useState(true);

  const handleReset = async () => {
    if (sessionId) {
      try {
        await axios.post('/api/wedding/reset', { sessionId });
      } catch (e) {
        // Ignore reset failures because the UI can still start a new local session.
      }
    }
    setSessionId(null);
    setState(null);
    window.location.reload();
  };

  return (
    <div className="app-layout">
      <div className="chat-area">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="brand-mark">
              <Crown size={21} />
            </div>
            <div>
              <div className="chat-header-logo">PLAN IT PERFECT</div>
              <div className="chat-header-subtitle">
                <Sparkles size={12} /> Multi-agent wedding studio
              </div>
            </div>
          </div>
          <div className="chat-header-actions">
            <button className="header-btn" onClick={toggleTheme} title="Toggle Theme">
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} Theme
            </button>
            <button
              className={`header-btn ${panelVisible ? 'active' : ''}`}
              onClick={() => setPanelVisible(!panelVisible)}
              title="Toggle Planning Panel"
            >
              {panelVisible
                ? <><PanelRightClose size={15} /> Plan</>
                : <><PanelRightOpen size={15} /> Plan</>
              }
            </button>
            <button className="header-btn" onClick={handleReset} title="Start Fresh">
              <RotateCcw size={15} /> New
            </button>
          </div>
        </div>

        <ChatInterface
          sessionId={sessionId}
          setSessionId={setSessionId}
          state={state}
          setState={setState}
          panelVisible={panelVisible}
        />
      </div>

      <WeddingStatePanel
        state={state}
        visible={panelVisible}
        sessionId={sessionId}
        setState={setState}
      />
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const ProtectedRoute = ({ children }) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <MainApp theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
