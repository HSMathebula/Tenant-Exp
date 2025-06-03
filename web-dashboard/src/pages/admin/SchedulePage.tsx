import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

const SchedulePage: React.FC = () => {
  return (
    <BaseLayout title="Schedule">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Schedule Page</Typography>
        <Typography variant="body1">This is a placeholder for the Schedule page.</Typography>
      </Box>
    </BaseLayout>
  );
};

export default SchedulePage; 