import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import crypto from 'node:crypto';
import { User } from '../../core/entities/user.entity';
import { SigninDTO, SignupDTO } from '../auth/auth.dto';
import { BcryptService } from '../../core/services/bcrypt.service';
import { MainSession } from '../../core/entities/session.entity';
import { daysInMilliseconds } from '../../core/utils/utils';
import { BaseMessage, MeResponse } from '../../shared/dtos';

@Injectable()
export class AuthService {

  constructor(
    private readonly dataSource: DataSource,
    private readonly bcryptService: BcryptService,
  ) {}

  public async getMe(userId: string): Promise<MeResponse> {
    const user = await this.dataSource.getRepository(User).findOneOrFail({
      where: { id: userId },
    });
    const data: MeResponse = {
      id: user.id,
      username: user.username,
    };
  
    return data;
  }

  public async signup(body: SignupDTO): Promise<BaseMessage> {
    await this.validateSignupData(body);
    await this.createUser(body);

    return { message: { key: 'auth.signup_successful' } };
  }

  public async signin(body: SigninDTO): Promise<MainSession> {
    const user = await this.getAuthenticatedUser(body);

    await this.deletePreviousSessions(user.id);

    const session = await this.createUserSession(user.id);

    return session;
  }

  public async signout(userId: string, sessionId: string): Promise<BaseMessage> {
    await this.dataSource.getRepository(MainSession).delete({ id: sessionId, user: { id: userId } });

    return {
      message: { key: 'auth.signout_successful' },
    };
  }

  private async validateSignupData(body: SignupDTO): Promise<void> {
    const userAlreadyExists = await this.dataSource.getRepository(User).exists({ where: { username: body.username } });

    if (userAlreadyExists) {
      throw new BadRequestException({ key: 'auth.username_already_in_use' });
    }

    if (body.password !== body.passwordConfirmation) {
      throw new BadRequestException({ key: 'auth.passwords_do_not_match' });
    }
  }

  private async deletePreviousSessions(userId: string): Promise<void> {
    await this.dataSource.getRepository(MainSession).delete({ user: { id: userId } });
  }

  private async createUser(body: SignupDTO): Promise<User> {
    const data = new User();

    data.username = body.username;
    data.password = await this.bcryptService.hash(body.password);

    return this.dataSource.getRepository(User).save(data);
  }

  private async getAuthenticatedUser(body: SigninDTO): Promise<User> {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { username: body.username },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new UnauthorizedException({ key: 'auth.invalid_credentials' });
    }

    const isPasswordValid = await this.bcryptService.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException({ key: 'auth.invalid_credentials' });
    }

    return user;
  }

  private async createUserSession(userId: string): Promise<MainSession> {
    const newSession = new MainSession();
    const expirationInMilliseconds = daysInMilliseconds(30);

    newSession.token = crypto.randomBytes(48).toString('hex');
    newSession.expiresAt = new Date(Date.now() + expirationInMilliseconds);
    newSession.maxAge = expirationInMilliseconds / 1000;
    newSession.user = new User();
    newSession.user.id = userId;

    const savedSession = await this.dataSource.getRepository(MainSession).save(newSession);

    delete (savedSession as any).user;

    return savedSession;
  }

}
