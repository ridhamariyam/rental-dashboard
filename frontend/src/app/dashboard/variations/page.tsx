import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Variations | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'product.name', label: 'Product' },
        { key: 'color', label: 'Color' },
        { key: 'size', label: 'Size' },
        { key: 'rent_price', label: 'Rent Price' },
        { key: 'security_deposit', label: 'Deposit' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'sku', label: 'SKU' },
        { key: 'barcode', label: 'Barcode' },
        { key: 'barcode_image', label: 'Barcode Image', displayAs: 'image' },
        { key: 'gallery', label: 'Gallery', displayAs: 'gallery-count' },
        {
          key: 'is_available',
          label: 'Status',
          displayAs: 'boolean-toggle',
          trueLabel: 'Available',
          falseLabel: 'Not Available',
        },
      ]}
      defaultValues={{
        product_id: '',
        color: '',
        size: '',
        rent_price: 0,
        security_deposit: 0,
        quantity: 1,
        is_available: true,
        gallery: [],
      }}
      endpoint="/variations"
      fields={[
        {
          key: 'product_id',
          label: 'Product',
          required: true,
          optionsEndpoint: '/products',
          optionLabelKey: 'name',
          optionValueKey: 'id',
        },
        { key: 'color', label: 'Color' },
        { key: 'size', label: 'Size' },
        { key: 'rent_price', label: 'Rent Price', required: true, type: 'number' },
        { key: 'security_deposit', label: 'Security Deposit', required: true, type: 'number' },
        { key: 'quantity', label: 'Quantity', required: true, type: 'number' },
        {
          key: 'is_available',
          label: 'Available',
          type: 'select',
          options: [
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ],
        },
        { key: 'gallery', label: 'Gallery', type: 'file', accept: 'image/*', multiple: true },
      ]}
      title="Variations"
    />
  );
}
