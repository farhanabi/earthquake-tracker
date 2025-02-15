import { useMutation } from '@apollo/client';
import { useState } from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import {
  CREATE_EARTHQUAKE,
  UPDATE_EARTHQUAKE,
  GET_EARTHQUAKES,
  Earthquake,
  CreateEarthquakeInput,
} from '../graphql/operations';

interface EarthquakeFormProps {
  earthquake?: Earthquake;
  onComplete: () => void;
}

export const EarthquakeForm = ({
  earthquake,
  onComplete,
}: EarthquakeFormProps) => {
  const [formData, setFormData] = useState<CreateEarthquakeInput>({
    location: earthquake?.location || '',
    magnitude: earthquake?.magnitude || 0,
    date: earthquake?.date || new Date().toISOString(),
  });
  const [error, setError] = useState<string | null>(null);

  const [createEarthquake] = useMutation(CREATE_EARTHQUAKE, {
    refetchQueries: [{ query: GET_EARTHQUAKES }],
  });

  const [updateEarthquake] = useMutation(UPDATE_EARTHQUAKE, {
    refetchQueries: [{ query: GET_EARTHQUAKES }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (earthquake) {
        await updateEarthquake({
          variables: {
            id: earthquake.id,
            input: formData,
          },
        });
      } else {
        await createEarthquake({
          variables: {
            input: formData,
          },
        });
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'magnitude' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{earthquake ? 'Edit' : 'Add'} Earthquake</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="magnitude">Magnitude</Label>
            <Input
              type="number"
              id="magnitude"
              name="magnitude"
              value={formData.magnitude}
              onChange={handleChange}
              step="0.1"
              min="0"
              max="10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date.slice(0, 16)}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onComplete}>
              Cancel
            </Button>
            <Button type="submit">{earthquake ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EarthquakeForm;
