'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

interface ProjectFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: {
    status?: string[];
    serviceType?: string[];
    phase?: string[];
  }) => void;
  availableFilters: {
    statuses: string[];
    serviceTypes: string[];
    phases: string[];
  };
}

export function ProjectFilters({
  onSearch,
  onFilterChange,
  availableFilters,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <div className="p-2">
              <div className="font-medium mb-2">Status</div>
              {availableFilters.statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={false}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      status: checked ? [status] : [],
                    });
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
            <div className="p-2">
              <div className="font-medium mb-2">Service Type</div>
              {availableFilters.serviceTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={false}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      serviceType: checked ? [type] : [],
                    });
                  }}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
            <div className="p-2">
              <div className="font-medium mb-2">Phase</div>
              {availableFilters.phases.map((phase) => (
                <DropdownMenuCheckboxItem
                  key={phase}
                  checked={false}
                  onCheckedChange={(checked) => {
                    onFilterChange({
                      phase: checked ? [phase] : [],
                    });
                  }}
                >
                  {phase}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
