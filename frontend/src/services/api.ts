import axios from 'axios';
import type { User, UserCreate, UserUpdate, Skill, SkillCreate, SkillUpdate, Experience, ExperienceCreate, ExperienceUpdate, Project, ProjectCreate, ProjectUpdate } from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Users
  getUsers: () => api.get<User[]>('/users'),
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

  // Projects
  getProjects: () => api.get<Project[]>('/projects'),
  getProject: (id: number) => api.get<Project>(`/projects/${id}`),
  createProject: (data: ProjectCreate) => api.post<Project>('/projects', data),
  updateProject: (id: number, data: ProjectUpdate) => api.put<Project>(`/projects/${id}`, data),
  deleteProject: (id: number) => api.delete(`/projects/${id}`),
};
