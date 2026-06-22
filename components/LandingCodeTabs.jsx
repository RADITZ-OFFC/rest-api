"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const tabs = [
  {
    id: "curl", label: "cURL",
    code: `curl -X GET \\
  "https://api.apistore.id/v1/weather?city=Jakarta" \\
  -H "X-API-Key: sk-xxxxxxxxxxxx"`,
    response: `{
  "status": true,
  "data": {
    "city": "Jakarta",
    "temp": 28,
    "humidity": 80,
    "condition": "Partly Cloudy"
  },
  "credits_used": 1,
  "credits_remaining": 999
}`,
  },
  {
    id: "js", label: "JavaScript",
    code: `const res = await fetch(
  "https://api.apistore.id/v1/weather?city=Jakarta",
  {
    headers: {
      "X-API-Key": "sk-xxxxxxxxxxxx",
    },
  }
);

const data = await res.json();`,
    response: `{
  "status": true,
  "data": { "city": "Jakarta", "temp": 28 },
  "credits_remaining": 999
}`,
  },
  {
    id: "python", label: "Python",
    code: `import requests

data = requests.get(
  "https://api.apistore.id/v1/weather",
  params={"city": "Jakarta"},
  headers={"X-API-Key": "sk-xxxxxxxxxxxx"}
).json()`,
    response: `{
  "status": True,
  "data": { "city": "Jakarta", "temp": 28 },
  "credits_remaining": 999
}`,
  },
];

export default function LandingCodeTabs() {
  const [active, setActive] = useState("curl");
  const [copied, setCopied] = useState(false);
  const current = tabs.find((t) => t.id === active);

  function handleCopy() {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-surface-card">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                active === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-text-faint hover:text-text-muted"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button onClick={handleCopy} className="text-text-faint hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-white/5">
          {copied ? <Check size={13} className="text-secondary" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Code */}
      <div className="p-4">
        <pre className="text-xs font-mono leading-6 text-text-muted overflow-x-auto">
          {current?.code}
        </pre>
      </div>

      {/* Response */}
      <div className="border-t border-white/[0.06] p-4 bg-surface">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="text-xs font-medium text-secondary">200 OK</span>
          <span className="text-xs text-text-faint ml-auto">234ms · 1 credit</span>
        </div>
        <pre className="text-xs font-mono leading-5 text-text-faint overflow-x-auto">
          {current?.response}
        </pre>
      </div>
    </div>
  );
}
