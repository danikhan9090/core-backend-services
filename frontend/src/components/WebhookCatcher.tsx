import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import axios from 'axios';

interface Webhook {
  _id: string;
  source: string;
  method: string;
  headers: Record<string, string>;
  body: any;
  timestamp: string;
}

const WebhookCatcher: React.FC = () => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testPayload, setTestPayload] = useState('{\n  "message": "Test webhook payload"\n}');

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3003/webhooks');
      setWebhooks(response.data.webhooks || []);
    } catch (err) {
      setError('Failed to fetch webhooks');
      console.error('Error fetching webhooks:', err);
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3003/webhooks/${id}`);
      setWebhooks(webhooks.filter(webhook => webhook._id !== id));
    } catch (err) {
      setError('Failed to delete webhook');
      console.error('Error deleting webhook:', err);
    }
  };

  const sendTestWebhook = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = JSON.parse(testPayload);
      await axios.post('http://localhost:3003/webhook', payload);
      await fetchWebhooks();
    } catch (err) {
      setError('Failed to send test webhook');
      console.error('Error sending test webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Webhook Catcher
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Send Test Webhook
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
              variant="outlined"
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={sendTestWebhook}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Send Test Webhook
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Recent Webhooks
              </Typography>
              <IconButton onClick={fetchWebhooks} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Body</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhooks.map((webhook) => (
                      <TableRow key={webhook._id}>
                        <TableCell>
                          {new Date(webhook.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{webhook.source}</TableCell>
                        <TableCell>{webhook.method}</TableCell>
                        <TableCell>
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(webhook.body, null, 2)}
                          </pre>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => deleteWebhook(webhook._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WebhookCatcher; 