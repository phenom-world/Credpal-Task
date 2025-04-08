import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaymentMethodController from '../controllers/payment-method.controller';

class PaymentMethodRouter {
  private router: Router;
  private readonly paymentMethodController: PaymentMethodController;

  constructor() {
    this.router = Router();
    this.paymentMethodController = new PaymentMethodController();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router
      .use(authMiddleware.isAuthenticated)
      .get('/:id', this.paymentMethodController.getPaymentMethod)
      .get('/', this.paymentMethodController.getPaymentMethods)
      .post('/', this.paymentMethodController.createPaymentMethod)
      .put('/:id/preferred', this.paymentMethodController.updatePaymentMethodPreference);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default PaymentMethodRouter;
