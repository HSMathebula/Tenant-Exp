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

export const PrivacyPage: React.FC = () => {
  return (
    <BaseLayout title="Privacy Policy">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Information We Collect
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Personal Information"
                secondary="Name, email address, phone number, address, and other contact information you provide during registration and account management."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Property Information"
                secondary="Details about your rental property, lease information, and maintenance history."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Usage Data"
                secondary="Information about how you use our platform, including maintenance requests, communications, and payment history."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            2. How We Use Your Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Service Provision"
                secondary="To provide and maintain our services, process your requests, and manage your account."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Communication"
                secondary="To send you important updates, respond to your inquiries, and provide customer support."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Improvement"
                secondary="To analyze usage patterns and improve our platform's functionality and user experience."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            3. Information Sharing
          </Typography>
          <Typography paragraph>
            We may share your information with:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Property Management"
                secondary="Your property management team to handle maintenance requests and other property-related matters."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Service Providers"
                secondary="Third-party vendors who assist in operating our platform and providing services."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Legal Requirements"
                secondary="When required by law or to protect our rights and safety."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            4. Data Security
          </Typography>
          <Typography paragraph>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Your Rights
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Access and Update"
                secondary="You can access and update your personal information through your account settings."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Data Deletion"
                secondary="You can request deletion of your account and associated data, subject to legal requirements."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Opt-Out"
                secondary="You can opt out of non-essential communications and data collection."
              />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            6. Cookies and Tracking
          </Typography>
          <Typography paragraph>
            We use cookies and similar tracking technologies to improve your experience on our platform. You can control cookie preferences
            through your browser settings.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Children's Privacy
          </Typography>
          <Typography paragraph>
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Changes to Privacy Policy
          </Typography>
          <Typography paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page
            and updating the "Last updated" date.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Contact Us
          </Typography>
          <Typography paragraph>
            If you have any questions about this Privacy Policy, please contact us at:
            <Box component="p" sx={{ mt: 1 }}>
              Email: privacy@tenantexperience.com<br />
              Phone: (555) 123-4567<br />
              Address: 123 Property Management Way, Suite 100, City, State 12345
            </Box>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            By using our platform, you acknowledge that you have read and understood this Privacy Policy.
          </Typography>
        </Paper>
      </Container>
    </BaseLayout>
  );
};

export default PrivacyPage; 