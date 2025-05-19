import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

interface TaskData {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo: string;
}

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskData, setTaskData] = useState<TaskData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    assignedTo: 'current-user' // You might want to get this from your auth context
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3006/api/tasks');
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError('Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (editingTask) {
        await axios.put(`http://localhost:3006/api/tasks/${editingTask._id}`, taskData);
        setSuccess('Task updated successfully');
      } else {
        await axios.post('http://localhost:3006/api/tasks', taskData);
        setSuccess('Task created successfully');
      }
      setOpenDialog(false);
      setEditingTask(null);
      setTaskData({ title: '', description: '', dueDate: '', priority: 'medium', status: 'pending', assignedTo: 'current-user' });
      fetchTasks();
    } catch (err) {
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3006/api/tasks/${id}`);
      setSuccess('Task deleted successfully');
      fetchTasks();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTaskData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assignedTo: 'current-user'
    });
    setOpenDialog(true);
  };

  const handleStatusChange = async (task: Task) => {
    try {
      await axios.put(`http://localhost:3006/api/tasks/${task._id}`, {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed'
      });
      fetchTasks();
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Task Management
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
        sx={{ mb: 2 }}
      >
        Add New Task
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task._id}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Checkbox
                checked={task.status === 'completed'}
                onChange={() => handleStatusChange(task)}
              />
              <ListItemText
                primary={task.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {task.description}
                    </Typography>
                    <br />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                    <br />
                    Priority: {task.priority}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(task)} sx={{ mr: 1 }}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(task._id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={taskData.description}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={taskData.dueDate}
            onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            label="Priority"
            value={taskData.priority}
            onChange={(e) => setTaskData({ ...taskData, priority: e.target.value as 'low' | 'medium' | 'high' })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </TextField>
          <TextField
            fullWidth
            select
            label="Status"
            value={taskData.status}
            onChange={(e) => setTaskData({ ...taskData, status: e.target.value as 'pending' | 'in_progress' | 'completed' | 'cancelled' })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </TextField>
          <TextField
            fullWidth
            label="Assigned To"
            value={taskData.assignedTo}
            onChange={(e) => setTaskData({ ...taskData, assignedTo: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskManagement; 