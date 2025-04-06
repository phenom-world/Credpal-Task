import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import { SavingsController } from '../controllers/savings.controller';
import SavingsValidator from '../validations/savings.validation';
import { validateSaving, validateUserSavingGoal } from '../validations/validate-savings.middleware';

class savingsRouter {
  private savingsController: SavingsController;
  private router: Router;
  private savingsValidator: SavingsValidator;
  private readonly paginationMiddleware: PaginationMiddleware;

  constructor() {
    this.router = Router();
    this.paginationMiddleware = new PaginationMiddleware();
    this.savingsController = new SavingsController();
    this.savingsValidator = new SavingsValidator();
    this.initializeRoutes();
  }

  initializeRoutes(): void {
    this.router.use(authMiddleware.isAuthenticated);

    this.router.post('/', this.savingsValidator.validateCreatesavings, validateUserSavingGoal, this.savingsController.create);

    this.router.get('/', this.savingsValidator.validateGetAllSavings, this.paginationMiddleware.paginate, this.savingsController.getAll);

    this.router.get('/:id', validateSaving, this.savingsController.getOne);

    this.router.put('/:id', this.savingsValidator.validateUpdatesavings, validateSaving, this.savingsController.update);

    this.router.delete('/:id', validateSaving, this.savingsController.delete);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default savingsRouter;
