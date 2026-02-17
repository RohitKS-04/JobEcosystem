interface TemplateSelectorProps {
  selectedTemplate: 'classic' | 'modern' | 'minimal';
  onTemplateChange: (template: 'classic' | 'modern' | 'minimal') => void;
}

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  const templates = [
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional single-column with serif headings',
      preview: 'border-2 border-slate-800',
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Two-column with colored sidebar',
      preview: 'border-l-4 border-blue-600 bg-gradient-to-r from-blue-50 to-white',
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean layout with generous whitespace',
      preview: 'border border-slate-200',
    },
  ] as const;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose Template</h3>
      
      <div className="grid gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateChange(template.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900">{template.name}</span>
              {selectedTemplate === template.id && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm text-slate-600 text-left">{template.description}</p>
            <div className="mt-3 h-8 rounded bg-white p-1">
              <div className={`h-full rounded ${template.preview}`}></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
