import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import { SavingsController } from '../controllers/savings.controller';
import SavingsValidator from '../validations/saving-goals.validation';

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

    this.router.post('/', this.savingsValidator.validateCreateSavingGoals, this.savingsController.create);

    this.router.get('/', this.savingsValidator.validateGetAllSavingGoals, this.paginationMiddleware.paginate, this.savingsController.getAll);

    this.router.get('/:id', this.savingsController.getOne);

    this.router.put('/:id', this.savingsValidator.validateUpdateSavingGoals, this.savingsController.update);

    this.router.delete('/:id', this.savingsController.delete);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default savingsRouter;
