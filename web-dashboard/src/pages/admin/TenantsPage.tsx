import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { BaseLayout } from '../../components/layouts/BaseLayout';
import { useSnackbar } from 'notistack';
import { api } from '../../services/api';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Property {
  id: string;
  name: string;
}

export const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<Omit<Tenant, 'id'>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyId: '',
    unitNumber: '',
    leaseStart: '',
    leaseEnd: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchTenants();
    fetchProperties();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenants');
      setTenants(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch tenants', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch properties', { variant: 'error' });
    }
  };

  const handleOpenDialog = (tenant?: Tenant) => {
    if (tenant) {
      setEditingTenant(tenant);
      setFormData({
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        email: tenant.email,
        phone: tenant.phone,
        propertyId: tenant.propertyId,
        unitNumber: tenant.unitNumber,
        leaseStart: tenant.leaseStart,
        leaseEnd: tenant.leaseEnd,
        status: tenant.status,
      });
    } else {
      setEditingTenant(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        propertyId: '',
        unitNumber: '',
        leaseStart: '',
        leaseEnd: '',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTenant(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | 
    (Event & { target: { value: string; name: string } })
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTenant) {
        await api.put(`/tenants/${editingTenant.id}`, formData);
        enqueueSnackbar('Tenant updated successfully', { variant: 'success' });
      } else {
        await api.post('/tenants', formData);
        enqueueSnackbar('Tenant created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchTenants();
    } catch (error) {
      enqueueSnackbar('Failed to save tenant', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await api.delete(`/tenants/${id}`);
        enqueueSnackbar('Tenant deleted successfully', { variant: 'success' });
        fetchTenants();
      } catch (error) {
        enqueueSnackbar('Failed to delete tenant', { variant: 'error' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.unitNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || tenant.propertyId === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  return (
    <BaseLayout title="Tenants">
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4} component="div">
            <TextField
              fullWidth
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
            />
          </Grid>
          <Grid item xs={12} md={3} component="div">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} component="div">
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={propertyFilter}
                label="Property"
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <MenuItem value="all">All Properties</MenuItem>
                {properties.map((property) => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2} component="div">
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Tenant
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Property</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Lease Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell>
                  {tenant.firstName} {tenant.lastName}
                </TableCell>
                <TableCell>
                  {tenant.email}
                  <br />
                  {tenant.phone}
                </TableCell>
                <TableCell>
                  {properties.find((p) => p.id === tenant.propertyId)?.name || 'N/A'}
                </TableCell>
                <TableCell>{tenant.unitNumber}</TableCell>
                <TableCell>
                  {new Date(tenant.leaseStart).toLocaleDateString()} -{' '}
                  {new Date(tenant.leaseEnd).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={tenant.status}
                    color={getStatusColor(tenant.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(tenant)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(tenant.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTenant ? 'Edit Tenant' : 'Add Tenant'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="firstName"
                  label="First Name"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="phone"
                  label="Phone"
                  fullWidth
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    name="propertyId"
                    value={formData.propertyId}
                    label="Property"
                    onChange={handleInputChange}
                  >
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="unitNumber"
                  label="Unit Number"
                  fullWidth
                  value={formData.unitNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="leaseStart"
                  label="Lease Start"
                  type="date"
                  fullWidth
                  value={formData.leaseStart}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} component="div">
                <TextField
                  name="leaseEnd"
                  label="Lease End"
                  type="date"
                  fullWidth
                  value={formData.leaseEnd}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} component="div">
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTenant ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </BaseLayout>
  );
};

export default TenantsPage; 