'use client';

import { ApolloProvider } from '@apollo/client';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FilterValues } from '~/types/filter-values';

import apolloClient from '../lib/apollo-client';
import { Earthquake } from '../graphql/operations';
import { EarthquakeList } from '../components/earthquake-list';
import { EarthquakeFormDialog } from '../components/earthquake-form-dialog';

export default function Home() {
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState<
    Earthquake | undefined
  >();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>(() => ({
    search: searchParams.get('search') || '',
    minMagnitude: searchParams.get('minMagnitude')
      ? Number(searchParams.get('minMagnitude'))
      : undefined,
    maxMagnitude: searchParams.get('maxMagnitude')
      ? Number(searchParams.get('maxMagnitude'))
      : undefined,
    fromDate: searchParams.get('fromDate') || '',
    toDate: searchParams.get('toDate') || '',
    sortField: searchParams.get('sortField') || 'DATE',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
  }));

  const handleEdit = (earthquake: Earthquake) => {
    setSelectedEarthquake(earthquake);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setSelectedEarthquake(undefined);
  };

  return (
    <ApolloProvider client={apolloClient}>
      <main className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <CardTitle>Earthquake Tracker</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Earthquake
            </Button>
          </CardHeader>
          <CardContent>
            <EarthquakeList
              onEdit={handleEdit}
              filters={filters}
              onFilterChange={setFilters}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </CardContent>
        </Card>

        <EarthquakeFormDialog
          earthquake={selectedEarthquake}
          isOpen={isFormOpen}
          onClose={handleClose}
          currentFilters={filters}
          currentPage={currentPage}
        />
      </main>
    </ApolloProvider>
  );
}
