import SavingsCreatedEventHandler from './handler/savings.created.handler';
import SavingsDeletedEventHandler from './handler/savings.deleted.handler';
import SavingsUpdatedEventHandler from './handler/savings.updated.handler';

export class EventHandlers {
  static handlers = {
    ['savings.created']: SavingsCreatedEventHandler,
    ['savings.updated']: SavingsUpdatedEventHandler,
    ['savings.deleted']: SavingsDeletedEventHandler,
  } as const;
}
