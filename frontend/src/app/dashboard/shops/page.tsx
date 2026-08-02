import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Shops | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'address', label: 'Address' },
      ]}
      defaultValues={{ name: '', email: '', phone: '', address: '', description: '', logo: '' }}
      endpoint="/shops"
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'email', label: 'Email', required: true, type: 'email' },
        { key: 'phone', label: 'Phone', required: true },
        { key: 'address', label: 'Address', required: true, type: 'textarea' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'logo', label: 'Logo URL' },
      ]}
      title="Shops"
    />
  );
}
