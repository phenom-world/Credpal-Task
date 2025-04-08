import { Express } from 'express';

import walletRouter from './wallet.routes';

class LoadWalletRouters {
  private walletRouter: walletRouter;

  constructor(private readonly router: Express) {
    this.walletRouter = new walletRouter();
  }

  loadRouters(): void {
    this.router.use('/api/wallet', this.walletRouter.getRouter());
  }
}

export default LoadWalletRouters;
