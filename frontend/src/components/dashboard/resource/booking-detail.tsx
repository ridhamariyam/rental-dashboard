'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { API_BASE_URL, api } from '@/lib/api';
import { paths } from '@/paths';

interface BookingDetailData {
  id: string;
  booking_number: string;
  from_date: string;
  to_date: string;
  total_days: number;
  rent_amount: number;
  security_deposit: number;
  total_amount: number;
  status: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string | null;
  };
  shop?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  product?: {
    name?: string;
    description?: string | null;
    category?: {
      name?: string;
      description?: string | null;
    };
  };
  variation?: {
    color?: string | null;
    size?: string | null;
    sku?: string;
    barcode?: string;
    barcode_image?: string | null;
    rent_price?: number;
    security_deposit?: number;
    quantity?: number;
    is_available?: boolean;
    gallery?: string[] | null;
  };
}

function resolveImageUrl(path: string): string {
  return path.startsWith('http://') || path.startsWith('https://') ? path : `${API_BASE_URL}${path}`;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }): React.JSX.Element {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ textAlign: 'right' }} variant="body2">
        {value ?? '-'}
      </Typography>
    </Stack>
  );
}

interface BookingDetailProps {
  bookingId: string;
}

export function BookingDetail({ bookingId }: BookingDetailProps): React.JSX.Element {
  const router = useRouter();
  const [booking, setBooking] = React.useState<BookingDetailData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadBooking(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<BookingDetailData>(`/bookings/${bookingId}`);

        if (isMounted) {
          setBooking(data);
        }
      } catch (error_) {
        if (isMounted) {
          setError(error_ instanceof Error ? error_.message : 'Unable to load booking details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      isMounted = false;
    };
  }, [bookingId]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <IconButton onClick={() => router.push(paths.dashboard.bookings)}>
          <ArrowLeftIcon fontSize="var(--icon-fontSize-md)" />
        </IconButton>
        <Typography variant="h4">Order Details</Typography>
      </Stack>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : booking ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader
                action={<Chip label={booking.status} size="small" />}
                title={`Booking ${booking.booking_number}`}
              />
              <Divider />
              <CardContent>
                <Stack spacing={1.5}>
                  <DetailRow label="From Date" value={booking.from_date} />
                  <DetailRow label="To Date" value={booking.to_date} />
                  <DetailRow label="Total Days" value={booking.total_days} />
                  <DetailRow label="Rent Amount" value={`₹${booking.rent_amount}`} />
                  <DetailRow label="Security Deposit" value={`₹${booking.security_deposit}`} />
                  <DetailRow label="Total Amount" value={`₹${booking.total_amount}`} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Customer" />
              <Divider />
              <CardContent>
                <Stack spacing={1.5}>
                  <DetailRow
                    label="Name"
                    value={`${booking.user?.first_name ?? ''} ${booking.user?.last_name ?? ''}`.trim() || '-'}
                  />
                  <DetailRow label="Email" value={booking.user?.email} />
                  <DetailRow label="Mobile Number" value={booking.user?.phone} />
                  <DetailRow label="Address" value={booking.user?.address} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Shop" />
              <Divider />
              <CardContent>
                <Stack spacing={1.5}>
                  <DetailRow label="Name" value={booking.shop?.name} />
                  <DetailRow label="Email" value={booking.shop?.email} />
                  <DetailRow label="Phone" value={booking.shop?.phone} />
                  <DetailRow label="Address" value={booking.shop?.address} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardHeader title="Product & Category" />
              <Divider />
              <CardContent>
                <Stack spacing={1.5}>
                  <DetailRow label="Product" value={booking.product?.name} />
                  <DetailRow label="Description" value={booking.product?.description} />
                  <DetailRow label="Category" value={booking.product?.category?.name} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Card>
              <CardHeader title="Variation" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1.5}>
                      <DetailRow label="Color" value={booking.variation?.color} />
                      <DetailRow label="Size" value={booking.variation?.size} />
                      <DetailRow label="SKU" value={booking.variation?.sku} />
                      <DetailRow label="Barcode" value={booking.variation?.barcode} />
                      <DetailRow label="Rent Price" value={`₹${booking.variation?.rent_price ?? 0}`} />
                      <DetailRow label="Variation Deposit" value={`₹${booking.variation?.security_deposit ?? 0}`} />
                      <DetailRow label="Quantity Left" value={booking.variation?.quantity} />
                      <DetailRow label="Available" value={booking.variation?.is_available ? 'Yes' : 'No'} />
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                      <Typography color="text.secondary" variant="body2">
                        Barcode Image
                      </Typography>
                      {booking.variation?.barcode_image ? (
                        <Box
                          alt="Barcode"
                          component="img"
                          src={resolveImageUrl(booking.variation.barcode_image)}
                          sx={{ height: 60, objectFit: 'contain', width: 160 }}
                        />
                      ) : (
                        <Typography color="text.secondary" variant="caption">
                          No barcode image
                        </Typography>
                      )}
                      <Typography color="text.secondary" sx={{ mt: 2 }} variant="body2">
                        Gallery
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {booking.variation?.gallery && booking.variation.gallery.length > 0 ? (
                          booking.variation.gallery.map((image, index) => (
                            <Box
                              alt={`Variation image ${index + 1}`}
                              component="img"
                              key={image}
                              src={resolveImageUrl(image)}
                              sx={{ borderRadius: 1, height: 64, objectFit: 'cover', width: 64 }}
                            />
                          ))
                        ) : (
                          <Typography color="text.secondary" variant="caption">
                            No images
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography color="text.secondary">Booking not found</Typography>
      )}
    </Stack>
  );
}
