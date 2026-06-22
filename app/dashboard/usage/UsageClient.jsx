"use client";

import { useState } from "react";

export default function UsageClient() {
  const [period, setPeriod] = useState("30");
  const periods = ["7", "14", "30", "90"];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex gap-0 border border-surface-border">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-2xs font-black tracking-widest uppercase border-r border-surface-border last:border-r-0 transition-colors ${
              period === p
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text-primary hover:bg-surface"
            }`}
          >
            {p}D
          </button>
        ))}
      </div>
      <span className="text-2xs font-bold tracking-widest uppercase text-text-faint">
        LAST UPDATED: {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
