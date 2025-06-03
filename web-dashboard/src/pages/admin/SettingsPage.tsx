import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  Save as SaveIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  IntegrationInstructions as IntegrationIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [settings, setSettings] = useState({
    general: {
      companyName: '',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      maintenanceAlerts: true,
      paymentReminders: true,
      newTicketAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      ipRestriction: false,
    },
    integrations: {
      paymentGateway: 'stripe',
      smsProvider: 'twilio',
      emailProvider: 'sendgrid',
      calendarSync: true,
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (section: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save settings
      setNotification({
        open: true,
        message: 'Settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Error saving settings',
        severity: 'error'
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" className="gradient-text" sx={{ flexGrow: 1 }}>
          Settings
        </Typography>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          className="hover-button"
        >
          Save Changes
        </Button>
      </Box>

      <Paper 
        sx={{ 
          width: '100%', 
          mb: 2,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}
        >
          <Tab icon={<PersonIcon />} label="Profile" />
          <Tab icon={<SettingsIcon />} label="General" />
          <Tab icon={<NotificationsIcon />} label="Notifications" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<IntegrationIcon />} label="Integrations" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
              <Card className="hover-card" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '3rem',
                      }}
                    >
                      {user?.firstName?.charAt(0) || 'U'}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' },
                      }}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography color="textSecondary">
                    {user?.email}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(66.67% - 16px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Profile Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={user?.firstName || ''}
                        disabled
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={user?.lastName || ''}
                        disabled
                      />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={user?.email || ''}
                        disabled
                      />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        Change Password
                      </Typography>
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        placeholder="Enter new password"
                      />
                    </Box>
                    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm new password"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Settings
                  </Typography>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={settings.general.companyName}
                    onChange={(e) => handleSettingChange('general', 'companyName', e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.general.timezone}
                      label="Timezone"
                      onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    >
                      <MenuItem value="UTC">UTC</MenuItem>
                      <MenuItem value="EST">EST</MenuItem>
                      <MenuItem value="PST">PST</MenuItem>
                      <MenuItem value="CST">CST</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Display Settings
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.general.dateFormat}
                      label="Date Format"
                      onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
                    >
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.general.currency}
                      label="Currency"
                      onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                    >
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                      <MenuItem value="GBP">GBP</MenuItem>
                      <MenuItem value="CAD">CAD</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Notification Preferences
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                    }
                    label="Email Notifications"
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                    }
                    label="SMS Notifications"
                    sx={{ mb: 2 }}
                  />
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Alert Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.maintenanceAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'maintenanceAlerts', e.target.checked)}
                      />
                    }
                    label="Maintenance Alerts"
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.paymentReminders}
                        onChange={(e) => handleSettingChange('notifications', 'paymentReminders', e.target.checked)}
                      />
                    }
                    label="Payment Reminders"
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.newTicketAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'newTicketAlerts', e.target.checked)}
                      />
                    }
                    label="New Ticket Alerts"
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Security Settings
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Two-Factor Authentication"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Session Timeout (minutes)"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Password Expiry (days)"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                  />
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Access Control
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.security.ipRestriction}
                        onChange={(e) => handleSettingChange('security', 'ipRestriction', e.target.checked)}
                      />
                    }
                    label="IP Restriction"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                    Note: Enabling IP restriction will limit access to specific IP addresses.
                    Please ensure you have the correct IP addresses configured.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payment Integration
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Payment Gateway</InputLabel>
                    <Select
                      value={settings.integrations.paymentGateway}
                      label="Payment Gateway"
                      onChange={(e) => handleSettingChange('integrations', 'paymentGateway', e.target.value)}
                    >
                      <MenuItem value="stripe">Stripe</MenuItem>
                      <MenuItem value="paypal">PayPal</MenuItem>
                      <MenuItem value="square">Square</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Communication Services
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>SMS Provider</InputLabel>
                    <Select
                      value={settings.integrations.smsProvider}
                      label="SMS Provider"
                      onChange={(e) => handleSettingChange('integrations', 'smsProvider', e.target.value)}
                    >
                      <MenuItem value="twilio">Twilio</MenuItem>
                      <MenuItem value="messagebird">MessageBird</MenuItem>
                      <MenuItem value="nexmo">Nexmo</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Email Provider</InputLabel>
                    <Select
                      value={settings.integrations.emailProvider}
                      label="Email Provider"
                      onChange={(e) => handleSettingChange('integrations', 'emailProvider', e.target.value)}
                    >
                      <MenuItem value="sendgrid">SendGrid</MenuItem>
                      <MenuItem value="mailgun">Mailgun</MenuItem>
                      <MenuItem value="amazon-ses">Amazon SES</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Card className="hover-card">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Integrations
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.integrations.calendarSync}
                        onChange={(e) => handleSettingChange('integrations', 'calendarSync', e.target.checked)}
                      />
                    }
                    label="Calendar Sync"
                  />
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
} 