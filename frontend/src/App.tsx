import { useState, useEffect } from 'react';
import type { User, Skill } from './types';
import { apiService } from './services/api';
import { UserProfileForm } from './components/UserProfileForm';
import { SkillManager } from './components/SkillManager';
import { ExperienceList } from './components/ExperienceList';
import { ProjectList } from './components/ProjectList';
import { JobMatcher } from './components/JobMatcher';
import { SkillSuggestions } from './components/SkillSuggestions';
import { TailoredCV } from './components/TailoredCV';
import type { MatchResponse } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'matcher'>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [lastJobDescription, setLastJobDescription] = useState<string>('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Hardcode user_id 1 for now, as requested.
      // In a real app, this would be determined by login/auth state.
      const [userResponse, skillsResponse] = await Promise.all([
        apiService.getUser(1).catch((err: any) => {
          if (err.response && err.response.status === 404) {
             return null;
          }
          throw err;
        }),
        apiService.getSkills()
      ]);

      setSkills(skillsResponse.data);

      if (userResponse) {
        setUser(userResponse.data);
      } else {
      // If user 1 doesn't exist, we might want to offer to create one or show a clear error.
        // Try to create a mock user 1 if it doesn't exist to make the dashboard work
        const newMockUser = await apiService.createUser({
          name: "Demo User",
          email: "demo@example.com"
        });
        setUser({
          ...newMockUser.data,
          experiences: [],
          projects: []
        });
      }
    } catch (err: any) {
      setError('Failed to connect to backend. Make sure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSkillsOnly = async () => {
    try {
      const response = await apiService.getSkills();
      setSkills(response.data);
    } catch (err) {
      console.error("Failed to refresh skills", err);
    }
  };

  const refreshUserOnly = async () => {
    try {
      if (user) {
         const response = await apiService.getUser(user.id);
         setUser(response.data);
      }
    } catch (err) {
      console.error("Failed to refresh user", err);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading Profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center border-t-4 border-red-500">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-12">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 mb-8 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Reverse ATS Builder
          </h1>

          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Profile Data Entry
            </button>
            <button
              onClick={() => setActiveTab('matcher')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'matcher'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              CV Generator
            </button>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Logged in as <span className="font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4">
        {activeTab === 'profile' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile & Skills */}
            <div className="lg:col-span-1 space-y-8">
              <UserProfileForm user={user} onUpdate={setUser} />
              <SkillManager skills={skills} onSkillsChanged={fetchSkillsOnly} />
            </div>

            {/* Right Column: Experiences & Projects */}
            <div className="lg:col-span-2 space-y-8">
              <ExperienceList
                userId={user.id}
                experiences={user.experiences || []}
                allSkills={skills}
                onExperienceAdded={refreshUserOnly}
                onExperienceDeleted={refreshUserOnly}
              />
              <ProjectList
                userId={user.id}
                projects={user.projects || []}
                allSkills={skills}
                onProjectAdded={refreshUserOnly}
                onProjectDeleted={refreshUserOnly}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6 print:hidden">
                 <JobMatcher
                    userId={user.id}
                    onMatchComplete={(result, jd) => {
                      setMatchResult(result);
                      if (jd) setLastJobDescription(jd);
                    }}
                 />
                 {lastJobDescription && (
                   <SkillSuggestions
                     jobDescription={lastJobDescription}
                     userSkills={skills}
                     onSkillAdded={fetchSkillsOnly}
                   />
                 )}
              </div>
              <div className="lg:col-span-2">
                {matchResult ? (
                  <TailoredCV user={user} matchResult={matchResult} />
                ) : (
                  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-12 border dark:border-gray-700 text-center flex flex-col items-center justify-center h-full">
                     <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                     <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">No CV Generated Yet</h3>
                     <p className="text-gray-500 mt-2">Paste a job description on the left and click "Generate Tailored CV" to see your match.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
