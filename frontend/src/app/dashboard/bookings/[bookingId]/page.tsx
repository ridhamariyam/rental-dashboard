import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import { BookingDetail } from '@/components/dashboard/resource/booking-detail';

export const metadata = { title: `Order Details | Dashboard | ${config.site.name}` } satisfies Metadata;

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { bookingId } = await params;

  return <BookingDetail bookingId={bookingId} />;
}
