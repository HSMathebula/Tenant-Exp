import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

const ReportsPage: React.FC = () => {
  return (
    <BaseLayout title="Reports">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Reports Page</Typography>
        <Typography variant="body1">This is a placeholder for the Reports page.</Typography>
      </Box>
    </BaseLayout>
  );
};

export default ReportsPage; 