import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Skeleton } from '~/components/ui/skeleton';

import {
  DELETE_EARTHQUAKE,
  GET_EARTHQUAKES,
  Earthquake,
} from '../graphql/operations';
import { DeleteConfirmationDialog } from './delete-confirmation-dialog';
import { EarthquakeFilters, FilterValues } from './earthquake-filters';

interface EarthquakeListProps {
  onEdit: (earthquake: Earthquake) => void;
}

export const EarthquakeList = ({ onEdit }: EarthquakeListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(
    () => Number(searchParams.get('page')) || 1
  );

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

  const pageSize = 10;

  const updateURL = useCallback(
    (newPage: number, newFilters: FilterValues) => {
      const params = new URLSearchParams();

      if (newPage > 1) {
        params.set('page', newPage.toString());
      }

      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.minMagnitude)
        params.set('minMagnitude', newFilters.minMagnitude.toString());
      if (newFilters.maxMagnitude)
        params.set('maxMagnitude', newFilters.maxMagnitude.toString());
      if (newFilters.fromDate) params.set('fromDate', newFilters.fromDate);
      if (newFilters.toDate) params.set('toDate', newFilters.toDate);
      if (newFilters.sortField) params.set('sortField', newFilters.sortField);
      if (newFilters.sortOrder) params.set('sortOrder', newFilters.sortOrder);

      const newURL = params.toString() ? `?${params.toString()}` : '';
      router.push(newURL, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    updateURL(currentPage, filters);
  }, [currentPage, filters, updateURL]);

  const { data, loading, error } = useQuery(GET_EARTHQUAKES, {
    variables: {
      page: currentPage,
      pageSize,
      sort: filters.sortField
        ? {
            field: filters.sortField,
            order: filters.sortOrder || 'DESC',
          }
        : undefined,
      filter: {
        search: filters.search,
        minMagnitude: filters.minMagnitude,
        maxMagnitude: filters.maxMagnitude,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      },
    },
  });

  const [deleteEarthquake] = useMutation(DELETE_EARTHQUAKE, {
    refetchQueries: [
      {
        query: GET_EARTHQUAKES,
        variables: {
          page: currentPage,
          pageSize,
          sort: filters.sortField
            ? {
                field: filters.sortField,
                order: filters.sortOrder || 'DESC',
              }
            : undefined,
          filter: {
            search: filters.search,
            minMagnitude: filters.minMagnitude,
            maxMagnitude: filters.maxMagnitude,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
          },
        },
      },
    ],
  });

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [earthquakeToDelete, setEarthquakeToDelete] =
    useState<Earthquake | null>(null);

  const handleDelete = async () => {
    if (!earthquakeToDelete) return;

    try {
      await deleteEarthquake({
        variables: { id: earthquakeToDelete.id },
      });
      setDeleteError(null);
      setEarthquakeToDelete(null);
      toast.success('Earthquake deleted successfully');
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete earthquake'
      );
      toast.error('Failed to delete earthquake');
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleFilterReset = () => {
    setFilters({
      sortField: 'DATE',
      sortOrder: 'DESC',
    });
    setCurrentPage(1);
    router.push('', { scroll: false });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <EarthquakeFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
        />
        <Alert variant="destructive">
          <AlertDescription>Error: {error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EarthquakeFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <DeleteConfirmationDialog
        isOpen={!!earthquakeToDelete}
        onClose={() => setEarthquakeToDelete(null)}
        onConfirm={handleDelete}
        location={earthquakeToDelete?.location ?? ''}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Location</TableHead>
            <TableHead>Magnitude</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.earthquakes.data.map((earthquake: Earthquake) => (
            <TableRow key={earthquake.id}>
              <TableCell>{earthquake.location}</TableCell>
              <TableCell>{earthquake.magnitude.toFixed(1)}</TableCell>
              <TableCell>
                {format(new Date(earthquake.date), 'MMM d, yyyy HH:mm')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(earthquake)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEarthquakeToDelete(earthquake)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {data?.earthquakes.data.length} of {data?.earthquakes.total}{' '}
          results
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {data?.earthquakes.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === data?.earthquakes.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EarthquakeList;
