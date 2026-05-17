import { useState } from 'react';
import { apiService } from '../services/api';
import type { MatchResponse } from '../types';

interface JobMatcherProps {
  userId: number;
  onMatchComplete: (matchResult: MatchResponse | null, jobDescription?: string) => void;
}

export function JobMatcher({ userId, onMatchComplete }: JobMatcherProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      const response = await apiService.generateMatch(userId, jobDescription);
      onMatchComplete(response.data, jobDescription);
    } catch (err) {
      console.error('Failed to generate match:', err);
      setError('Failed to generate tailored CV. Please try again.');
      onMatchComplete(null, jobDescription);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border dark:border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Job Matcher</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
        Paste the job description below to generate a tailored CV highlighting your most relevant experiences and projects.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Job Description
        </label>
        <textarea
          id="job-description"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-y"
          placeholder="Paste job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={isGenerating}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !jobDescription.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Tailored CV'}
        </button>
      </div>
    </div>
  );
}
