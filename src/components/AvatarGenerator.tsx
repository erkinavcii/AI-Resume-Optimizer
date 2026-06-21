import React, { useState } from "react";
import { Image, Loader2, Sparkles, AlertCircle, ArrowDownToLine, CircleHelp } from "lucide-react";

export default function AvatarGenerator() {
  const [prompt, setPrompt] = useState("Professional executive LinkedIn headshot, sharp corporate suit, clean modern studio lighting, high resolution, confident smile, commercial photography");
  const [size, setSize] = useState<"1K" | "2K" | "4K">("1K");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          size // '1K', '2K', '4K'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Image generation pipeline hit a quota block.");
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        throw new Error("No structured image data returned.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate visual asset. Try again or adapt parameters.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="avatar-generator-card" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
          <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Branding Visual Mascot & Professional Headshot Generator
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Generate LinkedIn avatars or corporate profile background banners using gemini-3-pro-image-preview.
        </p>
      </div>

      <div className="space-y-3">
        {/* Prompt Input */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            Visual Style Prompt
          </label>
          <textarea
            rows={2.5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your desired headshot avatar or background..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 resize-none leading-relaxed font-medium"
          />
        </div>

        {/* Size Selection */}
        <div className="flex items-center gap-4 py-1.5 border-y border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Image Quality (Size):</span>
          <div className="flex items-center gap-2">
            {(["1K", "2K", "4K"] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSize(sz)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md border transition-all cursor-pointer ${
                  size === sz
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 border-slate-205 dark:border-slate-705 hover:bg-slate-50 dark:hover:bg-slate-700/80"
                }`}
              >
                {sz} {sz === "1K" ? "(Standard)" : sz === "2K" ? "(Mid)" : "(Highest HD)"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-955/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-202 dark:disabled:bg-slate-800 disabled:text-slate-450 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Generating {size} Portrait visual...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              Generate Professional Avatar ({size})
            </>
          )}
        </button>
      </div>

      {/* Preview Section */}
      {imageUrl && (
        <div id="portrait-visual-output" className="relative group overflow-hidden bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl flex flex-col items-center">
          <img
            src={imageUrl}
            alt="AI Generated Headshot"
            referrerPolicy="no-referrer"
            className="w-48 h-48 rounded-xl object-cover hover:scale-105 transition-all shadow-xs"
          />
          <div className="mt-3 flex items-center justify-between w-full px-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-450 uppercase animate-pulse">Generation Complete at {size} size!</span>
            <a
              href={imageUrl}
              download="professional_avatar.png"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md py-1 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white transition-all shadow-xs"
            >
              <ArrowDownToLine className="w-3 h-3 text-slate-500 dark:text-slate-400" /> Save Avatar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
