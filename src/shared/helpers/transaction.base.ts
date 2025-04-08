import { ClientSession, Connection } from 'mongoose';

import logger from './logger.helper';

export abstract class TransactionBase<TransactionInput, TransactionOutput> {
  protected constructor(protected readonly connection: Connection) {}

  // this function will contain all of the operations that you need to perform
  // and has to be implemented in all transaction classes
  protected abstract execute(data: TransactionInput, session: ClientSession): Promise<TransactionOutput>;

  // this is the main function that runs the transaction
  async run(data: TransactionInput): Promise<TransactionOutput> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.execute(data, session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      logger.error(`MongoDB Transaction failed: ${error}`);
      throw new Error(`MongoDB Transaction failed: ${error}`);
    } finally {
      await session.endSession();
    }
  }

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction
  async runWithinTransaction(data: TransactionInput, session: ClientSession): Promise<TransactionOutput> {
    return this.execute(data, session);
  }
}
