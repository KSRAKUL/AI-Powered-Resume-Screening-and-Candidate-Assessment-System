"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  HelpCircle,
  Brain,
  RotateCcw
} from "lucide-react";
import ScoreGauge from "./ScoreGauge";
import MarkdownRenderer from "./MarkdownRenderer";

interface AnalysisResult {
  success: boolean;
  filename: string;
  score: number;
  category: string;
  resume_skills: string[];
  missing_skills: string[];
  ai_analysis: string;
  resume_text: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        setError(null);
      } else {
        setError("Only PDF files are supported.");
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError(null);
    setShowRawText(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume PDF file.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    // Simulate stages for realistic micro-interaction
    setAnalysisStage("Extracting text from PDF...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStage("Matching qualifications...");
    await new Promise((r) => setTimeout(r, 600));

    setAnalysisStage("Consulting HireSense...");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jobDescription);

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Server error occurred during analysis.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect to the analysis backend. Please make sure the FastAPI server is running on port 8000.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage("");
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-8">
      {/* Header section with modern badge and glowing text */}
      <header className="flex flex-col items-center text-center gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
          <Brain className="w-3.5 h-3.5" /> Next-Gen AI Screening
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-400 bg-clip-text text-transparent">
          AI Resume Screening System
        </h1>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
          Instantly evaluate resumes against job descriptions. Our parser extracts skills, evaluates matching density, and leverages AI to draft recruiter briefings.
        </p>
      </header>

      {/* Main Workspace: Form Inputs or Dashboard Results */}
      {!result ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: File uploader */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">1</span>
              Upload Candidate Profile
            </h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center min-h-[300px] p-8 border-2 border-dashed rounded-3xl transition-all duration-300 backdrop-blur-sm cursor-pointer group ${
                isDragging 
                  ? "border-indigo-400 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.15)]" 
                  : "border-slate-800 bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/30"
              }`}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />

              {!file ? (
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-4 rounded-full bg-slate-900/80 border border-slate-800 shadow-md group-hover:scale-110 transition duration-300">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Drag and drop resume PDF here</p>
                    <p className="text-slate-500 text-xs mt-1">or click to browse local files</p>
                  </div>
                  <div className="px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-900 text-slate-500 text-[10px] uppercase font-semibold">
                    Supports PDFs up to 10MB
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                  <div className="relative p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-md">
                    <FileText className="w-10 h-10 text-indigo-400" />
                    <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white border border-slate-950">
                      <Check className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="w-full">
                    <p className="text-white font-medium text-sm truncate max-w-xs">{file.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF File
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800/60 hover:bg-slate-900/80 text-rose-400 hover:text-rose-300 text-xs font-semibold tracking-wide transition shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Job Description and Submit */}
          <div className="flex flex-col gap-6 w-full">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-sm">2</span>
              Enter Target Job Requirements
            </h2>

            <div className="flex flex-col gap-3">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the detailed Job Description (responsibilities, technical stack, qualifications) here..."
                className="w-full min-h-[300px] p-5 bg-slate-900/20 backdrop-blur-sm border border-slate-800 rounded-3xl text-slate-300 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 resize-none leading-relaxed"
              />
            </div>

            {/* Error notifications inside layout */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                <p className="leading-relaxed font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !file || !jobDescription.trim()}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl text-sm font-bold uppercase tracking-wider text-white shadow-xl shadow-indigo-950/20 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none transition duration-200"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                  <span>{analysisStage}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze Resume Qualifications</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // Results View
        <div className="flex flex-col gap-8">
          {/* Control Bar: Reset or Re-test */}
          <div className="flex justify-between items-center gap-4 p-4 rounded-2xl bg-slate-900/20 backdrop-blur-sm border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <FileText className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Analyzed File</p>
                <h4 className="text-slate-400 text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{result.filename}</h4>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800/60 hover:bg-slate-900/80 text-slate-300 hover:text-white text-xs font-bold tracking-wide transition shadow-sm"
            >
              <RotateCcw className="w-4 h-4" /> Start New Assessment
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Metrics & Skill Matches */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              <ScoreGauge score={result.score} category={result.category} />

              {/* Skills Overview Details */}
              <div className="flex flex-col p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl gap-6">
                {/* Identified Skills */}
                <div>
                  <h4 className="text-white font-bold text-sm mb-3 tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    Matching Skills ({result.resume_skills.length})
                  </h4>

                  {result.resume_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.resume_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">No matching keywords identified.</p>
                  )}
                </div>

                <div className="border-t border-slate-800/60 my-1" />

                {/* Missing Skills */}
                <div>
                  <h4 className="text-white font-bold text-sm mb-3 tracking-wide flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/20 text-xs">
                      <X className="w-3.5 h-3.5" />
                    </span>
                    Missing Key Skills ({result.missing_skills.length})
                  </h4>

                  {result.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.missing_skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs italic">None! All job skills match.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: AI Analysis Cards */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              <MarkdownRenderer content={result.ai_analysis} />
            </div>
          </div>

          <div className="border-t border-slate-800/50 my-4" />

          {/* Expander: Raw Text Preview */}
          <div className="p-6 bg-slate-900/20 backdrop-blur-sm border border-slate-800 rounded-2xl">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between text-white hover:text-indigo-400 transition"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-sm">View Raw Extracted Resume Text</span>
              </div>
              {showRawText ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {showRawText && (
              <div className="mt-4 pt-4 border-t border-slate-800/60">
                <textarea
                  readOnly
                  value={result.resume_text}
                  className="w-full h-80 p-4 bg-slate-950/80 border border-slate-900 rounded-xl text-slate-400 font-mono text-xs leading-relaxed focus:outline-none resize-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Footer */}
      <footer className="mt-auto pt-8 border-t border-slate-900/60 flex flex-col items-center gap-2">
        <p className="text-slate-600 text-xs font-semibold tracking-wider uppercase">
          AI-Powered Candidate Assessment System
        </p>
      </footer>
    </div>
  );
}
