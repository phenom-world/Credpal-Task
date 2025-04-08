import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ApiResponse } from '../../../../shared/utils/helper.util';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { PaymentMethodService } from '../services/payment-method.service';

class PaymentMethodController {
  private readonly paymentMethodService: PaymentMethodService;
  constructor() {
    this.paymentMethodService = new PaymentMethodService();
  }

  createPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const response = await this.paymentMethodService.createPaymentMethod(req.body, req.user.id);
    return ApiResponse(res, StatusCodes.CREATED, response, 'Card created successfully');
  });

  getPaymentMethod = asyncHandler(async (req: Request, res: Response) => {
    const paymentMethodId = req.params.id;
    const response = await this.paymentMethodService.getPaymentMethod(paymentMethodId, req.user.id);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
    const response = await this.paymentMethodService.getPaymentMethods(req.user.id);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  updatePaymentMethodPreference = asyncHandler(async (req: Request, res: Response) => {
    const paymentMethodId = req.params.id;
    const response = await this.paymentMethodService.updatePaymentMethodPreference(paymentMethodId, req.user.id);
    return ApiResponse(res, StatusCodes.OK, response, 'Payment method preference updated successfully');
  });
}

export default PaymentMethodController;
