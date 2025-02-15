import { useQuery, useMutation } from '@apollo/client';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

export const EarthquakeList = ({
  onEdit,
}: {
  onEdit: (earthquake: Earthquake) => void;
}) => {
  const { data, loading, error } = useQuery(GET_EARTHQUAKES);
  const [deleteEarthquake] = useMutation(DELETE_EARTHQUAKE, {
    refetchQueries: [{ query: GET_EARTHQUAKES }],
  });
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const handleDelete = async (id: number) => {
    try {
      await deleteEarthquake({ variables: { id } });
      setDeleteError(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Failed to delete earthquake'
      );
    }
  };

  return (
    <div className="space-y-4">
      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

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
          {data?.earthquakes.map((earthquake: Earthquake) => (
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
                    onClick={() => handleDelete(earthquake.id)}
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
    </div>
  );
};

export default EarthquakeList;
