import express from 'express';
import Resume from '../models/Resume.js';
import { uid } from '../utils.js';

const router = express.Router();

// ── Auth middleware ───────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  if (!req.isAuthenticated?.() || !req.user?.uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ── GET /api/resumes  ─────────────────────────────────────────────────────────
// Returns all resumes for the logged-in user, newest first.

router.get('/', requireAuth, async (req, res) => {
  try {
    const resumes = await Resume
      .find({ userId: req.user.uid })
      .sort({ updatedAt: -1 })
      .lean();

    // lean() returns plain objects; strip Mongoose's _id before sending
    res.json({ resumes: resumes.map(stripId) });
  } catch (error) {
    console.error('GET /api/resumes', error);
    res.status(500).json({ error: 'Failed to load resumes.' });
  }
});

// ── GET /api/resumes/:id ──────────────────────────────────────────────────────

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const resume = await Resume
      .findOne({ id: req.params.id, userId: req.user.uid })
      .lean();

    if (!resume) return res.status(404).json({ error: 'Resume not found.' });
    res.json({ resume: stripId(resume) });
  } catch (error) {
    console.error('GET /api/resumes/:id', error);
    res.status(500).json({ error: 'Failed to load resume.' });
  }
});

// ── POST /api/resumes ─────────────────────────────────────────────────────────
// Creates a new resume.

router.post('/', requireAuth, async (req, res) => {
  try {
    const now = Date.now();
    const resume = await Resume.create({
      ...req.body,
      id:        req.body.id || uid(),
      userId:    req.user.uid,
      createdAt: req.body.createdAt || now,
      updatedAt: now,
    });
    res.status(201).json({ resume: resume.toJSON() });
  } catch (error) {
    console.error('POST /api/resumes', error);
    // Duplicate key — resume with this id already exists, do an update instead
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A resume with this ID already exists.' });
    }
    res.status(500).json({ error: 'Failed to create resume.' });
  }
});

// ── PUT /api/resumes/:id ──────────────────────────────────────────────────────
// Full replace of an existing resume's fields.

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updated = await Resume.findOneAndUpdate(
      { id: req.params.id, userId: req.user.uid },
      {
        ...req.body,
        // Never allow these to be overwritten by client
        id:        req.params.id,
        userId:    req.user.uid,
        updatedAt: Date.now(),
      },
      {
        new:    true,   // return the updated document
        lean:   true,   // return plain object
        runValidators: true,
      }
    );

    if (!updated) return res.status(404).json({ error: 'Resume not found.' });
    res.json({ resume: stripId(updated) });
  } catch (error) {
    console.error('PUT /api/resumes/:id', error);
    res.status(500).json({ error: 'Failed to update resume.' });
  }
});

// ── DELETE /api/resumes/:id ───────────────────────────────────────────────────

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await Resume.deleteOne({ id: req.params.id, userId: req.user.uid });
    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/resumes/:id', error);
    res.status(500).json({ error: 'Failed to delete resume.' });
  }
});

// ── POST /api/resumes/import ──────────────────────────────────────────────────
// One-time migration: import resumes that were previously stored in localStorage.

router.post('/import', requireAuth, async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.resumes) ? req.body.resumes : [];
    if (!incoming.length) return res.json({ imported: 0, resumes: [] });

    // Find which IDs already exist in the DB so we skip duplicates
    const existingIds = new Set(
      (await Resume.find({ userId: req.user.uid }).select('id').lean()).map(r => r.id)
    );

    const toInsert = incoming
      .filter(r => r.id && !existingIds.has(r.id))
      .map(r => ({ ...r, userId: req.user.uid, updatedAt: Date.now() }));

    if (toInsert.length) {
      await Resume.insertMany(toInsert, { ordered: false }); // continue on duplicate errors
    }

    const allResumes = await Resume
      .find({ userId: req.user.uid })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ imported: toInsert.length, resumes: allResumes.map(stripId) });
  } catch (error) {
    console.error('POST /api/resumes/import', error);
    res.status(500).json({ error: 'Failed to import local resumes.' });
  }
});

// ── Helper ────────────────────────────────────────────────────────────────────

function stripId(obj) {
  // eslint-disable-next-line no-unused-vars
  const { _id, __v, ...rest } = obj;
  return rest;
}

export default router;
