import mongoose from 'mongoose';
import { config } from './shared/config';
import { logger } from './shared/logger';
import app from './app';

async function bootstrap() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB', { uri: config.mongoUri.replace(/\/\/.*@/, '//<credentials>@') });

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`, { env: config.nodeEnv });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

bootstrap();
