import { Repository } from '../../../../shared/utils/data-repo.util';
import encrypterUtil from '../../../../shared/utils/encrypter.util';
import { BadRequestError, UnauthorizedError } from '../../../../shared/utils/error.util';
import { exclude } from '../../../../shared/utils/helper.util';
import { MongoObjectId } from '../../../../types';
import { JWTService } from '../../utility/services/jwt.service';
import { LoginDto, LoginResponse, RegisterDto } from '../interfaces/auth.interface';
import { UserStatus } from '../interfaces/user.interface';
import UserModel, { User } from '../models/user.model';

class AuthService {
  private readonly repo: Repository<User>;

  constructor() {
    this.repo = new Repository(UserModel);
  }

  async registerUser(userData: RegisterDto) {
    await this.repo.findOneAndThrow({ email: userData.email });

    const user = await this.repo.create({ data: userData });
    const userWithoutPassword = exclude(user.toJSON(), ['password']);
    return userWithoutPassword;
  }

  async loginUser(userData: LoginDto): Promise<Partial<LoginResponse>> {
    const user = await this.repo.findOneOrThrow(
      { email: userData.email },
      { options: { select: '+password' }, customError: 'Invalid email or password' }
    );

    const isPasswordValid = await user.comparePassword(userData.password);

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password');
    }

    this.validateUserStatus(user);

    const { accessToken } = JWTService.createSessionToken({ id: user._id, role: user.role });

    await this.repo.update({ _id: user._id }, { data: { lastLoginAt: new Date() } });
    const userWithoutPassword = exclude(user.toJSON(), ['password']);
    return { ...userWithoutPassword, accessToken };
  }

  async changePassword(id: MongoObjectId, password: string): Promise<void> {
    const hashedPassword = await encrypterUtil.hash(password);
    await this.repo.update({ _id: id }, { data: { password: hashedPassword } });
  }

  private validateUserStatus = (user: Pick<User, 'status'>): void => {
    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedError('Account is not active');
    }
  };
}

export default AuthService;
