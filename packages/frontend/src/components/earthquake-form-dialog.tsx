'use client';

import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';

import {
  CREATE_EARTHQUAKE,
  UPDATE_EARTHQUAKE,
  GET_EARTHQUAKES,
  Earthquake,
} from '../graphql/operations';

const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;

const earthquakeFormSchema = z.object({
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters.' })
    .max(100, { message: 'Location must not exceed 100 characters.' })
    .refine((value) => coordinatePattern.test(value), {
      message:
        'Location must be in format: latitude, longitude (e.g., 38.297, 142.373)',
    })
    .refine(
      (value) => {
        const [lat, lon] = value
          .split(',')
          .map((coord) => Number(coord.trim()));
        return (
          !isNaN(lat) &&
          !isNaN(lon) &&
          lat >= -90 &&
          lat <= 90 &&
          lon >= -180 &&
          lon <= 180
        );
      },
      {
        message:
          'Invalid coordinates. Latitude must be between -90° and 90°, longitude between -180° and 180°',
      }
    ),
  magnitude: z
    .number()
    .min(0, { message: 'Magnitude must be at least 0.' })
    .max(10, { message: 'Magnitude must not exceed 10.' }),
  date: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Please enter a valid date.',
  }),
});

type EarthquakeFormValues = z.infer<typeof earthquakeFormSchema>;

interface EarthquakeFormDialogProps {
  earthquake?: Earthquake;
  isOpen: boolean;
  onClose: () => void;
}

export const EarthquakeFormDialog = ({
  earthquake,
  isOpen,
  onClose,
}: EarthquakeFormDialogProps) => {
  const form = useForm<EarthquakeFormValues>({
    resolver: zodResolver(earthquakeFormSchema),
    defaultValues: {
      location: '',
      magnitude: 0,
      date: new Date().toISOString().slice(0, 16),
    },
  });

  const [createEarthquake] = useMutation(CREATE_EARTHQUAKE, {
    refetchQueries: [{ query: GET_EARTHQUAKES }],
  });

  const [updateEarthquake] = useMutation(UPDATE_EARTHQUAKE, {
    refetchQueries: [{ query: GET_EARTHQUAKES }],
  });

  useEffect(() => {
    if (isOpen) {
      if (earthquake) {
        form.reset({
          location: earthquake.location,
          magnitude: earthquake.magnitude,
          date: new Date(earthquake.date).toISOString().slice(0, 16),
        });
      } else {
        form.reset({
          location: '',
          magnitude: 0,
          date: new Date().toISOString().slice(0, 16),
        });
      }
    }
  }, [isOpen, earthquake, form]);

  const onSubmit = async (values: EarthquakeFormValues) => {
    try {
      if (earthquake) {
        await updateEarthquake({
          variables: {
            id: earthquake.id,
            input: values,
          },
        });
        toast.success('Earthquake updated successfully');
      } else {
        await createEarthquake({
          variables: {
            input: values,
          },
        });
        toast.success('Earthquake added successfully');
      }
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      toast.error(`Operation failed: ${errorMessage}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{earthquake ? 'Edit' : 'Add'} Earthquake</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Coordinates)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter coordinates (e.g., 38.297, 142.373)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the location as latitude, longitude (comma-separated)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="magnitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Magnitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter magnitude..."
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{earthquake ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EarthquakeFormDialog;
