import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

interface StockAlert {
  _id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  currentPrice: number;
  lastUpdated: string;
}

interface NewAlert {
  symbol: string;
  targetPrice: string;
  condition: 'above' | 'below';
}

const StockPriceNotifier: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newAlert, setNewAlert] = useState<NewAlert>({
    symbol: '',
    targetPrice: '',
    condition: 'above'
  });

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3007/alerts');
      setAlerts(response.data);
    } catch (err) {
      setError('Failed to fetch stock alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3007/alerts', {
        ...newAlert,
        targetPrice: parseFloat(newAlert.targetPrice)
      });
      setSuccess('Alert created successfully');
      setNewAlert({ symbol: '', targetPrice: '', condition: 'above' });
      fetchAlerts();
    } catch (err) {
      setError('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3007/alerts/${id}`);
      setSuccess('Alert deleted successfully');
      fetchAlerts();
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  const getPriceChangeColor = (alert: StockAlert) => {
    const priceDiff = alert.currentPrice - alert.targetPrice;
    if (alert.condition === 'above') {
      return priceDiff >= 0 ? 'success.main' : 'error.main';
    } else {
      return priceDiff <= 0 ? 'success.main' : 'error.main';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Stock Price Notifier
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Stock Symbol"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value.toUpperCase() })}
              placeholder="e.g., AAPL"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Target Price"
              type="number"
              value={newAlert.targetPrice}
              onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Condition"
              value={newAlert.condition}
              onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as 'above' | 'below' })}
              SelectProps={{ native: true }}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!newAlert.symbol || !newAlert.targetPrice}
              startIcon={<AddIcon />}
            >
              Add Alert
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {alerts.map((alert) => (
            <Grid item xs={12} sm={6} md={4} key={alert._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {alert.symbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Target: {alert.condition === 'above' ? '>' : '<'} ${alert.targetPrice}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ color: getPriceChangeColor(alert), my: 1 }}
                  >
                    ${alert.currentPrice}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {new Date(alert.lastUpdated).toLocaleString()}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={
                        ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100
                      }
                      color={getPriceChangeColor(alert) === 'success.main' ? 'success' : 'error'}
                    />
                  </Box>
                  <IconButton
                    onClick={() => handleDelete(alert._id)}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StockPriceNotifier; 