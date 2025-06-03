import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => (
  <Card className="hover-card" sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', color: trend >= 0 ? 'success.main' : 'error.main' }}>
              <TrendingUpIcon sx={{ mr: 0.5, transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
              <Typography variant="body2">
                {Math.abs(trend)}% from last month
              </Typography>
            </Box>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

interface ActivityItem {
  id: number;
  type: 'maintenance' | 'payment' | 'tenant' | 'announcement';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalTenants: 0,
    occupiedUnits: 0,
    maintenanceRequests: 0,
    monthlyRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([
    { month: 'Jan', revenue: 120000 },
    { month: 'Feb', revenue: 125000 },
    { month: 'Mar', revenue: 130000 },
    { month: 'Apr', revenue: 128000 },
    { month: 'May', revenue: 132000 },
    { month: 'Jun', revenue: 135000 },
  ]);

  useEffect(() => {
    // TODO: Fetch dashboard data from API
    // This is mock data for now
    setStats({
      totalTenants: 156,
      occupiedUnits: 142,
      maintenanceRequests: 23,
      monthlyRevenue: 125000,
    });

    setRecentActivity([
      {
        id: 1,
        type: 'maintenance',
        title: 'New Maintenance Request',
        description: 'Water leak reported in Unit 302',
        timestamp: '2 hours ago',
        user: {
          name: 'John Smith',
          avatar: undefined,
        },
      },
      {
        id: 2,
        type: 'payment',
        title: 'Rent Payment Received',
        description: 'Payment received from Sarah Johnson',
        timestamp: '4 hours ago',
      },
      {
        id: 3,
        type: 'tenant',
        title: 'New Tenant Application',
        description: 'Application received from Michael Brown',
        timestamp: '1 day ago',
      },
    ]);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'maintenance':
        return <AssignmentIcon />;
      case 'payment':
        return <TrendingUpIcon />;
      case 'tenant':
        return <PeopleIcon />;
      case 'announcement':
        return <NotificationsIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'maintenance':
        return theme.palette.warning.main;
      case 'payment':
        return theme.palette.success.main;
      case 'tenant':
        return theme.palette.info.main;
      case 'announcement':
        return theme.palette.primary.main;
      default:
        return theme.palette.primary.main;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" className="gradient-text" sx={{ flexGrow: 1 }}>
          Welcome back, {user?.firstName}!
        </Typography>
        <Button
          variant="outlined"
          endIcon={<ArrowForwardIcon />}
          className="hover-button"
        >
          View Reports
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Statistics Cards */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' } }}>
          <StatCard
            title="Total Tenants"
            value={stats.totalTenants}
            icon={<PeopleIcon />}
            trend={5}
            color={theme.palette.primary.main}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' } }}>
          <StatCard
            title="Occupied Units"
            value={stats.occupiedUnits}
            icon={<HomeIcon />}
            trend={3}
            color={theme.palette.success.main}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' } }}>
          <StatCard
            title="Maintenance Requests"
            value={stats.maintenanceRequests}
            icon={<AssignmentIcon />}
            trend={-2}
            color={theme.palette.warning.main}
          />
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 12px)' } }}>
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={<TrendingUpIcon />}
            trend={8}
            color={theme.palette.info.main}
          />
        </Box>

        {/* Revenue Chart */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(66.666% - 12px)' } }}>
          <Card className="hover-card" sx={{ width: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Revenue Overview</Typography>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#64748B" />
                    <YAxis stroke="#64748B" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.primary.main }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Activity */}
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 12px)' } }}>
          <Card className="hover-card" sx={{ width: '100%', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  className="hover-button"
                >
                  View All
                </Button>
              </Box>
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        px: 0,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: `${getActivityColor(activity.type)}20`,
                            color: getActivityColor(activity.type),
                          }}
                        >
                          {getActivityIcon(activity.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" component="div">
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              {activity.description}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {activity.timestamp}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < recentActivity.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
