export const appConfig = () => ({
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  stripe: {
    enabled: !!process.env.STRIPE_API_KEY,
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  twint: {
    enabled: process.env.TWINT_ENABLED === 'true',
    apiKey: process.env.TWINT_API_KEY,
  },
});