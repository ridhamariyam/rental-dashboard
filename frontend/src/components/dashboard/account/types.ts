export interface CurrentUserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
  address?: string | null;
  role: string;
  shop_id?: string | null;
  shop?: { name?: string } | null;
}
