import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SigninDTO, SignupDTO } from '../auth/auth.dto';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { AuthGuard } from '../../core/guards/auth.guard';
import { MainSession } from '../../core/entities/session.entity';
import { BaseMessage, MeResponse } from '../../shared/dtos';

@Controller('v1/auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Get('/me')
  @UseGuards(AuthGuard)
  public getMe(@Req() req: Request): Promise<MeResponse> {
    return this.authService.getMe(req.userId);
  }

  @Post('/signup')
  public signup(@Body() body: SignupDTO): Promise<BaseMessage> {
    return this.authService.signup(body);
  }

  @Post('/signin')
  public signin(@Body() body: SigninDTO): Promise<MainSession> {
    return this.authService.signin(body);
  }

  @Post('/signout')
  @UseGuards(AuthGuard)
  public signout(@Req() req: Request): Promise<BaseMessage> {
    return this.authService.signout(req.userId, req.sessionId);
  }

}
