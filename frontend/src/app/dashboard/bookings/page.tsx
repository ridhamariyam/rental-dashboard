import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Bookings | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'booking_number', label: 'Booking No.' },
        { key: 'user_id', label: 'User ID' },
        { key: 'product_id', label: 'Product ID' },
        { key: 'from_date', label: 'From' },
        { key: 'to_date', label: 'To' },
        { key: 'status', label: 'Status' },
      ]}
      defaultValues={{
        user_id: '',
        shop_id: '',
        product_id: '',
        from_date: '',
        to_date: '',
        status: 'pending',
      }}
      endpoint="/bookings"
      fields={[
        { key: 'user_id', label: 'User ID', required: true },
        { key: 'shop_id', label: 'Shop ID', required: true },
        { key: 'product_id', label: 'Product ID', required: true },
        { key: 'from_date', label: 'From Date', required: true, type: 'date' },
        { key: 'to_date', label: 'To Date', required: true, type: 'date' },
        {
          key: 'status',
          label: 'Status',
          required: true,
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Picked', value: 'picked' },
            { label: 'Returned', value: 'returned' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
        },
      ]}
      title="Bookings"
    />
  );
}
