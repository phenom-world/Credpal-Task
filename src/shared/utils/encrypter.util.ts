import { compare, genSalt, hash } from 'bcryptjs';

class Encrypter {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
    return hash(password, salt);
  }

  async compare(rawPassword: string, hashedPassword: string): Promise<boolean> {
    return compare(rawPassword, hashedPassword);
  }
}

export default new Encrypter();
