import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Component {
  _id: string;
  type: 'text' | 'button' | 'input' | 'select' | 'image';
  label: string;
  properties: {
    text?: string;
    placeholder?: string;
    options?: string[];
    src?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
  };
  position: {
    x: number;
    y: number;
  };
}

interface Page {
  _id: string;
  name: string;
  components: Component[];
}

const NoCode: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [pageData, setPageData] = useState({
    name: '',
    components: [] as Component[]
  });

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3008/pages');
      setPages(response.data);
    } catch (err) {
      setError('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingPage) {
        await axios.put(`http://localhost:3008/pages/${editingPage._id}`, pageData);
        setSuccess('Page updated successfully');
      } else {
        await axios.post('http://localhost:3008/pages', pageData);
        setSuccess('Page created successfully');
      }
      setOpenDialog(false);
      setEditingPage(null);
      setPageData({ name: '', components: [] });
      fetchPages();
    } catch (err) {
      setError('Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3008/pages/${id}`);
      setSuccess('Page deleted successfully');
      fetchPages();
    } catch (err) {
      setError('Failed to delete page');
    }
  };

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setPageData({
      name: page.name,
      components: page.components
    });
    setOpenDialog(true);
  };

  const addComponent = (type: Component['type']) => {
    const newComponent: Component = {
      _id: Date.now().toString(),
      type,
      label: `New ${type}`,
      properties: {},
      position: { x: 0, y: 0 }
    };
    setPageData({
      ...pageData,
      components: [...pageData.components, newComponent]
    });
  };

  const updateComponent = (id: string, updates: Partial<Component>) => {
    setPageData({
      ...pageData,
      components: pageData.components.map(comp =>
        comp._id === id ? { ...comp, ...updates } : comp
      )
    });
  };

  const removeComponent = (id: string) => {
    setPageData({
      ...pageData,
      components: pageData.components.filter(comp => comp._id !== id)
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        No-Code Builder
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

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        startIcon={<AddIcon />}
        sx={{ mb: 3 }}
      >
        Create New Page
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {pages.map((page) => (
            <Grid item xs={12} sm={6} md={4} key={page._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {page.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {page.components.length} components
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(page)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(page._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {editingPage ? 'Edit Page' : 'Create New Page'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Page Name"
            value={pageData.name}
            onChange={(e) => setPageData({ ...pageData, name: e.target.value })}
            margin="normal"
          />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Components
            </Typography>
            <Grid container spacing={2}>
              {['text', 'button', 'input', 'select', 'image'].map((type) => (
                <Grid item key={type}>
                  <Button
                    variant="outlined"
                    onClick={() => addComponent(type as Component['type'])}
                    startIcon={<AddIcon />}
                  >
                    Add {type}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3 }}>
              {pageData.components.map((component) => (
                <Paper key={component._id} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Label"
                        value={component.label}
                        onChange={(e) =>
                          updateComponent(component._id, { label: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={component.type}
                          label="Type"
                          onChange={(e) =>
                            updateComponent(component._id, {
                              type: e.target.value as Component['type']
                            })
                          }
                        >
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="button">Button</MenuItem>
                          <MenuItem value="input">Input</MenuItem>
                          <MenuItem value="select">Select</MenuItem>
                          <MenuItem value="image">Image</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth>
                        <InputLabel>Size</InputLabel>
                        <Select
                          value={component.properties.size || 'medium'}
                          label="Size"
                          onChange={(e) =>
                            updateComponent(component._id, {
                              properties: {
                                ...component.properties,
                                size: e.target.value as 'small' | 'medium' | 'large'
                              }
                            })
                          }
                        >
                          <MenuItem value="small">Small</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="large">Large</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <IconButton
                        color="error"
                        onClick={() => removeComponent(component._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!pageData.name}
          >
            {editingPage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoCode; 