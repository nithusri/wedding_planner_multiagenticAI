import { v4 as uuidv4 } from 'uuid';

// ─── In-Memory Session Store ────────────────────────────────────

const sessions = new Map();

function createBlankState() {
  return {
    userContext: {
      culture: '',
      budget: 0,
      guestCount: 0,
      location: '',
      date: '',
      vibe: [],
      nonNegotiables: [],
    },
    styleProfile: {
      theme: '',
      colors: [],
      decorElements: [],
      rituals: [],
      photographyStyle: '',
      dressCode: '',
      referenceImages: [],
    },
    catering: {
      caterers: [],
      selectedCatererId: null,
      menuOptions: [],
      selectedMenuId: null
    },
    financials: {
      totalBudget: 0,
      currency: 'USD',
      budgetProvided: false,
      estimatedRequired: 0,
      budgetGap: 0,
      costPerGuest: 0,
      guestCount: 0,
      allocation: {},
      feasibility: '',
      warnings: [],
    },
    venues: [],
    vendors: [],
    timeline: [],
    conversationHistory: [],
  };
}

// ─── Public API ─────────────────────────────────────────────────

export function createSession() {
  const sessionId = uuidv4();
  sessions.set(sessionId, createBlankState());
  return sessionId;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId, updates) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Deep merge updates into session
  for (const [key, value] of Object.entries(updates)) {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null && session[key]) {
      session[key] = { ...session[key], ...value };
    } else {
      session[key] = value;
    }
  }

  sessions.set(sessionId, session);
  return session;
}

export function addToHistory(sessionId, role, agentName, content) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.conversationHistory.push({
    role,
    agentName,
    content,
    timestamp: new Date().toISOString(),
  });
}

export function resetSession(sessionId) {
  if (sessions.has(sessionId)) {
    sessions.set(sessionId, createBlankState());
    return true;
  }
  return false;
}

export function getSessionState(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Return state without conversation history (separate concern)
  const { conversationHistory, ...state } = session;
  return state;
}
