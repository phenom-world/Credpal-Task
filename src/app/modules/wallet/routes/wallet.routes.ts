import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import { WalletController } from '../controllers/wallet.controller';

class WalletRouter {
  private walletController: WalletController;
  private router: Router;
  private readonly paginationMiddleware: PaginationMiddleware;

  constructor() {
    this.router = Router();
    this.paginationMiddleware = new PaginationMiddleware();
    this.walletController = new WalletController();
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.use(authMiddleware.isAuthenticated);

    // Wallet balance
    this.router.get('/balance', this.walletController.getBalance);
    this.router.get('/transactions', this.paginationMiddleware.paginate, this.walletController.getTransactions);
    this.router.get('/transactions/:id', this.walletController.getTransaction);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default WalletRouter;
