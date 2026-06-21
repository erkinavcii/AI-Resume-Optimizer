import React, { useState, useEffect } from "react";
import { ResumeData, JobRequirements, OptimizationsFeedback } from "./types";
import { mockResumeData } from "./data/mockResume";
import RequirementsParser from "./components/RequirementsParser";
import AuditPanel from "./components/AuditPanel";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import CareerCoachChat from "./components/CareerCoachChat";
import SpeechRehearsal from "./components/SpeechRehearsal";
import AvatarGenerator from "./components/AvatarGenerator";

import { 
  FileText, 
  Sparkles, 
  Printer, 
  Download, 
  Upload, 
  RefreshCw, 
  Wand2, 
  BookOpen, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  UserCheck,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  // Theme state initialized from localStorage
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "light";
  });

  // Handle document class modifications based on theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Primary application states
  const [resume, setResume] = useState<ResumeData>(mockResumeData);
  const [jobRequirements, setJobRequirements] = useState<JobRequirements | null>(null);
  const [feedback, setFeedback] = useState<OptimizationsFeedback | null>(null);
  
  // Interactive UI configurations
  const [viewMode, setViewMode] = useState<"editor" | "preview">("preview");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<"parser" | "coach" | "audiotools" | "visuals">("parser");
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string; type: "success" | "error" | "info" } | null>({
    text: "Welcome! We've preloaded a sample Senior Software Engineer resume for you. Add a target job description on the left to start.",
    type: "info"
  });

  // Show a visual micro-notification
  const triggerNotification = (text: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(prev => prev?.text === text ? null : prev);
    }, 6000);
  };

  // 1. Client-Side PDF Upload & Parse
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    setIsParsingPdf(true);
    triggerNotification(`Reading "${file.name}"...`, "info");

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const rawResult = reader.result as string;
        const cleanBase64 = rawResult.split(",")[1]; // remove MIME header

        const res = await fetch("/api/parse-resume-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdfBase64: cleanBase64 })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed parser connection.");
        }

        if (data.resume) {
          setResume(data.resume);
          triggerNotification("SUCCESS! Your PDF Resume was successfully compiled into our interactive live editor below.", "success");
          setViewMode("editor"); // shift focus to visual inputs
        } else {
          throw new Error("Empty structured resume returned from parser.");
        }
      } catch (err: any) {
        triggerNotification(`Parsing Failed: ${err.message || "Ensure the target is a valid PDF resume file."}`, "error");
      } finally {
        setIsParsingPdf(false);
      }
    };

    reader.onerror = () => {
      triggerNotification("FileReader failed to compile binary PDF assets.", "error");
      setIsParsingPdf(false);
    };

    reader.readAsDataURL(file);
  };

  // 2. Perform AI Resume Optimization Alignment
  const handleTailorResume = async () => {
    if (!jobRequirements) {
      triggerNotification("Please extract requirements from a job URL or paste a description on the left side first.", "error");
      return;
    }

    setIsOptimizing(true);
    triggerNotification("Executing AI Tailoring & ATS Keyword alignment...", "info");

    try {
      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: resume,
          jobRequirements,
          customPrompt: customPrompt.trim() || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed tailoring secure process.");
      }

      if (data.tailoredResume && data.feedback) {
        setResume(data.tailoredResume);
        setFeedback(data.feedback);
        triggerNotification(`SUCCESS! Resume optimized for target "${jobRequirements.title}". Performance score: ${data.feedback.score}%`, "success");
        setViewMode("preview"); // shift focus to inspect results
        
        // If there's an optimizations score, automatically transition or alert
        if (data.feedback.score >= 80) {
          triggerNotification(`High Compatibility Alert: Your modified resume scored an impressive ${data.feedback.score}% ATS keyword match!`, "success");
        }
      } else {
        throw new Error("Optimization output metadata is incomplete.");
      }
    } catch (err: any) {
      triggerNotification(`Optimization Failed: ${err.message || "An unexpected error occurred during targeting."}`, "error");
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply individual recommendation block suggested by AI audit
  const handleApplyIndividualRecommendation = (section: string, originalText: string | undefined, suggestedText: string) => {
    // Section-specific state mergers
    const lowerSec = section.toLowerCase();
    if (lowerSec.includes("summary")) {
      setResume(prev => ({
        ...prev,
        summary: suggestedText
      }));
      triggerNotification("Applied suggested executive summary update inline!", "success");
    } else if (lowerSec.includes("skill")) {
      setResume(prev => {
        const currentSkills = [...prev.skills];
        // add if not present
        if (!currentSkills.includes(suggestedText)) {
          currentSkills.push(suggestedText);
        }
        return {
          ...prev,
          skills: currentSkills
        };
      });
      triggerNotification(`Injected skill "${suggestedText}" into your technologies profile tag.`, "success");
    } else {
      triggerNotification(`Suggested updates can be reviewed next or integrated via direct input fields in corresponding Sections.`, "info");
    }
  };

  // Download formats
  const handleDownloadHtml = () => {
    const resumeElement = document.getElementById("printable-resume-page");
    if (!resumeElement) return;

    const baseHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${resume.personalInfo.name} - Professional Resume</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f3f4f6; padding: 40px; margin: 0; color: #111827; }
    .resume { background-color: white; max-width: 800px; margin: 0 auto; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    h1 { margin: 0; font-size: 28px; text-transform: uppercase; border-bottom: 2px solid #111827; padding-bottom: 12px; text-align: center; }
    p.title { text-align: center; font-size: 14px; text-transform: uppercase; color: #4b5563; font-weight: 600; margin-top: 6px; letter-spacing: 1px; }
    .contact { display: flex; justify-content: center; flex-wrap: wrap; gap: 15px; margin-top: 10px; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
    section { margin-top: 24px; }
    section h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #111827; padding-bottom: 4px; margin-bottom: 12px; }
    .exp-item, .proj-item { margin-bottom: 18px; }
    .exp-head, .proj-head { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px; }
    ul { padding-left: 20px; margin: 6px 0 0 0; }
    li { font-size: 12px; color: #374151; margin-bottom: 4px; line-height: 1.5; }
    .skills-text { font-size: 12px; color: #374151; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="resume">
    <h1>${resume.personalInfo.name}</h1>
    <p class="title">${resume.personalInfo.title}</p>
    <div class="contact">
      <span>Email: ${resume.personalInfo.email}</span>
      <span>Phone: ${resume.personalInfo.phone}</span>
      <span>Address: ${resume.personalInfo.location}</span>
      <span>Portfolio: ${resume.personalInfo.website}</span>
    </div>
    
    <section>
      <h2>Professional Summary</h2>
      <p style="font-size: 12px; line-height: 1.6; text-align: justify; margin: 0;">${resume.summary}</p>
    </section>

    <section>
      <h2>Experience</h2>
      ${resume.experience.map(exp => `
        <div class="exp-item">
          <div class="exp-head">
            <span>${exp.jobTitle} at ${exp.company}</span>
            <span style="font-weight: normal; color: #6b7280;">${exp.startDate} – ${exp.current ? "Present" : exp.endDate}</span>
          </div>
          <ul>
            ${exp.description.map(b => `<li>${b}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </section>

    <section>
      <h2>Skills</h2>
      <p class="skills-text">${resume.skills.join(" • ")}</p>
    </section>

    <section>
      <h2>Education</h2>
      ${resume.education.map(edu => `
        <div style="margin-bottom: 10px; font-size: 12px;">
          <strong>${edu.school}</strong> – <i>${edu.degree} in ${edu.fieldOfStudy}</i> (${edu.graduationDate})
        </div>
      `).join("")}
    </section>
  </div>
</body>
</html>`;

    const blob = new Blob([baseHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.personalInfo.name.replace(/\s+/g, "_")}_Modern_Resume.html`;
    link.click();
    triggerNotification("Successfully exported and downloaded professional HTML standalone resume file.", "success");
  };

  const handleDownloadTxt = () => {
    let baseTxt = `==================================================
${resume.personalInfo.name.toUpperCase()}
${resume.personalInfo.title.toUpperCase()}
==================================================
Email: ${resume.personalInfo.email}
Phone: ${resume.personalInfo.phone}
Location: ${resume.personalInfo.location}
Website: ${resume.personalInfo.website}

PROFESSIONAL SUMMARY
--------------------------------------------------
${resume.summary}

WORK HISTORY
--------------------------------------------------
${resume.experience.map(exp => `
* ${exp.jobTitle} | ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})
  Location: ${exp.location}
  ${exp.description.map(b => `  - ${b}`).join("\n")}
`).join("\n")}

CORE SKILLS & TECHNOLOGIES
--------------------------------------------------
${resume.skills.join(" | ")}

EDUCATION
--------------------------------------------------
${resume.education.map(edu => `
* ${edu.school}
  Degree: ${edu.degree} in ${edu.fieldOfStudy} (${edu.graduationDate})
`).join("\n")}
`;

    const blob = new Blob([baseTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.personalInfo.name.replace(/\s+/g, "_")}_ATS_Compliant.txt`;
    link.click();
    triggerNotification("Successfully exported resume as an ATS-friendly raw text document.", "success");
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const loadOriginalMockData = () => {
    setResume(mockResumeData);
    setFeedback(null);
    setPdfFileName(null);
    triggerNotification("Reset interactive inputs to standard engineering CV framework.", "info");
  };

  return (
    <div id="ai-cv-app" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans flex flex-col transition-colors duration-300">
      {/* Decorative Floating Notification Alert Banner */}
      {notification && (
        <div 
          id="system-notification-hud"
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-4.5 py-3 rounded-2xl shadow-lg border text-xs max-w-lg transition-all duration-300 ${
            notification.type === "success" 
              ? "bg-blue-900 border-blue-800 text-blue-50" 
              : notification.type === "error"
              ? "bg-red-900 border-red-805 text-red-50"
              : "bg-slate-900 border-slate-800 text-slate-50"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4.5 h-4.5 text-blue-300 shrink-0" />
          ) : notification.type === "error" ? (
            <AlertCircle className="w-4.5 h-4.5 text-red-300 shrink-0" />
          ) : (
            <Sparkles className="w-4.5 h-4.5 text-blue-300 shrink-0" />
          )}
          <p className="font-medium leading-normal">{notification.text}</p>
        </div>
      )}

      {/* Main Structural Banner / Header (hidden on print) */}
      <header className="print:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg leading-none">R</div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-none">
                ResumeFlow <span className="text-blue-600 dark:text-blue-450 italic">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
                Deep Recruiter Alignment & ATS Keyword optimizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
              className="p-2.5 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all shadow-xs"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-slate-500" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Direct PDF Uploader */}
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-xl bg-white dark:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-450 cursor-pointer transition-all shadow-xs shrink-0 bg-transparent">
              <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>{isParsingPdf ? "Parsing with Gemini..." : "Upload PDF Resume"}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                disabled={isParsingPdf}
                className="hidden"
              />
            </label>

            {/* Quick Mock Reset */}
            <button
              id="reset-mock-btn"
              type="button"
              onClick={loadOriginalMockData}
              className="px-3.5 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shrink-0 bg-transparent"
              title="Reset state to mock curriculum vitae"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Split Panel Context (Double Column Workspace Grid) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Controller & AI Toolings Panel (span 5) (hidden on print) */}
        <section className="print:hidden lg:col-span-5 space-y-6">
               {/* Action Tabs Slider */}
          <div className="flex gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <button
              type="button"
              onClick={() => setActiveToolTab("parser")}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeToolTab === "parser"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              🎯 1. Target Posting
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab("coach")}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeToolTab === "coach"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              💬 2. Career Coach
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab("audiotools")}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeToolTab === "audiotools"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              🎙️ 3. Pitch Rehearsal
            </button>
            <button
              type="button"
              onClick={() => setActiveToolTab("visuals")}
              className={`flex-1 py-2.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                activeToolTab === "visuals"
                  ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 shadow-xs border border-blue-100 dark:border-blue-900/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              🎨 4. Portraits
            </button>
          </div>

          {/* Sub-tool panels */}
          {activeToolTab === "parser" && (
            <div className="space-y-6">
              <RequirementsParser 
                onParsed={(reqs) => {
                  setJobRequirements(reqs);
                  triggerNotification(`Injected job requirements for "${reqs.title}" at "${reqs.company}". Ready to align!`, "success");
                }}
                parsedRequirements={jobRequirements}
              />

              {/* Instant Alignment / Direct instruction module */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-450" />
                    Targeting & Keywords Engine
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Map accomplishments to the matching language. Give custom tailoring preferences below.
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="custom-instruction-prompt" className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Directives / Focus Criteria
                    </label>
                    <input
                      id="custom-instruction-prompt"
                      type="text"
                      placeholder="e.g. emphasize my technical cloud skills, write in a modern tone..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    />
                  </div>

                  <button
                    id="btn-perform-tailoring"
                    type="button"
                    onClick={handleTailorResume}
                    disabled={isOptimizing || !jobRequirements}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
                  >
                    {isOptimizing ? "Optimizing & Scoring state..." : "Align & Score Resume (ATS Ready)"}
                  </button>
                </div>
              </div>

              {/* Audit results */}
              <AuditPanel 
                feedback={feedback}
                onApplyRecommendation={handleApplyIndividualRecommendation}
                onTriggerTailoring={handleTailorResume}
                isTailoring={isOptimizing}
                hasJobRequirements={!!jobRequirements}
              />
            </div>
          )}

          {activeToolTab === "coach" && (
            <CareerCoachChat 
              currentResumeSummary={resume.summary}
              onSuggestResumeEdits={(p) => {
                setCustomPrompt(p);
                setActiveToolTab("parser");
                triggerNotification("Copied coach advice into tailoring instructions. Click 'Optimize' to execute details.", "success");
              }}
            />
          )}

          {activeToolTab === "audiotools" && (
            <SpeechRehearsal textToRehearse={resume.summary} />
          )}

          {activeToolTab === "visuals" && (
            <AvatarGenerator />
          )}

          {/* Guidelines info card */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-4.5 rounded-2xl flex gap-3 text-xs">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-450 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Why ATS-Friendly Layouts Matter</h4>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-justify">
                Traditional Applicant Tracking Systems (ATS) read text inside single-column vertical frameworks. We completely avoid unparseable sidebars, heavy decorations, graphic scales, and complex charts so your content maps perfectly into recruiting databases. Use our editor tabs to adjust parameters.
              </p>
            </div>
          </div>
        </section>

        {/* Right Hand: The Document Output/Editor (span 7) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Header Controls for Editor (hidden on print) */}
          <div className="print:hidden bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
            
            {/* View Mode Toggle */}
            <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === "preview"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/50 dark:border-slate-800"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                👀 standard formatting Inspect
              </button>
              <button
                type="button"
                onClick={() => setViewMode("editor")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  viewMode === "editor"
                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs border border-slate-200/50 dark:border-slate-800"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                ✏️ Live Text Editor
              </button>
            </div>

            {/* Print/Download Button Group */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              <button
                id="btn-print-resume"
                type="button"
                onClick={handleTriggerPrint}
                className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg"
                title="Print Vector PDF directly"
              >
                <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                id="btn-download-html"
                type="button"
                onClick={handleDownloadHtml}
                className="p-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 bg-transparent rounded-lg"
                title="Download Standalone HTML file"
              >
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                id="btn-download-text"
                type="button"
                onClick={handleDownloadTxt}
                className="px-3.5 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 rounded-lg cursor-pointer transition-all flex items-center gap-1 shrink-0 border border-blue-500/30"
                title="Download Raw text for ATS checking"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>
            </div>
          </div>

          {/* Active Work Area Panel */}
          {viewMode === "editor" ? (
            <div className="print:hidden">
              <ResumeForm 
                resumeData={resume}
                onChange={(updated) => setResume(updated)}
              />
            </div>
          ) : (
            <div>
              <ResumePreview resumeData={resume} />
            </div>
          )}
        </section>
      </main>

      {/* Decorative Professional Footer */}
      <footer className="print:hidden border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AI Resume Optimizer & Targeted Tailor Office. Powered by serverless Gemini 3 Multimodal reasoning.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-slate-400">
              <UserCheck className="w-4 h-4 text-neutral-400 dark:text-slate-500" />
              ATS Compliance Passed
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
