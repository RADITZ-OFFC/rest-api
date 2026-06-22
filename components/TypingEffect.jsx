"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Typing effect — teks diketik satu per satu
 * Props:
 *   words    — array string yang akan diketik bergantian
 *   speed    — ms per karakter (default 80)
 *   pause    — ms diam setelah kata selesai (default 1800)
 *   className
 */
export default function TypingEffect({
  words = ["REST API", "DEVELOPER TOOLS", "INDONESIA"],
  speed = 80,
  pause = 1800,
  className = "",
}) {
  const [displayed, setDisplayed] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentWord = words[wordIndex];

    if (!deleting && charIndex < currentWord.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayed(currentWord.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      }, speed);
    } else if (!deleting && charIndex === currentWord.length) {
      timeoutRef.current = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIndex > 0) {
      timeoutRef.current = setTimeout(() => {
        setDisplayed(currentWord.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      }, speed / 2);
    } else if (deleting && charIndex === 0) {
      setDeleting(false);
      setWordIndex((i) => (i + 1) % words.length);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [charIndex, deleting, wordIndex, words, speed, pause]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span>{displayed}</span>
      <span
        className="inline-block shrink-0 w-[3px] h-[0.85em] bg-primary align-middle ml-1"
        style={{ animation: "blink 1s step-end infinite" }}
      />
    </span>
  );
}
