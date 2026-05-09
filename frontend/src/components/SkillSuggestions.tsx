import { useMemo, useState } from 'react';
import type { Skill } from '../types';
import { apiService } from '../services/api';

// Common stop words to exclude from capitalized word extraction
const STOP_WORDS = new Set([
  'The', 'A', 'An', 'And', 'But', 'Or', 'If', 'Then', 'Else', 'When',
  'At', 'From', 'By', 'For', 'With', 'About', 'Against', 'Between', 'Into',
  'Through', 'During', 'Before', 'After', 'Above', 'Below', 'To', 'In', 'On',
  'We', 'They', 'You', 'He', 'She', 'It', 'I', 'This', 'That', 'These', 'Those',
  'Are', 'Is', 'Was', 'Were', 'Be', 'Been', 'Being', 'Have', 'Has', 'Had', 'Do', 'Does', 'Did',
  'Will', 'Would', 'Shall', 'Should', 'Can', 'Could', 'May', 'Might', 'Must',
  'Our', 'Your', 'Their', 'His', 'Her', 'Its', 'My',
  'Job', 'Description', 'Requirements', 'Responsibilities', 'Experience', 'Years',
  'Team', 'Company', 'Role', 'Candidate', 'Work', 'Environment', 'Benefits',
  'Opportunity', 'Skills', 'Knowledge', 'Ability', 'Strong', 'Excellent', 'Good',
  'Required', 'Preferred', 'Plus', 'Bachelor', 'Master', 'Degree', 'Computer', 'Science',
  'Engineering', 'Software', 'Developer', 'Engineer', 'Manager', 'Lead', 'Senior', 'Junior',
  'Looking', 'Join', 'Help', 'Build', 'Create', 'Design', 'Develop', 'Maintain', 'Support'
]);

// Very common tech keywords that might not always be capitalized
const COMMON_TECH_KEYWORDS = new Set([
  'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'hibernate',
  'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'sql', 'mysql', 'postgresql', 'mongodb',
  'redis', 'elasticsearch', 'kafka', 'rabbitmq', 'graphql', 'rest', 'api', 'ci/cd', 'jenkins',
  'github', 'gitlab', 'agile', 'scrum', 'kanban', 'jira', 'confluence', 'linux', 'unix',
  'windows', 'macos', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin', 'java',
  'python', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'scala',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui', 'ant-design'
]);

interface SkillSuggestionsProps {
  jobDescription: string;
  userSkills: Skill[];
  onSkillAdded: () => void;
}

export function SkillSuggestions({ jobDescription, userSkills, onSkillAdded }: SkillSuggestionsProps) {
  const [addingSkills, setAddingSkills] = useState<Set<string>>(new Set());

  const suggestedSkills = useMemo(() => {
    if (!jobDescription) return [];

    const userSkillNames = new Set(userSkills.map(s => s.name.toLowerCase()));
    const extractedKeywords = new Set<string>();

    // Heuristic 1: Capitalized words
    const words = jobDescription.split(/[\s,.;:()]+/);
    for (const word of words) {
      if (word.length > 1 && /^[A-Z][a-z0-9+#]*$/.test(word)) {
        // Strip trailing punctuation
        const cleanWord = word.replace(/[^\w+#]/g, '');
        if (cleanWord.length > 1 && !STOP_WORDS.has(cleanWord)) {
          extractedKeywords.add(cleanWord);
        }
      }
    }

    // Heuristic 2: Known common tech keywords (case-insensitive search)
    const lowerJobDesc = jobDescription.toLowerCase();
    for (const keyword of COMMON_TECH_KEYWORDS) {
      // Use regex to find whole words only
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
      if (regex.test(lowerJobDesc)) {
        // Find original casing if possible, else capitalize first letter
        const match = jobDescription.match(new RegExp(`\\b${keyword}\\b`, 'i'));
        if (match) {
           extractedKeywords.add(match[0]);
        } else {
           extractedKeywords.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
        }
      }
    }

    // Filter out skills the user already has
    const suggestions: string[] = [];
    for (const kw of extractedKeywords) {
      if (!userSkillNames.has(kw.toLowerCase()) && !suggestions.find(s => s.toLowerCase() === kw.toLowerCase())) {
        suggestions.push(kw);
      }
    }

    return suggestions.sort();
  }, [jobDescription, userSkills]);

  const handleAddSkill = async (skillName: string) => {
    try {
      setAddingSkills(prev => new Set(prev).add(skillName));
      await apiService.createSkill({ name: skillName });
      onSkillAdded(); // Triggers a refresh of skills in parent
    } catch (err) {
      console.error(`Failed to add skill: ${skillName}`, err);
    } finally {
      setAddingSkills(prev => {
        const next = new Set(prev);
        next.delete(skillName);
        return next;
      });
    }
  };

  if (suggestedSkills.length === 0) {
    return null; // Nothing to suggest
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-500 mb-2">
        Missing Skills?
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
        The job mentions the following potential skills. Do you want to add them to your profile?
      </p>

      <div className="flex flex-wrap gap-2">
        {suggestedSkills.map(skill => (
          <div
            key={skill}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-yellow-300 dark:border-yellow-600 shadow-sm"
          >
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{skill}</span>
            <button
              onClick={() => handleAddSkill(skill)}
              disabled={addingSkills.has(skill)}
              className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
            >
              {addingSkills.has(skill) ? 'Adding...' : 'Add'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
