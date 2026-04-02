// Google Gemini AI Helper
// Get your free API key at: https://aistudio.google.com/app/apikey

export const DEMO_MODE = false; // Set to true for demo fallback only

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

/** Evaluate ATS score against a target job description */
export async function analyzeAtsScore(resumeInput, jobDescription) {
  if (DEMO_MODE) {
    await sleep(1500);
    const resume = resumeInput?.resumeText ? null : resumeInput;
    const normalizedSkills = resume?.skills || [];
    const textLengthScore = resumeInput?.resumeText ? Math.min(22, Math.round(resumeInput.resumeText.length / 180)) : 0;
    const score = Math.min(
      94,
      45 +
        normalizedSkills.length * 3 +
        (resume?.experience?.filter((item) => item.description?.trim()).length || 0) * 6 +
        (resume?.summary?.trim() ? 10 : 0) +
        textLengthScore
    );

    return {
      score,
      summary:
        'Your resume already has a solid structure for ATS parsing. The biggest opportunity is aligning more of your phrasing and keywords to the exact job description.',
      matchedKeywords: normalizedSkills.slice(0, 8),
      missingKeywords: ['Leadership', 'Stakeholder Management', 'CI/CD', 'System Design']
        .filter((skill) => !normalizedSkills.includes(skill))
        .slice(0, 6),
      strengths: [
        'Clear section structure supports ATS readability.',
        'Skills and experience sections contain role-relevant terminology.',
        'The resume includes multiple technical keywords that improve discoverability.'
      ],
      improvements: [
        'Mirror more exact keywords from the target job description in the summary.',
        'Add measurable outcomes to more experience bullets.',
        'Include any missing tools, domain terms, or responsibilities from the posting when they are accurate.'
      ],
      sectionScores: {
        contactInfo: resumeInput?.resumeText ? 80 : resume?.personalInfo?.email && resume?.personalInfo?.fullName ? 92 : 70,
        summary: resumeInput?.resumeText ? 76 : resume?.summary?.trim() ? 84 : 58,
        experience: resumeInput?.resumeText ? 78 : resume?.experience?.length ? 80 : 52,
        skills: resumeInput?.resumeText ? 74 : normalizedSkills.length >= 6 ? 88 : 61,
        formatting: 90
      }
    };
  }

  const res = await fetch('/api/ai/ats-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: resumeInput, jobDescription })
  });
  if (!res.ok) throw new Error('AI backend error');
  return res.json();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
