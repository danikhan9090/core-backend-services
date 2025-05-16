import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  author: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
}

interface PostData {
  title: string;
  content: string;
  author: string;
  tags: string[];
  status: 'draft' | 'published';
}

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    author: '',
    tags: [],
    status: 'draft'
  });
  const [newTag, setNewTag] = useState('');

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3009/posts');
      setPosts(response.data);
    } catch (err) {
      setError('Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingPost) {
        await axios.put(`http://localhost:3009/posts/${editingPost._id}`, postData);
        setSuccess('Post updated successfully');
      } else {
        await axios.post('http://localhost:3009/posts', postData);
        setSuccess('Post created successfully');
      }
      setOpenDialog(false);
      setEditingPost(null);
      setPostData({
        title: '',
        content: '',
        author: '',
        tags: [],
        status: 'draft'
      });
      fetchPosts();
    } catch (err) {
      setError('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3009/posts/${id}`);
      setSuccess('Post deleted successfully');
      fetchPosts();
    } catch (err) {
      setError('Failed to delete post');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setPostData({
      title: post.title,
      content: post.content,
      author: post.author,
      tags: post.tags,
      status: post.status
    });
    setOpenDialog(true);
  };

  const handleAddTag = () => {
    if (newTag && !postData.tags.includes(newTag)) {
      setPostData({
        ...postData,
        tags: [...postData.tags, newTag]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setPostData({
      ...postData,
      tags: postData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Blog Management
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
        Create New Post
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} md={6} key={post._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {post.content.substring(0, 150)}...
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {post.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    By {post.author} • {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={post.status}
                    color={post.status === 'published' ? 'success' : 'default'}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEdit(post)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(post._id)}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPost ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            value={postData.content}
            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
            margin="normal"
            multiline
            rows={6}
          />
          <TextField
            fullWidth
            label="Author"
            value={postData.author}
            onChange={(e) => setPostData({ ...postData, author: e.target.value })}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tags
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Add Tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddTag}
                disabled={!newTag}
              >
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {postData.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                />
              ))}
            </Box>
          </Box>
          <TextField
            fullWidth
            select
            label="Status"
            value={postData.status}
            onChange={(e) =>
              setPostData({
                ...postData,
                status: e.target.value as 'draft' | 'published'
              })
            }
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!postData.title || !postData.content || !postData.author}
          >
            {editingPost ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Blog; 