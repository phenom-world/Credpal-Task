import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import PaymentController from '../controllers/payment.controller';
import { PaymentValidator } from '../validations/payment.validation';

class PaymentRouter {
  private router: Router;
  private readonly paymentController: PaymentController;
  private readonly paginationMiddleware: PaginationMiddleware;
  private readonly paymentValidation: PaymentValidator;

  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.paginationMiddleware = new PaginationMiddleware();
    this.paymentValidation = new PaymentValidator();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(authMiddleware.isAuthenticated);
    //All user
    this.router
      .post('/initialize', this.paymentValidation.validateInitializePayment, this.paymentController.initializePayment)
      .get('/verify', this.paymentValidation.validateVerifyTransaction, this.paymentController.verifyTransaction);

    this.router
      .get('/:id', this.paymentController.getPayment)
      .get('/', this.paginationMiddleware.paginate, this.paymentController.getAllPayments)
      .post('/', this.paymentController.createPayment)
      .delete('/:id', this.paymentController.deletePayment);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default PaymentRouter;
