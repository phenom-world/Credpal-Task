import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose, { Connection } from 'mongoose';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { BadRequestError } from '../../../../shared/utils/error.util';
import { ApiResponse } from '../../../../shared/utils/helper.util';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares';
import { InitializePaymentResponse, PaymentHelper } from '../helpers/paystack.helper';
import {
  CreatePaymentDto,
  InitializePaymentDto,
  PaymentActionType,
  PaymentProvider,
  RefundPaymentDto,
  VerifyTransactionDto,
} from '../interfaces/payment.interface';
import { PaymentService } from '../services/payment.service';
import { PayPalService } from '../services/paypal.service';
import PaystackService from '../services/paystack.service';

class PaymentController {
  private readonly paystackService: PaystackService;
  private readonly paypalService: PayPalService;
  private readonly paymentHelper: PaymentHelper;
  private readonly paymentService: PaymentService;
  private readonly connection: Connection;

  constructor() {
    this.connection = mongoose.connection;
    this.paystackService = new PaystackService();
    this.paypalService = new PayPalService();
    this.paymentService = new PaymentService(this.connection);
    this.paymentHelper = new PaymentHelper(this.paymentService);
  }

  initializePayment = asyncHandler(async (req: CustomRequest<InitializePaymentDto>, res: Response) => {
    let resp: InitializePaymentResponse;
    switch (req.body.provider) {
      case PaymentProvider.PAYSTACK:
        resp = await this.paymentHelper.handleInitializePaystackPayment({ ...req.body, userId: req.user.id, email: req.user.email });
        break;
      case PaymentProvider.PAYPAL:
        resp = await this.paypalService.createSetupToken({ ...req.body, userId: req.user.id, email: req.user.email });
        break;
      default:
        throw new BadRequestError('Payment channel not supported');
    }

    const responseData = await this.paymentHelper.formatInitializeResponse(resp, req.body, req.user.id);
    return ApiResponse(res, StatusCodes.CREATED, responseData, 'Payment initialized successfully');
  });

  verifyTransaction = asyncHandler(async (req: Request, res: Response) => {
    const { reference, provider, type } = req.query as VerifyTransactionDto;
    if (provider === PaymentProvider.PAYSTACK) {
      const response = await this.paystackService.verifyTransaction(reference, type);
      return ApiResponse(res, StatusCodes.OK, response, 'Transaction verified successfully');
    } else if (provider === PaymentProvider.PAYPAL) {
      const response = await this.paypalService.createPaymentToken({
        type: type as PaymentActionType,
        token: reference,
        userId: req.user.id,
      });

      return ApiResponse(res, StatusCodes.OK, response, 'Transaction verified successfully');
    } else {
      return ApiResponse(res, StatusCodes.BAD_REQUEST, null, 'Transaction type not supported');
    }
  });

  createPayment = asyncHandler(async (req: CustomRequest<CreatePaymentDto>, res: Response) => {
    const response = await this.paymentService.createPayment({
      ...req.body,
    });
    return ApiResponse(res, StatusCodes.CREATED, response, 'Payment created successfully');
  });

  getPayment = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = req.params.id;
    const response = await this.paymentService.getPayment(paymentId, req.user.id);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  getAllPayments = asyncHandler(async (req: Request, res: Response) => {
    const paginate = res.locals.paginate;
    const response = await this.paymentService.getAllPayments(paginate, req.query, req.user.id);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: response.records, paginate, count: response.count }));
  });

  deletePayment = asyncHandler(async (req: CustomRequest<RefundPaymentDto>, res: Response) => {
    const paymentId = req.params.id;
    await this.paymentService.deletePayment(paymentId);
    return ApiResponse(res, StatusCodes.OK, null, 'Payment deleted successfully');
  });
}

export default PaymentController;
