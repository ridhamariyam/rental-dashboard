import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Admin@12345', href: paths.dashboard.customers, icon: 'users' },
  { key: 'categories', title: 'Categories', href: paths.dashboard.categories, icon: 'tag' },
  { key: 'products', title: 'Products', href: paths.dashboard.products, icon: 'package' },
  { key: 'variations', title: 'Variations', href: paths.dashboard.variations, icon: 'stack' },
  {
    key: 'available-variations',
    title: 'Available Stock',
    href: paths.dashboard.availableVariations,
    icon: 'check-circle',
  },
  { key: 'shops', title: 'Shops', href: paths.dashboard.shops, icon: 'storefront' },
  { key: 'bookings', title: 'Bookings', href: paths.dashboard.bookings, icon: 'calendar-check' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];
