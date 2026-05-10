import { usePDF } from 'react-to-pdf';
import type { MatchResponse, User } from '../types';
import type { ActiveCategory } from './CVBuilder';

interface TailoredCVProps {
  user: User;
  matchResult: MatchResponse;
  selectedExperiences: Set<number>;
  selectedProjects: Set<number>;
  selectedEducations: Set<number>;
  selectedSkills: Set<string>;
  hiddenBullets: Record<string, Set<number>>;
  onEditCategory: (category: ActiveCategory) => void;
}

export function TailoredCV({
  user,
  matchResult,
  selectedExperiences,
  selectedProjects,
  selectedEducations,
  selectedSkills,
  hiddenBullets,
  onEditCategory
}: TailoredCVProps) {
  const { matched_skills } = matchResult;
  const { toPDF, targetRef } = usePDF({ filename: 'tailored-cv.pdf' });

  // Helper to highlight matched skills in text
  const highlightSkills = (text: string | undefined, skillsToHighlight: string[]) => {
    if (!text) return null;
    if (skillsToHighlight.length === 0) return <span>{text}</span>;

    // Create a regex to match any of the skills, case-insensitive
    const escapedSkills = skillsToHighlight.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedSkills.join('|')})`, 'gi');

    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          const isMatch = skillsToHighlight.some(skill => skill.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <span key={i} className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          );
        })}
      </span>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  };

  // Filter based on selected IDs and preserve original order or sorted order?
  // Let's use the ones from user profile but only those selected.
  const relevantExperiences = user.experiences.filter(exp => selectedExperiences.has(exp.id));
  const relevantProjects = user.projects.filter(proj => selectedProjects.has(proj.id));
  const relevantEducations = user.educations.filter(edu => selectedEducations.has(edu.id));
  const relevantSkills = Array.from(selectedSkills);

  // Helper to filter hidden bullets from description
  const filterDescription = (description: string | undefined, itemKey: string) => {
    if (!description) return '';
    const lines = description.split('\n');
    const visibleLines = lines.filter((_, i) => !hiddenBullets[itemKey]?.has(i));
    return visibleLines.join('\n');
  };

  return (
    <div ref={targetRef} className="bg-white text-gray-900 shadow-lg rounded-lg p-8 md:p-12 border border-gray-200 mx-auto transition-all" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
      {/* Print Button (hidden in print view) */}
      <div data-html2canvas-ignore="true" className="flex justify-end gap-2 mb-4 print:hidden">
         <button
           onClick={() => toPDF()}
           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
         >
           Download as PDF
         </button>
         <button
           onClick={() => window.print()}
           className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
         >
           Print / Save PDF
         </button>
      </div>

      {/* Header */}
      <header className="border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold mb-2 uppercase tracking-wide">{user.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {user.email && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {user.email}
            </span>
          )}
          {user.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {user.phone}
            </span>
          )}
          {user.linkedin_url && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline">{user.linkedin_url}</a>
            </span>
          )}
        </div>
      </header>

      {/* Matched Skills */}
      <section className="mb-8 group relative rounded-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 p-2 -mx-2 transition-colors">
        <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-3">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Skills</h2>
          <button
            onClick={() => onEditCategory('skills')}
            className="opacity-0 group-hover:opacity-100 print:hidden text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Skills
          </button>
        </div>
        {relevantSkills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {relevantSkills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 text-sm font-medium rounded border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic print:hidden">No skills selected.</p>
        )}
      </section>

      {/* Experience */}
      <section className="mb-8 group relative rounded-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 p-2 -mx-2 transition-colors">
        <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Professional Experience</h2>
          <button
            onClick={() => onEditCategory('experiences')}
            className="opacity-0 group-hover:opacity-100 print:hidden text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Experience
          </button>
        </div>
        {relevantExperiences.length > 0 ? (
          <div className="space-y-6">
            {relevantExperiences.map(exp => {
              const filteredDesc = filterDescription(exp.description, `exp_${exp.id}`);
              return (
                <div key={exp.id} className="relative">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-4">
                      {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                    </span>
                  </div>
                  <div className="text-md font-medium text-blue-700 mb-2">{exp.company}</div>
                  {filteredDesc && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {highlightSkills(filteredDesc, matched_skills)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic print:hidden">No experiences selected.</p>
        )}
      </section>

      {/* Educations */}
      <section className="mb-8 group relative rounded-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 p-2 -mx-2 transition-colors">
        <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Education</h2>
          <button
            onClick={() => onEditCategory('educations')}
            className="opacity-0 group-hover:opacity-100 print:hidden text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Education
          </button>
        </div>
        {relevantEducations.length > 0 ? (
          <div className="space-y-6">
            {relevantEducations.map(edu => {
              const filteredDesc = filterDescription(edu.description, `edu_${edu.id}`);
              return (
                <div key={edu.id} className="relative">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-4">
                      {edu.start_date} - {edu.end_date || 'Present'}
                    </span>
                  </div>
                  <div className="text-md font-medium text-blue-700 mb-2">{edu.institution}</div>
                  {filteredDesc && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {highlightSkills(filteredDesc, matched_skills)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic print:hidden">No education selected.</p>
        )}
      </section>

      {/* Projects */}
      <section className="group relative rounded-lg border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 p-2 -mx-2 transition-colors">
        <div className="flex justify-between items-end border-b border-gray-300 pb-1 mb-4">
          <h2 className="text-xl font-bold uppercase tracking-wider text-gray-800">Projects</h2>
          <button
            onClick={() => onEditCategory('projects')}
            className="opacity-0 group-hover:opacity-100 print:hidden text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Projects
          </button>
        </div>
        {relevantProjects.length > 0 ? (
          <div className="space-y-6">
            {relevantProjects.map(proj => {
              const filteredDesc = filterDescription(proj.description, `proj_${proj.id}`);
              return (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        View Project
                      </a>
                    )}
                  </div>
                  {filteredDesc && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mt-1">
                      {highlightSkills(filteredDesc, matched_skills)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic print:hidden">No projects selected.</p>
        )}
      </section>

      {/* CSS for printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
          /* Hide app layout elements when printing */
          header:not(.cv-header), nav, footer {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
