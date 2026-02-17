import { ResumeData } from './ResumeForm';

interface ResumePreviewProps {
  data: ResumeData;
  template: 'classic' | 'modern' | 'minimal';
}

function hasContent(value: string): boolean {
  return value.trim().length > 0;
}

function parseSkills(skillsRaw: string): string[] {
  return skillsRaw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getBullets(multiline: string): string[] {
  return multiline
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ResumePreview({ data, template }: ResumePreviewProps) {
  const templateStyles = {
    classic: 'border-2 border-slate-800',
    modern: 'border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white',
    minimal: 'border border-slate-200',
  };

  const headerStyles = {
    classic: 'border-b-2 border-slate-800 pb-4',
    modern: 'border-b border-blue-600 pb-4',
    minimal: 'border-b border-slate-200 pb-4',
  };

  const headingStyles = {
    classic: 'font-serif text-xl font-bold text-slate-900',
    modern: 'font-sans text-xl font-bold text-slate-900',
    minimal: 'font-sans text-lg font-light text-slate-900 uppercase tracking-wide',
  };

  return (
    <div className={`rounded-xl bg-white p-8 shadow-sm ${templateStyles[template]}`}>
      {/* Header */}
      <header className={`mb-6 ${headerStyles[template]}`}>
        <h1 className={`text-2xl font-bold text-slate-900 mb-2`}>
          {data.personal.name || 'Your Name'}
        </h1>
        <div className="text-sm text-slate-600 flex flex-wrap gap-2">
          {hasContent(data.personal.email) && <span>{data.personal.email}</span>}
          {hasContent(data.personal.phone) && <span>• {data.personal.phone}</span>}
          {hasContent(data.personal.location) && <span>• {data.personal.location}</span>}
        </div>
      </header>

      {/* Summary */}
      {hasContent(data.summary) && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Summary</h2>
          <p className="text-slate-700 leading-relaxed">{data.summary}</p>
        </section>
      )}

      {/* Education */}
      {data.education.some((item: any) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year)) && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Education</h2>
          <div className="space-y-3">
            {data.education
              .filter((item: any) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year))
              .map((item: any, index: number) => (
                <div key={index} className="text-slate-700">
                  <div className="font-semibold">
                    {item.degree || 'Degree'} {item.school && `— ${item.school}`}
                  </div>
                  {item.year && <div className="text-sm text-slate-600">{item.year}</div>}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {data.experience.some((item: any) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0) && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Experience</h2>
          <div className="space-y-4">
            {data.experience
              .filter((item: any) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0)
              .map((item: any, index: number) => (
                <div key={index}>
                  <div className="font-semibold text-slate-900">
                    {item.role}
                    {item.company && `, ${item.company}`}
                  </div>
                  {item.duration && <div className="text-sm text-slate-600 mb-2">{item.duration}</div>}
                  {getBullets(item.bullets).length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      {getBullets(item.bullets).map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.some((item: any) => hasContent(item.title) || getBullets(item.bullets).length > 0) && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Projects</h2>
          <div className="space-y-4">
            {data.projects
              .filter((item: any) => hasContent(item.title) || getBullets(item.bullets).length > 0)
              .map((item: any, index: number) => (
                <div key={index}>
                  <div className="font-semibold text-slate-900">
                    {item.title}
                    {item.stack && ` — ${item.stack}`}
                  </div>
                  {getBullets(item.bullets).length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-slate-700 ml-4">
                      {getBullets(item.bullets).map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {parseSkills(data.skills).length > 0 && (
        <section className="mb-6">
          <h2 className={headingStyles[template]}>Skills</h2>
          <div className="flex flex-wrap gap-2">
            {parseSkills(data.skills).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Links */}
      {(hasContent(data.links.github) || hasContent(data.links.linkedin)) && (
        <section>
          <h2 className={headingStyles[template]}>Links</h2>
          <div className="space-y-1 text-slate-700">
            {hasContent(data.links.github) && (
              <div>
                <span className="font-semibold">GitHub:</span>{' '}
                <a href={data.links.github} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {data.links.github}
                </a>
              </div>
            )}
            {hasContent(data.links.linkedin) && (
              <div>
                <span className="font-semibold">LinkedIn:</span>{' '}
                <a href={data.links.linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  {data.links.linkedin}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!hasContent(data.summary) &&
        !data.education.some((item: any) => hasContent(item.school) || hasContent(item.degree) || hasContent(item.year)) &&
        !data.experience.some((item: any) => hasContent(item.role) || hasContent(item.company) || getBullets(item.bullets).length > 0) &&
        !data.projects.some((item: any) => hasContent(item.title) || getBullets(item.bullets).length > 0) &&
        parseSkills(data.skills).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-lg font-medium mb-2">No content added yet</div>
            <div className="text-sm">Start filling in the form to see your resume preview</div>
          </div>
        )}
    </div>
  );
}
