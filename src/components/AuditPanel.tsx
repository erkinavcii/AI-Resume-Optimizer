import React from "react";
import { OptimizationsFeedback } from "../types";
import { CheckCircle, AlertTriangle, Lightbulb, Play, ArrowRight } from "lucide-react";

interface AuditPanelProps {
  feedback: OptimizationsFeedback | null;
  onApplyRecommendation: (section: string, originalText: string | undefined, suggestedText: string) => void;
  onTriggerTailoring: () => void;
  isTailoring: boolean;
  hasJobRequirements: boolean;
}

export default function AuditPanel({
  feedback,
  onApplyRecommendation,
  onTriggerTailoring,
  isTailoring,
  hasJobRequirements,
}: AuditPanelProps) {
  // Score details helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/30";
    if (score >= 50) return "text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/30";
    return "text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/30";
  };

  const getStrokeColor = (score: number) => {
    return "#2563eb"; // Royal blue for matching the Clean Minimalism theme accent
  };

  return (
    <div id="audit-panel-container" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-6 transition-colors duration-300">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">ATS Audit & Match Analysis</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          See how your customized resume measures up against the selected job post keywords.
        </p>
      </div>

      {!feedback ? (
        <div className="flex flex-col items-center justify-center py-6 text-center bg-slate-55 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
            <Lightbulb className="w-5 h-5 text-slate-500 dark:text-slate-450" />
          </div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Audit Status: Idle</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1.5 leading-relaxed font-normal">
            Upload your resume PDF and specify the job posting requirements, then hit the "Instant Tailor Resume" to trigger structural matching.
          </p>
          <button
            id="btn-trigger-tailor-empty"
            type="button"
            onClick={onTriggerTailoring}
            disabled={isTailoring || !hasJobRequirements}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-750 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xs"
          >
            {isTailoring ? "Tailoring CV with AI..." : "Perform AI Tailoring"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Circular Score Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="transition-all duration-1000 ease-out"
                  strokeDasharray={`${feedback.score}, 100`}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  stroke={getStrokeColor(feedback.score)}
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-950 dark:text-white font-sans">{feedback.score}%</span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Match</span>
              </div>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getScoreColor(feedback.score)}`}>
                {feedback.score >= 80 ? "Highly Compatible" : feedback.score >= 50 ? "Partially Aligned" : "Critical Gaps"}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">Optimization Score</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                An estimate of your resume's search priority and keyword compliance across traditional recruiting applicant tracking systems.
              </p>
            </div>
          </div>

          {/* Strengths and Gaps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-emerald-100 dark:border-emerald-950/40 rounded-xl p-4 bg-emerald-50/15 dark:bg-emerald-950/10">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450" />
                Verified Alignment ({feedback.strengths.length})
              </h4>
              <ul className="space-y-1.5">
                {feedback.strengths.map((str, i) => (
                  <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1 font-medium leading-relaxed">
                    <span className="text-emerald-500 font-bold mr-1">•</span>
                    {str}
                  </li>
                ))}
                {feedback.strengths.length === 0 && (
                  <li className="text-xs text-slate-400 dark:text-slate-500 italic">No strong alignment keys matched yet.</li>
                )}
              </ul>
            </div>

            <div className="border border-amber-100 dark:border-amber-950/40 rounded-xl p-4 bg-amber-50/20 dark:bg-amber-950/10">
              <h4 className="text-xs font-bold text-amber-805 text-amber-800 dark:text-amber-450 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 hover:text-amber-400" />
                Discovered keyword Gaps ({feedback.gaps.length})
              </h4>
              <ul className="space-y-1.5">
                {feedback.gaps.map((gp, i) => (
                  <li key={i} className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1 font-medium leading-relaxed">
                    <span className="text-amber-500 font-bold mr-1">•</span>
                    {gp}
                  </li>
                ))}
                {feedback.gaps.length === 0 && (
                  <li className="text-xs text-slate-400 dark:text-slate-505 italic">No significant skills gaps discovered! Good job.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations list with Auto-Apply */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Actionable Content Revisions</h4>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Inline integration available</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {feedback.recommendations.map((rec, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-705 transition-all space-y-3 shadow-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
                      Section: {rec.section}
                    </span>
                    <button
                      id={`rec-apply-btn-${idx}`}
                      type="button"
                      onClick={() => onApplyRecommendation(rec.section, rec.originalText, rec.suggestedText)}
                      className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-105 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-md transition-all cursor-pointer border border-blue-200/40 dark:border-blue-800/40"
                    >
                      <Play className="w-2.5 h-2.5 text-blue-600 fill-blue-600" />
                      Apply Revision
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{rec.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {rec.originalText && (
                      <div className="space-y-1 bg-red-50/20 dark:bg-red-950/20 p-2.5 rounded-lg border border-red-55 border-red-50/40 dark:border-red-900/30">
                        <span className="text-[9px] uppercase font-bold text-red-505 tracking-wider">Before</span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-through leading-relaxed">{rec.originalText}</p>
                      </div>
                    )}
                    <div className="space-y-1 bg-emerald-50/20 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-55 border-emerald-50/40 dark:border-emerald-900/30 col-span-1 md:col-span-1">
                      <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-450 tracking-wider">AI Suggested (ATS-Ready)</span>
                      <p className="text-[11px] text-slate-900 dark:text-white font-medium leading-relaxed">{rec.suggestedText}</p>
                    </div>
                  </div>
                </div>
              ))}

              {feedback.recommendations.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                  No revisions suggested. Your profile appears fully targeted!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
