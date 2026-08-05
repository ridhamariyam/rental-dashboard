'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { api } from '@/lib/api';
import { paths } from '@/paths';

interface VariationDetail {
  id: string;
  product?: { name?: string };
  color?: string | null;
  size?: string | null;
  quantity: number;
  rent_price: number;
  security_deposit: number;
  is_available: boolean;
  barcode: string;
}

interface CustomerRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

const COLUMN_COUNT = 4;

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Picked', value: 'picked' },
  { label: 'Returned', value: 'returned' },
  { label: 'Cancelled', value: 'cancelled' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowISO(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function calculateTotalDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 0;
  }

  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function matchesSearch(customer: CustomerRow, search: string): boolean {
  const term = search.trim().toLowerCase();

  if (term === '') {
    return true;
  }

  return (
    customer.first_name.toLowerCase().includes(term) ||
    customer.last_name.toLowerCase().includes(term) ||
    customer.email.toLowerCase().includes(term) ||
    customer.phone.toLowerCase().includes(term)
  );
}

interface AssignVariationProps {
  variationId: string;
}

export function AssignVariation({ variationId }: AssignVariationProps): React.JSX.Element {
  const router = useRouter();
  const [variation, setVariation] = React.useState<VariationDetail | null>(null);
  const [customers, setCustomers] = React.useState<CustomerRow[]>([]);
  const [search, setSearch] = React.useState('');
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerRow | null>(null);
  const [fromDate, setFromDate] = React.useState(todayISO());
  const [toDate, setToDate] = React.useState(tomorrowISO());
  const [securityDeposit, setSecurityDeposit] = React.useState('');
  const [status, setStatus] = React.useState('confirmed');
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadData(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [variationData, usersData] = await Promise.all([
          api.get<VariationDetail>(`/variations/${variationId}`),
          api.get<CustomerRow[]>('/users'),
        ]);

        if (isMounted) {
          setVariation(variationData);
          setSecurityDeposit(String(variationData.security_deposit));
          setCustomers(Array.isArray(usersData) ? usersData.filter((user) => user.role === 'customer') : []);
        }
      } catch (error_) {
        if (isMounted) {
          setError(error_ instanceof Error ? error_.message : 'Unable to load assignment data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [variationId]);

  const filteredCustomers = React.useMemo(
    () => customers.filter((customer) => matchesSearch(customer, search)),
    [customers, search]
  );

  const totalDays = calculateTotalDays(fromDate, toDate);
  const depositValue = Number(securityDeposit) || 0;
  const totalAmount = variation && totalDays > 0 ? variation.rent_price * totalDays : 0;

  const handleConfirm = async (): Promise<void> => {
    if (!selectedCustomer) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post(`/variations/${variationId}/assign`, {
        user_id: selectedCustomer.id,
        from_date: fromDate,
        to_date: toDate,
        security_deposit: depositValue,
        status,
      });

      router.push(paths.dashboard.bookings);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to assign variation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton onClick={() => router.push(paths.dashboard.availableVariations)}>
          <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
        </IconButton>
        <Typography variant="h4">Assign Variation</Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <>
          <Card>
            <CardContent>
              <Typography variant="h6">{variation?.product?.name ?? 'Product'}</Typography>
              <Typography color="text.secondary" variant="body2">
                {[variation?.color, variation?.size].filter(Boolean).join(' / ') || 'No color/size specified'}
              </Typography>
              <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
                <Typography variant="body2">Rent Price: ₹{variation?.rent_price}</Typography>
                <Typography variant="body2">Deposit: ₹{variation?.security_deposit}</Typography>
                <Typography variant="body2">Quantity Available: {variation?.quantity}</Typography>
                <Typography variant="body2">Barcode: {variation?.barcode}</Typography>
              </Stack>
            </CardContent>
          </Card>

          {selectedCustomer ? (
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Confirm assignment to {selectedCustomer.first_name} {selectedCustomer.last_name}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    label="From Date"
                    onChange={(event) => setFromDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    type="date"
                    value={fromDate}
                  />
                  <TextField
                    label="To Date"
                    onChange={(event) => setToDate(event.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    type="date"
                    value={toDate}
                  />
                  <TextField
                    label="Security Deposit"
                    onChange={(event) => setSecurityDeposit(event.target.value)}
                    type="number"
                    value={securityDeposit}
                  />
                  <TextField
                    label="Status"
                    onChange={(event) => setStatus(event.target.value)}
                    select
                    value={status}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
                  {totalDays > 0
                    ? `${totalDays} day(s) × ₹${variation?.rent_price} = `
                    : 'Select a valid date range to calculate the total'}
                  {totalDays > 0 ? <strong>₹{totalAmount}</strong> : null}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  Security deposit (₹{depositValue}) is recorded separately and is not included in the total amount.
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    disabled={submitting || totalDays <= 0}
                    onClick={() => void handleConfirm()}
                    variant="contained"
                  >
                    Confirm Assignment
                  </Button>
                  <Button color="inherit" disabled={submitting} onClick={() => setSelectedCustomer(null)}>
                    Cancel
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <TextField
                  fullWidth
                  label="Search customer by name, email, or phone"
                  onChange={(event) => setSearch(event.target.value)}
                  value={search}
                />
              </CardContent>
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={COLUMN_COUNT}>No customers found</TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow hover key={customer.id}>
                          <TableCell>
                            {customer.first_name} {customer.last_name}
                          </TableCell>
                          <TableCell>{customer.email}</TableCell>
                          <TableCell>{customer.phone}</TableCell>
                          <TableCell align="right">
                            <Button onClick={() => setSelectedCustomer(customer)} size="small" variant="outlined">
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}
