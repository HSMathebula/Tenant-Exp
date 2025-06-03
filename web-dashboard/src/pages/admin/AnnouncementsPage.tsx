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
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { BaseLayout } from '../../components/layouts/BaseLayout';
import { useSnackbar } from 'notistack';
import { api, useApi } from '../../services/api';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  startDate: string;
  endDate: string;
  properties: string[];
  createdAt: string;
  updatedAt: string;
}

export const AnnouncementsPage: React.FC = () => {
  const { handleApiCall } = useApi();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    properties: [],
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchProperties();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const result = await handleApiCall(
      () => api.getAnnouncements(),
      'Announcements loaded successfully',
      'Failed to load announcements'
    );
    if (result) {
      setAnnouncements(result);
    }
    setLoading(false);
  };

  const fetchProperties = async () => {
    const result = await handleApiCall(
      () => api.getProperties(),
      'Properties loaded successfully',
      'Failed to load properties'
    );
    if (result) {
      setProperties(result.map(p => ({ id: p.id, name: p.name })));
    }
  };

  const handleOpenDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        startDate: announcement.startDate,
        endDate: announcement.endDate,
        properties: announcement.properties,
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        type: 'general',
        priority: 'medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        properties: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAnnouncement(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await api.updateAnnouncement(editingAnnouncement.id, formData);
        enqueueSnackbar('Announcement updated successfully', { variant: 'success' });
      } else {
        await api.createAnnouncement(formData);
        enqueueSnackbar('Announcement created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchAnnouncements();
    } catch (error) {
      enqueueSnackbar('Failed to save announcement', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.deleteAnnouncement(id);
        enqueueSnackbar('Announcement deleted successfully', { variant: 'success' });
        fetchAnnouncements();
      } catch (error) {
        enqueueSnackbar('Failed to delete announcement', { variant: 'error' });
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'error';
      case 'maintenance':
        return 'warning';
      case 'event':
        return 'success';
      default:
        return 'info';
    }
  };

  return (
    <BaseLayout title="Announcements">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingAnnouncement(null);
              setFormData({
                title: '',
                content: '',
                type: 'general',
                priority: 'medium',
                startDate: '',
                endDate: '',
                properties: []
              });
              setOpenDialog(true);
            }}
          >
            Create Announcement
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {announcements.map((announcement) => (
            <Box key={announcement.id} sx={{ flex: '1 1 300px', maxWidth: '100%' }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {announcement.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {announcement.content}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip
                      label={announcement.type}
                      color={announcement.type === 'emergency' ? 'error' : 'primary'}
                      size="small"
                    />
                    <Chip
                      label={announcement.priority}
                      color={
                        announcement.priority === 'high'
                          ? 'error'
                          : announcement.priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="small"
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(announcement.startDate).toLocaleDateString()} -{' '}
                    {announcement.endDate
                      ? new Date(announcement.endDate).toLocaleDateString()
                      : 'No end date'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingAnnouncement(announcement);
                      setFormData({
                        title: announcement.title,
                        content: announcement.content,
                        type: announcement.type,
                        priority: announcement.priority,
                        startDate: announcement.startDate,
                        endDate: announcement.endDate || '',
                        properties: announcement.properties
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(announcement.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <form onSubmit={handleSubmit}>
            <DialogTitle>
              {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                  name="title"
                  label="Title"
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <TextField
                  name="content"
                  label="Content"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      label="Type"
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as Announcement['type'] })}
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="emergency">Emergency</MenuItem>
                      <MenuItem value="event">Event</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      name="priority"
                      value={formData.priority}
                      label="Priority"
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Announcement['priority'] })}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    name="startDate"
                    label="Start Date"
                    type="date"
                    fullWidth
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    name="endDate"
                    label="End Date"
                    type="date"
                    fullWidth
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Properties</InputLabel>
                  <Select
                    multiple
                    value={formData.properties}
                    label="Properties"
                    onChange={(e) => setFormData({ ...formData, properties: e.target.value as string[] })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={properties.find(p => p.id === value)?.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {properties.map((property) => (
                      <MenuItem key={property.id} value={property.id}>
                        {property.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained">
                {editingAnnouncement ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </BaseLayout>
  );
};

export default AnnouncementsPage; 