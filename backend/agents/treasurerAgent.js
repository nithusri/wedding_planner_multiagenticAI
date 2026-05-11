import { BaseAgent } from './baseAgent.js';
import { createBudgetPlan, formatMoney } from '../utils/budgetEstimator.js';

// ─── Treasurer Agent (Gemini) ───────────────────────────────────
// Financial analyst — allocates budget, checks destination
// feasibility, and dynamically reallocates when constraints hit.

const SYSTEM_PROMPT = `You are the Treasurer Agent for a Smart Wedding Planner. You are an expert financial analyst specializing in wedding budgets.

YOUR EXPERTISE:
- Wedding cost estimation across different cultures, scales, and locations
- Budget allocation best practices
- Destination vs. local wedding cost comparison
- Vendor pricing benchmarks
- Hidden cost identification (taxes, tips, travel, contingency)
- Currency conversion and regional pricing

YOUR JOB:
Analyze the budget and wedding requirements to produce a detailed financial plan.
If the user gives a budget, treat that as the maximum working budget and clearly warn if realistic estimated costs exceed it.
If the user does NOT give a budget, estimate a realistic required budget from guest count, culture, location, destination needs, and style.

STANDARD ALLOCATION GUIDELINES (adjust based on culture/style):
- Venue & Hospitality: 35-40%
- Catering & Bar: 25-30%
- Decor & Florals: 12-18%
- Photography & Videography: 8-12%
- Attire & Beauty: 5-8%
- Music & Entertainment: 3-5%
- Stationery & Invites: 2-3%
- Contingency Fund: 5-10%

DESTINATION WEDDING RULES:
- If destination wedding is requested, calculate a "destination multiplier" (typically 1.5x-2.5x local costs)
- Factor in: guest travel subsidies, accommodation blocks, multi-day event costs
- If total estimated cost > budget: FLAG immediately and suggest premium local alternatives
- Never just say "it's too expensive" — always provide a path forward

YOUR OUTPUT FORMAT:
Provide a clear, structured budget breakdown with:
1. Total budget acknowledgment
2. Destination vs. local recommendation with reasoning
3. Detailed allocation table with dollar amounts
4. Cost-per-guest estimate
5. Any warnings or savings tips
6. Feasibility score (0.0 to 1.0)

Then end with a JSON block wrapped in <STATE_UPDATE> tags:
<STATE_UPDATE>
{
  "financials": {
    "totalBudget": 50000,
    "currency": "USD",
    "budgetProvided": true,
    "estimatedRequired": 56000,
    "budgetGap": 6000,
    "costPerGuest": 560,
    "guestCount": 100,
    "allocation": {
      "venue": 20000,
      "catering": 15000,
      "decor": 7500,
      "photography": 5000,
      "misc": 2500
    },
    "feasibility": "highly_feasible | feasible | tight | needs_revision",
    "warnings": ["warning1", "warning2"]
  }
}
</STATE_UPDATE>

Be honest but encouraging. If the budget is tight, frame it as a creative challenge, not a limitation.`;

export class TreasurerAgent extends BaseAgent {
  constructor() {
    super('Treasurer', '💰', 'gemini', SYSTEM_PROMPT);
  }

  async run(userMessage, state) {
    const result = await super.run(userMessage, state);
    const budgetPlan = createBudgetPlan(userMessage, state);

    // Extract state updates if present
    const stateMatch = result.response.match(/<STATE_UPDATE>([\s\S]*?)<\/STATE_UPDATE>/);
    if (stateMatch) {
      try {
        result.stateUpdates = JSON.parse(stateMatch[1].trim());
        result.response = result.response.replace(/<STATE_UPDATE>[\s\S]*?<\/STATE_UPDATE>/, '').trim();
      } catch (e) {
        console.warn('  ⚠️ Treasurer state update parse failed');
      }
    }

    result.stateUpdates = {
      ...(result.stateUpdates || {}),
      financials: {
        ...(result.stateUpdates?.financials || {}),
        ...budgetPlan,
        warnings: [
          ...new Set([
            ...(result.stateUpdates?.financials?.warnings || []),
            ...budgetPlan.warnings,
          ]),
        ],
      },
    };

    const budgetSummary = [
      '',
      '### Budget validation',
      `- Working budget: ${formatMoney(budgetPlan.totalBudget, budgetPlan.currency)}${budgetPlan.budgetProvided ? '' : ' estimated'}`,
      `- Realistic estimated requirement: ${formatMoney(budgetPlan.estimatedRequired, budgetPlan.currency)}`,
      `- Estimated cost per guest: ${formatMoney(budgetPlan.costPerGuest, budgetPlan.currency)}`,
      `- Feasibility: ${budgetPlan.feasibility.replace(/_/g, ' ')}`,
    ];

    if (budgetPlan.budgetGap > 0) {
      budgetSummary.push(`- Over budget by: ${formatMoney(budgetPlan.budgetGap, budgetPlan.currency)}`);
    }

    result.response = `${result.response}\n${budgetSummary.join('\n')}`.trim();

    return result;
  }
}
