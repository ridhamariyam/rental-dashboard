'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { api } from '@/lib/api';
import { useUser } from '@/hooks/use-user';

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

function formatLocation(address?: string | null, lat?: number | null, lng?: number | null): string {
  if (address) {
    return address;
  }

  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return '-';
  }

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10_000 });
  });
}

export function MyAttendance(): React.JSX.Element | null {
  const { user } = useUser();
  const [records, setRecords] = React.useState<AttendanceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadAttendance = React.useCallback(async () => {
    setLoading(true);

    try {
      const data = await api.get<AttendanceRow[]>('/attendance/me');
      setRecords(Array.isArray(data) ? data : []);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user?.role === 'staff') {
      void loadAttendance();
    }
  }, [user, loadAttendance]);

  if (user?.role !== 'staff') {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayRecord = records.find((record) => record.date === today);
  const canCheckIn = !todayRecord;
  const canCheckOut = Boolean(todayRecord && !todayRecord.check_out_time);

  const handleMark = async (action: 'check-in' | 'check-out'): Promise<void> => {
    setSubmitting(true);
    setError(null);

    try {
      const position = await getCurrentPosition();

      await api.post(`/attendance/${action}`, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      await loadAttendance();
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader title="Attendance" />
      <Divider />
      <CardContent>
        {error ? (
          <Alert onClose={() => setError(null)} severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack direction="row" spacing={2}>
          <Button disabled={submitting || !canCheckIn} onClick={() => void handleMark('check-in')} variant="contained">
            Check In
          </Button>
          <Button
            color="secondary"
            disabled={submitting || !canCheckOut}
            onClick={() => void handleMark('check-out')}
            variant="contained"
          >
            Check Out
          </Button>
        </Stack>
      </CardContent>
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 600 }}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No attendance records yet</TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
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
  );
}
