export interface DashboardBooking {
  id: string;
  booking_number: string;
  created_at: string;
  from_date: string;
  to_date: string;
  total_amount: number;
  status: string;
  user?: { first_name?: string; last_name?: string };
  product?: { name?: string };
  variation?: { color?: string | null; size?: string | null; barcode?: string };
}
