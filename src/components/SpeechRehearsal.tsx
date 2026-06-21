import React, { useState, useRef } from "react";
import { Volume2, Play, Pause, Loader2, Music, CheckCircle, AlertCircle } from "lucide-react";

interface SpeechRehearsalProps {
  textToRehearse: string;
}

const VOICES = [
  { id: "Zephyr", name: "Zephyr (Warm Male)" },
  { id: "Kore", name: "Kore (Clear Professional Female)" },
  { id: "Puck", name: "Puck (Cheerful Male)" },
  { id: "Charon", name: "Charon (Balanced Neutral)" },
  { id: "Fenrir", name: "Fenrir (Intellectual Deep)" }
];

export default function SpeechRehearsal({ textToRehearse }: SpeechRehearsalProps) {
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");
  const [text, setText] = useState(textToRehearse || "Hi, I am Alex Mercer. I'm a Senior Full-Stack Engineer specializing in TypeScript, Node, and performance optimization. It is nice to meet you today.");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with prop when CV summary updates
  React.useEffect(() => {
    if (textToRehearse) {
      setText(textToRehearse);
    }
  }, [textToRehearse]);

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: selectedVoice
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed secure audio pipeline.");
      }

      if (data.audioBase64) {
        // Convert base64 to binary and create custom Blob URL
        const binary = atob(data.audioBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Auto play on load
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 100);
      } else {
        throw new Error("No readable audio returned from system model.");
      }
    } catch (err: any) {
      setError(err.message || "Synthesizer failed. Check server parameters.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div id="speech-rehearsal-card" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Elevator Pitch & Audio Rehearsal (TTS)
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Generate voice synthesis of your summary, tailored summary, or pitches to practice interview delivery.
        </p>
      </div>

      <div className="space-y-3">
        {/* Voice Select */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Speaker Voice Style</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-55 bg-slate-50 dark:bg-slate-955/40 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium cursor-pointer"
          >
            {VOICES.map((v) => (
              <option key={v.id} value={v.id} className="dark:bg-slate-900 dark:text-white">{v.name}</option>
            ))}
          </select>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Text to Speak</label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your elevator introduction page..."
            className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 resize-none leading-relaxed font-medium"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-650 text-red-600 bg-red-50 dark:bg-red-955/20 p-2.5 rounded-lg border border-red-100 dark:border-red-900/40">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={loading || !text.trim()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-white font-bold text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-202 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Synthesizing Pitch with AI...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-white" />
                Generate Audio Response
              </>
            )}
          </button>

          {audioUrl && (
            <button
              type="button"
              onClick={togglePlayback}
              className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-955/25 hover:bg-amber-100 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 text-amber-700 dark:text-amber-400" /> Wait
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-700 dark:text-amber-400 fill-amber-700 dark:fill-amber-400" /> Play Pitch
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Interactive Audio Element */}
      {audioUrl && (
        <div id="rehearsal-equalizer" className="bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3 transition-colors duration-300">
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="hidden"
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-800 text-white shrink-0">
            <Music className={`w-4 h-4 ${isPlaying ? "animate-bounce" : ""}`} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Audio Playback Ready</span>
            {/* Elegant visual simulation equalizer waves */}
            <div className="flex items-end gap-0.5 h-3 mt-1.5">
              {[6, 12, 8, 14, 5, 10, 7, 11, 4, 8, 13, 6, 9].map((h, i) => (
                <div
                  key={i}
                  style={{ height: isPlaying ? `${Math.floor(Math.random() * 12) + 2}px` : "2px" }}
                  className="w-1 bg-amber-500 rounded-sm transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
