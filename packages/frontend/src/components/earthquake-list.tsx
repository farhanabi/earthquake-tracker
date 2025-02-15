import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface EarthquakeListProps {
  onEdit: (earthquake: Earthquake) => void;
}

export const EarthquakeList = ({ onEdit }: EarthquakeListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, loading, error } = useQuery(GET_EARTHQUAKES, {
    variables: { page: currentPage, pageSize },
  });

  const [deleteEarthquake] = useMutation(DELETE_EARTHQUAKE, {
    refetchQueries: [
      {
        query: GET_EARTHQUAKES,
        variables: { page: currentPage, pageSize },
      },
    ],
  });

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [earthquakeToDelete, setEarthquakeToDelete] =
    useState<Earthquake | null>(null);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
    );
  }

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>Error: {error.message}</AlertDescription>
      </Alert>
    );

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

  return (
    <div className="space-y-4">
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
