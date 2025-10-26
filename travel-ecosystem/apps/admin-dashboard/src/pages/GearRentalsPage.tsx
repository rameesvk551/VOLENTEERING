import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchGear } from '@/store/slices/gearSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function GearRentalsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state: RootState) => state.gear);

  useEffect(() => {
    dispatch(fetchGear());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gear Rentals</h1>
          <p className="text-gray-600 mt-1">Manage equipment and rental inventory</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Gear
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gear ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/Day</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                items.map((gear) => (
                  <TableRow key={gear.id}>
                    <TableCell className="font-medium">{gear.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{gear.category}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(gear.pricePerDay)}</TableCell>
                    <TableCell>
                      {gear.available}/{gear.total}
                    </TableCell>
                    <TableCell>
                      <Badge variant={gear.condition === 'excellent' ? 'success' : 'secondary'}>
                        {gear.condition}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Edit
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
