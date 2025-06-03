import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { BaseLayout } from '../../components/layouts/BaseLayout';
import { useSnackbar } from 'notistack';
import { api, Ticket, TicketComment } from '../../services/api';

interface Property {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Staff {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Ticket>>({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchComments();
      fetchProperties();
      fetchTenants();
      fetchStaff();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.getTicket(id!);
      setTicket(response);
      setEditFormData(response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch ticket details', { variant: 'error' });
      navigate('/admin/tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.getTicketComments(id!);
      setComments(response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch comments', { variant: 'error' });
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await api.getProperties();
      setProperties(response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch properties', { variant: 'error' });
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await api.getTenants();
      setTenants(response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch tenants', { variant: 'error' });
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await api.getStaff();
      setStaff(response);
    } catch (error) {
      enqueueSnackbar('Failed to fetch staff', { variant: 'error' });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.addTicketComment(id!, newComment);
      setNewComment('');
      fetchComments();
      enqueueSnackbar('Comment added successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to add comment', { variant: 'error' });
    }
  };

  const handleUpdateTicket = async () => {
    try {
      await api.updateTicket(id!, editFormData);
      setOpenEditDialog(false);
      fetchTicket();
      enqueueSnackbar('Ticket updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update ticket', { variant: 'error' });
    }
  };

  const handleDeleteTicket = async () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await api.deleteTicket(id!);
        enqueueSnackbar('Ticket deleted successfully', { variant: 'success' });
        navigate('/admin/tickets');
      } catch (error) {
        enqueueSnackbar('Failed to delete ticket', { variant: 'error' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'info';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <BaseLayout title="Ticket Details">
        <Box sx={{ p: 3 }}>
          <Typography>Loading...</Typography>
        </Box>
      </BaseLayout>
    );
  }

  if (!ticket) {
    return (
      <BaseLayout title="Ticket Details">
        <Box sx={{ p: 3 }}>
          <Typography>Ticket not found</Typography>
        </Box>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title="Ticket Details">
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/admin/tickets')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Ticket Details
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          <Box sx={{ flex: { md: 2 } }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {ticket.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton onClick={() => setOpenEditDialog(true)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleDeleteTicket}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Chip
                  label={ticket.status.replace('_', ' ')}
                  color={getStatusColor(ticket.status)}
                />
                <Chip
                  label={ticket.priority}
                  color={getPriorityColor(ticket.priority)}
                />
              </Stack>

              <Typography variant="body1" sx={{ mb: 3 }}>
                {ticket.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Comments
              </Typography>

              <List>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar src={comment.user.avatar}>
                        {comment.user.firstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {comment.user.firstName} {comment.user.lastName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" color="text.primary">
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comment.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Send
                </Button>
              </Box>
            </Paper>
          </Box>

          <Box sx={{ flex: { md: 1 } }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Ticket Information
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Property
                </Typography>
                <Typography variant="body1">
                  {ticket.property.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tenant
                </Typography>
                <Typography variant="body1">
                  {ticket.tenant.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(ticket.createdAt).toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(ticket.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>

        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Ticket</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                fullWidth
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status || ''}
                  label="Status"
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Ticket['status'] })}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editFormData.priority || ''}
                  label="Priority"
                  onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value as Ticket['priority'] })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  value={editFormData.assignedTo || ''}
                  label="Assigned To"
                  onChange={(e) => setEditFormData({ ...editFormData, assignedTo: e.target.value })}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {staff.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateTicket} variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BaseLayout>
  );
};

export default TicketDetailPage; 