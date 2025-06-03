import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

const AnnouncementsPage: React.FC = () => {
  return (
    <BaseLayout title="Announcements">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Announcements Page</Typography>
        <Typography variant="body1">This is a placeholder for the Announcements page.</Typography>
      </Box>
    </BaseLayout>
  );
};

export default AnnouncementsPage; 