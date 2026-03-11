import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: requireEnv('MONGODB_URI'),
  jwtSecret: requireEnv('JWT_SECRET'),
  openWeatherApiKey: requireEnv('OPENWEATHER_API_KEY'),
  alertEvaluationCron: process.env.ALERT_EVALUATION_CRON || '*/5 * * * *',
  nodeEnv: process.env.NODE_ENV || 'development',

  get isProduction() {
    return this.nodeEnv === 'production';
  },
} as const;
