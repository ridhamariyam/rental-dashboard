'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { ReceiptIcon } from '@phosphor-icons/react/dist/ssr/Receipt';
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';

import { api } from '@/lib/api';
import { RecentOrders } from '@/components/dashboard/overview/recent-orders';
import { ReturnedOrders } from '@/components/dashboard/overview/returned-orders';
import { StatTile } from '@/components/dashboard/overview/stat-tile';
import type { DashboardBooking } from '@/components/dashboard/overview/types';

const RECENT_ORDERS_LIMIT = 10;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency', maximumFractionDigits: 0 }).format(
    value
  );
}

function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

function isSameMonth(dateA: Date, dateB: Date): boolean {
  return dateA.getFullYear() === dateB.getFullYear() && dateA.getMonth() === dateB.getMonth();
}

export function DashboardOverview(): React.JSX.Element {
  const [bookings, setBookings] = React.useState<DashboardBooking[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadBookings(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<DashboardBooking[]>('/bookings');
        if (isMounted) {
          setBookings(Array.isArray(data) ? data : []);
        }
      } catch (error_) {
        if (isMounted) {
          setError(error_ instanceof Error ? error_.message : 'Unable to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Typography color="text.secondary">Loading...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const now = new Date();

  const todaysBookings = bookings.filter((booking) => isSameDay(new Date(booking.created_at), now));
  const monthlyBookings = bookings.filter((booking) => isSameMonth(new Date(booking.created_at), now));
  const dailyRevenue = todaysBookings.reduce((sum, booking) => sum + booking.total_amount, 0);
  const monthlyRevenue = monthlyBookings.reduce((sum, booking) => sum + booking.total_amount, 0);

  const recentOrders = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, RECENT_ORDERS_LIMIT);

  const returnedOrders = bookings.filter((booking) => booking.status === 'returned');

  return (
    <Grid container spacing={3}>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <StatTile
          icon={<CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />}
          label="Daily Revenue"
          sx={{ height: '100%' }}
          value={formatCurrency(dailyRevenue)}
        />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <StatTile
          icon={<CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />}
          label="Monthly Revenue"
          sx={{ height: '100%' }}
          value={formatCurrency(monthlyRevenue)}
        />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <StatTile
          icon={<ShoppingCartIcon fontSize="var(--icon-fontSize-lg)" />}
          label="Orders Today"
          sx={{ height: '100%' }}
          value={String(todaysBookings.length)}
        />
      </Grid>
      <Grid size={{ lg: 3, sm: 6, xs: 12 }}>
        <StatTile
          icon={<ReceiptIcon fontSize="var(--icon-fontSize-lg)" />}
          label="Total Orders"
          sx={{ height: '100%' }}
          value={String(bookings.length)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RecentOrders orders={recentOrders} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <ReturnedOrders orders={returnedOrders} />
      </Grid>
    </Grid>
  );
}
