import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Container, 
  Typography, 
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import WebhookCatcher from './components/WebhookCatcher';
import EmailService from './components/EmailService';
import SmsService from './components/SmsService';
import PushNotificationService from './components/PushNotificationService';
import UrlShortener from './components/UrlShortener';
import TaskManagement from './components/TaskManagement';
import StockPriceNotifier from './components/StockPriceNotifier';
import NoCode from './components/NoCode';
import Blog from './components/Blog';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Backend Services Dashboard
          </Typography>
          
          <Paper elevation={3} sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="service tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Webhook Catcher" />
                <Tab label="Email Service" />
                <Tab label="SMS Service" />
                <Tab label="Push Notifications" />
                <Tab label="URL Shortener" />
                <Tab label="Task Management" />
                <Tab label="Stock Price Notifier" />
                <Tab label="No-Code Builder" />
                <Tab label="Blog" />
              </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
              <WebhookCatcher />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <EmailService />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <SmsService />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <PushNotificationService />
            </TabPanel>
            <TabPanel value={value} index={4}>
              <UrlShortener />
            </TabPanel>
            <TabPanel value={value} index={5}>
              <TaskManagement />
            </TabPanel>
            <TabPanel value={value} index={6}>
              <StockPriceNotifier />
            </TabPanel>
            <TabPanel value={value} index={7}>
              <NoCode />
            </TabPanel>
            <TabPanel value={value} index={8}>
              <Blog />
            </TabPanel>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App; 