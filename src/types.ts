export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[]; // Bullet points
}

export interface Education {
  id: string;
  degree: string;
  fieldOfStudy: string;
  school: string;
  location: string;
  graduationDate: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  technologies: string[];
  link?: string;
  description: string[]; // Bullet points
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
}

export interface JobRequirements {
  title: string;
  company: string;
  summary: string;
  keySkills: string[];
  niceToHaveSkills: string[];
  experienceRequired?: string;
  educationRequired?: string;
  responsibilities: string[];
}

export interface OptimizationsFeedback {
  score: number; // 0 to 100 ATS match score
  strengths: string[];
  gaps: string[];
  recommendations: {
    section: string;
    description: string;
    originalText?: string;
    suggestedText: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type ChatbotRole = 'ats_reviewer' | 'career_coach' | 'branding_specialist';

export interface ChatbotRoleConfig {
  id: ChatbotRole;
  name: string;
  icon: string;
  tagline: string;
  systemInstruction: string;
  model: string; // The specific Gemini model
}
