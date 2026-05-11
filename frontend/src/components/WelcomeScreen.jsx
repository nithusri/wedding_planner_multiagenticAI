import React from 'react';
import {
  ClipboardList,
  Flower2,
  Sparkles,
  MapPinned,
  Palette,
  Utensils,
  WalletCards,
  Waves,
  Crown
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    Icon: Sparkles,
    text: 'Plan a traditional Indian Hindu wedding for 300 guests with ₹50 lakh budget in Udaipur',
  },
  {
    Icon: Waves,
    text: 'I want a beach destination wedding in Bali with $40,000 budget for 100 guests',
  },
  {
    Icon: Flower2,
    text: 'What are the trending wedding flower arrangements and color palettes for 2026?',
  },
  {
    Icon: WalletCards,
    text: 'I have a $25,000 budget. Is a destination wedding in Santorini feasible for 80 guests?',
  },
];

const AGENTS = [
  { Icon: Palette, name: 'Cultural Consultant', provider: 'Theme, rituals, decor' },
  { Icon: WalletCards, name: 'Treasurer', provider: 'Budget validation' },
  { Icon: MapPinned, name: 'Logistics Scout', provider: 'Venues and maps' },
  { Icon: ClipboardList, name: 'Vendor Orchestrator', provider: 'Vendors and timeline' },
  { Icon: Utensils, name: 'Catering Director', provider: 'Caterers and menus' },
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-shell">
        <div className="welcome-rings">
          <Crown size={42} />
        </div>
        <div className="welcome-kicker">
          <Sparkles size={14} /> Premium wedding planning workspace
        </div>
        <h1 className="welcome-title">PLAN IT PERFECT</h1>
        <p className="welcome-subtitle">
          A polished multi-agent studio for budgets, venues, vendors, menus, and AI-generated theme moodboards.
        </p>

        <div className="welcome-agents">
          {AGENTS.map(({ Icon, name, provider }) => (
            <div className="agent-card" key={name}>
              <span className="agent-card-emoji"><Icon size={19} /></span>
              <div className="agent-card-info">
                <div className="agent-card-name">{name}</div>
                <div className="agent-card-provider">{provider}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="welcome-starters">
          <div className="welcome-starters-label">Try asking</div>
          {STARTER_PROMPTS.map(({ Icon, text }, i) => (
            <button
              key={i}
              className="starter-btn"
              onClick={() => onSend(text)}
            >
              <span className="starter-icon"><Icon size={18} /></span>
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
