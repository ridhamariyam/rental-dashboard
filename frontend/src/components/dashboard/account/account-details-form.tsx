'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import { api } from '@/lib/api';
import type { CurrentUserProfile } from '@/components/dashboard/account/types';

export interface AccountDetailsFormProps {
  user: CurrentUserProfile;
  onSaved: (user: CurrentUserProfile) => void;
}

export function AccountDetailsForm({ user, onSaved }: AccountDetailsFormProps): React.JSX.Element {
  const [firstName, setFirstName] = React.useState(user.first_name);
  const [lastName, setLastName] = React.useState(user.last_name);
  const [email, setEmail] = React.useState(user.email);
  const [phone, setPhone] = React.useState(user.phone);
  const [address, setAddress] = React.useState(user.address ?? '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await api.put<CurrentUserProfile>(`/users/${user.id}`, {
        first_name: firstName,
        last_name: lastName,
        username: user.username,
        email,
        phone,
        address,
        role: user.role,
        shop_id: user.shop_id ?? null,
      });

      onSaved(updated);
      setSuccess(true);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unable to save details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <Card>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          {error ? (
            <Alert onClose={() => setError(null)} severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          {success ? (
            <Alert onClose={() => setSuccess(false)} severity="success" sx={{ mb: 2 }}>
              Details saved
            </Alert>
          ) : null}
          <Grid container spacing={3}>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>First name</InputLabel>
                <OutlinedInput
                  label="First name"
                  name="firstName"
                  onChange={(event) => setFirstName(event.target.value)}
                  value={firstName}
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Last name</InputLabel>
                <OutlinedInput
                  label="Last name"
                  name="lastName"
                  onChange={(event) => setLastName(event.target.value)}
                  value={lastName}
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Email address</InputLabel>
                <OutlinedInput
                  label="Email address"
                  name="email"
                  onChange={(event) => setEmail(event.target.value)}
                  value={email}
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Phone number</InputLabel>
                <OutlinedInput
                  label="Phone number"
                  name="phone"
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  value={phone}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Address</InputLabel>
                <OutlinedInput
                  label="Address"
                  multiline
                  name="address"
                  onChange={(event) => setAddress(event.target.value)}
                  rows={2}
                  value={address}
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button disabled={saving} type="submit" variant="contained">
            Save details
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
