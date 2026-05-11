import { SupervisorAgent } from '../agents/supervisorAgent.js';
import { ConsultantAgent } from '../agents/consultantAgent.js';
import { TreasurerAgent } from '../agents/treasurerAgent.js';
import { ScoutAgent } from '../agents/scoutAgent.js';
import { OrchestratorAgent } from '../agents/orchestratorAgent.js';
import { CateringAgent } from '../agents/cateringAgent.js';
import { geminiGenerateImage } from '../config/providers.js';
import {
  createSession,
  getSession,
  updateSession,
  addToHistory,
  resetSession as resetSessionState,
  getSessionState,
} from '../state/weddingState.js';

// ─── Initialize All Agents ──────────────────────────────────────

const supervisor = new SupervisorAgent();
const agents = {
  consultant: new ConsultantAgent(),
  treasurer: new TreasurerAgent(),
  scout: new ScoutAgent(),
  orchestrator: new OrchestratorAgent(),
  catering: new CateringAgent(),
};

const themeImageCache = new Map();

// ─── Chat Controller ────────────────────────────────────────────

export async function chat(req, res) {
  try {
    const { sessionId: incomingSessionId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    let sessionId = incomingSessionId;
    if (!sessionId || !getSession(sessionId)) {
      sessionId = createSession();
      console.log(`\n🆕 New session created: ${sessionId}`);
    }

    const state = getSession(sessionId);
    addToHistory(sessionId, 'user', 'User', message);

    console.log(`\n📩 Message: "${message.substring(0, 80)}…"`);
    console.log(`   Session: ${sessionId}`);

    // Step 1: Supervisor classifies intent
    const classification = await supervisor.classify(message, state);
    console.log(`   Intent: ${classification.intent}`);
    console.log(`   Delegate to: ${classification.delegateTo.join(', ') || 'none (direct)'}`);

    // Apply any user context extracted by supervisor
    if (classification.stateUpdates && Object.keys(classification.stateUpdates).length > 0) {
      updateSession(sessionId, classification.stateUpdates);
    }

    // Step 2: Route based on intent
    let responses = [];

    if (classification.intent === 'GENERAL' || classification.delegateTo.length === 0) {
      // Supervisor answers directly
      responses.push({
        agentName: 'Concierge',
        emoji: '🤵',
        provider: 'gemini',
        response: classification.directResponse,
      });
    } else {
      // Delegate to specialist agents (sequentially, so each sees prior updates)
      for (const agentKey of classification.delegateTo) {
        const agent = agents[agentKey];
        if (!agent) {
          console.warn(`  ⚠️ Unknown agent: ${agentKey}`);
          continue;
        }

        // Get fresh state (may have been updated by previous agent)
        const currentState = getSession(sessionId);
        const result = await agent.run(classification.refinedQuery, currentState);

        // Apply state updates from this agent
        if (result.stateUpdates && Object.keys(result.stateUpdates).length > 0) {
          updateSession(sessionId, result.stateUpdates);
        }

        responses.push(result);
      }
    }

    // Record all agent responses in history
    for (const resp of responses) {
      addToHistory(sessionId, 'assistant', resp.agentName, resp.response);
    }

    // Return the response
    const finalState = getSessionState(sessionId);

    res.json({
      sessionId,
      intent: classification.intent,
      responses: responses.map(r => ({
        agentName: r.agentName,
        emoji: r.emoji,
        provider: r.provider,
        message: r.response,
      })),
      state: finalState,
    });

  } catch (err) {
    console.error('❌ Chat error:', err);
    res.status(500).json({
      error: 'Failed to process your message. Please try again.',
      details: err.message,
    });
  }
}

// ─── Get State Controller ───────────────────────────────────────

export function getState(req, res) {
  const { sessionId } = req.params;
  const state = getSessionState(sessionId);

  if (!state) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ sessionId, state });
}

// ─── Reset Session Controller ───────────────────────────────────

export function resetSessionController(req, res) {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const success = resetSessionState(sessionId);
  if (!success) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({ sessionId, message: 'Session reset successfully' });
}

// ─── Select Menu Controller ─────────────────────────────────────

export function selectMenuController(req, res) {
  const { sessionId, menuId, catererId } = req.body;

  if (!sessionId || !menuId) {
    return res.status(400).json({ error: 'sessionId and menuId are required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Update state directly
  const cateringUpdate = { selectedMenuId: menuId };
  if (catererId) cateringUpdate.selectedCatererId = catererId;

  updateSession(sessionId, {
    catering: cateringUpdate
  });

  // Also add a system message so context is preserved
  addToHistory(sessionId, 'user', 'User', `I have selected menu option: ${menuId}`);

  res.json({ success: true, state: getSessionState(sessionId) });
}

// â”€â”€â”€ Select Caterer Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function selectCatererController(req, res) {
  const { sessionId, catererId } = req.body;

  if (!sessionId || !catererId) {
    return res.status(400).json({ error: 'sessionId and catererId are required' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const selectedCaterer = session.catering?.caterers?.find(c => c.id === catererId);
  const firstMenuId = selectedCaterer?.menus?.[0]?.id || null;

  updateSession(sessionId, {
    catering: {
      selectedCatererId: catererId,
      selectedMenuId: firstMenuId
    }
  });

  addToHistory(sessionId, 'user', 'User', `I have selected caterer: ${catererId}`);

  res.json({ success: true, state: getSessionState(sessionId) });
}

// â”€â”€â”€ Gemini Theme Image Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function generateThemeImageController(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const cleanPrompt = prompt.trim().slice(0, 1200);
    const cacheKey = cleanPrompt.toLowerCase();

    if (themeImageCache.has(cacheKey)) {
      return res.json(themeImageCache.get(cacheKey));
    }

    const imagePrompt = [
      cleanPrompt,
      'professional luxury wedding decor reference image',
      'realistic event photography',
      'elegant lighting',
      'no text, no watermark, no logo',
    ].join(', ');

    let imageUrl;
    let modelName;
    
    try {
      const generated = await geminiGenerateImage(imagePrompt);
      imageUrl = `data:${generated.mimeType};base64,${generated.data}`;
      modelName = generated.model;
    } catch (err) {
      console.warn(`⚠️ Gemini image failed (${err.status}), falling back to Pollinations AI...`);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?nologo=true&width=800&height=600`;
      modelName = 'pollinations.ai (fallback)';
    }

    const response = {
      imageUrl,
      model: modelName,
    };

    themeImageCache.set(cacheKey, response);
    res.json(response);
  } catch (err) {
    console.error('❌ Theme image controller error:', err);
    res.status(500).json({
      error: 'Failed to generate theme image.',
      details: err.message,
    });
  }
}
