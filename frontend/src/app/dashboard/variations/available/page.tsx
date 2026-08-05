import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { AvailableVariations } from '@/components/dashboard/resource/available-variations';

export const metadata = { title: `Available Stock | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <AvailableVariations />;
}
