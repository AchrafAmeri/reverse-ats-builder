/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import type { User, MatchResponse, Skill } from '../types';
import { JobMatcher } from './JobMatcher';
import { SkillSuggestions } from './SkillSuggestions';
import { TailoredCV } from './TailoredCV';
import { SelectionPanel } from './SelectionPanel';

interface CVBuilderProps {
  user: User;
  skills: Skill[];
  onSkillsChanged: () => void;
}

export type ActiveCategory = 'experiences' | 'projects' | 'skills' | null;

export function CVBuilder({ user, skills, onSkillsChanged }: CVBuilderProps) {
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [lastJobDescription, setLastJobDescription] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null);

  // Selections state
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set());
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());

  // Hidden bullets state: Map of itemId to set of hidden bullet indices
  // We prefix keys like 'exp_1' or 'proj_2' to differentiate
  const [hiddenBullets, setHiddenBullets] = useState<Record<string, Set<number>>>({});

  // Initialize selections when match result changes
  useEffect(() => {
    if (matchResult) {
      const expSet = new Set<number>();
      matchResult.top_experiences.forEach(exp => {
        if (exp.score > 0) expSet.add(exp.id);
      });
      setSelectedExperiences(expSet);

      const projSet = new Set<number>();
      matchResult.top_projects.forEach(proj => {
        if (proj.score > 0) projSet.add(proj.id);
      });
      setSelectedProjects(projSet);

      const skillSet = new Set<string>();
      matchResult.matched_skills.forEach(skill => {
        skillSet.add(skill);
      });
      setSelectedSkills(skillSet);

      // Reset hidden bullets
      setHiddenBullets({});
    }
  }, [matchResult]);

  const handleMatchComplete = (result: MatchResponse | null, jd?: string) => {
    setMatchResult(result);
    if (jd) setLastJobDescription(jd);
    setActiveCategory(null); // Reset active category
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Column (Job Matcher or Selection Panel) */}
      <div className="lg:col-span-1 space-y-6 print:hidden sticky top-24">
        {activeCategory && matchResult ? (
          <SelectionPanel
            category={activeCategory}
            onClose={() => setActiveCategory(null)}
            user={user}
            matchResult={matchResult}
            selectedExperiences={selectedExperiences}
            setSelectedExperiences={setSelectedExperiences}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            hiddenBullets={hiddenBullets}
            setHiddenBullets={setHiddenBullets}
          />
        ) : (
          <>
            <JobMatcher
              userId={user.id}
              onMatchComplete={handleMatchComplete}
            />
            {lastJobDescription && (
              <SkillSuggestions
                jobDescription={lastJobDescription}
                userSkills={skills}
                onSkillAdded={onSkillsChanged}
              />
            )}
          </>
        )}
      </div>

      {/* Right Column (Tailored CV) */}
      <div className="lg:col-span-2">
        {matchResult ? (
          <TailoredCV
            user={user}
            matchResult={matchResult}
            selectedExperiences={selectedExperiences}
            selectedProjects={selectedProjects}
            selectedSkills={selectedSkills}
            hiddenBullets={hiddenBullets}
            onEditCategory={(cat) => setActiveCategory(cat)}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-12 border dark:border-gray-700 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No CV Generated Yet</h3>
            <p className="text-gray-500 mt-2">Paste a job description on the left and click "Generate Tailored CV" to see your match.</p>
          </div>
        )}
      </div>
    </div>
  );
}
