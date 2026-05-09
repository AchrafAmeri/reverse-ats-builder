import { usePDF } from 'react-to-pdf';
import type { MatchResponse, User } from '../types';

interface TailoredCVProps {
  user: User;
  matchResult: MatchResponse;
}

export function TailoredCV({ user, matchResult }: TailoredCVProps) {
  const { top_experiences, top_projects, matched_skills } = matchResult;
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

  // Filter out experiences/projects with 0 score
  const relevantExperiences = top_experiences.filter(exp => exp.score > 0);
  const relevantProjects = top_projects.filter(proj => proj.score > 0);

  return (
    <div ref={targetRef} className="bg-white text-gray-900 shadow-lg rounded-lg p-8 md:p-12 border border-gray-200 mx-auto" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
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
      {matched_skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3 text-gray-800">Relevant Skills</h2>
          <div className="flex flex-wrap gap-2">
            {matched_skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-3 py-1 text-sm font-medium rounded-full border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {relevantExperiences.length > 0 ? (
        <section className="mb-8">
          <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-4 text-gray-800">Professional Experience</h2>
          <div className="space-y-6">
            {relevantExperiences.map(exp => (
              <div key={exp.id} className="relative">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                  <span className="text-sm font-semibold text-gray-600 whitespace-nowrap ml-4">
                    {formatDate(exp.start_date)} - {formatDate(exp.end_date)}
                  </span>
                </div>
                <div className="text-md font-medium text-blue-700 mb-2">{exp.company}</div>
                {exp.description && (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {highlightSkills(exp.description, matched_skills)}
                  </p>
                )}
                {/* Print view only: small score badge if desired, but usually CVs don't show match scores. Let's omit score from printed CV to look professional. */}
              </div>
            ))}
          </div>
        </section>
      ) : (
         <div className="mb-8 p-4 bg-red-50 text-red-700 border border-red-200 rounded">
            <strong>No Relevant Experience Found:</strong> Add more experiences to your profile or try a different job description.
         </div>
      )}

      {/* Projects */}
      {relevantProjects.length > 0 && (
        <section>
          <h2 className="text-xl font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-4 text-gray-800">Relevant Projects</h2>
          <div className="space-y-6">
            {relevantProjects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{proj.name}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      View Project
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mt-1">
                    {highlightSkills(proj.description, matched_skills)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
