export function variationAssignPath(variationId: string): string {
  return `/dashboard/variations/assign/${variationId}`;
}

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    account: '/dashboard/account',
    bookings: '/dashboard/bookings',
    categories: '/dashboard/categories',
    customers: '/dashboard/customers',
    integrations: '/dashboard/integrations',
    products: '/dashboard/products',
    settings: '/dashboard/settings',
    shops: '/dashboard/shops',
    variations: '/dashboard/variations',
    availableVariations: '/dashboard/variations/available',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
