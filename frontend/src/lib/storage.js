/** Backend persistence for account-based resume storage */
import { uid } from './utils';

const RESUMES_KEY = 'nextoffer_resumes';
const OLD_KEY = 'resumeai_resumes';
const IMPORT_FLAG_PREFIX = 'nextoffer_resumes_imported_';

function readLocalResumes() {
  try {
    const current = JSON.parse(localStorage.getItem(RESUMES_KEY) || 'null');
    if (Array.isArray(current)) return current;

    const legacy = JSON.parse(localStorage.getItem(OLD_KEY) || 'null');
    return Array.isArray(legacy) ? legacy : [];
  } catch {
    return [];
  }
}

function clearLegacyLocalResumes() {
  try {
    localStorage.removeItem(RESUMES_KEY);
    localStorage.removeItem(OLD_KEY);
  } catch {
    // Ignore local cleanup errors
  }
}

async function api(path, options = {}) {
  const res = await fetch(`/api/resumes${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || 'Resume request failed');
  }

  return res.json();
}

// Like api() but returns null on 404 instead of throwing (used by getResumeById)
async function apiOrNull(path, options = {}) {
  const res = await fetch(`/api/resumes${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.error || 'Resume request failed');
  }

  return res.json();
}

export async function maybeImportLocalResumes(userId) {
  if (!userId) return;

  const importFlag = `${IMPORT_FLAG_PREFIX}${userId}`;
  try {
    if (localStorage.getItem(importFlag) === 'done') return;
  } catch {
    // Ignore local flag issues
  }

  const localResumes = readLocalResumes();
  if (!localResumes.length) {
    try {
      localStorage.setItem(importFlag, 'done');
    } catch {
      // Ignore local flag issues
    }
    return;
  }

  await api('/import', {
    method: 'POST',
    body: JSON.stringify({ resumes: localResumes }),
  });

  clearLegacyLocalResumes();
  try {
    localStorage.setItem(importFlag, 'done');
  } catch {
    // Ignore local flag issues
  }
}

export async function getResumes(userId) {
  await maybeImportLocalResumes(userId);
  const data = await api('/');
  return data.resumes || [];
}

export async function getResumeById(id, _userId) {
  // NOTE: We intentionally do NOT call maybeImportLocalResumes here.
  // Import only runs once from getResumes() (the Dashboard entry point).
  // Calling it here caused it to fire on every Builder load/re-render.
  const data = await apiOrNull(`/${id}`);
  return data?.resume || null;
}

export async function createResume(data) {
  const payload = {
    ...data,
    id: data.id || uid(),
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  const result = await api('/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.resume;
}

export async function updateResume(id, data) {
  const result = await api(`/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return result.resume;
}

export async function deleteResume(id) {
  await api(`/${id}`, { method: 'DELETE' });
  return true;
}
