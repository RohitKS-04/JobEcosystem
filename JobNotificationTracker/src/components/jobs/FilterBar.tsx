import type { DashboardFilters } from '../../types';

type FilterBarProps = {
  filters: DashboardFilters;
  locations: string[];
  onChange: (next: DashboardFilters) => void;
};

export function FilterBar({ filters, locations, onChange }: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Job filters">
      <input
        type="search"
        placeholder="Search by role or company"
        value={filters.keyword}
        onChange={(event) => onChange({ ...filters, keyword: event.target.value })}
      />

      <select value={filters.location} onChange={(event) => onChange({ ...filters, location: event.target.value })}>
        <option value="All">All Locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>

      <select
        value={filters.mode}
        onChange={(event) => onChange({ ...filters, mode: event.target.value as DashboardFilters['mode'] })}
      >
        <option value="All">All Modes</option>
        <option value="Remote">Remote</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Onsite">Onsite</option>
      </select>

      <select
        value={filters.experience}
        onChange={(event) =>
          onChange({ ...filters, experience: event.target.value as DashboardFilters['experience'] })
        }
      >
        <option value="All">All Experience</option>
        <option value="Fresher">Fresher</option>
        <option value="0-1">0-1</option>
        <option value="1-3">1-3</option>
        <option value="3-5">3-5</option>
      </select>

      <select
        value={filters.source}
        onChange={(event) => onChange({ ...filters, source: event.target.value as DashboardFilters['source'] })}
      >
        <option value="All">All Sources</option>
        <option value="LinkedIn">LinkedIn</option>
        <option value="Naukri">Naukri</option>
        <option value="Indeed">Indeed</option>
      </select>

      <select
        value={filters.status}
        onChange={(event) => onChange({ ...filters, status: event.target.value as DashboardFilters['status'] })}
      >
        <option value="All">All Status</option>
        <option value="Not Applied">Not Applied</option>
        <option value="Applied">Applied</option>
        <option value="Rejected">Rejected</option>
        <option value="Selected">Selected</option>
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onChange({ ...filters, sort: event.target.value as DashboardFilters['sort'] })}
      >
        <option value="Latest">Latest</option>
        <option value="Match Score">Match Score</option>
        <option value="Salary">Salary</option>
      </select>
    </section>
  );
}
