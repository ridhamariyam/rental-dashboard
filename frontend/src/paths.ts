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
  },
  errors: { notFound: '/errors/not-found' },
} as const;
