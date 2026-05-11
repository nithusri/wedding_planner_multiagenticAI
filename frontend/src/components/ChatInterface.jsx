import React, { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, UserRound } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AgentBadge, { AGENT_CONFIG } from './AgentBadge';
import WelcomeScreen from './WelcomeScreen';

export default function ChatInterface({ sessionId, setSessionId, state, setState, panelVisible }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const renderAvatarIcon = (msg) => {
    if (msg.role === 'user') return <UserRound size={17} />;
    const Icon = AGENT_CONFIG[msg.agentName]?.Icon || Sparkles;
    return <Icon size={17} />;
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/wedding/chat', {
        sessionId,
        message: msg,
      });

      const data = res.data;

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.state) {
        setState(data.state);
      }

      if (data.responses) {
        const agentMessages = data.responses.map(r => ({
          role: 'assistant',
          agentName: r.agentName,
          provider: r.provider,
          content: r.message,
          timestamp: new Date(),
        }));
        setMessages(prev => [...prev, ...agentMessages]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          agentName: 'Concierge',
          provider: 'system',
          content: `Apologies, I encountered an error: ${err.response?.data?.error || err.message}. Please try again.`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {!hasMessages && !loading ? (
        <WelcomeScreen onSend={sendMessage} />
      ) : (
        <div className="messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {renderAvatarIcon(msg)}
              </div>
              <div className="message-content">
                {msg.role === 'assistant' && (
                  <AgentBadge agentName={msg.agentName} />
                )}
                <div className="message-bubble markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="typing-indicator">
              <div className="message-avatar"><Sparkles size={17} /></div>
              <div>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="typing-label">
                  Agents are thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the wedding you want to plan..."
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
