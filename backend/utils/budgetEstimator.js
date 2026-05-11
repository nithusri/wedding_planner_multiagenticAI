const INR_LOCATIONS = [
  'india',
  'udaipur',
  'jaipur',
  'goa',
  'delhi',
  'mumbai',
  'hyderabad',
  'bangalore',
  'bengaluru',
  'chennai',
  'kolkata',
];

const DESTINATION_KEYWORDS = [
  'destination',
  'bali',
  'santorini',
  'dubai',
  'maldives',
  'thailand',
  'italy',
  'paris',
  'goa',
  'udaipur',
  'jaipur',
];

const LUXURY_KEYWORDS = [
  'luxury',
  'royal',
  'palace',
  'premium',
  'grand',
  'lavish',
  'heritage',
  'resort',
];

const MULTI_DAY_KEYWORDS = [
  'hindu',
  'indian',
  'sikh',
  'mehendi',
  'sangeet',
  'haldi',
  'multi-day',
  'multiday',
];

function normalizedText(...values) {
  return values.filter(Boolean).join(' ').toLowerCase();
}

function parseNumericAmount(rawAmount, multiplierWord = '') {
  if (!rawAmount) return 0;
  const value = Number(String(rawAmount).replace(/,/g, ''));
  if (!Number.isFinite(value)) return 0;

  const unit = multiplierWord.toLowerCase();
  if (unit.includes('crore')) return value * 10000000;
  if (unit.includes('lakh') || unit.includes('lac')) return value * 100000;
  if (unit === 'k') return value * 1000;
  if (unit.includes('million')) return value * 1000000;

  return value;
}

function inferCurrency(userMessage, state) {
  const text = normalizedText(userMessage, state?.userContext?.location, state?.userContext?.culture);
  if (/[₹]|rs\.?|inr|lakh|lac|crore/.test(text)) return 'INR';
  if (/[$]|usd|dollar/.test(text)) return 'USD';
  if (INR_LOCATIONS.some(location => text.includes(location))) return 'INR';
  return state?.financials?.currency || 'USD';
}

function extractBudget(userMessage, state) {
  const text = userMessage || '';
  const currency = inferCurrency(userMessage, state);
  const existingBudget = Number(state?.userContext?.budget || state?.financials?.totalBudget || 0);

  const patterns = [
    /(?:₹|rs\.?|inr)\s*([\d,.]+)\s*(lakh|lac|crore|k|million)?/i,
    /(?:\$|usd)\s*([\d,.]+)\s*(k|million)?/i,
    /([\d,.]+)\s*(lakh|lac|crore)\b/i,
    /([\d,.]+)\s*(?:k|million)?\s*(?:budget|total budget)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        amount: Math.round(parseNumericAmount(match[1], match[2] || '')),
        currency,
        provided: true,
      };
    }
  }

  if (existingBudget > 0) {
    return {
      amount: Math.round(existingBudget),
      currency,
      provided: true,
    };
  }

  return { amount: 0, currency, provided: false };
}

function includesAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function getLocationMultiplier(text, currency) {
  if (currency === 'INR') {
    if (text.includes('udaipur')) return 1.9;
    if (text.includes('goa')) return 1.65;
    if (text.includes('jaipur')) return 1.45;
    if (text.includes('mumbai') || text.includes('delhi')) return 1.35;
    return 1;
  }

  if (text.includes('santorini') || text.includes('maldives')) return 1.9;
  if (text.includes('bali') || text.includes('dubai')) return 1.6;
  if (text.includes('new york') || text.includes('los angeles')) return 1.35;
  return 1;
}

function getScaleDiscount(guestCount) {
  if (guestCount >= 350) return 0.9;
  if (guestCount >= 200) return 0.94;
  if (guestCount <= 60) return 1.16;
  return 1;
}

function roundBudget(value, currency) {
  const increment = currency === 'INR' ? 25000 : 500;
  return Math.round(value / increment) * increment;
}

function calculateEstimatedRequired(userMessage, state, currency) {
  const guestCount = Number(state?.userContext?.guestCount || 0) || 100;
  const text = normalizedText(
    userMessage,
    state?.userContext?.location,
    state?.userContext?.culture,
    state?.userContext?.vibe?.join(' '),
    state?.styleProfile?.theme,
    state?.styleProfile?.decorElements?.join(' ')
  );

  const isDestination = includesAny(text, DESTINATION_KEYWORDS);
  const isLuxury = includesAny(text, LUXURY_KEYWORDS);
  const isMultiDay = includesAny(text, MULTI_DAY_KEYWORDS);

  const profile = currency === 'INR'
    ? { basePerGuest: 7000, fixed: 350000, minimum: 800000 }
    : { basePerGuest: 260, fixed: 8000, minimum: 18000 };

  let multiplier = getLocationMultiplier(text, currency);
  if (isDestination) multiplier *= currency === 'INR' ? 1.22 : 1.35;
  if (isLuxury) multiplier *= 1.22;
  if (isMultiDay) multiplier *= currency === 'INR' ? 1.25 : 1.14;
  multiplier *= getScaleDiscount(guestCount);

  const rawEstimate = Math.max(
    profile.minimum,
    (guestCount * profile.basePerGuest + profile.fixed) * multiplier
  );

  return {
    guestCount,
    estimatedRequired: roundBudget(rawEstimate, currency),
    isDestination,
    isLuxury,
    isMultiDay,
  };
}

function getAllocationPercentages(isDestination) {
  if (isDestination) {
    return {
      venue: 0.34,
      catering: 0.23,
      decor: 0.12,
      photography: 0.09,
      attireBeauty: 0.05,
      entertainment: 0.03,
      travelHospitality: 0.08,
      contingency: 0.06,
    };
  }

  return {
    venue: 0.31,
    catering: 0.28,
    decor: 0.14,
    photography: 0.1,
    attireBeauty: 0.06,
    entertainment: 0.04,
    stationery: 0.02,
    contingency: 0.05,
  };
}

function buildAllocation(total, currency, isDestination) {
  const percentages = getAllocationPercentages(isDestination);
  return Object.fromEntries(
    Object.entries(percentages).map(([category, percentage]) => [
      category,
      roundBudget(total * percentage, currency),
    ])
  );
}

function getFeasibility(ratio) {
  if (ratio >= 1.15) return 'highly_feasible';
  if (ratio >= 1) return 'feasible';
  if (ratio >= 0.85) return 'tight';
  return 'needs_revision';
}

export function formatMoney(amount, currency = 'USD') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(amount || 0)));
}

export function createBudgetPlan(userMessage, state) {
  const budget = extractBudget(userMessage, state);
  const estimate = calculateEstimatedRequired(userMessage, state, budget.currency);
  const workingBudget = budget.provided ? budget.amount : estimate.estimatedRequired;
  const ratio = workingBudget / estimate.estimatedRequired;
  const budgetGap = Math.max(0, estimate.estimatedRequired - workingBudget);
  const costPerGuest = roundBudget(estimate.estimatedRequired / estimate.guestCount, budget.currency);
  const allocationBase = budget.provided ? workingBudget : estimate.estimatedRequired;
  const allocation = buildAllocation(allocationBase, budget.currency, estimate.isDestination);

  const warnings = [];
  if (!budget.provided) {
    warnings.push(`No fixed budget was provided, so I estimated a realistic starting budget of ${formatMoney(estimate.estimatedRequired, budget.currency)}.`);
  }
  if (budgetGap > 0) {
    warnings.push(`The estimated plan exceeds the given budget by ${formatMoney(budgetGap, budget.currency)}.`);
    warnings.push(`To stay within budget, reduce guest count to about ${Math.max(20, Math.floor(estimate.guestCount * ratio))} guests, simplify decor, or choose a lower-cost venue/location.`);
  }
  if (estimate.isDestination) {
    warnings.push('Destination weddings include extra hospitality, logistics, travel coordination, and multi-day buffer costs.');
  }

  return {
    totalBudget: workingBudget,
    currency: budget.currency,
    budgetProvided: budget.provided,
    estimatedRequired: estimate.estimatedRequired,
    budgetGap,
    costPerGuest,
    guestCount: estimate.guestCount,
    allocation,
    feasibility: getFeasibility(ratio),
    warnings,
  };
}
