import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchBookings, updateBookingStatus } from '@/store/slices/bookingsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate, formatCurrency } from '@/lib/utils';

export function BookingsPage() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state: RootState) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      pending: 'secondary',
      confirmed: 'success',
      cancelled: 'destructive',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings & Payments</h1>
        <p className="text-gray-600 mt-1">Manage customer bookings and payment status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm">#{booking.id.slice(0, 8)}</TableCell>
                    <TableCell>{booking.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{booking.bookingType}</Badge>
                    </TableCell>
                    <TableCell>{booking.tripTitle || booking.gearName}</TableCell>
                    <TableCell>
                      {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                    </TableCell>
                    <TableCell>{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      <Badge variant={booking.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                        {booking.paymentStatus}
                      </Badge>
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
