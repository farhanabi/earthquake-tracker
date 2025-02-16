import React, { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import debounce from 'lodash/debounce';

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
  onReset: () => void;
}

export const EarthquakeFilters: React.FC<EarthquakeFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    minMagnitude: filters.minMagnitude ?? '',
    maxMagnitude: filters.maxMagnitude ?? '',
  });

  const debouncedFilterChange = useCallback(
    debounce((newFilters: FilterValues) => {
      onFilterChange(newFilters);
    }, 300),
    [onFilterChange]
  );

  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      minMagnitude: filters.minMagnitude ?? '',
      maxMagnitude: filters.maxMagnitude ?? '',
    });
  }, [filters.search, filters.minMagnitude, filters.maxMagnitude]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalFilters((prev) => ({ ...prev, search: newValue }));
    debouncedFilterChange({ ...filters, search: newValue });
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLocalFilters((prev) => ({ ...prev, [name]: value }));

    const numValue = value ? parseFloat(value) : undefined;
    debouncedFilterChange({ ...filters, [name]: numValue });
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleSortChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    setLocalFilters({
      search: '',
      minMagnitude: '',
      maxMagnitude: '',
    });
    onReset();
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
            value={localFilters.search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>

        {/* Magnitude Range */}
        <div className="flex gap-2 min-w-[200px]">
          <Input
            type="number"
            placeholder="Min magnitude"
            name="minMagnitude"
            value={localFilters.minMagnitude}
            onChange={handleNumberInput}
            step="0.1"
          />
          <Input
            type="number"
            placeholder="Max magnitude"
            name="maxMagnitude"
            value={localFilters.maxMagnitude}
            onChange={handleNumberInput}
            step="0.1"
          />
        </div>

        {/* Date Range */}
        <div className="flex gap-2 min-w-[200px]">
          <Input
            type="date"
            name="fromDate"
            value={filters.fromDate || ''}
            onChange={handleDateInput}
          />
          <Input
            type="date"
            name="toDate"
            value={filters.toDate || ''}
            onChange={handleDateInput}
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
        <Button variant="outline" onClick={handleReset} className="ml-auto">
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
