import { useState, useEffect } from 'react';
import type { Skill } from './types';
import { apiService } from './services/api';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './pages/AuthScreen';
import { UserProfileForm } from './components/UserProfileForm';
import { SkillManager } from './components/SkillManager';
import { ExperienceList } from './components/ExperienceList';
import { ProjectList } from './components/ProjectList';
import { CVImporter } from './components/CVImporter';
import { CVBuilder } from './components/CVBuilder';

function Dashboard() {
  const [activeTab, setActiveTab] = useState<'profile' | 'matcher'>('profile');
  const { user, logout } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Local state to handle user updates from components
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const skillsResponse = await apiService.getSkills();
      setSkills(skillsResponse.data);

    } catch (err: any) {
      setError('Failed to load initial data. Make sure the backend is running.');
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
      if (localUser) {
         const response = await apiService.getUser(localUser.id);
         setLocalUser(response.data);
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

  if (error || !localUser) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 pb-12 w-full">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 mb-8 sticky top-0 z-10 w-full">
        <div className="w-full max-w-full px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
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

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              Logged in as <span className="font-semibold text-gray-700 dark:text-gray-200">{localUser.name}</span>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="w-full max-w-full px-8">
        {activeTab === 'profile' ? (
          <div className="flex flex-col">
            <CVImporter onImportSuccess={refreshUserOnly} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Profile & Skills */}
            <div className="lg:col-span-1 space-y-8">
              <UserProfileForm user={localUser} onUpdate={setLocalUser} />
              <SkillManager skills={skills} onSkillsChanged={fetchSkillsOnly} />
            </div>

              {/* Right Column: Experiences & Projects */}
              <div className="lg:col-span-2 space-y-8">
                <ExperienceList
                  userId={localUser.id}
                  experiences={localUser.experiences || []}
                  allSkills={skills}
                  onExperienceAdded={refreshUserOnly}
                  onExperienceDeleted={refreshUserOnly}
                />
                <ProjectList
                  userId={localUser.id}
                  projects={localUser.projects || []}
                  allSkills={skills}
                  onProjectAdded={refreshUserOnly}
                  onProjectDeleted={refreshUserOnly}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <CVBuilder
              user={localUser}
              skills={skills}
              onSkillsChanged={fetchSkillsOnly}
            />
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-xl font-semibold text-gray-600 dark:text-gray-300">Loading Application...</div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthScreen />;
}

export default App;
