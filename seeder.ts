import 'dotenv/config';

import UserModel from './src/app/modules/user/models/user.model';
import connectDB from './src/config/db';
import logger from './src/shared/helpers/logger.helper';

connectDB();
const deleteData = async () => {
  try {
    await UserModel.deleteMany();
    console.log(`Users deleted`);
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const createUsers = async () => {
  await UserModel.deleteMany();
  const admin = await UserModel.create({
    email: 'admin@gmail.com',
    password: 'password',
    role: 'ADMIN',
  });
  const user = await UserModel.create({
    email: 'user@gmail.com',
    password: 'password',
  });
  logger.info(`Admin, ${admin.email.underline.cyan} and User, ${user.email.underline.cyan} created`);
  process.exit();
};

if (process.argv[2] === '-d') {
  deleteData();
}

if (process.argv[2] === '-c') {
  createUsers();
}
