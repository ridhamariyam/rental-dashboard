'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { API_BASE_URL, api } from '@/lib/api';
import { variationAssignPath } from '@/paths';

interface AvailableVariationRow {
  id: string;
  product?: { name?: string };
  color?: string | null;
  size?: string | null;
  quantity: number;
  rent_price: number;
  security_deposit: number;
  is_available: boolean;
  barcode: string;
  barcode_image?: string | null;
  gallery?: string[] | null;
}

const COLUMN_COUNT = 9;
const GALLERY_PREVIEW_LIMIT = 3;

function resolveImageUrl(path: string): string {
  return path.startsWith('http://') || path.startsWith('https://') ? path : `${API_BASE_URL}${path}`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { currency: 'INR', style: 'currency' }).format(value);
}

export function AvailableVariations(): React.JSX.Element {
  const router = useRouter();
  const [rows, setRows] = React.useState<AvailableVariationRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadRows(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const data = await api.get<AvailableVariationRow[]>('/variations');

        if (isMounted) {
          setRows(Array.isArray(data) ? data.filter((row) => row.is_available) : []);
        }
      } catch (error_) {
        if (isMounted) {
          setError(error_ instanceof Error ? error_.message : 'Unable to load available variations');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadRows();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Available Stock</Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Color</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Rent Price</TableCell>
                <TableCell>Deposite</TableCell>
                <TableCell>Images</TableCell>
                <TableCell>Barcode</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT}>Loading...</TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMN_COUNT}>No available variations found</TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const gallery = Array.isArray(row.gallery) ? row.gallery : [];
                  const previewImages = gallery.slice(0, GALLERY_PREVIEW_LIMIT);
                  const remainingCount = gallery.length - previewImages.length;

                  return (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.product?.name ?? '-'}</TableCell>
                      <TableCell>{row.color ?? '-'}</TableCell>
                      <TableCell>{row.size ?? '-'}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{formatCurrency(row.rent_price)}</TableCell>
                      <TableCell>{formatCurrency(row.security_deposit)}</TableCell>
                      <TableCell>
                        <Stack alignItems="center" direction="row" spacing={1}>
                          {previewImages.length === 0 ? (
                            <Typography color="text.secondary" variant="caption">
                              No images
                            </Typography>
                          ) : (
                            previewImages.map((image, index) => (
                              <Box
                                alt={`${row.product?.name ?? 'Product'} image ${index + 1}`}
                                component="img"
                                key={image}
                                src={resolveImageUrl(image)}
                                sx={{ borderRadius: 1, height: 40, objectFit: 'cover', width: 40 }}
                              />
                            ))
                          )}
                          {remainingCount > 0 ? <Chip label={`+${remainingCount}`} size="small" /> : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack alignItems="center" direction="row" spacing={1}>
                          {row.barcode_image ? (
                            <Box
                              alt="Barcode"
                              component="img"
                              src={resolveImageUrl(row.barcode_image)}
                              sx={{ height: 32, objectFit: 'contain', width: 80 }}
                            />
                          ) : null}
                          <Typography variant="body2">{row.barcode}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          onClick={() => router.push(variationAssignPath(row.id))}
                          size="small"
                          variant="contained"
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider />
      </Card>
    </Stack>
  );
}
