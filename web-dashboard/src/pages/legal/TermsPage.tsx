import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { BaseLayout } from '../../components/layouts/BaseLayout';

export const TermsPage: React.FC = () => {
  return (
    <BaseLayout title="Terms and Conditions">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Terms and Conditions
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography paragraph>
            By accessing and using this tenant experience platform, you agree to be bound by these Terms and Conditions.
            If you do not agree to these terms, please do not use our services.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. User Accounts
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Account Creation"
                secondary="You must provide accurate and complete information when creating your account. You are responsible for maintaining the confidentiality of your account credentials."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Account Security"
                secondary="You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            3. User Responsibilities
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Compliance"
                secondary="You agree to comply with all applicable laws and regulations while using our platform."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Content"
                secondary="You are responsible for all content you post or submit through the platform. Do not post illegal, harmful, or inappropriate content."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            4. Service Usage
          </Typography>
          <Typography paragraph>
            Our platform provides services for managing tenant-related matters, including but not limited to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Maintenance requests and tracking" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communication with property management" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Document management" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Payment processing" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            5. Privacy and Data Protection
          </Typography>
          <Typography paragraph>
            We are committed to protecting your privacy. Our collection and use of your personal information is governed by our Privacy Policy.
            By using our services, you consent to such processing and warrant that all data provided by you is accurate.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Intellectual Property
          </Typography>
          <Typography paragraph>
            All content, features, and functionality of the platform are owned by us and are protected by international copyright,
            trademark, and other intellectual property laws.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Limitation of Liability
          </Typography>
          <Typography paragraph>
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use
            of or inability to use the platform.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Changes to Terms
          </Typography>
          <Typography paragraph>
            We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through
            the platform. Continued use of the platform after such modifications constitutes acceptance of the updated terms.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Contact Information
          </Typography>
          <Typography paragraph>
            For any questions regarding these Terms and Conditions, please contact us at:
            <Box component="p" sx={{ mt: 1 }}>
              Email: support@tenantexperience.com<br />
              Phone: (555) 123-4567<br />
              Address: 123 Property Management Way, Suite 100, City, State 12345
            </Box>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            By using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </Typography>
        </Paper>
      </Container>
    </BaseLayout>
  );
};

export default TermsPage; 