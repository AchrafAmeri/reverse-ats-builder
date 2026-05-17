import { useState } from 'react';
import axios from 'axios';
import type { Project, ProjectCreate, ProjectUpdate, Skill } from '../types';
import { apiService } from '../services/api';
import { Code, Plus, X, ExternalLink, Edit2 } from 'lucide-react';

interface ProjectListProps {
  userId: number;
  projects: Project[];
  allSkills: Skill[];
  onProjectAdded: () => void;
  onProjectDeleted: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ userId, projects, allSkills, onProjectAdded, onProjectDeleted }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProj, setEditingProj] = useState<Project | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await apiService.deleteProject(id);
      onProjectDeleted();
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
            <Code className="text-orange-600 dark:text-orange-300 w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Projects</h2>
        </div>
        <button
          onClick={() => {
            if (isAdding || editingProj) {
              setIsAdding(false);
              setEditingProj(null);
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-1 text-sm bg-orange-50 text-orange-600 dark:bg-orange-900 dark:text-orange-300 px-3 py-1.5 rounded-md hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors"
        >
          {(isAdding || editingProj) ? <X size={16} /> : <Plus size={16} />}
          {(isAdding || editingProj) ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {(isAdding || editingProj) && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
          <ProjectForm
            userId={userId}
            allSkills={allSkills}
            existingProject={editingProj}
            onSuccess={() => {
              setIsAdding(false);
              setEditingProj(null);
              onProjectAdded();
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.length === 0 ? (
          <p className="text-gray-500 col-span-2 text-center py-4">No projects added yet.</p>
        ) : (
          projects.map((proj) => (
            <div key={proj.id} className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{proj.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingProj(proj);
                      setIsAdding(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {proj.url && (
                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2">
                  <ExternalLink size={14} /> {proj.url}
                </a>
              )}

              {proj.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {proj.description}
                </p>
              )}

              {proj.skills && proj.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {proj.skills.map(skill => (
                    <span key={skill.id} className="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-md border border-orange-200 dark:border-orange-800">
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

interface ProjectFormProps {
  userId: number;
  allSkills: Skill[];
  existingProject?: Project | null;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ userId, allSkills, existingProject, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: existingProject?.name || '',
    description: existingProject?.description || '',
    url: existingProject?.url || '',
  });
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>(
    existingProject?.skills.map(s => s.id) || []
  );
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
      if (existingProject) {
        const payload: ProjectUpdate = {
          name: formData.name,
          description: formData.description || undefined,
          url: formData.url || undefined,
          skill_ids: selectedSkillIds,
        };
        await apiService.updateProject(existingProject.id, payload);
      } else {
        const payload: ProjectCreate = {
          user_id: userId,
          name: formData.name,
          description: formData.description || undefined,
          url: formData.url || undefined,
          skill_ids: selectedSkillIds,
        };
        await apiService.createProject(payload);
      }
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || `Failed to ${existingProject ? 'update' : 'add'} project`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to ${existingProject ? 'update' : 'add'} project`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Project Name *</label>
          <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">URL (Optional)</label>
          <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://" className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"></textarea>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Technologies / Skills Used</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md dark:border-gray-600 dark:bg-gray-800">
          {allSkills.map(skill => (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedSkillIds.includes(skill.id)
                  ? 'bg-orange-600 text-white border-orange-600'
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
        <button type="submit" disabled={isLoading} className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : (existingProject ? 'Update Project' : 'Save Project')}
        </button>
      </div>
    </form>
  );
};
