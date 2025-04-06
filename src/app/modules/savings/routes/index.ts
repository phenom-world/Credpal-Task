import { Express } from 'express';

import savingsRouter from './savings.routes';

class LoadsavingsRouters {
  private savingsRouter: savingsRouter;

  constructor(private readonly router: Express) {
    this.savingsRouter = new savingsRouter();
  }

  loadRouters(): void {
    this.router.use('/api/savings', this.savingsRouter.getRouter());
  }
}

export default LoadsavingsRouters;
