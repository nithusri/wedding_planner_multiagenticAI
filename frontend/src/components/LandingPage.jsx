import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ backgroundImage: "url('/src/assets/landing_bg.jpg')" }}>
      <div className="landing-overlay">
        <div className="landing-content">
          <div className="landing-logo-container">
            <Crown size={48} className="landing-logo-icon" />
            <h1 className="landing-title">PLAN IT PERFECT</h1>
          </div>
          <p className="landing-subtitle">
            Your premium wedding planning workspace. From dreaming to reality, we make it perfect.
          </p>
          <div className="landing-actions">
            <button className="landing-btn primary" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="landing-btn secondary" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
