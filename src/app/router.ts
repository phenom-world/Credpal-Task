import { Express, Request, Response } from 'express';

import LoadSavingGoalRouters from './modules/saving-goals/routes';
import LoadsavingsRouters from './modules/savings/routes';
import LoadUserRouters from './modules/user/routes';
class AppRouter {
  private readonly userRouters: LoadUserRouters;
  private readonly savingsRouter: LoadsavingsRouters;
  private readonly savingGoalRouter: LoadSavingGoalRouters;

  constructor(private readonly app: Express) {
    this.userRouters = new LoadUserRouters(this.app);
    this.savingsRouter = new LoadsavingsRouters(this.app);
    this.savingGoalRouter = new LoadSavingGoalRouters(this.app);
  }

  loadRouters(): void {
    this.healthCheck(this.app);

    // Register all routers here
    this.userRouters.loadRouters();
    this.savingsRouter.loadRouters();
    this.savingGoalRouter.loadRouters();
  }

  private healthCheck(app: Express): void {
    app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        message: 'Broilerplate Backend Service',
        timestamp: new Date().toISOString(),
      });
    });
  }
}

export default AppRouter;
