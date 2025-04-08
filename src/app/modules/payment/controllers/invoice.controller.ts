import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { ApiResponse } from '../../../../shared/utils/helper.util';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { InvoiceService } from '../services/invoice.service';

export class InvoiceController {
  private readonly invoiceService: InvoiceService;
  constructor() {
    this.invoiceService = new InvoiceService();
  }

  createInvoice = asyncHandler(async (req: Request, res: Response) => {
    const response = await this.invoiceService.createInvoice({
      ...req.body,
    });
    return ApiResponse(res, StatusCodes.CREATED, response, 'Invoice created successfully');
  });

  getUserInvoices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const paginate = res.locals.paginate;
    const response = await this.invoiceService.getUserInvoices(paginate, req.query, userId);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: response.records, paginate, count: response.count }));
  });

  getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id;
    const response = await this.invoiceService.getInvoice(invoiceId);
    return ApiResponse(res, StatusCodes.OK, response);
  });

  voidInvoice = asyncHandler(async (req: Request, res: Response) => {
    const invoiceId = req.params.id;
    const response = await this.invoiceService.voidInvoice(invoiceId);
    return ApiResponse(res, StatusCodes.OK, response, 'Invoice voided successfully');
  });
}
