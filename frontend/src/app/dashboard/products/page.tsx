import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Products | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'rent_price', label: 'Rent Price' },
        { key: 'security_deposit', label: 'Deposit' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'sku', label: 'SKU' },
      ]}
      defaultValues={{
        shop_id: '',
        category_id: '',
        name: '',
        description: '',
        image: '',
        gallery: [],
        rent_price: 0,
        security_deposit: 0,
        quantity: 1,
        available_quantity: 1,
      }}
      endpoint="/products"
      fields={[
        { key: 'shop_id', label: 'Shop ID', required: true },
        { key: 'category_id', label: 'Category ID', required: true },
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'image', label: 'Image URL' },
        { key: 'rent_price', label: 'Rent Price', required: true, type: 'number' },
        { key: 'security_deposit', label: 'Security Deposit', required: true, type: 'number' },
        { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
        { key: 'available_quantity', label: 'Available Quantity', required: true, type: 'number', createOnly: true },
      ]}
      title="Products"
    />
  );
}
