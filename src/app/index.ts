import 'dotenv/config';

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import config from '../config';
import logger from '../shared/helpers/logger.helper';
import { ErrorMiddleware, notFound, rateLimiterMiddleware } from './middlewares';
import AppRouter from './router';

class App {
  private readonly app: Express;
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.registerRoutes();
    this.initiateErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.disable('x-powered-by');
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(rateLimiterMiddleware);

    // CORS configuration
    this.app.use(
      cors({
        origin: ['http://localhost:3000', process.env.FRONTEND_CLIENT_BASE_URL!].filter(Boolean),
        credentials: true,
      })
    );

    // Development logging
    if (config.application.get('env') === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(
        morgan(
          ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
          { stream: { write: (message) => logger.log('info', message.trim(), { tags: ['http'] }) } }
        )
      );
    }
    this.app.use(helmet());
  }

  private initiateErrorHandling(): void {
    this.app.use(notFound);
    this.app.use(ErrorMiddleware);
  }

  private registerRoutes(): void {
    new AppRouter(this.app).loadRouters();
  }

  getApp(): Express {
    return this.app;
  }
}

export default App;
