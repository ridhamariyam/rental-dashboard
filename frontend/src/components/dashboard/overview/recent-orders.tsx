'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { DashboardBooking } from '@/components/dashboard/overview/types';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  picked: 'info',
  returned: 'success',
  cancelled: 'error',
};

export interface RecentOrdersProps {
  orders: DashboardBooking[];
  title?: string;
}

export function RecentOrders({ orders, title = 'Last 10 Orders' }: RecentOrdersProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Card>
      <CardHeader title={title} />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Booking No.</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No orders found</TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow hover key={order.id} onClick={() => router.push(`/dashboard/bookings/${order.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell>{order.booking_number}</TableCell>
                  <TableCell>
                    {order.user?.first_name} {order.user?.last_name}
                  </TableCell>
                  <TableCell>{order.product?.name ?? '-'}</TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip color={STATUS_COLOR[order.status] ?? 'default'} label={order.status} size="small" />
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
