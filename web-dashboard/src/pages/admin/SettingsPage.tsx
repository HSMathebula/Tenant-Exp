import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

const SettingsPage: React.FC = () => {
  return (
    <BaseLayout title="Settings">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Settings Page</Typography>
        <Typography variant="body1">This is a placeholder for the Settings page.</Typography>
      </Box>
    </BaseLayout>
  );
};

export default SettingsPage; 