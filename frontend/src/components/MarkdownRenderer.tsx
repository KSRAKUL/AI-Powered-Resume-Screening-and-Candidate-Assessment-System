"use client";

import React from "react";
import { Sparkles, Activity, CheckCircle2, AlertTriangle, HelpCircle, FileText, BadgeCheck } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // If the content is empty, show a loading placeholder
  if (!content) return null;

  // Let's parse the content. The LLM returns sections starting with "## "
  // We can split by "## " to get each section.
  const sections = content.split(/(?=^## )/m);

  const parsedSections = sections.map((section, idx) => {
    const lines = section.trim().split("\n");
    const headerLine = lines[0] || "";
    const title = headerLine.replace(/^##\s+/, "").trim();
    const bodyLines = lines.slice(1);
    const bodyText = bodyLines.join("\n").trim();

    return {
      title,
      bodyText,
      lines: bodyLines,
      original: section
    };
  }).filter(s => s.title && s.bodyText);

  // Helper to render bullet points or text
  const renderBody = (title: string, lines: string[]) => {
    // Check if the lines are bullet points or numbered lists
    const isBulletList = lines.some(l => l.trim().startsWith("- ") || l.trim().startsWith("* "));
    const isNumberedList = lines.some(l => /^\d+\.\s+/.test(l.trim()));

    if (isBulletList) {
      const items = lines
        .map(l => l.trim().replace(/^[-*]\s+/, ""))
        .filter(l => l.length > 0);

      // Determine icons and colors based on the section title
      const isStrength = title.toLowerCase().includes("strength");
      const isGap = title.toLowerCase().includes("gap") || title.toLowerCase().includes("missing");
      
      const itemIcon = isStrength ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : isGap ? (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      ) : (
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5 mr-2" />
      );

      return (
        <ul className="space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
              {itemIcon}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (isNumberedList) {
      const items = lines
        .map(l => l.trim().replace(/^\d+\.\s+/, ""))
        .filter(l => l.length > 0);

      return (
        <ol className="space-y-4">
          {items.map((item, i) => (
            <li key={i} className="flex gap-4 p-3 bg-slate-950/40 rounded-xl border border-slate-800/40 hover:border-slate-800 transition">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm shrink-0">
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm leading-relaxed self-center">{item}</p>
            </li>
          ))}
        </ol>
      );
    }

    // Default: text block, parsing basic blockquotes or clean paragraphs
    return (
      <div className="space-y-3">
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (trimmed.startsWith(">")) {
            // Blockquote
            const quoteContent = trimmed.replace(/^>\s*/, "").replace(/^\[!(WARNING|NOTE|TIP)\]\s*/i, "");
            const isWarn = trimmed.includes("WARNING") || trimmed.includes("⚠️");
            
            return (
              <div 
                key={i} 
                className={`p-4 rounded-xl border my-4 ${
                  isWarn 
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-300" 
                    : "bg-indigo-500/5 border-indigo-500/20 text-indigo-300"
                }`}
              >
                <div className="flex gap-3">
                  {isWarn ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Sparkles className="w-5 h-5 shrink-0" />}
                  <p className="text-sm leading-relaxed font-medium">{quoteContent}</p>
                </div>
              </div>
            );
          }

          // Clean bold tags **text** -> strong
          if (trimmed.length === 0) return null;
          
          return (
            <p key={i} className="text-slate-300 text-sm leading-relaxed">
              {trimmed.split("**").map((chunk, j) => {
                if (j % 2 === 1) {
                  return <strong key={j} className="text-white font-semibold">{chunk}</strong>;
                }
                return chunk;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // Helper to get section headers icons
  const getSectionIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("summary")) return <FileText className="w-5 h-5 text-sky-400" />;
    if (t.includes("match") || t.includes("assessment")) return <Activity className="w-5 h-5 text-violet-400" />;
    if (t.includes("strength")) return <BadgeCheck className="w-5 h-5 text-emerald-400" />;
    if (t.includes("gap") || t.includes("skills")) return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    if (t.includes("recommendation")) return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
    if (t.includes("interview") || t.includes("question")) return <HelpCircle className="w-5 h-5 text-indigo-400" />;
    return <Sparkles className="w-5 h-5 text-indigo-400" />;
  };

  // Helper to get borders and backgrounds based on section
  const getSectionStyles = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("recommendation")) {
      return "border-l-4 border-l-fuchsia-500 bg-gradient-to-r from-fuchsia-950/15 to-slate-900/40";
    }
    if (t.includes("gap")) {
      return "border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-950/10 to-slate-900/40";
    }
    return "bg-slate-900/40";
  };

  // If the prompt generated something outside of "##" format, just render it as text
  if (parsedSections.length === 0) {
    return (
      <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 text-slate-300 text-sm leading-relaxed space-y-4">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {parsedSections.map((section, idx) => {
        // We render Interview Questions and Recommendations wide (spanning both columns) if possible
        const isWide = 
          section.title.toLowerCase().includes("interview") || 
          section.title.toLowerCase().includes("recommendation") ||
          section.title.toLowerCase().includes("summary");

        return (
          <div
            key={idx}
            className={`p-6 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl flex flex-col transition-all hover:border-slate-700/80 ${
              isWide ? "md:col-span-2" : ""
            } ${getSectionStyles(section.title)}`}
          >
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800/60">
              <div className="p-2 rounded-xl bg-slate-950/60 shadow-inner">
                {getSectionIcon(section.title)}
              </div>
              <h3 className="text-white font-bold tracking-tight text-base">{section.title}</h3>
            </div>
            <div className="flex-1">
              {renderBody(section.title, section.lines)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
