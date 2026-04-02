import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const PersonalInfoSchema = new Schema({
  fullName: { type: String, default: '' },
  email:    { type: String, default: '' },
  phone:    { type: String, default: '' },
  location: { type: String, default: '' },
  website:  { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github:   { type: String, default: '' },
  jobTitle: { type: String, default: '' },
}, { _id: false });

const ExperienceSchema = new Schema({
  id:          { type: String, default: '' },
  jobTitle:    { type: String, default: '' },
  company:     { type: String, default: '' },
  location:    { type: String, default: '' },
  startDate:   { type: String, default: '' },
  endDate:     { type: String, default: '' },
  current:     { type: Boolean, default: false },
  description: { type: String, default: '' },
}, { _id: false });

const EducationSchema = new Schema({
  id:          { type: String, default: '' },
  degree:      { type: String, default: '' },
  institution: { type: String, default: '' },
  location:    { type: String, default: '' },
  startDate:   { type: String, default: '' },
  endDate:     { type: String, default: '' },
  gpa:         { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const ProjectSchema = new Schema({
  id:           { type: String, default: '' },
  name:         { type: String, default: '' },
  description:  { type: String, default: '' },
  technologies: { type: String, default: '' },
  link:         { type: String, default: '' },
  github:       { type: String, default: '' },
}, { _id: false });

// ── Main Resume schema ────────────────────────────────────────────────────────

const ResumeSchema = new Schema(
  {
    // Client-generated ID — used by the frontend as the URL param (/builder/:id)
    id:          { type: String, required: true, unique: true, index: true },
    // Google OAuth user ID from Passport
    userId:      { type: String, required: true, index: true },

    title:       { type: String, default: 'My Resume' },
    sourceType:  { type: String, enum: ['builder', 'uploaded'], default: 'builder' },
    template:    { type: String, default: 'classic' },
    accentColor: { type: String, default: '#7c3aed' },
    isPublic:    { type: Boolean, default: false },

    // ATS optimizer
    atsTarget:   { type: String, default: '' },
    atsAnalysis: { type: Schema.Types.Mixed, default: null },

    // Uploaded resume raw text
    rawText:     { type: String, default: '' },

    // Sections
    personalInfo: { type: PersonalInfoSchema, default: () => ({}) },
    summary:      { type: String, default: '' },
    experience:   { type: [ExperienceSchema], default: [] },
    education:    { type: [EducationSchema],  default: [] },
    projects:     { type: [ProjectSchema],    default: [] },
    skills:       { type: [String],           default: [] },

    // Unix timestamps (ms) — kept as numbers to match existing frontend contract
    createdAt: { type: Number, default: () => Date.now() },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  {
    // Disable Mongoose's own createdAt/updatedAt (we manage them manually)
    timestamps: false,
    // Strip __v from all JSON output
    versionKey: false,
  }
);

// Serialise to a plain object without Mongoose internals (_id etc.)
ResumeSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret._id;
    return ret;
  },
});

export default model('Resume', ResumeSchema);
