import React from "react";
import { ResumeData } from "../types";
import { Mail, Phone, MapPin, Globe, Award, Briefcase, GraduationCap, Code } from "lucide-react";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

export default function ResumePreview({ resumeData }: ResumePreviewProps) {
  const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

  return (
    <div 
      id="printable-resume-page" 
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-neutral-100 dark:border-slate-800 p-8 sm:p-10 text-neutral-900 dark:text-slate-100 font-sans max-w-[210mm] min-h-[297mm] mx-auto print:shadow-none print:border-none print:p-0 print:m-0 print:bg-white print:text-black transition-colors duration-300"
    >
      {/* Header Profile details */}
      <header className="border-b-2 border-neutral-900 dark:border-slate-700 pb-5 mb-5 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white uppercase print:text-2xl">
          {personalInfo.name || "YOUR FULL NAME"}
        </h1>
        <p className="text-sm font-semibold tracking-wider text-neutral-600 dark:text-slate-400 uppercase mt-1 print:text-xs">
          {personalInfo.title || "Target Professional Title"}
        </p>

        {/* Contact list */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-3 text-xs text-neutral-500 dark:text-slate-400 font-medium">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 shrink-0 print:hidden text-neutral-400 dark:text-slate-500" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 shrink-0 print:hidden text-neutral-400 dark:text-slate-500" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 print:hidden text-neutral-400 dark:text-slate-500" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1 underline decoration-neutral-200 dark:decoration-slate-700">
              <Globe className="w-3.5 h-3.5 shrink-0 print:hidden text-neutral-400 dark:text-slate-500" />
              {personalInfo.website}
            </span>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {/* Executive Summary */}
        {summary && (
          <section className="print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-2.5">
              <Award className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Professional Summary
            </h2>
            <p className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed text-justify font-normal">
              {summary}
            </p>
          </section>
        )}

        {/* Professional Experience */}
        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-3.5 print:break-inside-avoid">
              <Briefcase className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Professional History
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="print:break-inside-avoid space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-xs font-extrabold text-neutral-950 dark:text-white flex flex-wrap gap-1 items-baseline">
                      <span>{exp.jobTitle}</span>
                      <span className="text-neutral-400 dark:text-slate-500 font-medium">@</span>
                      <span className="text-neutral-700 dark:text-slate-300 font-bold">{exp.company}</span>
                    </h3>
                    <div className="text-[11px] font-semibold text-neutral-500 dark:text-slate-400 shrink-0">
                      <span>{exp.startDate}</span> – <span>{exp.current ? "Present" : exp.endDate}</span>
                      {exp.location && <span className="text-neutral-300 dark:text-slate-700 mx-1.5 font-normal">|</span>}
                      {exp.location && <span className="font-medium italic">{exp.location}</span>}
                    </div>
                  </div>

                  <ul className="list-disc pl-4.5 space-y-1">
                    {exp.description.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed font-normal">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected Projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-3.5 print:break-inside-avoid">
              <Award className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Key Projects
            </h2>
            <div className="space-y-4">
              {projects.map((proj) => (
                <div key={proj.id} className="print:break-inside-avoid space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <h3 className="text-xs font-extrabold text-neutral-950 dark:text-white">
                      {proj.title}
                      {proj.role && <span className="text-neutral-500 dark:text-slate-400 font-medium ml-1.5">({proj.role})</span>}
                    </h3>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-[10px] font-semibold text-neutral-400 dark:text-slate-500 font-mono truncate">
                        {proj.technologies.join(" • ")}
                      </div>
                    )}
                  </div>

                  <ul className="list-disc pl-4.5 space-y-1">
                    {proj.description.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed font-normal">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Column Core */}
        {skills.length > 0 && (
          <section className="print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-2.5">
              <Code className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Skills & Expertise
            </h2>
            <p className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed font-normal">
              {skills.join(" • ")}
            </p>
          </section>
        )}

        {/* Education Background */}
        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-3.5 print:break-inside-avoid">
              <GraduationCap className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Education & Credentials
            </h2>
            <div className="space-y-3.5">
              {education.map((edu) => (
                <div key={edu.id} className="print:break-inside-avoid flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 text-xs">
                  <div>
                    <h3 className="font-extrabold text-neutral-950 dark:text-white">
                      {edu.school}
                    </h3>
                    <p className="text-neutral-600 dark:text-slate-400 font-medium">
                      {edu.degree} in {edu.fieldOfStudy}
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-neutral-500 dark:text-slate-400 shrink-0 text-left sm:text-right">
                    <span>{edu.graduationDate}</span>
                    {edu.location && <span className="text-neutral-300 dark:text-slate-700 mx-1.5 font-normal">|</span>}
                    {edu.location && <span className="font-medium italic">{edu.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Array */}
        {certifications.length > 0 && (
          <section className="print:break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-slate-200 border-b border-neutral-200 dark:border-slate-800 pb-1 flex items-center gap-1.5 mb-2.5">
              <Award className="w-4 h-4 shrink-0 print:hidden text-neutral-500 dark:text-slate-400" />
              Certifications
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {certifications.map((cert) => (
                <li key={cert.id} className="text-neutral-700 dark:text-slate-300 font-normal leading-relaxed">
                  <span className="font-bold text-neutral-900 dark:text-white">{cert.name}</span> – <span className="text-neutral-500 dark:text-slate-400">{cert.issuer} ({cert.date})</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="hidden print:block text-center mt-10 border-t border-dashed border-neutral-200 pt-3">
        <p className="text-[9px] text-neutral-400 font-medium">Generated via AI Resume Optimizer & Personal Career Coach</p>
      </footer>
    </div>
  );
}
