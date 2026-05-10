import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { User, MatchResponse } from '../types';
import type { ActiveCategory } from './CVBuilder';

interface SelectionPanelProps {
  category: ActiveCategory;
  onClose: () => void;
  user: User;
  matchResult: MatchResponse;
  selectedExperiences: Set<number>;
  setSelectedExperiences: Dispatch<SetStateAction<Set<number>>>;
  selectedProjects: Set<number>;
  setSelectedProjects: Dispatch<SetStateAction<Set<number>>>;
  selectedEducations: Set<number>;
  setSelectedEducations: Dispatch<SetStateAction<Set<number>>>;
  selectedSkills: Set<string>;
  setSelectedSkills: Dispatch<SetStateAction<Set<string>>>;
  hiddenBullets: Record<string, Set<number>>;
  setHiddenBullets: Dispatch<SetStateAction<Record<string, Set<number>>>>;
}

export function SelectionPanel({
  category,
  onClose,
  user,
  matchResult,
  selectedExperiences,
  setSelectedExperiences,
  selectedProjects,
  setSelectedProjects,
  selectedEducations,
  setSelectedEducations,
  selectedSkills,
  setSelectedSkills,
  hiddenBullets,
  setHiddenBullets
}: SelectionPanelProps) {

  // Create quick lookup for match scores
  const experienceScores = new Map(matchResult.top_experiences.map(e => [e.id, e.score]));
  const projectScores = new Map(matchResult.top_projects.map(p => [p.id, p.score]));
  const matchedSkillsSet = new Set(matchResult.matched_skills.map(s => s.toLowerCase()));

  // Expandable state for Deep Edit
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const toggleBullet = (itemId: string, bulletIndex: number) => {
    setHiddenBullets(prev => {
      const currentSet = prev[itemId] || new Set();
      const nextSet = new Set(currentSet);
      if (nextSet.has(bulletIndex)) {
        nextSet.delete(bulletIndex);
      } else {
        nextSet.add(bulletIndex);
      }
      return { ...prev, [itemId]: nextSet };
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border dark:border-gray-700 h-[calc(100vh-8rem)] overflow-y-auto flex flex-col">
      <div className="flex justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white capitalize">
          Select {category}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 space-y-4">
        {category === 'experiences' && user.experiences.map(exp => {
          const score = experienceScores.get(exp.id) || 0;
          const isRecommended = score > 0;
          const isSelected = selectedExperiences.has(exp.id);
          const itemKey = `exp_${exp.id}`;
          const isExpanded = expandedItems.has(itemKey);

          return (
            <div key={exp.id} className={`p-4 border rounded-md transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    setSelectedExperiences(prev => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(exp.id);
                      else next.delete(exp.id);
                      return next;
                    });
                  }}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={exp.title}>{exp.title}</h3>
                    {isRecommended && <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">Recommended</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>

                  {exp.description && isSelected && (
                    <button
                      onClick={() => toggleExpand(itemKey)}
                      className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide description details' : 'Edit description bullets'}
                      <svg className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  )}

                  {isExpanded && exp.description && isSelected && (
                    <div className="mt-3 space-y-2 border-t dark:border-gray-700 pt-2">
                      {exp.description.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        const isBulletHidden = hiddenBullets[itemKey]?.has(i);
                        return (
                          <label key={i} className={`flex items-start gap-2 text-sm cursor-pointer ${isBulletHidden ? 'opacity-50 line-through' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!isBulletHidden}
                              onChange={() => toggleBullet(itemKey, i)}
                              className="mt-1 h-3 w-3 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 line-clamp-2" title={trimmed}>{trimmed}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {category === 'educations' && user.educations.map(edu => {
          const isSelected = selectedEducations.has(edu.id);
          const itemKey = `edu_${edu.id}`;
          const isExpanded = expandedItems.has(itemKey);

          return (
            <div key={edu.id} className={`p-4 border rounded-md transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    setSelectedEducations(prev => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(edu.id);
                      else next.delete(edu.id);
                      return next;
                    });
                  }}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={edu.degree}>{edu.degree}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>

                  {edu.description && isSelected && (
                    <button
                      onClick={() => toggleExpand(itemKey)}
                      className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide description details' : 'Edit description bullets'}
                      <svg className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  )}

                  {isExpanded && edu.description && isSelected && (
                    <div className="mt-3 space-y-2 border-t dark:border-gray-700 pt-2">
                      {edu.description.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        const isBulletHidden = hiddenBullets[itemKey]?.has(i);
                        return (
                          <label key={i} className={`flex items-start gap-2 text-sm cursor-pointer ${isBulletHidden ? 'opacity-50 line-through' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!isBulletHidden}
                              onChange={() => toggleBullet(itemKey, i)}
                              className="mt-1 h-3 w-3 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 line-clamp-2" title={trimmed}>{trimmed}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {category === 'projects' && user.projects.map(proj => {
          const score = projectScores.get(proj.id) || 0;
          const isRecommended = score > 0;
          const isSelected = selectedProjects.has(proj.id);
          const itemKey = `proj_${proj.id}`;
          const isExpanded = expandedItems.has(itemKey);

          return (
            <div key={proj.id} className={`p-4 border rounded-md transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    setSelectedProjects(prev => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(proj.id);
                      else next.delete(proj.id);
                      return next;
                    });
                  }}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={proj.name}>{proj.name}</h3>
                    {isRecommended && <span className="ml-2 text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full whitespace-nowrap">Recommended</span>}
                  </div>

                  {proj.description && isSelected && (
                    <button
                      onClick={() => toggleExpand(itemKey)}
                      className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide description details' : 'Edit description bullets'}
                      <svg className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  )}

                  {isExpanded && proj.description && isSelected && (
                    <div className="mt-3 space-y-2 border-t dark:border-gray-700 pt-2">
                      {proj.description.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return null;
                        const isBulletHidden = hiddenBullets[itemKey]?.has(i);
                        return (
                          <label key={i} className={`flex items-start gap-2 text-sm cursor-pointer ${isBulletHidden ? 'opacity-50 line-through' : ''}`}>
                            <input
                              type="checkbox"
                              checked={!isBulletHidden}
                              onChange={() => toggleBullet(itemKey, i)}
                              className="mt-1 h-3 w-3 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-700 dark:text-gray-300 line-clamp-2" title={trimmed}>{trimmed}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {category === 'skills' && (
          <div className="flex flex-wrap gap-2">
            {/* Extract all unique skills from user profile */}
            {Array.from(new Set([
              ...user.experiences.flatMap(e => e.skills.map(s => s.name)),
              ...user.projects.flatMap(p => p.skills.map(s => s.name)),
              ...matchResult.matched_skills
            ])).sort().map(skill => {
              const isRecommended = matchedSkillsSet.has(skill.toLowerCase());
              const isSelected = selectedSkills.has(skill);

              return (
                <label
                  key={skill}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-full cursor-pointer transition-colors text-sm
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      setSelectedSkills(prev => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(skill);
                        else next.delete(skill);
                        return next;
                      });
                    }}
                    className="sr-only"
                  />
                  <span>{skill}</span>
                  {isRecommended && (
                    <span className="w-2 h-2 rounded-full bg-green-500" title="Recommended for this job"></span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Done Editing
        </button>
      </div>
    </div>
  );
}
