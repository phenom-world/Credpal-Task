import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { paginateResponse } from '../../../../shared/helpers/paginate-response.helper';
import { ApiResponse } from '../../../../shared/utils/helper.util';
import { CustomRequest } from '../../../../types';
import { asyncHandler } from '../../../middlewares/async-handler.middleware';
import { CreateSavingsDto, UpdateSavingsDto } from '../interfaces/savings.interface';
import { SavingsService } from '../services/savings.service';
export class SavingsController {
  private savingsService: SavingsService;

  constructor() {
    this.savingsService = new SavingsService();
  }

  // create savings
  create = asyncHandler(async (req: CustomRequest<CreateSavingsDto>, res: Response) => {
    const savings = await this.savingsService.create(req.body);
    return ApiResponse(res, StatusCodes.CREATED, savings, 'Savings created successfully');
  });

  // update savings
  update = asyncHandler(async (req: CustomRequest<UpdateSavingsDto>, res: Response) => {
    const { id } = req.params;
    const savings = await this.savingsService.update(id, req.body);
    return ApiResponse(res, StatusCodes.OK, savings, 'Savings updated successfully');
  });

  // get all savings
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const { paginate } = res.locals;
    const userId = req.user.id;
    const savings = await this.savingsService.getAllSavings(paginate, req.query, userId);
    return ApiResponse(res, StatusCodes.OK, paginateResponse({ rows: savings.records, paginate, count: savings.count }));
  });

  // get one savings
  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const savings = await this.savingsService.getOneSavings(id);
    return ApiResponse(res, StatusCodes.OK, savings);
  });

  // delete savings
  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.savingsService.delete(id);
    return ApiResponse(res, StatusCodes.OK, null, 'Savings deleted successfully');
  });
}
