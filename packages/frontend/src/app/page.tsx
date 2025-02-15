'use client';

import { ApolloProvider } from '@apollo/client';
import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

import apolloClient from '../lib/apollo-client';
import { Earthquake } from '../graphql/operations';
import { EarthquakeList } from '../components/earthquake-list';
import { EarthquakeFormDialog } from '../components/earthquake-form-dialog';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEarthquake, setSelectedEarthquake] = useState<
    Earthquake | undefined
  >();

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
            <EarthquakeList onEdit={handleEdit} />
          </CardContent>
        </Card>

        <EarthquakeFormDialog
          earthquake={selectedEarthquake}
          isOpen={isFormOpen}
          onClose={handleClose}
        />
      </main>
    </ApolloProvider>
  );
}
