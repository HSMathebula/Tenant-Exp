import React from 'react';
import { SnackbarProvider as NotistackProvider } from 'notistack';

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <NotistackProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {children}
    </NotistackProvider>
  );
}; 