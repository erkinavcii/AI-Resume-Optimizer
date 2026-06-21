import React, { useState } from "react";
import { ResumeData, WorkExperience, Education, Project } from "../types";
import { Plus, Trash2, Mail, Phone, MapPin, Globe, CreditCard, Award, Code, GraduationCap, Briefcase } from "lucide-react";

interface ResumeFormProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

export default function ResumeForm({ resumeData, onChange }: ResumeFormProps) {
  const [newSkill, setNewSkill] = useState("");

  const handlePersonalInfoChange = (field: string, value: string) => {
    onChange({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const handleSummaryChange = (val: string) => {
    onChange({
      ...resumeData,
      summary: val,
    });
  };

  // Work Experience Handlers
  const handleExperienceChange = (id: string, index: number, field: keyof WorkExperience, value: any) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onChange({ ...resumeData, experience: updated });
  };

  const updateExperienceBullet = (expId: string, bulletIdx: number, val: string) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === expId) {
        const bullets = [...exp.description];
        bullets[bulletIdx] = val;
        return { ...exp, description: bullets };
      }
      return exp;
    });
    onChange({ ...resumeData, experience: updated });
  };

  const deleteExperienceBullet = (expId: string, bulletIdx: number) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === expId) {
        const bullets = exp.description.filter((_, idx) => idx !== bulletIdx);
        return { ...exp, description: bullets };
      }
      return exp;
    });
    onChange({ ...resumeData, experience: updated });
  };

  const addExperienceBullet = (expId: string) => {
    const updated = resumeData.experience.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, description: [...exp.description, ""] };
      }
      return exp;
    });
    onChange({ ...resumeData, experience: updated });
  };

  const addExperienceCard = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ["Developed standard web solutions."],
    };
    onChange({ ...resumeData, experience: [newExp, ...resumeData.experience] });
  };

  const deleteExperienceCard = (id: string) => {
    const updated = resumeData.experience.filter((exp) => exp.id !== id);
    onChange({ ...resumeData, experience: updated });
  };

  // Education Handlers
  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    const updated = resumeData.education.map((edu) => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onChange({ ...resumeData, education: updated });
  };

  const addEducationCard = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: "",
      fieldOfStudy: "",
      school: "",
      location: "",
      graduationDate: "",
    };
    onChange({ ...resumeData, education: [...resumeData.education, newEdu] });
  };

  const deleteEducationCard = (id: string) => {
    const updated = resumeData.education.filter((edu) => edu.id !== id);
    onChange({ ...resumeData, education: updated });
  };

  // Projects Handlers
  const handleProjectChange = (id: string, field: keyof Project, value: any) => {
    const updated = resumeData.projects.map((proj) => {
      if (proj.id === id) {
        return { ...proj, [field]: value };
      }
      return proj;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const updateProjectBullet = (projId: string, bulletIdx: number, val: string) => {
    const updated = resumeData.projects.map((proj) => {
      if (proj.id === projId) {
        const bullets = [...proj.description];
        bullets[bulletIdx] = val;
        return { ...proj, description: bullets };
      }
      return proj;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const deleteProjectBullet = (projId: string, bulletIdx: number) => {
    const updated = resumeData.projects.map((proj) => {
      if (proj.id === projId) {
        const bullets = proj.description.filter((_, idx) => idx !== bulletIdx);
        return { ...proj, description: bullets };
      }
      return proj;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const addProjectBullet = (projId: string) => {
    const updated = resumeData.projects.map((proj) => {
      if (proj.id === projId) {
        return { ...proj, description: [...proj.description, ""] };
      }
      return proj;
    });
    onChange({ ...resumeData, projects: updated });
  };

  const addProjectCard = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "",
      role: "",
      technologies: [],
      description: ["Architected responsive UI."],
    };
    onChange({ ...resumeData, projects: [...resumeData.projects, newProj] });
  };

  const deleteProjectCard = (id: string) => {
    const updated = resumeData.projects.filter((proj) => proj.id !== id);
    onChange({ ...resumeData, projects: updated });
  };

  // Skills Handlers
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (clean && !resumeData.skills.includes(clean)) {
      onChange({
        ...resumeData,
        skills: [...resumeData.skills, clean],
      });
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skill: string) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.filter((sk) => sk !== skill),
    });
  };

  return (
    <div id="resume-builder-form" className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-450" />
          Contact Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
            <input
              type="text"
              value={resumeData.personalInfo.name}
              onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Professional Title</label>
            <input
              type="text"
              value={resumeData.personalInfo.title}
              onChange={(e) => handlePersonalInfoChange("title", e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="email"
                value={resumeData.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="tel"
                value={resumeData.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Location (City, State)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={resumeData.personalInfo.location}
                onChange={(e) => handlePersonalInfoChange("location", e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Website / Portfolio Url</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </span>
              <input
                type="url"
                value={resumeData.personalInfo.website}
                onChange={(e) => handlePersonalInfoChange("website", e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-3 transition-colors duration-300">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
          <Award className="w-4 h-4 text-blue-600 dark:text-blue-450" />
          Professional Profile
        </h3>
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">CV Executive Summary</label>
          <textarea
            rows={3}
            value={resumeData.summary}
            onChange={(e) => handleSummaryChange(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all resize-none leading-relaxed font-medium"
          />
        </div>
      </div>

      {/* Core Skills Tags */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-1">
          <Code className="w-4 h-4 text-blue-600 dark:text-blue-450" />
          Core Technologies & Skills
        </h3>
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            placeholder="Add skill (e.g. Docker, TypeScript, Project Management)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white transition-all font-medium"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {resumeData.skills.map((sk) => (
            <span
              key={sk}
              className="inline-flex items-center gap-1 bg-slate-50 dark:bg-slate-800 hover:bg-red-55 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-100 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-all cursor-pointer group"
              onClick={() => handleDeleteSkill(sk)}
              title="Click to delete skill"
            >
              {sk}
              <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-red-500 shrink-0" />
            </span>
          ))}
          {resumeData.skills.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic font-medium">No skills listed yet.</p>
          )}
        </div>
      </div>

      {/* Professional Experiences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-450" />
            Work History
          </h3>
          <button
            id="btn-add-experience"
            type="button"
            onClick={addExperienceCard}
            className="text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white p-1.5 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Add Experience
          </button>
        </div>

        <div className="space-y-6">
          {resumeData.experience.map((exp, idx) => (
            <div key={exp.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 relative">
              <button
                type="button"
                onClick={() => deleteExperienceCard(exp.id)}
                className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-650 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-550">Position #{idx + 1}</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(exp.id, idx, "company", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={exp.jobTitle}
                    onChange={(e) => handleExperienceChange(exp.id, idx, "jobTitle", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/45 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Dates / Calendar Frame</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="YYYY-MM (Start)"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(exp.id, idx, "startDate", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder={exp.current ? "Present" : "YYYY-MM (End)"}
                      disabled={exp.current}
                      value={exp.current ? "" : exp.endDate}
                      onChange={(e) => handleExperienceChange(exp.id, idx, "endDate", e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800/80 disabled:text-slate-400 dark:disabled:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Location Details</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(exp.id, idx, "location", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`current-job-${exp.id}`}
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => handleExperienceChange(exp.id, idx, "current", e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-500 border-slate-300 dark:border-slate-700 rounded-sm focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <label htmlFor={`current-job-${exp.id}`} className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  I currently work in this role
                </label>
              </div>

              <div className="space-y-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">Achievement Statement & Metric Bullets</label>
                  <button
                    type="button"
                    onClick={() => addExperienceBullet(exp.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-440 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3" /> Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {exp.description.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex gap-2">
                      <span className="text-xs text-slate-400 dark:text-slate-550 pt-2 shrink-0">{bulletIdx + 1}.</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => updateExperienceBullet(exp.id, bulletIdx, e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => deleteExperienceBullet(exp.id, bulletIdx)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 shrink-0 self-center transition-colors cursor-pointer"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {exp.description.length === 0 && (
                    <p className="text-xs text-slate-450 dark:text-slate-500 italic">No accomplishments entered. Add a bullet for ATS formatting.</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600 dark:text-blue-450" />
            Key Projects
          </h3>
          <button
            type="button"
            onClick={addProjectCard}
            className="text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white p-1.5 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-450" /> Add Project
          </button>
        </div>

        <div className="space-y-6">
          {resumeData.projects.map((proj, idx) => (
            <div key={proj.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 relative">
              <button
                type="button"
                onClick={() => deleteProjectCard(proj.id)}
                className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => handleProjectChange(proj.id, "title", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-455 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Your Role / Responsibility</label>
                  <input
                    type="text"
                    placeholder="e.g. Creator, Lead Developer"
                    value={proj.role}
                    onChange={(e) => handleProjectChange(proj.id, "role", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-455 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">Achievement Statement Bullet Points</label>
                  <button
                    type="button"
                    onClick={() => addProjectBullet(proj.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-440 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Bullet
                  </button>
                </div>

                <div className="space-y-2">
                  {proj.description.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex gap-2">
                      <span className="text-xs text-slate-400 dark:text-slate-550 pt-2 shrink-0">{bulletIdx + 1}.</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => updateProjectBullet(proj.id, bulletIdx, e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => deleteProjectBullet(proj.id, bulletIdx)}
                        className="text-slate-400 dark:text-slate-500 hover:text-red-500 shrink-0 self-center transition-colors cursor-pointer"
                        title="Remove bullet"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* College and Education */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-4 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-450" />
            Education History
          </h3>
          <button
            type="button"
            onClick={addEducationCard}
            className="text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-950 dark:hover:text-white p-1.5 px-3.5 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Education
          </button>
        </div>

        <div className="space-y-4">
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 relative space-y-3.5">
              <button
                type="button"
                onClick={() => deleteEducationCard(edu.id)}
                className="absolute top-4 right-4 text-slate-400 dark:text-slate-550 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                title="Delete education"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">School / Institution</label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleEducationChange(edu.id, "school", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Degree Received</label>
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(edu.id, "degree", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Primary Field of Study</label>
                  <input
                    type="text"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleEducationChange(edu.id, "fieldOfStudy", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Graduation Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 2021-05"
                    value={edu.graduationDate}
                    onChange={(e) => handleEducationChange(edu.id, "graduationDate", e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white dark:bg-slate-950/40 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-450 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
