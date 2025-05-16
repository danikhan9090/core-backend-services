import config from '../config';
import logger from '../config/logger';

interface AlertMessage {
  symbol: string;
  currentPrice: number;
  threshold: number;
  condition: 'above' | 'below';
  timestamp: string;
}

class NotificationService {
  private readonly emailEnabled: boolean;
  private readonly emailFrom: string;
  private readonly emailTo: string;

  constructor() {
    this.emailEnabled = config.notification.email.enabled;
    this.emailFrom = config.notification.email.from;
    this.emailTo = config.notification.email.to;
  }

  private formatAlertMessage(alert: AlertMessage): string {
    const condition = alert.condition === 'above' ? 'exceeded' : 'dropped below';
    return `
Stock Price Alert
----------------
Symbol: ${alert.symbol}
Current Price: $${alert.currentPrice.toFixed(2)}
Threshold: $${alert.threshold.toFixed(2)}
Condition: Price has ${condition} the threshold
Time: ${new Date(alert.timestamp).toLocaleString()}
    `.trim();
  }

  async sendAlert(alert: AlertMessage): Promise<void> {
    try {
      const message = this.formatAlertMessage(alert);
      
      // Log the alert
      logger.warn('Stock price alert', {
        ...alert,
        message,
      });

      // In a real implementation, this would send an email
      if (this.emailEnabled) {
        // Mock email sending
        logger.info('Sending email alert', {
          from: this.emailFrom,
          to: this.emailTo,
          subject: `Stock Price Alert: ${alert.symbol}`,
          message,
        });

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logger.info('Email alert sent successfully');
      } else {
        logger.info('Email notifications are disabled');
      }
    } catch (error) {
      logger.error('Failed to send alert', {
        error,
        alert,
      });
      throw error;
    }
  }
}

export default new NotificationService(); 