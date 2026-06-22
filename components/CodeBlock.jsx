"use client";

/**
 * Code block dengan syntax highlighting warna
 * Support: keywords (purple), strings (green), comments (grey),
 *          functions (periwinkle), numbers (olive)
 */

const TOKEN_RULES = [
  // Comment
  { regex: /(\/\/[^\n]*|#[^\n]*)/g,        cls: "text-text-faint italic" },
  // String
  { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: "text-secondary" },
  // Keywords JS/Python
  { regex: /\b(const|let|var|async|await|function|return|import|from|export|default|if|else|try|catch|class|new|this|true|false|null|undefined|import|requests|print|def|True|False|None)\b/g, cls: "text-primary" },
  // HTTP methods / status
  { regex: /\b(GET|POST|PUT|PATCH|DELETE|curl)\b/g, cls: "text-muted font-bold" },
  // Numbers
  { regex: /\b(\d+)\b/g, cls: "text-secondary" },
  // Function calls
  { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, cls: "text-primary-light" },
  // URL / path strings
  { regex: /(https?:\/\/[^\s"']+)/g, cls: "text-secondary underline" },
  // Keys / properties
  { regex: /"([^"]+)":/g, cls: "text-muted" },
];

function tokenize(code) {
  // Simple split by newline, return styled spans
  const lines = code.split("\n");
  return lines.map((line, li) => {
    // Apply simple coloring per line
    let colored = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    if (colored.trim().startsWith("//") || colored.trim().startsWith("#")) {
      return (
        <span key={li} className="text-text-faint italic">
          {line}{"\n"}
        </span>
      );
    }

    // Process token by token per char is complex — use simple regex highlight
    // We do it as segments
    return (
      <span key={li}>
        <HighlightLine line={line} />{"\n"}
      </span>
    );
  });
}

function HighlightLine({ line }) {
  // Tokenize with simple rules — returns array of {text, cls}
  const segments = [];
  let remaining = line;
  let safety = 0;

  while (remaining.length > 0 && safety < 500) {
    safety++;
    let matched = false;

    // Try each rule
    for (const rule of TOKEN_RULES) {
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(remaining);
      if (match && match.index === 0) {
        segments.push({ text: match[0], cls: rule.cls });
        remaining = remaining.slice(match[0].length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Plain char
      const nextSpecial = remaining.search(/["'`\/\b]/);
      const plain = nextSpecial > 0 ? remaining.slice(0, nextSpecial) : remaining[0];
      if (segments.length > 0 && !segments[segments.length - 1].cls) {
        segments[segments.length - 1].text += plain;
      } else {
        segments.push({ text: plain, cls: null });
      }
      remaining = remaining.slice(plain.length);
    }
  }

  return (
    <>
      {segments.map((seg, i) =>
        seg.cls ? (
          <span key={i} className={seg.cls}>{seg.text}</span>
        ) : (
          <span key={i} className="text-text-muted">{seg.text}</span>
        )
      )}
    </>
  );
}

export default function CodeBlock({ code, language = "js", title, response, className = "" }) {
  return (
    <div className={`border border-surface-border overflow-hidden ${className}`}>
      {/* Window bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border bg-surface">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-900" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-900" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-900" />
        </div>
        {title && (
          <span className="text-2xs font-mono text-text-faint ml-2">{title}</span>
        )}
        <span className="ml-auto text-2xs font-bold tracking-widest uppercase text-text-faint border border-surface-border px-2 py-0.5">
          {language.toUpperCase()}
        </span>
      </div>

      {/* Code */}
      <pre className="p-5 text-xs font-mono leading-6 overflow-x-auto bg-surface-dark">
        {tokenize(code)}
      </pre>

      {/* Response block */}
      {response && (
        <div className="border-t border-surface-border bg-surface p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xs font-black tracking-widest uppercase text-secondary">
              RESPONS — 200 OK
            </span>
            <span className="text-2xs text-text-faint">234MS · BIAYA: 1 CREDIT</span>
          </div>
          <pre className="text-xs font-mono leading-6 overflow-x-auto text-text-muted">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
