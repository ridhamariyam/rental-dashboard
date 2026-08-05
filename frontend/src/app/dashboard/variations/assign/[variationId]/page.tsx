import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { AssignVariation } from '@/components/dashboard/resource/assign-variation';

export const metadata = { title: `Assign Variation | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  params: Promise<{ variationId: string }>;
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { variationId } = await params;

  return <AssignVariation variationId={variationId} />;
}
