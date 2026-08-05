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
        { key: 'user.first_name', label: 'Customer First Name' },
        { key: 'created_by.first_name', label: 'Booked By' },
        { key: 'security_deposit', label: 'Security Deposit' },
        { key: 'product.name', label: 'Product' },
        { key: 'variation.color', label: 'Color' },
        { key: 'variation.size', label: 'Size' },
        { key: 'from_date', label: 'From' },
        { key: 'to_date', label: 'To' },
        { key: 'total_amount', label: 'Total Amount' },
        { key: 'status', label: 'Status' },
        { key: 'variation.barcode', label: 'Barcode', displayAs: 'link' },
      ]}
      defaultValues={{
        variation_id: '',
        from_date: '',
        to_date: '',
        security_deposit: 0,
        status: 'pending',
      }}
      endpoint="/bookings"
      fields={[
        { key: 'user.first_name', label: 'Customer First Name', readOnly: true },
        { key: 'user.last_name', label: 'Customer Last Name', readOnly: true },
        { key: 'shop.name', label: 'Shop', readOnly: true },
        { key: 'created_by.first_name', label: 'Booked By', readOnly: true },
        {
          key: 'variation_id',
          label: 'Variation',
          required: true,
          optionsEndpoint: '/variations',
          optionLabelKeys: ['product.name', 'color', 'size', 'barcode'],
          optionValueKey: 'id',
        },
        { key: 'from_date', label: 'From Date', required: true, type: 'date' },
        { key: 'to_date', label: 'To Date', required: true, type: 'date' },
        { key: 'security_deposit', label: 'Security Deposit', required: true, type: 'number' },
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
      hideAddButton
      rowLinkTemplate="/dashboard/bookings/{id}"
      searchableKeys={['user.first_name', 'user.last_name', 'variation.barcode', 'booking_number']}
      searchLabel="Search by customer, barcode, or booking no."
      title="Bookings"
    />
  );
}
