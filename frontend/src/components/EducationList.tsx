import { useState } from 'react';
import axios from 'axios';
import type { Education, EducationCreate, EducationUpdate } from '../types';
import { apiService } from '../services/api';
import { GraduationCap, Plus, X, Calendar, Edit2 } from 'lucide-react';

interface EducationListProps {
  userId: number;
  educations: Education[];
  onEducationAdded: () => void;
  onEducationDeleted: () => void;
}

export const EducationList: React.FC<EducationListProps> = ({ userId, educations, onEducationAdded, onEducationDeleted }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this education?')) return;
    try {
      await apiService.deleteEducation(id);
      onEducationDeleted();
    } catch (err) {
      console.error('Failed to delete education', err);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6 border-b pb-4 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
            <GraduationCap className="text-indigo-600 dark:text-indigo-300 w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Education</h2>
        </div>
        <button
          onClick={() => {
            if (isAdding || editingEdu) {
              setIsAdding(false);
              setEditingEdu(null);
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300 px-3 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors"
        >
          {(isAdding || editingEdu) ? <X size={16} /> : <Plus size={16} />}
          {(isAdding || editingEdu) ? 'Cancel' : 'Add Education'}
        </button>
      </div>

      {(isAdding || editingEdu) && (
        <div className="mb-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border dark:border-gray-600">
          <EducationForm
            userId={userId}
            existingEducation={editingEdu}
            onSuccess={() => {
              setIsAdding(false);
              setEditingEdu(null);
              onEducationAdded();
            }}
          />
        </div>
      )}

      <div className="space-y-6">
        {educations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No education added yet.</p>
        ) : (
          educations.map((edu) => (
            <div key={edu.id} className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700">
              <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white dark:border-gray-800"></div>

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{edu.degree}</h3>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{edu.institution}</div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <Calendar size={14} />
                    {edu.start_date} - {edu.end_date ? edu.end_date : 'Present'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingEdu(edu);
                      setIsAdding(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {edu.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                  {edu.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface EducationFormProps {
  userId: number;
  existingEducation?: Education | null;
  onSuccess: () => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ userId, existingEducation, onSuccess }) => {
  const [formData, setFormData] = useState({
    degree: existingEducation?.degree || '',
    institution: existingEducation?.institution || '',
    start_date: existingEducation?.start_date || '',
    end_date: existingEducation?.end_date || '',
    description: existingEducation?.description || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (existingEducation) {
        const payload: EducationUpdate = {
          degree: formData.degree,
          institution: formData.institution,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          description: formData.description || undefined,
        };
        await apiService.updateEducation(existingEducation.id, payload);
      } else {
        const payload: EducationCreate = {
          user_id: userId,
          degree: formData.degree,
          institution: formData.institution,
          start_date: formData.start_date,
          end_date: formData.end_date || undefined,
          description: formData.description || undefined,
        };
        await apiService.createEducation(payload);
      }
      onSuccess();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || err.message || `Failed to ${existingEducation ? 'update' : 'add'} education`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(`Failed to ${existingEducation ? 'update' : 'add'} education`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Degree / Diploma *</label>
          <input required type="text" name="degree" value={formData.degree} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Institution *</label>
          <input required type="text" name="institution" value={formData.institution} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <input required type="text" placeholder="e.g. 2018 or Jan 2018" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input type="text" placeholder="e.g. 2022 or Present" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"></textarea>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : (existingEducation ? 'Update Education' : 'Save Education')}
        </button>
      </div>
    </form>
  );
};
