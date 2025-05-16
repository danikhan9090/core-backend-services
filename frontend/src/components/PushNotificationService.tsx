import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from 'axios';

const PushNotificationService: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    icon: '',
    badge: '',
    data: '{}',
    priority: 'normal'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNotificationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendNotification = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const payload = {
        ...notificationData,
        data: JSON.parse(notificationData.data)
      };

      await axios.post('http://localhost:3004/notifications/send', payload);
      setSuccess('Push notification sent successfully!');
      setNotificationData({
        title: '',
        body: '',
        icon: '',
        badge: '',
        data: '{}',
        priority: 'normal'
      });
    } catch (err) {
      setError('Failed to send push notification');
      console.error('Error sending push notification:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Push Notification Service
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={notificationData.title}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Body"
              name="body"
              value={notificationData.body}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={2}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Icon URL"
              name="icon"
              value={notificationData.icon}
              onChange={handleChange}
              variant="outlined"
              helperText="URL of the notification icon"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Badge URL"
              name="badge"
              value={notificationData.badge}
              onChange={handleChange}
              variant="outlined"
              helperText="URL of the notification badge"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Data"
              name="data"
              value={notificationData.data}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={3}
              helperText="JSON object with additional data"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={notificationData.priority}
                onChange={handleSelectChange}
                label="Priority"
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
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
            <Button
              variant="contained"
              color="primary"
              onClick={sendNotification}
              disabled={loading || !notificationData.title || !notificationData.body}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Send Push Notification'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PushNotificationService; 