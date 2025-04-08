import { Express } from 'express';

import InvoiceRouter from './invoice.routes';
import PaymentRouter from './payment.routes';
import PaymentMethodRouter from './payment-method.routes';

class LoadPaymentRouters {
  private paymentRouter: PaymentRouter;
  private invoiceRouter: InvoiceRouter;
  private paymentMethodRouter: PaymentMethodRouter;

  constructor(private readonly router: Express) {
    this.paymentRouter = new PaymentRouter();
    this.invoiceRouter = new InvoiceRouter();
    this.paymentMethodRouter = new PaymentMethodRouter();
  }

  loadRouters(): void {
    this.router.use('/api/v1/payment', this.paymentRouter.getRouter());
    this.router.use('/api/v1/payment-method', this.paymentMethodRouter.getRouter());
    this.router.use('/api/v1/invoice', this.invoiceRouter.getRouter());
  }
}

export default LoadPaymentRouters;
