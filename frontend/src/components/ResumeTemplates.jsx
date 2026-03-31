import { formatDate } from '../lib/utils';
import './ResumePreview.css';

// Classic Template
export function ClassicTemplate({ resume }) {
  const { personalInfo: p = {}, summary, experience = [], education = [], projects = [], skills = [], accentColor = '#7c3aed' } = resume;
  const accent = accentColor;

  return (
    <div className="resume classic-template" id="resume-preview-content" style={{ '--accent': accent }}>
      {/* Header */}
      <div className="classic-header">
        <h1 className="classic-name">{p.fullName || 'Your Name'}</h1>
        {p.jobTitle && <p className="classic-job-title">{p.jobTitle}</p>}
        <div className="classic-contact">
          {p.email    && <span>{p.email}</span>}
          {p.phone    && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
          {p.github   && <span>{p.github}</span>}
          {p.website  && <span>{p.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Professional Summary" accent={accent}>
          <p className="resume-text">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Section title="Work Experience" accent={accent}>
          {experience.map((e, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{e.jobTitle}</div>
                  <div className="entry-sub">{e.company}{e.location ? ` · ${e.location}` : ''}</div>
                </div>
                <div className="entry-date">
                  {formatDate(e.startDate)} – {e.current ? 'Present' : formatDate(e.endDate)}
                </div>
              </div>
              {e.description && <div className="resume-text entry-desc">{e.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Section title="Education" accent={accent}>
          {education.map((e, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{e.degree}</div>
                  <div className="entry-sub">{e.institution}{e.location ? ` · ${e.location}` : ''}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
                </div>
                <div className="entry-date">
                  {formatDate(e.startDate)} – {formatDate(e.endDate)}
                </div>
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <Section title="Projects" accent={accent}>
          {projects.map((pr, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-header">
                <div className="entry-title">{pr.name}</div>
                <div style={{display:'flex',gap:8}}>
                  {pr.link   && <span className="entry-link">🔗 Live</span>}
                  {pr.github && <span className="entry-link">⌥ GitHub</span>}
                </div>
              </div>
              {pr.technologies && <div className="entry-tech">{pr.technologies}</div>}
              {pr.description && <div className="resume-text entry-desc">{pr.description}</div>}
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div className="skills-list">
            {skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
          </div>
        </Section>
      )}
    </div>
  );
}

// Modern Template
export function ModernTemplate({ resume }) {
  const { personalInfo: p = {}, summary, experience = [], education = [], projects = [], skills = [], accentColor = '#7c3aed' } = resume;

  return (
    <div className="resume modern-template" id="resume-preview-content" style={{ '--accent': accentColor }}>
      <div className="modern-sidebar">
        <div className="modern-name-block">
          <div className="modern-avatar">{(p.fullName || 'U')[0]}</div>
          <h1 className="modern-name">{p.fullName || 'Your Name'}</h1>
          {p.jobTitle && <p className="modern-job-title">{p.jobTitle}</p>}
        </div>
        <div className="modern-contact-section">
          <div className="modern-section-label">Contact</div>
          {p.email    && <div className="modern-contact-item">{p.email}</div>}
          {p.phone    && <div className="modern-contact-item">{p.phone}</div>}
          {p.location && <div className="modern-contact-item">{p.location}</div>}
          {p.linkedin && <div className="modern-contact-item">{p.linkedin}</div>}
          {p.github   && <div className="modern-contact-item">{p.github}</div>}
        </div>
        {skills.length > 0 && (
          <div className="modern-contact-section">
            <div className="modern-section-label">Skills</div>
            <div className="modern-skills">
              {skills.map((s, i) => <span key={i} className="modern-skill-tag">{s}</span>)}
            </div>
          </div>
        )}
      </div>
      <div className="modern-main">
        {summary && (
          <ModernSection title="Profile">
            <p className="resume-text">{summary}</p>
          </ModernSection>
        )}
        {experience.length > 0 && (
          <ModernSection title="Experience">
            {experience.map((e, i) => (
              <div key={i} className="resume-entry">
                <div className="entry-header">
                  <div>
                    <div className="entry-title">{e.jobTitle}</div>
                    <div className="entry-sub">{e.company}{e.location ? ` · ${e.location}` : ''}</div>
                  </div>
                  <div className="entry-date">{formatDate(e.startDate)} – {e.current ? 'Present' : formatDate(e.endDate)}</div>
                </div>
                {e.description && <div className="resume-text entry-desc">{e.description}</div>}
              </div>
            ))}
          </ModernSection>
        )}
        {education.length > 0 && (
          <ModernSection title="Education">
            {education.map((e, i) => (
              <div key={i} className="resume-entry">
                <div className="entry-header">
                  <div>
                    <div className="entry-title">{e.degree}</div>
                    <div className="entry-sub">{e.institution}{e.gpa ? ` · GPA: ${e.gpa}` : ''}</div>
                  </div>
                  <div className="entry-date">{formatDate(e.startDate)} – {formatDate(e.endDate)}</div>
                </div>
              </div>
            ))}
          </ModernSection>
        )}
        {projects.length > 0 && (
          <ModernSection title="Projects">
            {projects.map((pr, i) => (
              <div key={i} className="resume-entry">
                <div className="entry-title">{pr.name}</div>
                {pr.technologies && <div className="entry-tech">{pr.technologies}</div>}
                {pr.description && <div className="resume-text entry-desc">{pr.description}</div>}
              </div>
            ))}
          </ModernSection>
        )}
      </div>
    </div>
  );
}

// Minimal Template
export function MinimalTemplate({ resume }) {
  const { personalInfo: p = {}, summary, experience = [], education = [], projects = [], skills = [], accentColor = '#7c3aed' } = resume;

  return (
    <div className="resume minimal-template" id="resume-preview-content" style={{ '--accent': accentColor }}>
      <div className="minimal-header">
        <div className="minimal-header-left">
          <h1 className="minimal-name">{p.fullName || 'Your Name'}</h1>
          {p.jobTitle && <p className="minimal-job-title">{p.jobTitle}</p>}
        </div>
        <div className="minimal-header-right">
          {p.email    && <span>{p.email}</span>}
          {p.phone    && <span>{p.phone}</span>}
          {p.location && <span>{p.location}</span>}
          {p.github   && <span>{p.github}</span>}
          {p.linkedin && <span>{p.linkedin}</span>}
        </div>
      </div>
      <div className="minimal-accent-line" />

      {summary && (
        <MinimalSection title="Summary">
          <p className="resume-text">{summary}</p>
        </MinimalSection>
      )}
      {experience.length > 0 && (
        <MinimalSection title="Experience">
          {experience.map((e, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{e.jobTitle} <span className="entry-at">@ {e.company}</span></div>
                  {e.location && <div className="entry-sub">{e.location}</div>}
                </div>
                <div className="entry-date">{formatDate(e.startDate)} – {e.current ? 'Present' : formatDate(e.endDate)}</div>
              </div>
              {e.description && <div className="resume-text entry-desc">{e.description}</div>}
            </div>
          ))}
        </MinimalSection>
      )}
      {education.length > 0 && (
        <MinimalSection title="Education">
          {education.map((e, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-header">
                <div>
                  <div className="entry-title">{e.degree}</div>
                  <div className="entry-sub">{e.institution}{e.gpa ? ` · ${e.gpa}` : ''}</div>
                </div>
                <div className="entry-date">{formatDate(e.startDate)} – {formatDate(e.endDate)}</div>
              </div>
            </div>
          ))}
        </MinimalSection>
      )}
      {skills.length > 0 && (
        <MinimalSection title="Skills">
          <div className="skills-list">{skills.map((s,i) => <span key={i} className="skill-tag">{s}</span>)}</div>
        </MinimalSection>
      )}
      {projects.length > 0 && (
        <MinimalSection title="Projects">
          {projects.map((pr, i) => (
            <div key={i} className="resume-entry">
              <div className="entry-title">{pr.name}{pr.technologies ? <span className="entry-tech-inline"> — {pr.technologies}</span> : ''}</div>
              {pr.description && <div className="resume-text entry-desc">{pr.description}</div>}
            </div>
          ))}
        </MinimalSection>
      )}
    </div>
  );
}

// Creative Template
export function CreativeTemplate({ resume }) {
  const { personalInfo: p = {}, summary, experience = [], education = [], projects = [], skills = [], accentColor = '#7c3aed' } = resume;

  return (
    <div className="resume creative-template" id="resume-preview-content" style={{ '--accent': accentColor }}>
      <div className="creative-header">
        <div>
          <h1 className="creative-name">{p.fullName || 'Your Name'}</h1>
          {p.jobTitle && <p className="creative-job-title">{p.jobTitle}</p>}
        </div>
        <div className="creative-contact">
          {p.email    && <span>✉ {p.email}</span>}
          {p.phone    && <span>✆ {p.phone}</span>}
          {p.location && <span>⊙ {p.location}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
          {p.github   && <span>⌥ {p.github}</span>}
        </div>
      </div>
      <div className="creative-body">
        <div className="creative-main">
          {summary && (
            <CreativeSection title="About Me">
              <p className="resume-text">{summary}</p>
            </CreativeSection>
          )}
          {experience.length > 0 && (
            <CreativeSection title="Experience">
              {experience.map((e, i) => (
                <div key={i} className="resume-entry creative-entry">
                  <div className="creative-entry-dot" />
                  <div className="creative-entry-content">
                    <div className="entry-header">
                      <div>
                        <div className="entry-title">{e.jobTitle}</div>
                        <div className="entry-sub">{e.company}{e.location ? ` · ${e.location}` : ''}</div>
                      </div>
                      <div className="entry-date">{formatDate(e.startDate)} – {e.current ? 'Present' : formatDate(e.endDate)}</div>
                    </div>
                    {e.description && <div className="resume-text entry-desc">{e.description}</div>}
                  </div>
                </div>
              ))}
            </CreativeSection>
          )}
          {projects.length > 0 && (
            <CreativeSection title="Projects">
              {projects.map((pr, i) => (
                <div key={i} className="resume-entry">
                  <div className="entry-title">{pr.name}</div>
                  {pr.technologies && <div className="entry-tech">{pr.technologies}</div>}
                  {pr.description && <div className="resume-text entry-desc">{pr.description}</div>}
                </div>
              ))}
            </CreativeSection>
          )}
        </div>
        <div className="creative-sidebar">
          {education.length > 0 && (
            <CreativeSideSection title="Education">
              {education.map((e, i) => (
                <div key={i} style={{marginBottom:10}}>
                  <div className="creative-sidebar-item-title">{e.degree}</div>
                  <div className="creative-sidebar-item-sub">{e.institution}</div>
                  <div className="creative-sidebar-item-date">{formatDate(e.startDate)} – {formatDate(e.endDate)}</div>
                </div>
              ))}
            </CreativeSideSection>
          )}
          {skills.length > 0 && (
            <CreativeSideSection title="Skills">
              <div className="creative-skills">
                {skills.map((s,i) => <span key={i} className="creative-skill">{s}</span>)}
              </div>
            </CreativeSideSection>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Section helpers ──────────────────────── */
function Section({ title, accent, children }) {
  return (
    <div className="resume-section">
      <div className="classic-section-title" style={{ borderBottomColor: accent }}>{title}</div>
      {children}
    </div>
  );
}
function ModernSection({ title, children }) {
  return (
    <div className="modern-section">
      <div className="modern-section-title">{title}</div>
      {children}
    </div>
  );
}
function MinimalSection({ title, children }) {
  return (
    <div className="resume-section">
      <div className="minimal-section-title">{title}</div>
      {children}
    </div>
  );
}
function CreativeSection({ title, children }) {
  return (
    <div className="resume-section">
      <div className="creative-section-title">{title}</div>
      {children}
    </div>
  );
}
function CreativeSideSection({ title, children }) {
  return (
    <div className="creative-side-section">
      <div className="creative-side-title">{title}</div>
      {children}
    </div>
  );
}
