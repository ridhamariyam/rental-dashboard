'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/ssr/ArrowLeft';

import { API_BASE_URL, api } from '@/lib/api';
import { paths } from '@/paths';

const RETURNABLE_STATUSES = new Set(['confirmed', 'picked']);

const CONDITION_CHIP_COLOR: Record<string, 'error' | 'success' | 'info'> = {
  damaged: 'error',
  approved: 'success',
  clean: 'info',
};

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
  return_condition?: string | null;
  damage_notes?: string | null;
  return_image?: string | null;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string | null;
  };
  collected_by?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  } | null;
  created_by?: {
    first_name?: string;
    last_name?: string;
    role?: string;
  } | null;
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

  const [returnCondition, setReturnCondition] = React.useState('approved');
  const [damageNotes, setDamageNotes] = React.useState('');
  const [returnImage, setReturnImage] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const loadBooking = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get<BookingDetailData>(`/bookings/${bookingId}`);
      setBooking(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to load booking details');
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  React.useEffect(() => {
    void loadBooking();
  }, [loadBooking]);

  const canReturn = Boolean(booking && RETURNABLE_STATUSES.has(booking.status));

  async function handleReturnSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
      formData.append('return_condition', returnCondition);
      if (damageNotes.trim()) {
        formData.append('damage_notes', damageNotes.trim());
      }
      if (returnImage) {
        formData.append('image', returnImage);
      }

      const updated = await api.post<BookingDetailData>(`/bookings/${bookingId}/return`, formData);
      setBooking(updated);
      setDamageNotes('');
      setReturnImage(null);
    } catch (error_) {
      setSubmitError(error_ instanceof Error ? error_.message : 'Unable to record the return');
    } finally {
      setSubmitting(false);
    }
  }

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
                  <DetailRow
                    label="Booked By"
                    value={
                      booking.created_by
                        ? `${booking.created_by.first_name ?? ''} ${booking.created_by.last_name ?? ''}`.trim() || '-'
                        : '-'
                    }
                  />
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

          {booking.status === 'returned' ? (
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardHeader title="Return / Collection" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1.5}>
                        <DetailRow
                          label="Condition"
                          value={
                            booking.return_condition ? (
                              <Chip
                                color={CONDITION_CHIP_COLOR[booking.return_condition] ?? 'default'}
                                label={booking.return_condition}
                                size="small"
                              />
                            ) : (
                              '-'
                            )
                          }
                        />
                        <DetailRow label="Damage Notes" value={booking.damage_notes} />
                        <DetailRow
                          label="Collected By"
                          value={
                            booking.collected_by
                              ? `${booking.collected_by.first_name ?? ''} ${booking.collected_by.last_name ?? ''}`.trim()
                              : '-'
                          }
                        />
                      </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={1}>
                        <Typography color="text.secondary" variant="body2">
                          Return Image
                        </Typography>
                        {booking.return_image ? (
                          <Box
                            alt="Return condition"
                            component="img"
                            src={resolveImageUrl(booking.return_image)}
                            sx={{ borderRadius: 1, height: 120, objectFit: 'cover', width: 120 }}
                          />
                        ) : (
                          <Typography color="text.secondary" variant="caption">
                            No image uploaded
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ) : null}

          {canReturn ? (
            <Grid size={{ xs: 12 }}>
              <Card component="form" onSubmit={(event) => void handleReturnSubmit(event)}>
                <CardHeader title="Mark Product Returned" />
                <Divider />
                <CardContent>
                  <Stack spacing={2}>
                    {submitError ? <Alert severity="error">{submitError}</Alert> : null}
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          fullWidth
                          label="Condition"
                          onChange={(event) => setReturnCondition(event.target.value)}
                          select
                          value={returnCondition}
                        >
                          <MenuItem value="approved">Approved</MenuItem>
                          <MenuItem value="clean">Clean</MenuItem>
                          <MenuItem value="damaged">Damaged</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Damage Notes"
                          minRows={2}
                          multiline
                          onChange={(event) => setDamageNotes(event.target.value)}
                          placeholder="Describe the damage (if any)"
                          value={damageNotes}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                          <Button component="label" variant="outlined">
                            {returnImage ? 'Change Image' : 'Upload Image'}
                            <input
                              accept="image/*"
                              hidden
                              onChange={(event) => setReturnImage(event.target.files?.[0] ?? null)}
                              type="file"
                            />
                          </Button>
                          <Typography color="text.secondary" variant="caption">
                            {returnImage ? returnImage.name : 'No image selected'}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                    <Box>
                      <Button disabled={submitting} type="submit" variant="contained">
                        {submitting ? 'Saving...' : 'Mark as Returned'}
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ) : null}
        </Grid>
      ) : (
        <Typography color="text.secondary">Booking not found</Typography>
      )}
    </Stack>
  );
}
