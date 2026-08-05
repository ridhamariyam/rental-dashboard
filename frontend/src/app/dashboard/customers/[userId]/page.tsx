import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { UserDetail } from '@/components/dashboard/resource/user-detail';

export const metadata = { title: `User Details | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { userId } = await params;

  return <UserDetail userId={userId} />;
}
