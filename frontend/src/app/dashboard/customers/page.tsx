import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Customers | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'role', label: 'Role' },
        { key: 'shop.name', label: 'Shop' },
      ]}
      createEndpoint="/users/register"
      defaultValues={{
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        role: 'customer',
        shop_id: '',
      }}
      endpoint="/users"
      fields={[
        { key: 'first_name', label: 'First Name', required: true },
        { key: 'last_name', label: 'Last Name', required: true },
        { key: 'username', label: 'Username', required: true },
        { key: 'email', label: 'Email', required: true, type: 'email' },
        { key: 'phone', label: 'Phone', required: true },
        { key: 'password', label: 'Password', required: true, type: 'password' },
        {
          key: 'shop_id',
          label: 'Shop',
          type: 'select',
          optionsEndpoint: '/shops',
          optionLabelKey: 'name',
          optionValueKey: 'id',
        },
        {
          key: 'role',
          label: 'Role',
          required: true,
          type: 'select',
          options: [
            { label: 'Customer', value: 'customer' },
            { label: 'Staff', value: 'staff' },
            { label: 'Admin', value: 'admin' },
          ],
        },
      ]}
      title="Customers"
    />
  );
}
