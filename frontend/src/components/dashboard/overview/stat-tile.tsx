import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export interface StatTileProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  sx?: SxProps;
}

export function StatTile({ label, value, icon, sx }: StatTileProps): React.JSX.Element {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack direction="row" spacing={3} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              {label}
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
