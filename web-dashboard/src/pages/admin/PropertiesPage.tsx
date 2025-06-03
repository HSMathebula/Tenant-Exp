import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { BaseLayout } from '../../components/layouts/BaseLayout';
import { useSnackbar } from 'notistack';
import { api } from '../../services/api';

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupiedUnits: number;
  manager: string;
  contactPhone: string;
  contactEmail: string;
}

export const PropertiesPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    manager: '',
    contactPhone: '',
    contactEmail: '',
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch properties', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (property?: Property) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        name: property.name,
        address: property.address,
        manager: property.manager,
        contactPhone: property.contactPhone,
        contactEmail: property.contactEmail,
      });
    } else {
      setEditingProperty(null);
      setFormData({
        name: '',
        address: '',
        manager: '',
        contactPhone: '',
        contactEmail: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await api.put(`/properties/${editingProperty.id}`, formData);
        enqueueSnackbar('Property updated successfully', { variant: 'success' });
      } else {
        await api.post('/properties', formData);
        enqueueSnackbar('Property created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchProperties();
    } catch (error) {
      enqueueSnackbar('Failed to save property', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${id}`);
        enqueueSnackbar('Property deleted successfully', { variant: 'success' });
        fetchProperties();
      } catch (error) {
        enqueueSnackbar('Failed to delete property', { variant: 'error' });
      }
    }
  };

  return (
    <BaseLayout title="Properties">
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Property
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Units</TableCell>
              <TableCell>Occupancy</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {properties.map((property) => (
              <TableRow key={property.id}>
                <TableCell>{property.name}</TableCell>
                <TableCell>{property.address}</TableCell>
                <TableCell>{property.units}</TableCell>
                <TableCell>
                  {property.occupiedUnits} / {property.units}
                </TableCell>
                <TableCell>{property.manager}</TableCell>
                <TableCell>
                  {property.contactPhone}
                  <br />
                  {property.contactEmail}
                </TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleOpenDialog(property)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(property.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingProperty ? 'Edit Property' : 'Add Property'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Property Name"
                  fullWidth
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="address"
                  label="Address"
                  fullWidth
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="manager"
                  label="Property Manager"
                  fullWidth
                  value={formData.manager}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="contactPhone"
                  label="Contact Phone"
                  fullWidth
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="contactEmail"
                  label="Contact Email"
                  fullWidth
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProperty ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </BaseLayout>
  );
}; 