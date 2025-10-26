import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchHosts, verifyHost } from '@/store/slices/hostsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Star } from 'lucide-react';

export function HostsPage() {
  const dispatch = useDispatch();
  const { hosts, loading } = useSelector((state: RootState) => state.hosts);

  useEffect(() => {
    dispatch(fetchHosts());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hosts & Volunteers</h1>
        <p className="text-gray-600 mt-1">Manage trip hosts and volunteers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hosts ({hosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Trips</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                hosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {host.name}
                        {host.verified && (
                          <CheckCircle className="h-4 w-4 ml-2 text-blue-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{host.email}</TableCell>
                    <TableCell>{host.location}</TableCell>
                    <TableCell>{host.totalTrips}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {host.rating.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={host.status === 'active' ? 'success' : 'secondary'}>
                        {host.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!host.verified && (
                        <Button size="sm" onClick={() => dispatch(verifyHost(host.id))}>
                          Verify
                        </Button>
                      )}
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
