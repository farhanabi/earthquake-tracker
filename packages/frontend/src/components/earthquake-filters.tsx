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
import { FilterValues } from '~/types/filter-values';

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
    sortField: filters.sortField || 'DATE',
    sortOrder: filters.sortOrder || 'DESC',
  });

  const debouncedFilterChange = useCallback(
    debounce((newFilters: FilterValues) => {
      onFilterChange(newFilters);
    }, 1000),
    [onFilterChange]
  );

  useEffect(() => {
    setLocalFilters({
      search: filters.search || '',
      minMagnitude: filters.minMagnitude ?? '',
      maxMagnitude: filters.maxMagnitude ?? '',
      sortField: filters.sortField || 'DATE',
      sortOrder: filters.sortOrder || 'DESC',
    });
  }, [
    filters.search,
    filters.minMagnitude,
    filters.maxMagnitude,
    filters.sortField,
    filters.sortOrder,
  ]);

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

  const handleReset = () => {
    setLocalFilters({
      search: '',
      minMagnitude: '',
      maxMagnitude: '',
      sortField: 'DATE',
      sortOrder: 'DESC',
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
            placeholder="From Date"
            name="fromDate"
            value={filters.fromDate || ''}
            max={new Date(new Date()).toISOString().split('T')[0]}
            onChange={handleDateInput}
          />
          <Input
            type="date"
            placeholder="To Date"
            name="toDate"
            value={filters.toDate || ''}
            min={filters.fromDate || ''}
            max={
              new Date(new Date().setDate(new Date().getDate() + 1))
                .toISOString()
                .split('T')[0]
            }
            onChange={handleDateInput}
          />
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sort Field */}
        <Select
          value={`${filters.sortField}_${filters.sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split('_');
            onFilterChange({
              ...filters,
              sortField: field,
              sortOrder: order,
            });
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DATE_DESC">Date (Latest first)</SelectItem>
            <SelectItem value="DATE_ASC">Date (Oldest first)</SelectItem>
            <SelectItem value="MAGNITUDE_ASC">
              Magnitude (Low to High)
            </SelectItem>
            <SelectItem value="MAGNITUDE_DESC">
              Magnitude (High to Low)
            </SelectItem>
            <SelectItem value="LOCATION_ASC">Location (A to Z)</SelectItem>
            <SelectItem value="LOCATION_DESC">Location (Z to A)</SelectItem>
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
