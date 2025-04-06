import { Express } from 'express';

import savingGoalRouter from './saving-goals.routes';

class LoadSavingGoalRouters {
  private savingGoalRouter: savingGoalRouter;

  constructor(private readonly router: Express) {
    this.savingGoalRouter = new savingGoalRouter();
  }

  loadRouters(): void {
    this.router.use('/api/saving-goal', this.savingGoalRouter.getRouter());
  }
}

export default LoadSavingGoalRouters;
