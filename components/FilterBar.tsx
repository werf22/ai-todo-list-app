'use client';

import { useState } from 'react';
import { PORTFOLIO_PROJECT_SECTION } from '@/config/TASK_FIELD_CONFIG';

interface FilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  portfolio: string;
  project: string;
  section: string;
  priority: string;
  status: string;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  // State for each filter option
  const [portfolio, setPortfolio] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [section, setSection] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Get available options based on selected portfolio
  const getAvailableProjects = () => {
    if (!portfolio) return [];
    return Object.keys(PORTFOLIO_PROJECT_SECTION[portfolio] || {});
  };

  // Get available sections based on selected portfolio and project
  const getAvailableSections = () => {
    if (!portfolio || !project) return [];
    return PORTFOLIO_PROJECT_SECTION[portfolio]?.[project] || [];
  };

  // Handle filter changes
  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    // Update the specific filter state
    switch (field) {
      case 'portfolio':
        setPortfolio(value);
        // Reset dependent filters when changing portfolio
        setProject('');
        setSection('');
        break;
      case 'project':
        setProject(value);
        // Reset dependent filter when changing project
        setSection('');
        break;
      case 'section':
        setSection(value);
        break;
      case 'priority':
        setPriority(value);
        break;
      case 'status':
        setStatus(value);
        break;
    }

    // Call the parent's filter change handler with the updated filters
    onFilterChange({
      portfolio: field === 'portfolio' ? value : portfolio,
      project: field === 'project' ? value : field === 'portfolio' ? '' : project,
      section: field === 'section' ? value : field === 'project' || field === 'portfolio' ? '' : section,
      priority: field === 'priority' ? value : priority,
      status: field === 'status' ? value : status,
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setPortfolio('');
    setProject('');
    setSection('');
    setPriority('');
    setStatus('');
    
    onFilterChange({
      portfolio: '',
      project: '',
      section: '',
      priority: '',
      status: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Filter Tasks</h2>
        <button
          onClick={handleResetFilters}
          className="ml-auto px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded hover:bg-gray-200 transition"
        >
          Reset Filters
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Portfolio Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portfolio
          </label>
          <select
            value={portfolio}
            onChange={(e) => handleFilterChange('portfolio', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">-- All Portfolios --</option>
            {Object.keys(PORTFOLIO_PROJECT_SECTION).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={!portfolio}
          >
            <option value="">-- All Projects --</option>
            {getAvailableProjects().map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={section}
            onChange={(e) => handleFilterChange('section', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
            disabled={!project}
          >
            <option value="">-- All Sections --</option>
            {getAvailableSections().map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">-- All Priorities --</option>
            <option value="P0 - NOW">P0 - NOW</option>
            <option value="P1 - Critical">P1 - Critical</option>
            <option value="P2 - High">P2 - High</option>
            <option value="P3 - Medium">P3 - Medium</option>
            <option value="P4 - Low">P4 - Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">-- All Statuses --</option>
            <option value="1 - Nová (v Inboxe)">1 - Nová (v Inboxe)</option>
            <option value="2 - Čaká na Info / Rozhodnutie (Ja)">2 - Čaká na Info / Rozhodnutie (Ja)</option>
            <option value="3 - Pripravená pre AI">3 - Pripravená pre AI</option>
            <option value="4 - AI Agent Pracuje">4 - AI Agent Pracuje</option>
            <option value="5 - Vyžaduje Moju Akciu / Dokončenie">5 - Vyžaduje Moju Akciu / Dokončenie</option>
            <option value="6 - Hotovo">6 - Hotovo</option>
            <option value="7 - Zaparkované / Zrušené">7 - Zaparkované / Zrušené</option>
          </select>
        </div>
      </div>
    </div>
  );
}
