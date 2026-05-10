// Skill Types
export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface SkillCreate {
  name: string;
  category?: string;
}

export interface SkillUpdate {
  name?: string;
  category?: string;
}

// Experience Types
export interface Experience {
  id: number;
  user_id: number;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description?: string;
  skills: Skill[];
}

export interface ExperienceCreate {
  user_id: number;
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  description?: string;
  skill_ids?: number[];
}

export interface ExperienceUpdate {
  title?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  skill_ids?: number[];
}

// Education Types
export interface Education {
  id: number;
  user_id: number;
  degree: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface EducationCreate {
  user_id: number;
  degree: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface EducationUpdate {
  degree?: string;
  institution?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// Project Types
export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  url?: string;
  skills: Skill[];
}

export interface ProjectCreate {
  user_id: number;
  name: string;
  description?: string;
  url?: string;
  skill_ids?: number[];
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  url?: string;
  skill_ids?: number[];
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
}

export interface UserCreate {
  name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

// Match Types
export interface MatchRequest {
  user_id: number;
  job_description: string;
}

export interface ScoredExperience extends Experience {
  score: number;
}

export interface ScoredProject extends Project {
  score: number;
}

export interface MatchResponse {
  matched_skills: string[];
  top_experiences: ScoredExperience[];
  top_projects: ScoredProject[];
  educations: Education[];
}
