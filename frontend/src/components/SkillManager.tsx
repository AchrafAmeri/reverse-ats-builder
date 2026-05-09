import { useState } from 'react';
import type { Skill, SkillCreate } from '../types';
import { apiService } from '../services/api';
import { Tags, Plus, X } from 'lucide-react';

interface SkillManagerProps {
  skills: Skill[];
  onSkillsChanged: () => void;
}

export const SkillManager: React.FC<SkillManagerProps> = ({ skills, onSkillsChanged }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const skillData: SkillCreate = {
        name: newSkillName.trim(),
        category: newSkillCategory.trim() || undefined,
      };
      await apiService.createSkill(skillData);
      onSkillsChanged();
      setNewSkillName('');
      setNewSkillCategory('');
    } catch (err: any) {
      setError(err.message || 'Failed to add skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    try {
      await apiService.deleteSkill(id);
      onSkillsChanged();
    } catch (err) {
      console.error('Failed to delete skill', err);
      setError('Failed to delete skill. It might be in use.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4 dark:border-gray-700">
        <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full">
          <Tags className="text-purple-600 dark:text-purple-300 w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Global Skills Manager</h2>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
        <input
          type="text"
          placeholder="Skill Name (e.g., React)"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
        />
        <input
          type="text"
          placeholder="Category (optional)"
          value={newSkillCategory}
          onChange={(e) => setNewSkillCategory(e.target.value)}
          className="flex-1 min-w-0 px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          disabled={isLoading || !newSkillName.trim()}
          className="flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 sm:w-auto w-full"
        >
          <Plus size={18} />
          Add
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
          >
            {skill.name} {skill.category && <span className="text-xs text-gray-500 dark:text-gray-400">({skill.category})</span>}
            <button
              onClick={() => handleDeleteSkill(skill.id)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-gray-500 text-sm italic">No skills added yet.</p>
        )}
      </div>
    </div>
  );
};
