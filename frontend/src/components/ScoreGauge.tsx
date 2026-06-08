"use client";

import React, { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number | string | null | undefined;
  category?: string;
}

export default function ScoreGauge({ score, category }: ScoreGaugeProps) {
  // Gracefully parse and handle potential undefined/null/string/NaN score values
  const parsedScore = parseFloat(String(score));
  const safeScore = isNaN(parsedScore) ? 0 : Math.max(0, Math.min(10, parsedScore));

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Smooth score increment animation
    const duration = 1200; // ms
    const steps = 60;
    const increment = safeScore / steps;
    let current = 0;
    
    // Reset immediately to 0 when safeScore changes, before beginning animation
    setAnimatedScore(0);
    
    const interval = setInterval(() => {
      current += increment;
      if (current >= safeScore) {
        setAnimatedScore(safeScore);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [safeScore]);

  // Determine colors and badges based on LLM Fit Classification
  const normalizedCategory = String(category || "").toLowerCase();
  
  let textColor = "text-amber-400";
  let badgeText = category || "Core Skills Match (Trainable)";
  let badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  let startColor = "#f59e0b";
  let endColor = "#ea580c";

  if (normalizedCategory.includes("outstanding") || normalizedCategory.includes("expert")) {
    textColor = "text-emerald-400";
    badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    startColor = "#10b981";
    endColor = "#14b8a6";
  } else if (normalizedCategory.includes("strong") || normalizedCategory.includes("plug")) {
    textColor = "text-indigo-400";
    badgeBg = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    startColor = "#6366f1";
    endColor = "#8b5cf6";
  } else if (normalizedCategory.includes("core skills") || normalizedCategory.includes("trainable")) {
    textColor = "text-amber-400";
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    startColor = "#f59e0b";
    endColor = "#d97706";
  } else if (normalizedCategory.includes("heavy training") || normalizedCategory.includes("needs")) {
    textColor = "text-orange-400";
    badgeBg = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    startColor = "#f97316";
    endColor = "#ea580c";
  } else if (normalizedCategory.includes("not aligned") || normalizedCategory.includes("poor") || normalizedCategory.includes("low")) {
    textColor = "text-rose-400";
    badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    startColor = "#f43f5e";
    endColor = "#e11d48";
  }

  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  // Guard against any theoretical NaN offset
  const scoreRatio = isNaN(animatedScore) ? 0 : animatedScore / 10;
  const strokeDashoffset = circumference - scoreRatio * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl w-full">
      <h3 className="text-slate-400 text-sm font-semibold mb-4 tracking-wider uppercase">AI Fit Classification</h3>
      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          {/* Background Ring */}
          <circle
            className="text-slate-800"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
          />
          {/* Glowing Filter */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="stop-color-indigo-500" stopColor={startColor} />
              <stop offset="100%" className="stop-color-violet-500" stopColor={endColor} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Foreground Circle */}
          <circle
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference.toString()}
            strokeDashoffset={strokeDashoffset.toString()}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx="70"
            cy="70"
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
            filter="url(#glow)"
          />
        </svg>
        {/* Core Percentage Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${textColor}`}>
            {isNaN(animatedScore) ? "0" : animatedScore.toString()}
          </span>
          <span className="text-slate-500 text-xs font-semibold mt-0.5">out of 10</span>
        </div>
      </div>
      <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold border text-center max-w-full truncate ${badgeBg}`}>
        {badgeText}
      </div>
    </div>
  );
}
