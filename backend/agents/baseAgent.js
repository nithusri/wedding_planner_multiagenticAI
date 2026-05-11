import { providers } from '../config/providers.js';

// ─── Base Agent Class ───────────────────────────────────────────
// All specialized agents extend this. Each agent is bound to a
// specific AI provider (gemini, groq, or cohere) at construction.

export class BaseAgent {
  constructor(name, emoji, providerName, systemPrompt) {
    this.name = name;
    this.emoji = emoji;
    this.providerName = providerName;
    this.generate = providers[providerName];
    this.systemPrompt = systemPrompt;

    if (!this.generate) {
      throw new Error(`Unknown provider: ${providerName}. Use: gemini, groq, or cohere`);
    }
  }

  /**
   * Build context string from the shared wedding state.
   * Agents receive the full state so they can cross-reference
   * each other's outputs (e.g., Scout reads styleProfile).
   */
  buildContext(state) {
    return `
=== CURRENT WEDDING PLANNING STATE ===
User Context: ${JSON.stringify(state.userContext, null, 2)}
Style Profile: ${JSON.stringify(state.styleProfile, null, 2)}
Financials: ${JSON.stringify(state.financials, null, 2)}
Catering: ${JSON.stringify(state.catering, null, 2)}
Venues Found: ${state.venues.length > 0 ? JSON.stringify(state.venues, null, 2) : 'None yet'}
Vendors Found: ${state.vendors.length > 0 ? JSON.stringify(state.vendors, null, 2) : 'None yet'}
Timeline: ${state.timeline.length > 0 ? JSON.stringify(state.timeline, null, 2) : 'Not created yet'}
=== END STATE ===
    `.trim();
  }

  /**
   * Run the agent. Sends the user message + state context to
   * this agent's specific LLM provider.
   */
  async run(userMessage, state) {
    const context = this.buildContext(state);
    const prompt = `${context}\n\nUser Message: ${userMessage}`;

    console.log(`  🔄 ${this.emoji} ${this.name} processing via ${this.providerName}…`);

    try {
      const response = await this.generate(prompt, this.systemPrompt);
      console.log(`  ✅ ${this.emoji} ${this.name} responded`);
      return {
        agentName: this.name,
        emoji: this.emoji,
        provider: this.providerName,
        response: response,
      };
    } catch (err) {
      console.error(`  ❌ ${this.name} failed:`, err.message);
      return {
        agentName: this.name,
        emoji: this.emoji,
        provider: this.providerName,
        response: `I apologize, but I'm having trouble connecting to my AI engine (${this.providerName}). Please try again in a moment. Error: ${err.message}`,
      };
    }
  }
}
