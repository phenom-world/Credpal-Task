import mongoose from 'mongoose';

import config from '../config';
import logger from '../shared/helpers/logger.helper';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(config.application.get('database.url'));
    logger.info('Database connected successfully'.green.underline);
  } catch (error) {
    logger.error('Error connecting to database:'.red, error);
    process.exit(1);
  }
}

export default connectDB;
