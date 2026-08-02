import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { ResourceManager } from '@/components/dashboard/resource/resource-manager';

export const metadata = { title: `Categories | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <ResourceManager
      columns={[
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
      ]}
      defaultValues={{ name: '', description: '' }}
      endpoint="/categories"
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
      ]}
      title="Categories"
    />
  );
}
