import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Grid,
  useTheme,
  Avatar,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Tenant } from '../../services/api';

// Extend the Tenant interface to include status
interface TenantWithStatus extends Tenant {
  status: 'active' | 'inactive' | 'pending';
}

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
      id={`tenant-tabpanel-${index}`}
      aria-labelledby={`tenant-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tenant-tab-${index}`,
    'aria-controls': `tenant-tabpanel-${index}`,
  };
}

const TenantsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<TenantWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: string;
  }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantWithStatus | null>(null);
  const [viewMode, setViewMode] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.getTenants();
      // Add status to each tenant
      const tenantsWithStatus = response.map(tenant => ({
        ...tenant,
        status: 'active' as const // Default status, you might want to get this from the API
      }));
      setTenants(tenantsWithStatus);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tenants. Please try again later.');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (filter: { status?: string }) => {
    setSelectedFilters(filter);
    handleFilterClose();
  };

  const handleTenantClick = (tenant: TenantWithStatus) => {
    setSelectedTenant(tenant);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedTenant(null);
  };

  const handleViewModeChange = (event: React.SyntheticEvent, newValue: number) => {
    setViewMode(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedFilters.status || tenant.status === selectedFilters.status;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Tenants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/tenants/new')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          Add Tenant
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tenants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleFilterClick}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Filter
        </Button>
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={handleSortClick}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Sort
        </Button>
      </Box>

      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterSelect({ status: 'active' })}>
          Active
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect({ status: 'pending' })}>
          Pending
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect({ status: 'inactive' })}>
          Inactive
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={handleSortClose}>Name (A-Z)</MenuItem>
        <MenuItem onClick={handleSortClose}>Name (Z-A)</MenuItem>
        <MenuItem onClick={handleSortClose}>Move-in Date (Newest)</MenuItem>
        <MenuItem onClick={handleSortClose}>Move-in Date (Oldest)</MenuItem>
      </Menu>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={viewMode} onChange={handleViewModeChange} aria-label="view mode tabs">
          <Tab label="Grid View" {...a11yProps(0)} />
          <Tab label="List View" {...a11yProps(1)} />
        </Tabs>
      </Box>

      <TabPanel value={viewMode} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredTenants.map((tenant) => (
            <Box
              key={tenant.id}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'calc(50% - 12px)',
                  md: 'calc(33.33% - 16px)',
                },
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '1.5rem',
                        }}
                      >
                        {tenant.firstName.charAt(0)}
                        {tenant.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="h2">
                          {tenant.firstName} {tenant.lastName}
                        </Typography>
                        <Chip
                          label={tenant.status}
                          color={getStatusColor(tenant.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {tenant.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        {tenant.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HomeIcon color="action" fontSize="small" />
                      <Typography variant="body2" color="text.secondary">
                        Unit {tenant.unitNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Lease: {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleTenantClick(tenant)}>
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Tenant">
                        <IconButton size="small" onClick={() => navigate(`/admin/tenants/${tenant.id}/edit`)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Tenant">
                        <IconButton size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={viewMode} index={1}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTenants.map((tenant) => (
            <Card key={tenant.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {tenant.firstName[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">
                    {tenant.firstName} {tenant.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tenant.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={tenant.status}
                    color={tenant.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setSelectedTenant(tenant);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        {selectedTenant && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedTenant.firstName} {selectedTenant.lastName}
                </Typography>
                <Chip
                  label={selectedTenant.status}
                  color={getStatusColor(selectedTenant.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ width: { xs: '100%', md: '33.33%' } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '3rem',
                      }}
                    >
                      {selectedTenant.firstName.charAt(0)}
                      {selectedTenant.lastName.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6">
                        {selectedTenant.firstName} {selectedTenant.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tenant ID: {selectedTenant.id}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ width: { xs: '100%', md: '66.67%' } }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Contact Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {selectedTenant.email}
                        </Typography>
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">
                          {selectedTenant.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Lease Information
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Property
                        </Typography>
                        <Typography variant="body1">
                          {selectedTenant.propertyId}
                        </Typography>
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Unit Number
                        </Typography>
                        <Typography variant="body1">
                          {selectedTenant.unitNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Lease Start
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedTenant.leaseStart).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                        <Typography variant="body2" color="text.secondary">
                          Lease End
                        </Typography>
                        <Typography variant="body1">
                          {new Date(selectedTenant.leaseEnd).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose}>Close</Button>
              <Button
                variant="contained"
                onClick={() => navigate(`/admin/tenants/${selectedTenant.id}/edit`)}
              >
                Edit Tenant
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default TenantsPage; 