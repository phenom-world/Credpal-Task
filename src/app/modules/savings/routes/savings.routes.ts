import { Router } from 'express';

import authMiddleware from '../../../middlewares/auth.middleware';
import PaginationMiddleware from '../../../middlewares/pagination.middleware';
import { SavingsController } from '../controllers/savings.controller';
import SavingsValidator from '../validations/savings.validation';

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

    this.router.post('/', this.savingsValidator.validateCreatesavings, this.savingsController.create);

    this.router.get('/', this.savingsValidator.validateGetAll, this.paginationMiddleware.paginate, this.savingsController.getAll);

    this.router.get('/:id', this.savingsController.getById);
    this.router.get('/user/:userId', this.savingsController.getByUserId);

    this.router.put('/:id', this.savingsValidator.validateUpdate, this.savingsController.update);

    this.router.delete('/:id', this.savingsController.delete);
  }

  getRouter(): Router {
    return this.router;
  }
}

export default savingsRouter;
