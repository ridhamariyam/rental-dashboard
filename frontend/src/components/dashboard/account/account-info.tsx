import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { CurrentUserProfile } from '@/components/dashboard/account/types';

export interface AccountInfoProps {
  user: CurrentUserProfile;
}

export function AccountInfo({ user }: AccountInfoProps): React.JSX.Element {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ height: '80px', width: '80px' }}>
            {user.first_name.charAt(0).toUpperCase()}
            {user.last_name.charAt(0).toUpperCase()}
          </Avatar>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              @{user.username}
            </Typography>
            <Chip label={user.role} size="small" sx={{ alignSelf: 'center' }} />
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="body2">Email: {user.email}</Typography>
          <Typography variant="body2">Mobile Number: {user.phone}</Typography>
          <Typography variant="body2">Address: {user.address ?? '-'}</Typography>
          <Typography variant="body2">Shop: {user.shop?.name ?? '-'}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
