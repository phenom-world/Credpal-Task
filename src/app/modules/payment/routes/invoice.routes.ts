import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import { InvoiceController } from '../controllers/invoice.controller';

class InvoiceRouter {
  private router: Router;
  private readonly invoiceController: InvoiceController;

  constructor() {
    this.router = Router();
    this.invoiceController = new InvoiceController();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Basic authenticated routes
    this.router
      .use(authMiddleware.isAuthenticated)
      .post('/', this.invoiceController.createInvoice)
      .get('/:id', this.invoiceController.getInvoice)
      .get('/user/:id', this.invoiceController.getUserInvoices)
      .post('/:id/void', this.invoiceController.voidInvoice);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default InvoiceRouter;
