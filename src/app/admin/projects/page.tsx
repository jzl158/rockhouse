'use client';

import { useState, useEffect } from 'react';
import { ProjectGrid } from '@/app/components/projects/ProjectGrid';
import { ProjectList } from '@/app/components/projects/ProjectList';
import { ProjectFilters } from '@/app/components/projects/ProjectFilters';
import { fetchProjects, fetchProjectFilters } from '@/app/components/projects/projectHelpers';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

export default function AdminProjects() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: [],
    serviceType: [],
    phase: [],
    searchTerm: '',
  });
  const [availableFilters, setAvailableFilters] = useState({
    statuses: [],
    serviceTypes: [],
    phases: [],
  });

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filterOptions = await fetchProjectFilters();
        setAvailableFilters(filterOptions);
        setError(null);
      } catch (err) {
        setError('Failed to load filters. Please try again.');
        console.error('Error loading filters:', err);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const projectData = await fetchProjects(filters);
        setProjects(projectData);
        setError(null);
      } catch (err) {
        setError('Failed to load projects. Please try again.');
        console.error('Error loading projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjects();
  }, [filters]);

  const handleSearch = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }));
  };

  const handleFilterChange = (newFilters: {
    status?: string[];
    serviceType?: string[];
    phase?: string[];
  }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-accent' : ''}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-accent' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ProjectFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        availableFilters={availableFilters}
      />

      {error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid projects={projects} />
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}