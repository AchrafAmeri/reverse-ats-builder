import axios from 'axios';
import type { User, UserCreate, UserUpdate, Skill, SkillCreate, SkillUpdate, Experience, ExperienceCreate, ExperienceUpdate, Education, EducationCreate, EducationUpdate, Project, ProjectCreate, ProjectUpdate, MatchResponse, MatchRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  setToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  // Auth
  login: (data: FormData) => api.post<{ access_token: string, token_type: string }>('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
  register: (data: UserCreate) => api.post<User>('/auth/register', data),

  // Users
  getUsers: () => api.get<User[]>('/users'),
  getMe: () => api.get<User>('/users/me'),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  createUser: (data: UserCreate) => api.post<User>('/users', data),
  updateUser: (id: number, data: UserUpdate) => api.put<User>(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),

  // Skills
  getSkills: () => api.get<Skill[]>('/skills'),
  createSkill: (data: SkillCreate) => api.post<Skill>('/skills', data),
  updateSkill: (id: number, data: SkillUpdate) => api.put<Skill>(`/skills/${id}`, data),
  deleteSkill: (id: number) => api.delete(`/skills/${id}`),

  // Experiences
  getExperiences: () => api.get<Experience[]>('/experiences'),
  getExperience: (id: number) => api.get<Experience>(`/experiences/${id}`),
  createExperience: (data: ExperienceCreate) => api.post<Experience>('/experiences', data),
  updateExperience: (id: number, data: ExperienceUpdate) => api.put<Experience>(`/experiences/${id}`, data),
  deleteExperience: (id: number) => api.delete(`/experiences/${id}`),

  // Educations
  getEducations: () => api.get<Education[]>('/educations'),
  getEducation: (id: number) => api.get<Education>(`/educations/${id}`),
  createEducation: (data: EducationCreate) => api.post<Education>('/educations', data),
  updateEducation: (id: number, data: EducationUpdate) => api.put<Education>(`/educations/${id}`, data),
  deleteEducation: (id: number) => api.delete(`/educations/${id}`),

  // Projects
  getProjects: () => api.get<Project[]>('/projects'),
  getProject: (id: number) => api.get<Project>(`/projects/${id}`),
  createProject: (data: ProjectCreate) => api.post<Project>('/projects', data),
  updateProject: (id: number, data: ProjectUpdate) => api.put<Project>(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),

  // Match
  generateMatch: (userId: number, jobDescription: string) =>
    api.post<MatchResponse>('/match/', { user_id: userId, job_description: jobDescription } as MatchRequest),

  // Import
  uploadCV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Explicitly let browser handle Content-Type for multipart/form-data
    return api.post<{ message: string, experiences_added: number, skills_matched: number }>('/import/cv', formData, {
      headers: { 'Content-Type': undefined }
    });
  },
};
