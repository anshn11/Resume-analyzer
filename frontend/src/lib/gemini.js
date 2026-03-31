// Google Gemini AI Helper
// Get your free API key at: https://aistudio.google.com/app/apikey

const DEMO_MODE = false; // Set to true for demo fallback only

/** Enhance professional summary using AI */
export async function enhanceSummary(currentSummary, jobTitle) {
  if (DEMO_MODE) {
    await sleep(1500);
    return `Results-driven ${jobTitle || 'professional'} with a proven track record of delivering high-impact solutions. Adept at leveraging cutting-edge technologies to solve complex problems and drive business growth. Passionate about innovation and committed to continuous learning, with strong collaboration skills and a data-driven approach to decision-making. Seeking to bring expertise and creative problem-solving to a forward-thinking organization.`;
  }
  const res = await fetch('/api/ai/enhance-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: currentSummary, jobTitle })
  });
  if (!res.ok) throw new Error('AI backend error');
  const data = await res.json();
  return data.result;
}

/** Enhance job experience bullet points */
export async function enhanceExperience(description, jobTitle, company) {
  if (DEMO_MODE) {
    await sleep(1500);
    return `• Led cross-functional teams to deliver ${company || 'company'} projects 30% ahead of schedule, resulting in $500K cost savings\n• Architected and implemented scalable microservices solutions, improving system performance by 45%\n• Collaborated with stakeholders to define product roadmap and secured executive buy-in for 3 major initiatives\n• Mentored 5 junior engineers, fostering a culture of technical excellence and continuous improvement`;
  }
  const res = await fetch('/api/ai/enhance-experience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, jobTitle, company })
  });
  if (!res.ok) throw new Error('AI backend error');
  const data = await res.json();
  return data.result;
}

/** Suggest skills based on job title */
export async function suggestSkills(jobTitle, existingSkills) {
  if (DEMO_MODE) {
    await sleep(1200);
    const skillSets = {
      default: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'REST APIs', 'Agile', 'Problem Solving', 'Communication', 'TypeScript'],
      developer: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'Docker', 'AWS', 'TypeScript', 'GraphQL'],
      designer: ['Figma', 'Adobe XD', 'UI/UX Design', 'Prototyping', 'User Research', 'CSS', 'Sketch', 'Design Systems', 'Accessibility', 'Wireframing'],
      manager: ['Project Management', 'Agile', 'Scrum', 'Stakeholder Management', 'Risk Management', 'Budgeting', 'Leadership', 'Communication', 'JIRA', 'Confluence'],
    };
    const key = jobTitle?.toLowerCase().includes('design') ? 'designer'
              : jobTitle?.toLowerCase().includes('manager') ? 'manager'
              : jobTitle?.toLowerCase().includes('developer') || jobTitle?.toLowerCase().includes('engineer') ? 'developer'
              : 'default';
    return skillSets[key].filter(s => !existingSkills?.includes(s)).slice(0, 8);
  }
  const res = await fetch('/api/ai/suggest-skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobTitle, existingSkills })
  });
  if (!res.ok) throw new Error('AI backend error');
  const data = await res.json();
  return data.result;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { DEMO_MODE };
