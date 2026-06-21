import React, { useState } from "react";
import { Link, Clipboard, Sparkles, Loader2, CircleCheck, AlertCircle } from "lucide-react";
import { JobRequirements } from "../types";

interface RequirementsParserProps {
  onParsed: (reqs: JobRequirements) => void;
  parsedRequirements: JobRequirements | null;
}

export default function RequirementsParser({ onParsed, parsedRequirements }: RequirementsParserProps) {
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"link" | "text">("link");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/parse-job-posting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: activeTab === "link" ? url.trim() : undefined,
          rawText: activeTab === "text" ? rawText.trim() : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse requirements.");
      }

      if (data.requirements) {
        onParsed(data.requirements);
      } else {
        throw new Error("No structured requirements returned from server.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="requirements-parser-container" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-450" />
            Target Job Description
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Extract skills and credentials from job descriptions to target your resume updates.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-lg mb-4">
        <button
          id="tab-btn-link"
          type="button"
          onClick={() => { setActiveTab("link"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "link"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100"
          }`}
        >
          <Link className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          By Job Link
        </button>
        <button
          id="tab-btn-text"
          type="button"
          onClick={() => { setActiveTab("text"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
            activeTab === "text"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100"
          }`}
        >
          <Clipboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          By Plain Text
        </button>
      </div>

      {/* Input section */}
      <div className="space-y-3">
        {activeTab === "link" ? (
          <div>
            <label htmlFor="job-link-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Online Listing URL
            </label>
            <input
              id="job-link-input"
              type="url"
              placeholder="e.g. https://careers.company.com/jobs/senior-software-engineer"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="job-text-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Paste Job Description Text
            </label>
            <textarea
              id="job-text-input"
              rows={5}
              placeholder="Paste the full qualifications, responsibilities, and job listing details..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none font-medium"
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Parsing Issue</p>
              <p className="opacity-90">{error}</p>
            </div>
          </div>
        )}

        <button
          id="btn-parse-requirements"
          type="button"
          onClick={handleParse}
          disabled={loading || (activeTab === "link" ? !url : !rawText)}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all cursor-pointer disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Crawling & Extracting with AI...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              Extract Job Requirements
            </>
          )}
        </button>
      </div>

      {/* Rendering results */}
      {parsedRequirements && (
        <div id="requirements-results-box" className="mt-5 border-t border-dashed border-slate-200 dark:border-slate-800 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center font-bold text-blue-700 dark:text-blue-400 text-xs shrink-0 border border-blue-100 dark:border-blue-900/50">
              {parsedRequirements.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{parsedRequirements.title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{parsedRequirements.company}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 rounded-xl p-3.5 space-y-3 border border-slate-100 dark:border-slate-800/60">
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Target Role Summary</h4>
              <p className="text-xs text-slate-605 text-slate-600 dark:text-slate-400 leading-relaxed font-normal">{parsedRequirements.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <h4 className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Key Keywords Required
                </h4>
                <div className="flex flex-wrap gap-1">
                  {parsedRequirements.keySkills.slice(0, 8).map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded-full">
                      {sk}
                    </span>
                  ))}
                  {parsedRequirements.keySkills.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">None extracted</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  Nice To Have / Bonus
                </h4>
                <div className="flex flex-wrap gap-1">
                  {parsedRequirements.niceToHaveSkills.slice(0, 8).map((sk, idx) => (
                    <span key={idx} className="text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-full">
                      {sk}
                    </span>
                  ))}
                  {parsedRequirements.niceToHaveSkills.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 italic">None extracted</span>
                  )}
                </div>
              </div>
            </div>

            {parsedRequirements.responsibilities.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2">
                <h4 className="text-[11px] font-bold text-slate-705 text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Core Objectives & Responsibilities</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {parsedRequirements.responsibilities.slice(0, 4).map((resp, i) => (
                    <li key={i} className="text-[11px] text-slate-600 dark:text-slate-400 font-normal leading-relaxed">{resp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
