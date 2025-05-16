import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const SmsService: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [smsData, setSmsData] = useState({
    to: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendSms = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post('http://localhost:3002/sms/send', smsData);
      setSuccess('SMS sent successfully!');
      setSmsData({
        to: '',
        message: ''
      });
    } catch (err) {
      setError('Failed to send SMS');
      console.error('Error sending SMS:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        SMS Service
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              name="to"
              value={smsData.to}
              onChange={handleChange}
              variant="outlined"
              required
              placeholder="+1234567890"
              helperText="Enter phone number with country code"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={smsData.message}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
              required
              helperText="Enter your SMS message"
            />
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
              onClick={sendSms}
              disabled={loading || !smsData.to || !smsData.message}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Send SMS'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SmsService; 