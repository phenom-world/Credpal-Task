import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

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

  create = asyncHandler(async (req: CustomRequest<CreateSavingsDto>, res: Response) => {
    const savings = await this.savingsService.create(req.body);
    return ApiResponse(res, StatusCodes.CREATED, savings);
  });

  update = asyncHandler(async (req: CustomRequest<UpdateSavingsDto>, res: Response) => {
    const { id } = req.params;
    const savings = await this.savingsService.update(id, req.body);
    return ApiResponse(res, StatusCodes.OK, savings);
  });

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const savings = await this.savingsService.getAll();
    return ApiResponse(res, StatusCodes.OK, savings);
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const savings = await this.savingsService.getOne(id);
    return ApiResponse(res, StatusCodes.OK, savings);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await this.savingsService.delete(id);
    return ApiResponse(res, StatusCodes.OK, null, 'Savings deleted successfully');
  });
}
