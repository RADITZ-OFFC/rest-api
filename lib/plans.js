/**
 * Definisi plan — single source of truth
 * Dipakai di frontend, API routes, dan admin
 */
export const PLANS = {
  user: {
    name:        "Free",
    label:       "free",
    price:       0,
    color:       "text-text-muted",
    border:      "border-white/[0.06]",
    bg:          "bg-white/[0.02]",
    badge:       "badge-muted",
    credits:     500,
    apiKeys:     1,
    rateLimit:   30,
    logsHistory: 7,
    features: [
      "500 credits per day",
      "1 API key",
      "30 requests/min",
      "Public endpoints only",
      "7-day request logs",
      "Community support",
    ],
  },
  premium: {
    name:        "Premium",
    label:       "premium",
    price:       25000,
    color:       "text-primary",
    border:      "border-primary/30",
    bg:          "bg-primary/5",
    badge:       "badge-primary",
    credits:     10000,
    apiKeys:     5,
    rateLimit:   120,
    logsHistory: 30,
    features: [
      "10,000 credits per day",
      "5 API keys",
      "120 requests/min",
      "All endpoints",
      "30-day request logs",
      "Priority email support",
    ],
  },
  super_premium: {
    name:        "Super Premium",
    label:       "super_premium",
    price:       50000,
    color:       "text-secondary",
    border:      "border-secondary/30",
    bg:          "bg-secondary/5",
    badge:       "badge-active",
    credits:     100000,
    apiKeys:     10,
    rateLimit:   300,
    logsHistory: 90,
    features: [
      "100,000 credits per day",
      "10 API keys",
      "300 requests/min",
      "All endpoints + priority",
      "90-day request logs",
      "Dedicated support",
    ],
  },
};

export const PLAN_ORDER = ["user", "premium", "super_premium"];

/**
 * Cek apakah plan A lebih tinggi dari plan B
 */
export function isPlanHigher(a, b) {
  return PLAN_ORDER.indexOf(a) > PLAN_ORDER.indexOf(b);
}

/**
 * Ambil plan info dari role string
 */
export function getPlan(role) {
  return PLANS[role] || PLANS.user;
}
