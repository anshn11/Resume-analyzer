import { ClassicTemplate, ModernTemplate, MinimalTemplate, CreativeTemplate } from './ResumeTemplates';

export default function ResumePreview({ resume }) {
  if (!resume) return null;
  const template = resume.template || 'classic';

  return (
    <div className="resume-preview-container">
      {template === 'classic'  && <ClassicTemplate  resume={resume} />}
      {template === 'modern'   && <ModernTemplate   resume={resume} />}
      {template === 'minimal'  && <MinimalTemplate  resume={resume} />}
      {template === 'creative' && <CreativeTemplate resume={resume} />}
    </div>
  );
}
