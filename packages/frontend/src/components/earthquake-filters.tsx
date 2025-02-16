import React from 'react';
import { Search } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

export interface FilterValues {
  search?: string;
  minMagnitude?: number;
  maxMagnitude?: number;
  fromDate?: string;
  toDate?: string;
  sortField?: string;
  sortOrder?: string;
}

interface EarthquakeFiltersProps {
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
}

export const EarthquakeFilters: React.FC<EarthquakeFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSortChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            name="search"
            value={filters.search || ''}
            onChange={handleInputChange}
            className="pl-8"
          />
        </div>

        {/* Magnitude Range */}
        <div className="flex gap-2 min-w-[200px]">
          <Input
            type="number"
            placeholder="Min magnitude"
            name="minMagnitude"
            value={filters.minMagnitude || ''}
            onChange={handleInputChange}
            step="0.1"
          />
          <Input
            type="number"
            placeholder="Max magnitude"
            name="maxMagnitude"
            value={filters.maxMagnitude || ''}
            onChange={handleInputChange}
            step="0.1"
          />
        </div>

        {/* Date Range */}
        <div className="flex gap-2 min-w-[200px]">
          <Input
            type="date"
            name="fromDate"
            value={filters.fromDate || ''}
            onChange={handleInputChange}
          />
          <Input
            type="date"
            name="toDate"
            value={filters.toDate || ''}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sort Field */}
        <Select
          value={filters.sortField}
          onValueChange={(value) => handleSortChange('sortField', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATE">Date</SelectItem>
            <SelectItem value="MAGNITUDE">Magnitude</SelectItem>
            <SelectItem value="LOCATION">Location</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order */}
        <Select
          value={filters.sortOrder}
          onValueChange={(value) => handleSortChange('sortOrder', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Order..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ASC">Ascending</SelectItem>
            <SelectItem value="DESC">Descending</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset Filters */}
        <Button
          variant="outline"
          onClick={() => onFilterChange({})}
          className="ml-auto"
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
