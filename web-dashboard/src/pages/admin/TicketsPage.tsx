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
  Tabs,
  Tab,
  useTheme,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../../services/api';

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
      id={`ticket-tabpanel-${index}`}
      aria-labelledby={`ticket-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ticket-tab-${index}`,
    'aria-controls': `ticket-tabpanel-${index}`,
  };
}

const TicketsPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
  }>({});

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      setTickets(response.tickets);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tickets. Please try again later.');
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  const handleFilterSelect = (filter: { status?: TicketStatus; priority?: TicketPriority; category?: TicketCategory }) => {
    setSelectedFilters(filter);
    handleFilterClose();
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return 'warning';
      case TicketStatus.ASSIGNED:
        return 'info';
      case TicketStatus.IN_PROGRESS:
        return 'primary';
      case TicketStatus.WAITING_FOR_PARTS:
        return 'secondary';
      case TicketStatus.COMPLETED:
        return 'success';
      case TicketStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.LOW:
        return 'success';
      case TicketPriority.NORMAL:
        return 'info';
      case TicketPriority.URGENT:
        return 'warning';
      case TicketPriority.EMERGENCY:
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedFilters.status || ticket.status === selectedFilters.status;
    const matchesPriority = !selectedFilters.priority || ticket.priority === selectedFilters.priority;
    const matchesCategory = !selectedFilters.category || ticket.category === selectedFilters.category;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Maintenance Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/admin/tickets/new')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          New Ticket
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search tickets..."
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
        <MenuItem onClick={() => handleFilterSelect({ status: TicketStatus.PENDING })}>
          Pending
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect({ status: TicketStatus.ASSIGNED })}>
          Assigned
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect({ status: TicketStatus.IN_PROGRESS })}>
          In Progress
        </MenuItem>
        <MenuItem onClick={() => handleFilterSelect({ status: TicketStatus.COMPLETED })}>
          Completed
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={sortAnchorEl}
        open={Boolean(sortAnchorEl)}
        onClose={handleSortClose}
      >
        <MenuItem onClick={handleSortClose}>Date Created (Newest)</MenuItem>
        <MenuItem onClick={handleSortClose}>Date Created (Oldest)</MenuItem>
        <MenuItem onClick={handleSortClose}>Priority (High to Low)</MenuItem>
        <MenuItem onClick={handleSortClose}>Priority (Low to High)</MenuItem>
      </Menu>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="ticket tabs">
          <Tab label="All" {...a11yProps(0)} />
          <Tab label="Pending" {...a11yProps(1)} />
          <Tab label="In Progress" {...a11yProps(2)} />
          <Tab label="Completed" {...a11yProps(3)} />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredTickets.map((ticket) => (
            <Card
              key={ticket.id}
              sx={{
                width: '100%',
                maxWidth: 400,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {ticket.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Chip
                        label={ticket.status}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {ticket.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                    >
                      {ticket.tenant.firstName.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {ticket.tenant.firstName} {ticket.tenant.lastName}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredTickets
            .filter((ticket) => ticket.status === TicketStatus.PENDING)
            .map((ticket) => (
              <Card
                key={ticket.id}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {ticket.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ticket.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                      >
                        {ticket.tenant.firstName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {ticket.tenant.firstName} {ticket.tenant.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredTickets
            .filter((ticket) => ticket.status === TicketStatus.IN_PROGRESS)
            .map((ticket) => (
              <Card
                key={ticket.id}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {ticket.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ticket.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                      >
                        {ticket.tenant.firstName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {ticket.tenant.firstName} {ticket.tenant.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {filteredTickets
            .filter((ticket) => ticket.status === TicketStatus.COMPLETED)
            .map((ticket) => (
              <Card
                key={ticket.id}
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {ticket.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={ticket.status}
                          color={getStatusColor(ticket.status)}
                          size="small"
                        />
                        <Chip
                          label={ticket.priority}
                          color={getPriorityColor(ticket.priority)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ticket.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}
                      >
                        {ticket.tenant.firstName.charAt(0)}
                      </Avatar>
                      <Typography variant="body2">
                        {ticket.tenant.firstName} {ticket.tenant.lastName}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
        </Box>
      </TabPanel>
    </Container>
  );
};

export default TicketsPage; 