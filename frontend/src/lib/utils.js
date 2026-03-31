/** Utility helpers */

export const ACCENT_COLORS = [
  { label: 'Purple',  value: '#7c3aed' },
  { label: 'Blue',    value: '#2563eb' },
  { label: 'Indigo',  value: '#4f46e5' },
  { label: 'Teal',    value: '#0d9488' },
  { label: 'Green',   value: '#16a34a' },
  { label: 'Red',     value: '#dc2626' },
  { label: 'Orange',  value: '#ea580c' },
  { label: 'Pink',    value: '#db2777' },
  { label: 'Gray',    value: '#475569' },
  { label: 'Black',   value: '#0f172a' },
];

export const TEMPLATES = [
  { id: 'classic',  label: 'Classic',  description: 'Traditional & clean' },
  { id: 'modern',   label: 'Modern',   description: 'Bold & contemporary' },
  { id: 'minimal',  label: 'Minimal',  description: 'Simple & elegant' },
  { id: 'creative', label: 'Creative', description: 'Stand out & impress' },
];

export const EMPTY_RESUME = {
  title: 'My Resume',
  template: 'classic',
  accentColor: '#7c3aed',
  isPublic: false,
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    jobTitle: '',
  },
  summary: '',
  experience: [],
  education: [],
  projects: [],
  skills: [],
};

export const EMPTY_EXPERIENCE = {
  id: '',
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
};

export const EMPTY_EDUCATION = {
  id: '',
  degree: '',
  institution: '',
  location: '',
  startDate: '',
  endDate: '',
  gpa: '',
  description: '',
};

export const EMPTY_PROJECT = {
  id: '',
  name: '',
  description: '',
  technologies: '',
  link: '',
  github: '',
};

/** Generate a simple unique ID */
export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

/** Format date string for display */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month, 10) - 1] || ''} ${year}`;
}

/** Clamp text to a max length */
export function clamp(text, max = 100) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
}
