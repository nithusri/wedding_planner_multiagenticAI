import React from 'react';
import { ClipboardList, Gem, MapPinned, Palette, Sparkles, Utensils, WalletCards } from 'lucide-react';

const AGENT_CONFIG = {
  Concierge: { css: 'concierge', Icon: Sparkles, provider: 'Gemini' },
  'Cultural Consultant': { css: 'consultant', Icon: Palette, provider: 'Groq' },
  'Treasurer': { css: 'treasurer', Icon: WalletCards, provider: 'Gemini' },
  'Logistics Scout': { css: 'scout', Icon: MapPinned, provider: 'Cohere' },
  'Vendor Orchestrator': { css: 'orchestrator', Icon: ClipboardList, provider: 'Groq' },
  'Catering Director': { css: 'catering', Icon: Utensils, provider: 'Groq' },
};

export default function AgentBadge({ agentName, showProvider = true }) {
  const config = AGENT_CONFIG[agentName] || {
    css: 'concierge',
    Icon: Gem,
    provider: 'AI',
  };
  const Icon = config.Icon;

  return (
    <span className="message-agent-info">
      <span className={`agent-badge ${config.css}`}>
        <Icon size={12} /> {agentName}
      </span>
      {showProvider && (
        <span className="agent-provider">via {config.provider}</span>
      )}
    </span>
  );
}

export { AGENT_CONFIG };
