import express from "express";
import path from "path";
import { GoogleGenAI, Type, Modality } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Centralized Google Gen AI Model Configuration Directory
const MODEL_CONFIG = {
  RESUME_PARSER: "gemini-3.5-flash",
  JOB_PARSER: "gemini-3.5-flash",
  RESUME_TAILOR: "gemini-3.5-flash",
  CHAT_DEFAULT: "gemini-3.5-flash",
  CHAT_PRO: "gemini-3.1-pro-preview",
  CHAT_EXPEDITE: "gemini-3.1-flash-lite",
  TEXT_TO_SPEECH: "gemini-3.1-flash-tts-preview",
  IMAGE_GENERATOR: "gemini-3.1-flash-image",
  IMAGE_FALLBACK: "gemini-2.5-flash-image"
};

// Payload DoS Mitigation: Apply selective limits.
// Only the PDF uploading route is authorized up to 15MB. General JSON routing is capped strictly at 2MB.
app.use("/api/parse-resume-pdf", express.json({ limit: "15mb" }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// In-Memory Time-Window Request Rate Limiter (Abuse Prevention Coordinator)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimits = new Map<string, RateLimitRecord>();

function rateLimit(limit: number, windowMs: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    
    const record = rateLimits.get(key);
    if (!record) {
      rateLimits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= limit) {
      return res.status(429).json({
        error: "Kötüye kullanım önleme ve kota koruması kapsamında çok sık istek gönderdiniz. Lütfen bir süre sonra tekrar deneyin.",
      });
    }
    
    record.count++;
    next();
  };
}

// Memory-Friendly Cleanup Thread (prevent leaks in rate-limit tables)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimits.entries()) {
    if (now > value.resetTime) {
      rateLimits.delete(key);
    }
  }
}, 5 * 60 * 1000);

// Robust Server Side Request Forgery (SSRF) Guard
function isSafeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    
    const hostname = parsed.hostname.toLowerCase();
    
    // Obvious blocked hosts
    const blockedHosts = [
      "localhost", "127.0.0.1", "::1", "0.0.0.0", "169.254.169.254",
      "metadata.google.internal", "metadata", "instance-metadata", "internal"
    ];
    if (blockedHosts.some(blocked => hostname === blocked || hostname.endsWith("." + blocked))) {
      return false;
    }
    
    // Regulate raw IPv4 string patterns to filter out private IP segments
    const ipv4Regex = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    const ipMatch = hostname.match(ipv4Regex);
    if (ipMatch) {
      const o1 = parseInt(ipMatch[1], 10);
      const o2 = parseInt(ipMatch[2], 10);
      const o3 = parseInt(ipMatch[3], 10);
      const o4 = parseInt(ipMatch[4], 10);
      
      if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return false;
      
      if (o1 === 10) return false; // RFC 1918: 10.0.0.0/8
      if (o1 === 127) return false; // Loopback
      if (o1 === 169 && o2 === 254) return false; // Cloud Metadata: 169.254.0.0/16
      if (o1 === 192 && o2 === 168) return false; // RFC 1918: 192.168.0.0/16
      if (o1 === 172 && (o2 >= 16 && o2 <= 31)) return false; // RFC 1918: 172.16.0.0/12
      if (o1 === 0) return false; // Local Broadcast host
    }
    
    // Prevent IPv6 loopback and unicast local address spaces
    if (hostname === "[::1]" || hostname.startsWith("[fe80:") || hostname.startsWith("[fc00:") || hostname.startsWith("[fd")) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Initialize Google Gen AI SDK
const apiKey = process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Strip HTML tags to extract readable text
function cleanHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Helper: Format Google Gen AI API errors beautifully
function formatApiError(error: any): string {
  if (!error) return "An unknown error occurred.";
  
  const msg = error.message || String(error);
  
  if (typeof msg === "string" && msg.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.error && parsed.error.message) {
        return parsed.error.message;
      }
    } catch (e) {
      // Ignore JSON parsing failure
    }
  }

  if (error.status === "PERMISSION_DENIED" || (error.code === 403) || msg.includes("PERMISSION_DENIED")) {
    if (msg.includes("unrestricted keys")) {
      return "Gemini API request denied due to unrestricted key usage. Please ensure your API key on AI Studio features the required restrictions or update your API key context.";
    }
    return `Access Denied: ${msg}`;
  }

  return msg;
}

// 1. API: Parse Resume PDF into structured ResumeData
app.post("/api/parse-resume-pdf", rateLimit(5, 5 * 60 * 1000), async (req, res) => {
  const { pdfBase64, customText } = req.body;

  if (!pdfBase64 && !customText) {
    return res.status(400).json({ error: "No PDF data or text provided for parsing." });
  }

  try {
    const contents: any[] = [];

    if (pdfBase64) {
      // Clean base64 prefix if present
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64,
        },
      });
    }

    contents.push({
      text: `Extract and compile the professional background from this CV/resume into a completely structured JSON output conforming to the responseSchema. Make sure to populate every single section appropriately (personalInfo, summary, experience, education, skills, projects, certifications). If a section cannot be found, provide a representative sample empty structure or extrapolate accurately based on available clues. Break bullet points into separate array entries under experience and projects.`,
    });

    const response = await ai.models.generateContent({
      model: MODEL_CONFIG.RESUME_PARSER,
      contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                website: { type: Type.STRING },
              },
              required: ["name", "title", "email", "phone", "location", "website"],
            },
            summary: { type: Type.STRING },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  jobTitle: { type: Type.STRING },
                  company: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["id", "jobTitle", "company"],
              },
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  school: { type: Type.STRING },
                  location: { type: Type.STRING },
                  graduationDate: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["id", "degree", "school"],
              },
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  role: { type: Type.STRING },
                  technologies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  link: { type: Type.STRING },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["id", "title"],
              },
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ["id", "name"],
              },
            },
          },
          required: ["personalInfo", "summary", "experience", "education", "skills", "projects", "certifications"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ resume: parsedData });
  } catch (error: any) {
    console.error("Resume parsing error:", error);
    res.status(500).json({ error: formatApiError(error) });
  }
});

// 2. API: Parse/scrape Job Posting link or text
app.post("/api/parse-job-posting", rateLimit(10, 1 * 60 * 1000), async (req, res) => {
  const { url, rawText } = req.body;

  if (!url && !rawText) {
    return res.status(400).json({ error: "Either job posting URL or text must be provided." });
  }

  let textToParse = rawText || "";

  if (url) {
    if (!isSafeUrl(url)) {
      return res.status(403).json({
        error: "Sistem güvenliği kapsamındaki SSRF koruması nedeniyle girilen URL adresi engellendi."
      });
    }
    try {
      // Crawl/fetch online job posting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const webRes = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!webRes.ok) {
        throw new Error(`Failed to load page: HTTP ${webRes.status}`);
      }

      const html = await webRes.text();
      textToParse = cleanHtml(html);
    } catch (parseErr: any) {
      console.error("Web scrape failed, using fallback keyword parsing:", parseErr);
      return res.status(500).json({
        error: `Could not reach the URL directly. You can instead copy-paste the text content of the job description below. Details: ${parseErr.message}`,
      });
    }
  }

  try {
    // Standardize text lengths to protect tokens
    const trimmedInput = textToParse.slice(0, 8000);

    const response = await ai.models.generateContent({
      model: MODEL_CONFIG.JOB_PARSER,
      contents: `Extract and structure the core job posting requirements from the following text:
      ---
      ${trimmedInput}
      ---`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            summary: { type: Type.STRING },
            keySkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Must-have key technical or professional skills required.",
            },
            niceToHaveSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Bonus, elective, preferred, or soft skills.",
            },
            experienceRequired: { type: Type.STRING },
            educationRequired: { type: Type.STRING },
            responsibilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "company", "summary", "keySkills", "niceToHaveSkills", "responsibilities"],
        },
      },
    });

    const parsedRequirements = JSON.parse(response.text || "{}");
    res.json({ requirements: parsedRequirements });
  } catch (error: any) {
    console.error("Job description parse error:", error);
    res.status(500).json({ error: `Failed to extract job listing requirements: ${formatApiError(error)}` });
  }
});

// 3. API: Tailor Resume to Job Requirements + Suggestions
app.post("/api/tailor-resume", rateLimit(5, 1 * 60 * 1000), async (req, res) => {
  const { resumeData, jobRequirements, customPrompt } = req.body;

  if (!resumeData) {
    return res.status(400).json({ error: "Resume data is required." });
  }

  try {
    const prompt = `You are a high-level CV and Resume tailoring engine. You specialize in maximizing ATS score alignment while retaining 100% of the candidate's real honesty and integrity (never invent fictitious experience, instead map their real achievements to language used in the modern recruiting field).

Task: Optimize the candidate's resume data targeting the specific job posting requirements provided below.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Job Requirements:
${JSON.stringify(jobRequirements, null, 2)}

User Tailoring Instructions / Focus Intent:
"${customPrompt || "Default Optimization: Maximize ATS compatibility and highlight relevant skills."}"

Instructions:
1. Revamp the 'summary' to integrate target keywords organically, explaining value proposition within 3 sentences.
2. Refine experienced achievements (projects/experience) to show impact using metrics where possible while preserving dates, company names, and core truths. Focus description points using strong action verbs that map directly to the key skills and responsibilities of the job.
3. Align the skills array with keywords mentioned in the job description that the candidate likely possesses (extrapolating from their background).
4. Provide the fully updated resume matching the same Resume structure.
5. Provide a constructive, friendly audit object with an overall ATS score (0-100), key strengths found, gaps to address, and clean specific recommendations.

Generate both outputs together in a single JSON schema.`;

    const response = await ai.models.generateContent({
      model: MODEL_CONFIG.RESUME_TAILOR,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tailoredResume: {
              type: Type.OBJECT,
              properties: {
                personalInfo: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    title: { type: Type.STRING },
                    email: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    location: { type: Type.STRING },
                    website: { type: Type.STRING },
                  },
                  required: ["name", "title", "email", "phone", "location", "website"],
                },
                summary: { type: Type.STRING },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      jobTitle: { type: Type.STRING },
                      company: { type: Type.STRING },
                      location: { type: Type.STRING },
                      startDate: { type: Type.STRING },
                      endDate: { type: Type.STRING },
                      current: { type: Type.BOOLEAN },
                      description: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["id", "jobTitle", "company"],
                  },
                },
                education: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      degree: { type: Type.STRING },
                      fieldOfStudy: { type: Type.STRING },
                      school: { type: Type.STRING },
                      location: { type: Type.STRING },
                      graduationDate: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ["id", "degree", "school"],
                  },
                },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                projects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      role: { type: Type.STRING },
                      technologies: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      link: { type: Type.STRING },
                      description: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ["id", "title"],
                  },
                },
                certifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      issuer: { type: Type.STRING },
                      date: { type: Type.STRING },
                    },
                    required: ["id", "name"],
                  },
                },
              },
              required: ["personalInfo", "summary", "experience", "education", "skills", "projects", "certifications"],
            },
            feedback: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      section: { type: Type.STRING },
                      description: { type: Type.STRING },
                      originalText: { type: Type.STRING },
                      suggestedText: { type: Type.STRING },
                    },
                    required: ["section", "description", "suggestedText"],
                  },
                },
              },
              required: ["score", "strengths", "gaps", "recommendations"],
            },
          },
          required: ["tailoredResume", "feedback"],
        },
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    res.json(parsedResult);
  } catch (error: any) {
    console.error("Resume tailoring error:", error);
    res.status(500).json({ error: formatApiError(error) });
  }
});

// 4. API: Multi-turn Chat interface with different model mapping
app.post("/api/chat", rateLimit(20, 1 * 60 * 1000), async (req, res) => {
  const { history, message, role, modelMode } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Choose appropriate model based on requested speed/reasoning complexity
  let selectedModel = MODEL_CONFIG.CHAT_DEFAULT; // default general
  if (modelMode === "pro") {
    selectedModel = MODEL_CONFIG.CHAT_PRO;
  } else if (modelMode === "fast") {
    selectedModel = MODEL_CONFIG.CHAT_EXPEDITE;
  }

  // Prepare system instructions for different chatbot roles
  let systemInstruction = "";
  if (role === "ats_reviewer") {
    systemInstruction = `You are an elite ATS Compliance Officer and veteran HR Recruiter. 
Your tone is professional, direct, analytical, and highly constructive.
Help the user restructure achievements to pass ATS screenings effortlessly, flag resume parsing risks, optimize lists of core skills with precision keywords, and audit spacing issues.
Prioritize short sentences, clear feedback, and professional vocabulary. Exclude unneeded fluff.`;
  } else if (role === "branding_specialist") {
    systemInstruction = `You are a Professional Executive Branding Director and visual storyteller. 
Your tone is encouraging, refined, precise, and branding-oriented. 
Help the user synthesize powerful elevator summaries, polish professional statements, craft modern summaries, and define visual layout tips to make their personal brand stand out in a crowd.`;
  } else {
    // career_coach default
    systemInstruction = `You are a Seasoned Career Development Coach and Executive Career Consultant. 
Your tone is highly motivational, strategic, coaching-focused, and supportive. 
Help the user frame their experiences using impact actions, the STAR framework (Situation, Task, Action, Result) with tangible metrics, and brainstorm high-impact additions to their tech stack, volunteer experience, or volunteer leadership.`;
  }

  try {
    // Map existing message format to Gemini content parts
    const processedContents = (history || []).map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // Add new user message
    processedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: processedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini chatbot error:", error);
    res.status(500).json({ error: formatApiError(error) });
  }
});

// 5. API: Text-to-Speech (TTS) using target gemini-3.1-flash-tts-preview
app.post("/api/generate-speech", rateLimit(10, 1 * 60 * 1000), async (req, res) => {
  const { text, voice } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text to speak is required." });
  }

  const voiceName = voice || "Zephyr"; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'

  try {
    const response = await ai.models.generateContent({
      model: MODEL_CONFIG.TEXT_TO_SPEECH,
      contents: [{ parts: [{ text: `Read this resume pitch or tailored summary beautifully and completely: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio content returned from speech generator.");
    }

    res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error("TTS generation error:", error);
    res.status(500).json({ error: formatApiError(error) });
  }
});

// 6. API: High-Quality Image Generation using target gemini-3.1-flash-image
app.post("/api/generate-image", rateLimit(3, 1 * 60 * 1000), async (req, res) => {
  const { prompt, size } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  const modelName = MODEL_CONFIG.IMAGE_GENERATOR;
  const imageSize = size || "1K"; // '1K', '2K', '4K' are supported in the metadata specification.
  let base64Image = "";

  try {
    // Attempt generation with primary image model
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: `High professional quality executive visual: ${prompt}. Clean minimalist layout, suitable for a professional avatar portrait or sleek resume background banner accent.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }
  } catch (primaryError) {
    console.warn("Primary image generator failed or threw error, attempting fallback:", primaryError);
  }

  // Fallback to general/faster model if primary generation failed or returned empty content
  if (!base64Image) {
    try {
      console.log("Attempting fallback image model content generation...");
      const fallbackResponse = await ai.models.generateContent({
        model: MODEL_CONFIG.IMAGE_FALLBACK,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      const fallbackParts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of fallbackParts) {
        if (part.inlineData && part.inlineData.data) {
          base64Image = part.inlineData.data;
          break;
        }
      }
    } catch (fallbackError: any) {
      console.error("Image generation fallback failed completely:", fallbackError);
      return res.status(500).json({ error: `Image generation failed with fallback error: ${formatApiError(fallbackError)}` });
    }
  }

  if (!base64Image) {
    return res.status(500).json({ error: "No image data returned from either generation or fallback API." });
  }

  res.json({ imageUrl: `data:image/png;base64,${base64Image}` });
});

// Vite middleware configuration for development mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Resume Optimizer server running on http://localhost:${PORT}`);
  });
}

startServer();
