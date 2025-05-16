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

const EmailService: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    text: '',
    html: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendEmail = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post('http://localhost:3001/email/send', emailData);
      setSuccess('Email sent successfully!');
      setEmailData({
        to: '',
        subject: '',
        text: '',
        html: ''
      });
    } catch (err) {
      setError('Failed to send email');
      console.error('Error sending email:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Email Service
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="To"
              name="to"
              value={emailData.to}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={emailData.subject}
              onChange={handleChange}
              variant="outlined"
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Text Content"
              name="text"
              value={emailData.text}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="HTML Content"
              name="html"
              value={emailData.html}
              onChange={handleChange}
              variant="outlined"
              multiline
              rows={4}
              helperText="Optional: HTML content for rich email formatting"
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
              onClick={sendEmail}
              disabled={loading || !emailData.to || !emailData.subject}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'Send Email'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EmailService; 