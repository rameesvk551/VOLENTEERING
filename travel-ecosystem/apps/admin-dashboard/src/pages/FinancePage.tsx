import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchFinanceRecords, fetchFinanceSummary } from '@/store/slices/financeSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export function FinancePage() {
  const dispatch = useDispatch();
  const { records, summary, loading } = useSelector((state: RootState) => state.finance);

  useEffect(() => {
    dispatch(fetchFinanceRecords());
    dispatch(fetchFinanceSummary());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance & Reporting</h1>
        <p className="text-gray-600 mt-1">Track revenue, expenses, and financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpense)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.type === 'income'
                            ? 'success'
                            : record.type === 'expense'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.category}</TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          record.type === 'income'
                            ? 'text-green-600'
                            : record.type === 'expense'
                            ? 'text-red-600'
                            : ''
                        }
                      >
                        {record.type === 'income' ? '+' : '-'}
                        {formatCurrency(record.amount)}
                      </span>
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
