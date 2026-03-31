/** LocalStorage persistence — resume data CRUD */
import { uid } from './utils';

const RESUMES_KEY = 'resumeai_resumes';

// ── Resume CRUD ─────────────────────────────────────────
export function getResumes() {
  try { return JSON.parse(localStorage.getItem(RESUMES_KEY)) || []; }
  catch { return []; }
}

export function saveResumes(resumes) {
  localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
}

export function getResumeById(id) {
  return getResumes().find(r => r.id === id) || null;
}

export function createResume(data) {
  const resumes = getResumes();
  const newResume = { ...data, id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
  resumes.unshift(newResume);
  saveResumes(resumes);
  return newResume;
}

export function updateResume(id, data) {
  const resumes = getResumes();
  const idx = resumes.findIndex(r => r.id === id);
  if (idx < 0) return false;
  resumes[idx] = { ...resumes[idx], ...data, updatedAt: Date.now() };
  saveResumes(resumes);
  return resumes[idx];
}

export function deleteResume(id) {
  saveResumes(getResumes().filter(r => r.id !== id));
}
