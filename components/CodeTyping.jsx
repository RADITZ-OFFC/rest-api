"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Code block yang "diketik" saat masuk viewport.
 * Props:
 *   code     — string kode yang akan diketik
 *   language — label bahasa (kanan atas)
 *   title    — nama file (kiri atas)
 *   speed    — ms per karakter (default 18)
 *   delay    — ms sebelum mulai mengetik (default 300)
 *   tokens   — array {text, cls} untuk syntax highlight (optional)
 */

// Tokenizer sederhana untuk syntax highlight
function tokenize(code) {
  const lines = code.split("\n");
  return lines.map((line, li) => {
    const isComment = line.trim().startsWith("//") || line.trim().startsWith("#");
    if (isComment) {
      return { key: li, parts: [{ text: line, cls: "text-text-faint italic" }] };
    }

    // Split per segment dengan regex sederhana
    const parts = [];
    let rest = line;
    const patterns = [
      { re: /^(const|let|var|async|await|function|return|import|from|export|default|if|else|true|false|null|undefined|def|True|False|None|import|requests|print)\b/, cls: "text-primary" },
      { re: /^(GET|POST|PUT|PATCH|DELETE|curl)\b/, cls: "text-muted font-semibold" },
      { re: /^("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/, cls: "text-secondary" },
      { re: /^\b\d+\b/, cls: "text-secondary" },
      { re: /^-[HX]\b/, cls: "text-primary" },
      { re: /^[a-zA-Z_]\w*(?=\s*\()/, cls: "text-primary-light" },
    ];

    let safety = 0;
    while (rest.length > 0 && safety++ < 500) {
      let matched = false;
      for (const { re, cls } of patterns) {
        const m = re.exec(rest);
        if (m) {
          parts.push({ text: m[0], cls });
          rest = rest.slice(m[0].length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const last = parts[parts.length - 1];
        if (last && !last.cls) last.text += rest[0];
        else parts.push({ text: rest[0], cls: "text-text-muted" });
        rest = rest.slice(1);
      }
    }

    return { key: li, parts };
  });
}

export default function CodeTyping({
  code = "",
  language = "bash",
  title = "example.sh",
  speed = 16,
  delay = 400,
  className = "",
}) {
  const ref = useRef(null);
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Start on viewport entry
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Typing effect
  useEffect(() => {
    if (!started) return;
    let i = 0;
    let timeout;

    function type() {
      if (i <= code.length) {
        setDisplayed(code.slice(0, i));
        i++;
        timeout = setTimeout(type, speed);
      } else {
        setDone(true);
      }
    }

    timeout = setTimeout(type, delay);
    return () => clearTimeout(timeout);
  }, [started, code, speed, delay]);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tokens = tokenize(displayed);

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-white/[0.08] overflow-hidden bg-surface-card ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-surface">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-900/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-900/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-900/80" />
          </div>
          <span className="text-xs font-mono text-text-faint">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-text-faint border border-white/[0.06] px-2 py-0.5 rounded">
            {language}
          </span>
          {done && (
            <button
              onClick={handleCopy}
              className="text-text-faint hover:text-primary transition-colors p-1 rounded"
            >
              {copied ? <Check size={12} className="text-secondary" /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Code area */}
      <pre className="p-5 text-xs font-mono leading-6 overflow-x-auto min-h-[120px]">
        {tokens.map((line) => (
          <div key={line.key}>
            {line.parts.map((part, pi) => (
              <span key={pi} className={part.cls}>{part.text}</span>
            ))}
            {"\n"}
          </div>
        ))}
        {/* Cursor saat mengetik */}
        {!done && started && (
          <span
            className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-px"
            style={{ animation: "blink 0.8s step-end infinite" }}
          />
        )}
      </pre>
    </div>
  );
}
