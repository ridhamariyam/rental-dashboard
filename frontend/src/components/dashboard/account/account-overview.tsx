'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { api } from '@/lib/api';
import { useUser } from '@/hooks/use-user';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { MyAttendance } from '@/components/dashboard/account/my-attendance';
import type { CurrentUserProfile } from '@/components/dashboard/account/types';

export function AccountOverview(): React.JSX.Element {
  const { user: sessionUser } = useUser();
  const [profile, setProfile] = React.useState<CurrentUserProfile | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const loadProfile = React.useCallback(async (userId: string) => {
    try {
      const data = await api.get<CurrentUserProfile>(`/users/${userId}`);
      setProfile(data);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to load your profile');
    }
  }, []);

  React.useEffect(() => {
    if (sessionUser?.id) {
      void loadProfile(sessionUser.id);
    }
  }, [sessionUser, loadProfile]);

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!profile) {
    return <Typography color="text.secondary">Loading...</Typography>;
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ lg: 4, md: 6, xs: 12 }}>
        <AccountInfo user={profile} />
      </Grid>
      <Grid size={{ lg: 8, md: 6, xs: 12 }}>
        <AccountDetailsForm onSaved={setProfile} user={profile} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <MyAttendance />
      </Grid>
    </Grid>
  );
}
