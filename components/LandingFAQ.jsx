"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "What is ApiStore?",                    a: "ApiStore is a REST API marketplace for Indonesian developers. Buy access to various APIs, get an API key, and integrate it directly into your project." },
  { q: "How does authentication work?",         a: "Add your API key as a header: X-API-Key: sk-xxxx. Generate keys from your dashboard after purchasing an API package." },
  { q: "What APIs are available?",             a: "We offer APIs across multiple categories: Weather, SMS, Identity, Finance, Media, and Utility. Each endpoint is fully documented." },
  { q: "What are the rate limits?",             a: "Free plan: 30 req/min. Pro: 120 req/min. VVIP: 300 req/min. Rate limits are per API key." },
  { q: "How do I upgrade my plan?",             a: "Go to your dashboard, navigate to Billing, and choose your plan. Payment confirmation is done by admin — automatic QRIS payment coming soon." },
  { q: "Is my data secure?",                   a: "Yes. All passwords and API keys are encrypted with industry standards. Data is never stored in plaintext." },
  { q: "What happens if an endpoint fails?",   a: "Our auto-recovery system automatically deactivates problematic endpoints to maintain stability. You can check system status anytime." },
  { q: "Do you have API documentation?",       a: "Yes, full documentation is available at the Docs page. Each endpoint includes parameters, example requests, and response formats." },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="flex flex-col divide-y divide-white/[0.06]">
      {faqs.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between py-4 text-left gap-4 group"
          >
            <span className={`text-sm font-medium transition-colors ${open === i ? "text-text-primary" : "text-text-muted group-hover:text-text-primary"}`}>
              {faq.q}
            </span>
            <span className="shrink-0 text-text-faint group-hover:text-primary transition-colors">
              {open === i ? <Minus size={15} /> : <Plus size={15} />}
            </span>
          </button>
          {open === i && (
            <div className="pb-4">
              <p className="text-sm text-text-muted leading-relaxed">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
