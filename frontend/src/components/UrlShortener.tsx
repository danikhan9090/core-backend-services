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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Link
} from '@mui/material';
import { Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import axios from 'axios';

interface ShortUrl {
  _id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string;
  clicks: number;
}

const UrlShortener: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [urls, setUrls] = useState<ShortUrl[]>([]);
  const [urlData, setUrlData] = useState({
    originalUrl: '',
    customCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUrlData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:3003/urls');
      setUrls(response.data);
    } catch (err) {
      setError('Failed to fetch URLs');
      console.error('Error fetching URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createShortUrl = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post('http://localhost:3003/urls', urlData);
      setSuccess('URL shortened successfully!');
      setUrlData({
        originalUrl: '',
        customCode: ''
      });
      await fetchUrls();
    } catch (err) {
      setError('Failed to create short URL');
      console.error('Error creating short URL:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteUrl = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3003/urls/${id}`);
      setUrls(urls.filter(url => url._id !== id));
    } catch (err) {
      setError('Failed to delete URL');
      console.error('Error deleting URL:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('URL copied to clipboard!');
  };

  React.useEffect(() => {
    fetchUrls();
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        URL Shortener
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Create Short URL
            </Typography>
            <TextField
              fullWidth
              label="Original URL"
              name="originalUrl"
              value={urlData.originalUrl}
              onChange={handleChange}
              variant="outlined"
              required
              margin="normal"
              placeholder="https://example.com"
            />
            <TextField
              fullWidth
              label="Custom Code (Optional)"
              name="customCode"
              value={urlData.customCode}
              onChange={handleChange}
              variant="outlined"
              margin="normal"
              placeholder="custom-code"
              helperText="Leave empty for auto-generated code"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={createShortUrl}
              disabled={loading || !urlData.originalUrl}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Short URL'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Short URLs
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Original URL</TableCell>
                      <TableCell>Short URL</TableCell>
                      <TableCell>Clicks</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urls.map((url) => (
                      <TableRow key={url._id}>
                        <TableCell>
                          <Link href={url.originalUrl} target="_blank" rel="noopener noreferrer">
                            {url.originalUrl}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Link href={`http://localhost:3003/${url.shortCode}`} target="_blank" rel="noopener noreferrer">
                              {`http://localhost:3003/${url.shortCode}`}
                            </Link>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(`http://localhost:3003/${url.shortCode}`)}
                            >
                              <CopyIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>{url.clicks}</TableCell>
                        <TableCell>
                          {new Date(url.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => deleteUrl(url._id)}
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

export default UrlShortener; 