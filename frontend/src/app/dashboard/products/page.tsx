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
        { key: 'image', label: 'Image', displayAs: 'image' },
        { key: 'shop.name', label: 'Shop' },
        { key: 'category.name', label: 'Category' },
      ]}
      defaultValues={{
        shop_id: '',
        category_id: '',
        name: '',
        description: '',
        image: '',
      }}
      endpoint="/products"
      fields={[
        {
          key: 'shop_id',
          label: 'Shop',
          required: true,
          optionsEndpoint: '/shops',
          optionLabelKey: 'name',
          optionValueKey: 'id',
        },
        {
          key: 'category_id',
          label: 'Category',
          required: true,
          optionsEndpoint: '/categories',
          optionLabelKey: 'name',
          optionValueKey: 'id',
        },
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'image', label: 'Image', type: 'file', accept: 'image/*' },
      ]}
      title="Products"
    />
  );
}
