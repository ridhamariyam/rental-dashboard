'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
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

interface UserDetailData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  address?: string | null;
  role: string;
  shop?: { name?: string } | null;
}

interface OrderRow {
  id: string;
  booking_number: string;
  from_date: string;
  to_date: string;
  status: string;
  total_amount: number;
  product?: { name?: string };
  variation?: { color?: string | null; size?: string | null };
}

interface LeaveRow {
  id: string;
  staff_id: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
}

interface AttendanceRow {
  id: string;
  date: string;
  check_in_time: string;
  check_in_latitude: number;
  check_in_longitude: number;
  check_in_address?: string | null;
  check_out_time?: string | null;
  check_out_latitude?: number | null;
  check_out_longitude?: number | null;
  check_out_address?: string | null;
}

interface SalaryRow {
  id: string;
  amount: number;
  effective_date: string;
  note?: string | null;
}

const LEAVE_STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

function formatLocation(address?: string | null, lat?: number | null, lng?: number | null): string {
  if (address) {
    return address;
  }

  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return '-';
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

interface UserDetailProps {
  userId: string;
}

export function UserDetail({ userId }: UserDetailProps): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = React.useState<UserDetailData | null>(null);
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [leaves, setLeaves] = React.useState<LeaveRow[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceRow[]>([]);
  const [salaries, setSalaries] = React.useState<SalaryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [leaveForm, setLeaveForm] = React.useState({ from_date: '', to_date: '', reason: '' });
  const [savingLeave, setSavingLeave] = React.useState(false);

  const [salaryForm, setSalaryForm] = React.useState({ amount: '', effective_date: '', note: '' });
  const [savingSalary, setSavingSalary] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userData = await api.get<UserDetailData>(`/users/${userId}`);
      setUser(userData);

      if (userData.role === 'customer') {
        const orderData = await api.get<OrderRow[]>(`/bookings/customer/${userId}`);
        setOrders(Array.isArray(orderData) ? orderData : []);
      } else if (userData.role === 'staff') {
        const [leaveData, attendanceData, salaryData] = await Promise.all([
          api.get<LeaveRow[]>('/staff-leaves'),
          api.get<AttendanceRow[]>(`/attendance/staff/${userId}`),
          api.get<SalaryRow[]>(`/salaries/staff/${userId}`),
        ]);
        setLeaves(Array.isArray(leaveData) ? leaveData.filter((leave) => leave.staff_id === userId) : []);
        setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
        setSalaries(Array.isArray(salaryData) ? salaryData : []);
      }
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleRequestLeave = async (): Promise<void> => {
    setSavingLeave(true);
    setError(null);

    try {
      await api.post('/staff-leaves', {
        staff_id: userId,
        from_date: leaveForm.from_date,
        to_date: leaveForm.to_date,
        reason: leaveForm.reason,
      });
      setLeaveForm({ from_date: '', to_date: '', reason: '' });
      await loadAll();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to request leave');
    } finally {
      setSavingLeave(false);
    }
  };

  const handleLeaveStatusChange = async (leaveId: string, status: string): Promise<void> => {
    setError(null);

    try {
      await api.put(`/staff-leaves/${leaveId}`, { status });
      await loadAll();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to update leave status');
    }
  };

  const handleAddSalary = async (): Promise<void> => {
    setSavingSalary(true);
    setError(null);

    try {
      await api.post('/salaries', {
        staff_id: userId,
        amount: Number(salaryForm.amount) || 0,
        effective_date: salaryForm.effective_date,
        note: salaryForm.note,
      });
      setSalaryForm({ amount: '', effective_date: '', note: '' });
      await loadAll();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to add salary record');
    } finally {
      setSavingSalary(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton onClick={() => router.push(paths.dashboard.customers)}>
          <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
        </IconButton>
        <Typography variant="h4">User Details</Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : user ? (
        <Stack spacing={3}>
          <Card>
            <CardHeader
              action={<Chip label={user.role} size="small" />}
              title={`${user.first_name} ${user.last_name}`}
              subheader={user.username}
            />
            <Divider />
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
                <Typography variant="body2">Email: {user.email}</Typography>
                <Typography variant="body2">Mobile Number: {user.phone}</Typography>
                <Typography variant="body2">Address: {user.address ?? '-'}</Typography>
                <Typography variant="body2">Shop: {user.shop?.name ?? '-'}</Typography>
              </Stack>
            </CardContent>
          </Card>

          {user.role === 'customer' ? (
            <Card>
              <CardHeader title="Order List" />
              <Divider />
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Booking No.</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>From</TableCell>
                      <TableCell>To</TableCell>
                      <TableCell>Total Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>No orders found</TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow
                          hover
                          key={order.id}
                          onClick={() => router.push(`/dashboard/bookings/${order.id}`)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{order.booking_number}</TableCell>
                          <TableCell>{order.product?.name ?? '-'}</TableCell>
                          <TableCell>{order.variation?.color ?? '-'}</TableCell>
                          <TableCell>{order.variation?.size ?? '-'}</TableCell>
                          <TableCell>{order.from_date}</TableCell>
                          <TableCell>{order.to_date}</TableCell>
                          <TableCell>₹{order.total_amount}</TableCell>
                          <TableCell>
                            <Chip label={order.status} size="small" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          ) : null}

          {user.role === 'staff' ? (
            <>
              <Card>
                <CardHeader title="Leave Requests" />
                <Divider />
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="From Date"
                      onChange={(event) => setLeaveForm((current) => ({ ...current, from_date: event.target.value }))}
                      slotProps={{ inputLabel: { shrink: true } }}
                      type="date"
                      value={leaveForm.from_date}
                    />
                    <TextField
                      label="To Date"
                      onChange={(event) => setLeaveForm((current) => ({ ...current, to_date: event.target.value }))}
                      slotProps={{ inputLabel: { shrink: true } }}
                      type="date"
                      value={leaveForm.to_date}
                    />
                    <TextField
                      fullWidth
                      label="Reason"
                      onChange={(event) => setLeaveForm((current) => ({ ...current, reason: event.target.value }))}
                      value={leaveForm.reason}
                    />
                    <Button
                      disabled={savingLeave || !leaveForm.from_date || !leaveForm.to_date || !leaveForm.reason}
                      onClick={() => void handleRequestLeave()}
                      variant="contained"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Request Leave
                    </Button>
                  </Stack>
                </CardContent>
                <Divider />
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>From</TableCell>
                        <TableCell>To</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaves.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4}>No leave requests found</TableCell>
                        </TableRow>
                      ) : (
                        leaves.map((leave) => (
                          <TableRow hover key={leave.id}>
                            <TableCell>{leave.from_date}</TableCell>
                            <TableCell>{leave.to_date}</TableCell>
                            <TableCell>{leave.reason}</TableCell>
                            <TableCell>
                              <TextField
                                onChange={(event) => void handleLeaveStatusChange(leave.id, event.target.value)}
                                select
                                size="small"
                                value={leave.status}
                              >
                                {LEAVE_STATUS_OPTIONS.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>

              <Card>
                <CardHeader title="Attendance History" />
                <Divider />
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check In Location</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell>Check Out Location</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5}>No attendance records found</TableCell>
                        </TableRow>
                      ) : (
                        attendance.map((record) => (
                          <TableRow hover key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{new Date(record.check_in_time).toLocaleTimeString()}</TableCell>
                            <TableCell>
                              {formatLocation(record.check_in_address, record.check_in_latitude, record.check_in_longitude)}
                            </TableCell>
                            <TableCell>
                              {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}
                            </TableCell>
                            <TableCell>
                              {formatLocation(record.check_out_address, record.check_out_latitude, record.check_out_longitude)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>

              <Card>
                <CardHeader title="Salary History" />
                <Divider />
                <CardContent>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Amount"
                      onChange={(event) => setSalaryForm((current) => ({ ...current, amount: event.target.value }))}
                      type="number"
                      value={salaryForm.amount}
                    />
                    <TextField
                      label="Effective Date"
                      onChange={(event) =>
                        setSalaryForm((current) => ({ ...current, effective_date: event.target.value }))
                      }
                      slotProps={{ inputLabel: { shrink: true } }}
                      type="date"
                      value={salaryForm.effective_date}
                    />
                    <TextField
                      fullWidth
                      label="Note"
                      onChange={(event) => setSalaryForm((current) => ({ ...current, note: event.target.value }))}
                      value={salaryForm.note}
                    />
                    <Button
                      disabled={savingSalary || !salaryForm.amount || !salaryForm.effective_date}
                      onClick={() => void handleAddSalary()}
                      variant="contained"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Add Entry
                    </Button>
                  </Stack>
                </CardContent>
                <Divider />
                <Box sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 500 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Effective Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {salaries.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>No salary records found</TableCell>
                        </TableRow>
                      ) : (
                        salaries.map((salary) => (
                          <TableRow hover key={salary.id}>
                            <TableCell>{salary.effective_date}</TableCell>
                            <TableCell>₹{salary.amount}</TableCell>
                            <TableCell>{salary.note ?? '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Card>
            </>
          ) : null}
        </Stack>
      ) : (
        <Typography color="text.secondary">User not found</Typography>
      )}
    </Stack>
  );
}
