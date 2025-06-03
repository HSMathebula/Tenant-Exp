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
  Avatar,
  Stack,
  TablePagination,
  TableSortLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
import { BaseLayout } from '../../components/layouts/BaseLayout';
import { useSnackbar } from 'notistack';
import { api, useApi, Ticket } from '../../services/api';
import { useNavigate } from 'react-router-dom';

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof Ticket;
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'title', label: 'Title', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'priority', label: 'Priority', sortable: true },
  { id: 'property', label: 'Property', sortable: true },
  { id: 'tenant', label: 'Tenant', sortable: true },
  { id: 'createdAt', label: 'Created', sortable: true },
  { id: 'updatedAt', label: 'Updated', sortable: true },
];

const statusColors = {
  open: 'info',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
} as const;

const priorityColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  urgent: 'error',
} as const;

export const TicketsPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleApiCall } = useApi();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Ticket>('createdAt');
  const { enqueueSnackbar } = useSnackbar();

  const [formData, setFormData] = useState<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    status: 'open',
    priority: 'medium',
    category: '',
    propertyId: '',
    unitNumber: '',
    tenantId: '',
    assignedTo: '',
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    const result = await handleApiCall(
      () => api.getTickets({
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      }),
      'Tickets loaded successfully',
      'Failed to load tickets'
    );
    if (result) {
      setTickets(result);
    }
    setLoading(false);
  };

  const handleOpenDialog = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        propertyId: ticket.propertyId,
        unitNumber: ticket.unitNumber,
        tenantId: ticket.tenantId,
        assignedTo: ticket.assignedTo || '',
      });
    } else {
      setEditingTicket(null);
      setFormData({
        title: '',
        description: '',
        status: 'open',
        priority: 'medium',
        category: '',
        propertyId: '',
        unitNumber: '',
        tenantId: '',
        assignedTo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTicket(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
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
      if (editingTicket) {
        await api.put(`/tickets/${editingTicket.id}`, formData);
        enqueueSnackbar('Ticket updated successfully', { variant: 'success' });
      } else {
        await api.post('/tickets', formData);
        enqueueSnackbar('Ticket created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchTickets();
    } catch (error) {
      enqueueSnackbar('Failed to save ticket', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await api.delete(`/tickets/${id}`);
        enqueueSnackbar('Ticket deleted successfully', { variant: 'success' });
        fetchTickets();
      } catch (error) {
        enqueueSnackbar('Failed to delete ticket', { variant: 'error' });
      }
    }
  };

  const handleRequestSort = (property: keyof Ticket) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(event.target.value);
  };

  const handlePriorityFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPriorityFilter(event.target.value);
  };

  const handleCreateTicket = () => {
    navigate('/admin/tickets/new');
  };

  const handleEditTicket = (id: string) => {
    navigate(`/admin/tickets/${id}`);
  };

  const handleDeleteTicket = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this ticket?');
    if (confirmed) {
      const success = await handleApiCall(
        () => api.deleteTicket(id),
        'Ticket deleted successfully',
        'Failed to delete ticket'
      );
      if (success) {
        fetchTickets();
      }
    }
  };

  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (order === 'asc') {
        return String(aValue) > String(bValue) ? 1 : -1;
      }
      return String(aValue) < String(bValue) ? 1 : -1;
    });

  return (
    <BaseLayout title="Tickets">
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Tickets
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
            >
              Create Ticket
            </Button>
          </Box>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: 200 }}
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                sx={{ minWidth: 200 }}
                label="Status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
              <TextField
                select
                sx={{ minWidth: 200 }}
                label="Priority"
                value={priorityFilter}
                onChange={handlePriorityFilterChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </TextField>
            </Box>
          </Paper>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      {headCell.sortable ? (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={() => handleRequestSort(headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.status.replace('_', ' ')}
                          color={statusColors[ticket.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ticket.priority}
                          color={priorityColors[ticket.priority]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{ticket.property.name}</TableCell>
                      <TableCell>{ticket.tenant.name}</TableCell>
                      <TableCell>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTicket(ticket.id)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTicket(ticket.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredTickets.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTicket ? 'Edit Ticket' : 'Create Ticket'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  name="title"
                  label="Title"
                  fullWidth
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="resolved">Resolved</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formData.priority}
                    label="Priority"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Property</InputLabel>
                  <Select
                    name="propertyId"
                    value={formData.propertyId}
                    label="Property"
                    onChange={handleInputChange}
                  >
                    {/* Add property options here */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="unitNumber"
                  label="Unit Number"
                  fullWidth
                  value={formData.unitNumber}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Tenant</InputLabel>
                  <Select
                    name="tenantId"
                    value={formData.tenantId}
                    label="Tenant"
                    onChange={handleInputChange}
                  >
                    {/* Add tenant options here */}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assign To</InputLabel>
                  <Select
                    name="assignedTo"
                    value={formData.assignedTo}
                    label="Assign To"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {/* Add staff options here */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingTicket ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </BaseLayout>
  );
};

export default TicketsPage; 