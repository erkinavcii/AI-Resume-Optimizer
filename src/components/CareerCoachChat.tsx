import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ChatbotRole, ChatbotRoleConfig } from "../types";
import { Send, Sparkles, RefreshCw, User, HelpCircle, Loader2, Download, Upload } from "lucide-react";

interface CareerCoachChatProps {
  onSuggestResumeEdits: (prompt: string) => void;
  currentResumeSummary: string;
}

const COACH_ROLES: ChatbotRoleConfig[] = [
  {
    id: "career_coach",
    name: "STAR Career Consult",
    icon: "🎯",
    tagline: "STAR Method & Metrics Expert",
    systemInstruction: "You are a senior executive coach focused on quantifiable impact.",
    model: "gemini-3.5-flash"
  },
  {
    id: "ats_reviewer",
    name: "ATS Compliance Officer",
    icon: "🔍",
    tagline: "Applicant Tracking Auditor",
    systemInstruction: "You are an ATS parser expert analyzing layout compliance.",
    model: "gemini-3.1-pro-preview"
  },
  {
    id: "branding_specialist",
    name: "Executive Branding Writer",
    icon: "✨",
    tagline: "Elevator Pitch & Voice Stylist",
    systemInstruction: "You are an expert biographer refining executive narratives.",
    model: "gemini-3.5-flash"
  }
];

export default function CareerCoachChat({ onSuggestResumeEdits, currentResumeSummary }: CareerCoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hello! I am your AI Career Mentor. I am powered by modern Gemini models designed to optimize your resume and interview presentation. Choose a coaching specialist role as well as model weights above, and let's brainstorm!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>("career_coach");
  const [modelMode, setModelMode] = useState<"general" | "pro" | "fast">("general");
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const threadEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on updates
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const activeRole = COACH_ROLES.find(r => r.id === selectedRole) || COACH_ROLES[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputMsg.trim();
    if (!cleanInput || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: cleanInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg("");
    setLoading(true);
    setImportError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: cleanInput,
          role: selectedRole,
          modelMode // 'general' | 'pro' | 'fast'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed secure chat connection.");
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: "assistant",
        text: data.text || "I was unable to formulate a response.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "assistant",
        text: `Error connecting to Gemini Chat API: ${err.message || "Please check your network and secrets keys."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "assistant",
        text: `Switched to ${activeRole.name}. Ready to analyze! Tell me about the roles or skills you wish to integrate.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setImportError(null);
  };

  // Switch role and update prompt
  const handleRoleChange = (roleID: ChatbotRole) => {
    setSelectedRole(roleID);
  };

  // Export chat log as JSON file
  const handleExportChat = () => {
    try {
      const payload = {
        messages,
        selectedRole,
        modelMode,
        exportedAt: new Date().toISOString()
      };
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(payload, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `career_consultation_chat_history_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err: any) {
      setImportError(`Failed to export chat: ${err.message}`);
    }
  };

  // Trigger file selection
  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  // Handle uploaded file content
  const handleImportChat = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== "string") {
          throw new Error("Invalid file parsing format.");
        }
        
        const data = JSON.parse(text);
        if (data && Array.isArray(data.messages)) {
          // Soft validation on message shapes to verify format integrity
          const validList = data.messages.filter((m: any) => m && m.id && m.sender && m.text);
          if (validList.length > 0) {
            setMessages(validList);
            if (data.selectedRole) setSelectedRole(data.selectedRole);
            if (data.modelMode) setModelMode(data.modelMode);
            setImportError(null);
          } else {
            throw new Error("Uploaded backup contains no valid messages.");
          }
        } else {
          throw new Error("Invalid configuration file. Must be a valid Chat JSON exports.");
        }
      } catch (err: any) {
        setImportError(`Import issue: ${err.message}`);
      }
    };

    reader.onerror = () => {
      setImportError("Error occurred while reading the specified JSON file.");
    };

    reader.readAsText(file);
    // Reset inputs
    e.target.value = "";
  };

  return (
    <div id="career-coach-chat" className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-205 border-slate-200 dark:border-slate-800 p-6 flex flex-col h-[520px] transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            AI Career Mentor & Coach
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Multi-turn consultation with specialized recruiters.
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Invisible Upload Field */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportChat}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerImportFile}
            className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Import past chat history (.json)"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleExportChat}
            className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Export this conversation history (.json)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={clearChatHistory}
            className="text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Reset thread history"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Specialty Roles Selection */}
      <div className="grid grid-cols-3 gap-1.5 py-3 border-b border-slate-100 dark:border-slate-800">
        {COACH_ROLES.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => handleRoleChange(role.id)}
            className={`p-2 rounded-xl text-center border transition-all text-left cursor-pointer ${
              selectedRole === role.id
                ? "bg-slate-900 border-slate-900 text-white shadow-xs dark:bg-blue-600 dark:border-blue-600"
                : "bg-slate-50 dark:bg-slate-950/40 border-slate-205 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-450 hover:text-slate-950 dark:hover:text-white"
            }`}
          >
            <div className="text-base mb-0.5">{role.icon}</div>
            <div className="text-[10px] font-extrabold truncate">{role.name}</div>
            <div className={`text-[8px] truncate font-medium ${selectedRole === role.id ? "text-slate-300" : "text-slate-400 dark:text-slate-500"}`}>
              {role.tagline}
            </div>
          </button>
        ))}
      </div>

      {/* Model Selection */}
      <div className="flex items-center justify-between gap-2 py-2 bg-slate-50/50 dark:bg-slate-950/15 px-3 border-b border-slate-100 dark:border-slate-800 text-[10px]">
        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model Selection:</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setModelMode("fast")}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              modelMode === "fast" ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
            }`}
            title="Fast execution using gemini-3.1-flash-lite"
          >
            Fast
          </button>
          <button
            type="button"
            onClick={() => setModelMode("general")}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              modelMode === "general" ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
            }`}
            title="Balanced general tasks using gemini-3.5-flash"
          >
            General
          </button>
          <button
            type="button"
            onClick={() => setModelMode("pro")}
            className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
              modelMode === "pro" ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-400"
            }`}
            title="Complex reasoning using gemini-3.1-pro-preview (Paid)"
          >
            Pro/Advanced
          </button>
        </div>
      </div>

      {/* Import Status Alert (Non-blocking human-friendly error state) */}
      {importError && (
        <div className="bg-red-50 dark:bg-red-955/20 border-b border-red-101 dark:border-red-900/35 text-[10px] text-red-700 dark:text-red-400 font-semibold px-3 py-1.5 flex justify-between items-center transition-all animate-fade-in shrink-0">
          <span className="truncate">{importError}</span>
          <button
            type="button"
            onClick={() => setImportError(null)}
            className="hover:text-red-950 dark:hover:text-red-350 font-bold ml-2 shrink-0 bg-transparent py-0.5 px-1.5 rounded-md border border-red-200/50 dark:border-red-900/30 hover:bg-red-100/50 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Message Area Thread */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 max-h-[300px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-sm ${
              msg.sender === "user" ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 border border-slate-200 dark:border-slate-700" : "bg-slate-800 dark:bg-slate-950 text-white shrink-0 border border-slate-900 dark:border-slate-800"
            }`}>
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : activeRole.icon}
            </div>
            <div className={`space-y-1 max-w-[80%] ${msg.sender === "user" ? "text-right" : "text-left"}`}>
              <div className={`text-xs p-3 rounded-2xl leading-relaxed text-left prose ${
                msg.sender === "user"
                  ? "bg-slate-900 dark:bg-blue-600 text-white rounded-tr-xs"
                  : "bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-205 border-slate-200 dark:border-slate-800"
              }`}>
                {msg.text}
              </div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-slate-800 dark:bg-slate-950 border border-slate-900 dark:border-slate-800 text-white flex items-center justify-center text-sm">
              {activeRole.icon}
            </div>
            <div className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-xs p-3 rounded-2xl rounded-tl-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-450" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Quick Suggestions / Actions */}
      <div className="flex flex-wrap gap-1 mb-2">
        <button
          type="button"
          onClick={() => setInputMsg("Can you audit my professional summary for word count and impact verbs?")}
          className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 px-2 py-1 rounded-md transition-all cursor-pointer"
        >
          📝 Audit Summary
        </button>
        <button
          type="button"
          onClick={() => setInputMsg("Which active keywords are missing to clear modern tech recruiting pipelines?")}
          className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 px-2 py-1 rounded-md transition-all cursor-pointer"
        >
          🔍 Check Keywords Gap
        </button>
        <button
          type="button"
          onClick={() => setInputMsg("Explain the STAR method for bullet achievements.")}
          className="text-[9px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705 px-2 py-1 rounded-md transition-all cursor-pointer"
        >
          🎯 STAR Formula Explanation
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask career advice or tailoring hints..."
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-450 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-200 dark:disabled:bg-slate-800 rounded-xl text-white font-bold text-xs shrink-0 flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
