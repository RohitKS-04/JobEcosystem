import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { jobs } from '../../jobs/data/jobs';
import type { JobMode, JobTrackerPreferences } from '../../../types';
import {
  clearJobTrackerPreferences,
  defaultJobTrackerPreferences,
  parseCommaSeparatedInput,
  readJobTrackerPreferences,
  writeJobTrackerPreferences,
} from '../../../utils';

const modeOptions: JobMode[] = ['Remote', 'Hybrid', 'Onsite'];

export function SettingsPage() {
  const [roleKeywordsInput, setRoleKeywordsInput] = useState('');
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [preferredMode, setPreferredMode] = useState<JobMode[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<JobTrackerPreferences['experienceLevel']>('Any');
  const [skillsInput, setSkillsInput] = useState('');
  const [minMatchScore, setMinMatchScore] = useState(40);
  const [saveMessage, setSaveMessage] = useState('');

  const locationOptions = useMemo(() => Array.from(new Set(jobs.map((job) => job.location))).sort(), []);

  useEffect(() => {
    const preferences = readJobTrackerPreferences();
    setRoleKeywordsInput(preferences.roleKeywords.join(', '));
    setPreferredLocations(preferences.preferredLocations);
    setPreferredMode(preferences.preferredMode);
    setExperienceLevel(preferences.experienceLevel);
    setSkillsInput(preferences.skills.join(', '));
    setMinMatchScore(preferences.minMatchScore);
  }, []);

  const toggleMode = (mode: JobMode) => {
    setPreferredMode((current) =>
      current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode],
    );
  };

  const onSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preferences: JobTrackerPreferences = {
      roleKeywords: parseCommaSeparatedInput(roleKeywordsInput),
      preferredLocations,
      preferredMode,
      experienceLevel,
      skills: parseCommaSeparatedInput(skillsInput),
      minMatchScore,
    };

    writeJobTrackerPreferences(preferences);
    setSaveMessage('Preferences saved. Intelligent matching is now active.');
  };

  const onClearPreferences = () => {
    clearJobTrackerPreferences();
    setRoleKeywordsInput(defaultJobTrackerPreferences.roleKeywords.join(', '));
    setPreferredLocations(defaultJobTrackerPreferences.preferredLocations);
    setPreferredMode(defaultJobTrackerPreferences.preferredMode);
    setExperienceLevel(defaultJobTrackerPreferences.experienceLevel);
    setSkillsInput(defaultJobTrackerPreferences.skills.join(', '));
    setMinMatchScore(defaultJobTrackerPreferences.minMatchScore);
    setSaveMessage('Preferences cleared. Digest will refresh after regeneration.');
  };

  return (
    <main className="page-shell">
      <section className="page-content settings-content">
        <h1>Settings</h1>
        <p>Configure your targeting rules to activate deterministic matching on the dashboard.</p>

        <form className="settings-form" aria-label="Job tracker preferences" onSubmit={onSave}>
          <div className="field-group">
            <label htmlFor="role-keywords">Role keywords</label>
            <input
              id="role-keywords"
              type="text"
              placeholder="e.g. Frontend Engineer, React Developer"
              value={roleKeywordsInput}
              onChange={(event) => setRoleKeywordsInput(event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="preferred-locations">Preferred locations</label>
            <select
              id="preferred-locations"
              multiple
              value={preferredLocations}
              onChange={(event) => {
                const selected = Array.from(event.target.selectedOptions).map((option) => option.value);
                setPreferredLocations(selected);
              }}
            >
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <span>Preferred mode</span>
            <div className="checkbox-group" role="group" aria-label="Preferred mode">
              {modeOptions.map((mode) => (
                <label key={mode} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={preferredMode.includes(mode)}
                    onChange={() => toggleMode(mode)}
                  />
                  <span>{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="experience-level">Experience level</label>
            <select
              id="experience-level"
              value={experienceLevel}
              onChange={(event) => setExperienceLevel(event.target.value as JobTrackerPreferences['experienceLevel'])}
            >
              <option value="Any">Any</option>
              <option value="Fresher">Fresher</option>
              <option value="0-1">0-1</option>
              <option value="1-3">1-3</option>
              <option value="3-5">3-5</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="skills">Skills</label>
            <input
              id="skills"
              type="text"
              placeholder="e.g. React, TypeScript, SQL"
              value={skillsInput}
              onChange={(event) => setSkillsInput(event.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="min-match-score">Min match score ({minMatchScore})</label>
            <input
              id="min-match-score"
              type="range"
              min={0}
              max={100}
              step={1}
              value={minMatchScore}
              onChange={(event) => setMinMatchScore(Number(event.target.value))}
            />
          </div>

          <div className="settings-actions">
            <button type="submit" className="btn-primary settings-save-button">
              Save Preferences
            </button>

            <button type="button" className="btn-secondary settings-clear-button" onClick={onClearPreferences}>
              Clear Preferences
            </button>
          </div>

          {saveMessage ? <p className="settings-save-message">{saveMessage}</p> : null}
        </form>
      </section>
    </main>
  );
}
