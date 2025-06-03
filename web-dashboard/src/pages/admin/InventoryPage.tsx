import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

const InventoryPage: React.FC = () => {
  return (
    <BaseLayout title="Inventory">
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Inventory Page</Typography>
        <Typography variant="body1">This is a placeholder for the Inventory page.</Typography>
      </Box>
    </BaseLayout>
  );
};

export default InventoryPage; 