import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchTrips } from '@/store/slices/tripsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, MapPin } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export function TripsPage() {
  const dispatch = useDispatch();
  const { trips, loading } = useSelector((state: RootState) => state.trips);

  useEffect(() => {
    dispatch(fetchTrips());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      draft: 'secondary',
      published: 'success',
      cancelled: 'destructive',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trips & Itineraries</h1>
          <p className="text-gray-600 mt-1">Manage travel trips and itineraries</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Trip
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trips ({trips.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip Title</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-medium">{trip.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                        {trip.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </TableCell>
                    <TableCell>{trip.hostName}</TableCell>
                    <TableCell>
                      {trip.currentParticipants}/{trip.maxParticipants}
                    </TableCell>
                    <TableCell>{formatCurrency(trip.price)}</TableCell>
                    <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
