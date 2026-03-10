// Core type definitions for ResumeIQ

export interface ExtractedData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  rawText: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  cgpa: string;
}

export interface ProjectEntry {
  title: string;
  description: string;
}

export interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface AnalysisResult {
  extractedData: ExtractedData;
  overallScore: number;
  sectionScores: SectionScore[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface ImprovedResume {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string[];
  projects: ProjectEntry[];
  education: EducationEntry[];
}

export interface DownloadRequest {
  resumeData: ImprovedResume;
}
