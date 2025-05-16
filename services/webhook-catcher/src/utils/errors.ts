export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookError';
  }
} 