import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseJsonFromText(text, fallback) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : fallback;
  } catch {
    return fallback;
  }
}

router.post('/enhance-summary', async (req, res) => {
  try {
    const { summary, jobTitle } = req.body;
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a professional resume writer. Rewrite the following professional summary to be more impactful, concise, and ATS-friendly. Keep it to 3-4 sentences. Job title: ${jobTitle || 'professional'}. Current summary: "${summary || 'No summary provided'}". Return ONLY the enhanced summary text, no quotes or explanations.`;
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    res.json({ result: text.trim() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/enhance-experience', async (req, res) => {
  try {
    const { description, jobTitle, company } = req.body;
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `You are a professional resume writer. Enhance the following job experience description into 4 strong bullet points using the STAR method (Situation, Task, Action, Result). Include quantifiable metrics where possible. Job: ${jobTitle} at ${company}. Current description: "${description || 'No description provided'}". Return ONLY the 4 bullet points starting with •, no explanations.`;
    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    res.json({ result: text.trim() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/suggest-skills', async (req, res) => {
  try {
    const { jobTitle, existingSkills } = req.body;
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Suggest 8 relevant skills for a ${jobTitle} resume. Existing skills: ${existingSkills?.join(', ') || 'none'}. Return ONLY a JSON array of skill strings, no explanation. Example: ["JavaScript", "React", "Node.js"]`;
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const match = text.match(/\[.*\]/s);
    res.json({ result: match ? JSON.parse(match[0]) : [] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/ats-score', async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const resumePayload = typeof resume?.resumeText === 'string' && resume.resumeText.trim()
      ? `Uploaded Resume Text:\n${resume.resumeText.trim()}`
      : `Resume JSON:\n${JSON.stringify(resume ?? {}, null, 2)}`;
    const prompt = `You are an ATS resume reviewer. Analyze the resume against the target job description and return ONLY valid JSON.

${resumePayload}

Job Description:
${jobDescription || 'Not provided'}

Return JSON with this exact shape:
{
  "score": 0,
  "summary": "string",
  "matchedKeywords": ["string"],
  "missingKeywords": ["string"],
  "strengths": ["string"],
  "improvements": ["string"],
  "sectionScores": {
    "contactInfo": 0,
    "summary": 0,
    "experience": 0,
    "skills": 0,
    "formatting": 0
  }
}

Rules:
- Scores must be integers from 0 to 100.
- Keep arrays concise, usually 3-6 items.
- Focus on ATS relevance, keyword alignment, structure, and clarity.
- Do not include markdown, comments, or code fences.`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    const parsed = parseJsonFromText(text, null);

    if (!parsed) {
      return res.status(502).json({ error: 'Could not parse ATS analysis response.' });
    }

    res.json({
      score: Number.isFinite(parsed.score) ? Math.max(0, Math.min(100, Math.round(parsed.score))) : 0,
      summary: parsed.summary || '',
      matchedKeywords: Array.isArray(parsed.matchedKeywords) ? parsed.matchedKeywords : [],
      missingKeywords: Array.isArray(parsed.missingKeywords) ? parsed.missingKeywords : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      sectionScores: {
        contactInfo: Number.isFinite(parsed.sectionScores?.contactInfo) ? parsed.sectionScores.contactInfo : 0,
        summary: Number.isFinite(parsed.sectionScores?.summary) ? parsed.sectionScores.summary : 0,
        experience: Number.isFinite(parsed.sectionScores?.experience) ? parsed.sectionScores.experience : 0,
        skills: Number.isFinite(parsed.sectionScores?.skills) ? parsed.sectionScores.skills : 0,
        formatting: Number.isFinite(parsed.sectionScores?.formatting) ? parsed.sectionScores.formatting : 0,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
