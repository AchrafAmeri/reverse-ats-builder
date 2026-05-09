import { useState } from 'react';
import type { Experience, ExperienceCreate, Skill } from '../types';
import { apiService } from '../services/api';
import { Briefcase, Plus, X, Calendar } from 'lucide-react';

interface ExperienceListProps {
  userId: number;
  experiences: Experience[];
  allSkills: Skill[];
  onExperienceAdded: () => void;
  onExperienceDeleted: () => void;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({ userId, experiences, allSkills, onExperienceAdded, onExperienceDeleted }) => {
  const [isAdding, setIsAdding] = useState(false);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await apiService.deleteExperience(id);
      onExperienceDeleted();
    } catch (err) {
      console.error('Failed to delete experience', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Briefcase className="text-green-600 dark:text-green-300 w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Experience</h2>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1 text-sm bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300 px-3 py-1.5 rounded-md hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? 'Cancel' : 'Add Experience'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
          <ExperienceForm
            userId={userId}
            allSkills={allSkills}
            onSuccess={() => {
              setIsAdding(false);
              onExperienceAdded();
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        {experiences.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No experiences added yet.</p>
        ) : (
          experiences.map((exp) => (
            <div key={exp.id} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{exp.title}</h3>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{exp.company}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar size={14} />
                    {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(exp.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>

              {exp.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                  {exp.description}
                </p>
              )}

              {exp.skills && exp.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {exp.skills.map(skill => (
                    <span key={skill.id} className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-md border border-green-200 dark:border-green-800">
                      {skill.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface ExperienceFormProps {
  userId: number;
  allSkills: Skill[];
  onSuccess: () => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ userId, allSkills, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: '',
  });
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const payload: ExperienceCreate = {
        user_id: userId,
        title: formData.title,
        company: formData.company,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        description: formData.description || undefined,
        skill_ids: selectedSkillIds,
      };
      await apiService.createExperience(payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to add experience');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Job Title *</label>
          <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company *</label>
          <input required type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <input required type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Related Skills</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md dark:border-gray-600 dark:bg-gray-800">
          {allSkills.map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedSkillIds.includes(skill.id)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {skill.name}
            </button>
          ))}
          {allSkills.length === 0 && <span className="text-sm text-gray-500">No skills available. Add some in the Skill Manager.</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : 'Save Experience'}
        </button>
      </div>
    </form>
  );
};
