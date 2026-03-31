import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export default router;
