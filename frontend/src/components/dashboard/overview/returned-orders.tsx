'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import type { DashboardBooking } from '@/components/dashboard/overview/types';

export interface ReturnedOrdersProps {
  orders: DashboardBooking[];
}

export function ReturnedOrders({ orders }: ReturnedOrdersProps): React.JSX.Element {
  const router = useRouter();

  return (
    <Card>
      <CardHeader title="Returned Products" />
      <Divider />
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>Booking No.</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Barcode</TableCell>
              <TableCell>Returned Period</TableCell>
              <TableCell>Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>No returned products</TableCell>
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
                  <TableCell>
                    {order.user?.first_name} {order.user?.last_name}
                  </TableCell>
                  <TableCell>{order.product?.name ?? '-'}</TableCell>
                  <TableCell>{order.variation?.color ?? '-'}</TableCell>
                  <TableCell>{order.variation?.size ?? '-'}</TableCell>
                  <TableCell>{order.variation?.barcode ?? '-'}</TableCell>
                  <TableCell>
                    {order.from_date} - {order.to_date}
                  </TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
}
